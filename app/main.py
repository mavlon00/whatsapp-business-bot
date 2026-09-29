from fastapi import FastAPI, Depends, Request, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.config import settings
from app.services.whatsapp import send_whatsapp_message
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.models.business import Business
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WhatsApp Business Bot", version="0.3.0")

@app.get("/")
def home():
    return {"message": "WhatsApp Business Bot is running!", "status": "ok"}

@app.get("/health")
def health(db: Session = Depends(get_db)):
    return {"status": "ok", "database": "connected"}


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

        if msg_type != "text":
            return {"status": "ok"}

        text = message["text"]["body"].strip().lower()
        print(f"From {from_number}: {text}")

        # Get the demo business
        business = db.query(Business).filter(Business.name == "Dravex Demo").first()
        if not business:
            await send_whatsapp_message(from_number, "Bot is not ready yet. Please try again later.")
            return {"status": "ok"}

        # ========== REPLIES ==========

        if text in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]:
            reply = (
                "👋 Welcome to *Dravex Business Bot*!\n\n"
                "I can help you order food quickly.\n\n"
                "Type *menu* to see our products."
            )

        elif text in ["menu", "products", "product", "catalog"]:
            products = db.query(Product).filter(Product.business_id == business.id).all()
            if not products:
                reply = "No products available at the moment."
            else:
                reply = "🛍️ *Our Menu*\n\n"
                for p in products:
                    reply += f"• *{p.name}* - ₦{p.price:,.0f}\n  {p.description}\n  Stock: {p.stock}\n\n"
                reply += "To order, type for example:\n*I want 2 Jollof Rice*"

        elif text.startswith("i want") or text.startswith("order") or "want" in text:
            # Very simple order detection
            products = db.query(Product).filter(Product.business_id == business.id).all()
            ordered_items = []
            total = 0

            for p in products:
                if p.name.lower() in text:
                    # Try to find quantity
                    qty = 1
                    words = text.split()
                    for i, word in enumerate(words):
                        if word.isdigit() and i + 1 < len(words):
                            if p.name.lower().split()[0] in " ".join(words[i+1:]).lower():
                                qty = int(word)
                                break

                    if p.stock >= qty:
                        ordered_items.append(f"{qty}x {p.name}")
                        total += p.price * qty
                        p.stock -= qty
                    else:
                        await send_whatsapp_message(from_number, f"Sorry, we only have {p.stock} left of {p.name}.")
                        return {"status": "ok"}

            if ordered_items:
                # Save order
                order = Order(
                    business_id=business.id,
                    customer_phone=from_number,
                    total_amount=total,
                    status=OrderStatus.pending
                )
                db.add(order)
                db.commit()

                reply = (
                    f"✅ *Order Received!*\n\n"
                    f"Items:\n" + "\n".join(f"• {item}" for item in ordered_items) +
                    f"\n\nTotal: *₦{total:,.0f}*\n\n"
                    f"We will confirm your order shortly.\n"
                    f"Thank you!"
                )
            else:
                reply = "I couldn't understand the order.\nPlease type like: *I want 2 Jollof Rice*"

        elif text in ["orders", "my orders", "status"]:
            orders = db.query(Order).filter(Order.customer_phone == from_number).order_by(Order.id.desc()).limit(3).all()
            if not orders:
                reply = "You have no recent orders."
            else:
                reply = "📦 *Your Recent Orders*\n\n"
                for o in orders:
                    reply += f"Order #{o.id} - ₦{o.total_amount:,.0f} - {o.status.value}\n"

        else:
            reply = (
                "Sorry, I didn't understand.\n\n"
                "Type *menu* to see products\n"
                "Or *I want 2 Jollof Rice* to order"
            )

        await send_whatsapp_message(from_number, reply)

    except Exception as e:
        print("Error:", str(e))

    return {"status": "ok"}
