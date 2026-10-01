from fastapi import FastAPI, Depends, Request, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.config import settings
from app.services.whatsapp import send_whatsapp_message, send_list_message
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.models.business import Business
from app.models.customer import Customer
from groq import Groq
import app.models
import json

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WhatsApp Business Bot", version="1.0.0")

OWNER_NUMBER = "2348121819461"
client = Groq(api_key=settings.GROQ_API_KEY)

user_state = {}


def understand_message(text: str, products: list) -> dict:
    product_names = [p.name for p in products]
    
    prompt = f"""
You are a friendly and smart WhatsApp assistant for a small business called Dravex.
Available products: {product_names}

Customer message: "{text}"

Analyze the message and reply ONLY with valid JSON in this exact format:
{{
  "intent": "greeting" | "menu" | "order" | "orders" | "general" | "unknown",
  "items": [{{"name": "Product Name", "quantity": 1}}],
  "reply": "A natural, friendly reply to the customer"
}}

Rules:
- greeting → hi, hello, hey, good morning, etc.
- menu → customer wants to see products / what do you have
- order → customer wants to buy something (extract items + quantity)
- orders → customer wants to check previous orders
- general → any other question or chat (answer helpfully and politely)
- Be flexible with Nigerian Pidgin, short forms and spelling mistakes
- Only use product names from the available list for orders
- Keep replies short and natural (1-3 sentences max)
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=300
        )
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        return json.loads(content)
    except Exception as e:
        print("AI Error:", e)
        return {
            "intent": "unknown",
            "items": [],
            "reply": "Sorry, I didn't quite get that. You can type *menu* to see what we have or just tell me what you need."
        }


@app.get("/")
def home():
    return {"message": "Bot is running", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/seed")
def seed_data(db: Session = Depends(get_db)):
    # Create business if not exists
    business = db.query(Business).filter(Business.name == "Dravex Demo").first()
    if not business:
        business = Business(name="Dravex Demo")
        db.add(business)
        db.commit()
        db.refresh(business)

    # Clear old products
    db.query(Product).filter(Product.business_id == business.id).delete()

    products = [
        Product(business_id=business.id, name="Jollof Rice", price=2500, description="Party jollof with chicken", stock=50),
        Product(business_id=business.id, name="Fried Rice", price=2800, description="Fried rice with mixed proteins", stock=50),
        Product(business_id=business.id, name="Chicken (Full)", price=4500, description="Grilled full chicken", stock=30),
        Product(business_id=business.id, name="Pounded Yam & Egusi", price=3200, description="Pounded yam with egusi soup", stock=40),
        Product(business_id=business.id, name="Soft Drink", price=500, description="Coke, Fanta or Sprite", stock=100),
        Product(business_id=business.id, name="Bottle Water", price=300, description="75cl water", stock=100),
    ]

    for p in products:
        db.add(p)
    db.commit()

    return {"message": "Database seeded successfully!", "products": len(products)}


@app.get("/check")
def check_data(db: Session = Depends(get_db)):
    businesses = db.query(Business).all()
    products = db.query(Product).all()
    
    return {
        "businesses": [{"id": b.id, "name": b.name} for b in businesses],
        "products_count": len(products),
        "products": [{"id": p.id, "name": p.name, "business_id": p.business_id} for p in products]
    }


@app.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    if hub_mode == "subscribe" and hub_verify_token == settings.VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhook")
async def receive_message(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    print("Received:", body)

    try:
        entry = body.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            return {"status": "ok"}

        message = messages[0]
        from_number = message["from"]
        msg_type = message.get("type")

        if msg_type == "interactive":
            interactive = message.get("interactive", {})
            if interactive.get("type") == "list_reply":
                text = interactive.get("list_reply", {}).get("id", "").lower()
            elif interactive.get("type") == "button_reply":
                text = interactive.get("button_reply", {}).get("id", "").lower()
            else:
                text = ""
        elif msg_type == "text":
            text = message["text"]["body"].strip()
        else:
            return {"status": "ok"}

        print(f"From {from_number}: {text}")

        business = db.query(Business).filter(Business.name == "Dravex Demo").first()
        if not business:
            await send_whatsapp_message(from_number, "Bot is not ready yet.")
            return {"status": "ok"}

        products = db.query(Product).filter(Product.business_id == business.id).all()

        # ========== OWNER COMMANDS ==========
        if from_number == OWNER_NUMBER and text.lower() in ["orders", "order"]:
            orders = db.query(Order).order_by(Order.id.desc()).limit(5).all()
            if not orders:
                reply = "No orders yet."
            else:
                reply = "📦 *Latest Orders*\n\n"
                for o in orders:
                    reply += f"#{o.id} | {o.customer_phone} | ₦{o.total_amount:,.0f} | {o.status.value}\n"
            await send_whatsapp_message(from_number, reply)
            return {"status": "ok"}

        # ========== CONVERSATION STATE (Order Flow) ==========
        state = user_state.get(from_number)

        if state:
            step = state["step"]
            data = state["data"]

            if step == "waiting_name":
                data["name"] = text
                user_state[from_number] = {"step": "waiting_address", "data": data}
                await send_whatsapp_message(from_number, "📍 Please enter your *Delivery Address*:")
                return {"status": "ok"}

            elif step == "waiting_address":
                data["address"] = text
                user_state[from_number] = {"step": "waiting_alt_phone", "data": data}
                await send_whatsapp_message(from_number, "📱 Enter an *Alternate Phone Number* (or type *skip*):")
                return {"status": "ok"}

            elif step == "waiting_alt_phone":
                data["alt_phone"] = None if text.lower() == "skip" else text

                customer = db.query(Customer).filter(
                    Customer.phone == from_number,
                    Customer.business_id == business.id
                ).first()
                if not customer:
                    customer = Customer(business_id=business.id, phone=from_number, name=data["name"])
                    db.add(customer)
                else:
                    customer.name = data["name"]
                db.commit()

                order = Order(
                    business_id=business.id,
                    customer_phone=from_number,
                    total_amount=data["total"],
                    status=OrderStatus.pending
                )
                db.add(order)
                db.commit()
                db.refresh(order)

                items_text = "\n".join(f"• {i}" for i in data["items"])
                reply = (
                    f"✅ *Order Confirmed!*\n\n"
                    f"Order Number: *#{order.id}*\n\n"
                    f"*Customer Details:*\n"
                    f"Name: {data['name']}\n"
                    f"Phone: {from_number}\n"
                    f"Address: {data['address']}\n"
                )
                if data.get("alt_phone"):
                    reply += f"Alt Phone: {data['alt_phone']}\n"
                reply += f"\n*Items:*\n{items_text}\n\n*Total: ₦{data['total']:,.0f}*\n\nThank you! We will contact you shortly."

                await send_whatsapp_message(from_number, reply)

                owner_msg = (
                    f"🔔 *New Order #{order.id}*\n\n"
                    f"Name: {data['name']}\n"
                    f"Phone: {from_number}\n"
                    f"Address: {data['address']}\n"
                    f"Alt Phone: {data.get('alt_phone') or 'None'}\n\n"
                    f"Items: {', '.join(data['items'])}\n"
                    f"Total: ₦{data['total']:,.0f}"
                )
                await send_whatsapp_message(OWNER_NUMBER, owner_msg)

                del user_state[from_number]
                return {"status": "ok"}

        # ========== BUTTON / LIST HANDLING ==========
        if text in ["menu", "products"]:
            if not products:
                await send_whatsapp_message(from_number, "No products available right now.")
            else:
                reply = "🛍️ *Our Menu*\n\n"
                for p in products:
                    reply += f"• *{p.name}* - ₦{p.price:,.0f}\n  {p.description}\n\n"
                reply += "Just tell me what you want, e.g. *2 Jollof Rice*"
                await send_whatsapp_message(from_number, reply)
            return {"status": "ok"}

        if text in ["order", "place order"]:
            await send_whatsapp_message(
                from_number,
                "Please tell me what you want to order.\n\nExample:\n*2 Jollof Rice*\n*1 Chicken and 2 Soft Drink*"
            )
            return {"status": "ok"}

        if text in ["myorders", "my orders"]:
            orders = db.query(Order).filter(Order.customer_phone == from_number).order_by(Order.id.desc()).limit(3).all()
            if not orders:
                await send_whatsapp_message(from_number, "You have no recent orders.")
            else:
                reply = "📦 *Your Recent Orders*\n\n"
                for o in orders:
                    reply += f"#{o.id} - ₦{o.total_amount:,.0f} - {o.status.value}\n"
                await send_whatsapp_message(from_number, reply)
            return {"status": "ok"}

        # ========== AI UNDERSTANDING ==========
        understanding = understand_message(text, products)
        intent = understanding.get("intent", "unknown")
        ai_reply = understanding.get("reply", "")
        print("AI Understanding:", understanding)

        if intent == "greeting" or text.lower() in ["hi", "hello", "hey", "start"]:
            await send_list_message(
                to=from_number,
                body_text="👋 Welcome to *Dravex Business Bot*!\n\nHow can I help you today?",
                button_text="View Options",
                sections=[{
                    "title": "Main Options",
                    "rows": [
                        {"id": "menu", "title": "📋 View Menu", "description": "See all available products"},
                        {"id": "order", "title": "🛒 Place Order", "description": "Order food now"},
                        {"id": "myorders", "title": "📦 My Orders", "description": "Check your recent orders"}
                    ]
                }]
            )

        elif intent == "menu":
            if not products:
                await send_whatsapp_message(from_number, "No products available right now.")
            else:
                reply = "🛍️ *Our Menu*\n\n"
                for p in products:
                    reply += f"• *{p.name}* - ₦{p.price:,.0f}\n  {p.description}\n\n"
                reply += "Just tell me what you want, e.g. *2 Jollof Rice*"
                await send_whatsapp_message(from_number, reply)

        elif intent == "order":
            items = understanding.get("items", [])
            ordered_items = []
            total = 0

            for item in items:
                product = next((p for p in products if p.name.lower() == item["name"].lower()), None)
                if product:
                    qty = item.get("quantity", 1)
                    if product.stock >= qty:
                        ordered_items.append(f"{qty}x {product.name}")
                        total += product.price * qty
                    else:
                        await send_whatsapp_message(from_number, f"Sorry, only {product.stock} left of {product.name}.")
                        return {"status": "ok"}

            if ordered_items:
                user_state[from_number] = {
                    "step": "waiting_name",
                    "data": {"items": ordered_items, "total": total}
                }
                await send_whatsapp_message(
                    from_number,
                    f"Great! You want:\n" + "\n".join(f"• {i}" for i in ordered_items) +
                    f"\n\nTotal: *₦{total:,.0f}*\n\nPlease enter your *Full Name*:"
                )
            else:
                await send_whatsapp_message(from_number, ai_reply or "I couldn't understand the items. Please type *menu* or say something like *2 Jollof Rice*")

        elif intent == "orders":
            orders = db.query(Order).filter(Order.customer_phone == from_number).order_by(Order.id.desc()).limit(3).all()
            if not orders:
                await send_whatsapp_message(from_number, "You have no recent orders.")
            else:
                reply = "📦 *Your Recent Orders*\n\n"
                for o in orders:
                    reply += f"#{o.id} - ₦{o.total_amount:,.0f} - {o.status.value}\n"
                await send_whatsapp_message(from_number, reply)

        elif intent == "general":
            await send_whatsapp_message(from_number, ai_reply)

        else:
            if ai_reply:
                await send_whatsapp_message(from_number, ai_reply)
            else:
                await send_list_message(
                    to=from_number,
                    body_text="How can I help you?",
                    button_text="View Options",
                    sections=[{
                        "title": "Options",
                        "rows": [
                            {"id": "menu", "title": "📋 View Menu", "description": "See products"},
                            {"id": "order", "title": "🛒 Place Order", "description": "Order now"},
                            {"id": "myorders", "title": "📦 My Orders", "description": "Your orders"}
                        ]
                    }]
                )

    except Exception as e:
        print("Error:", str(e))

    return {"status": "ok"}
