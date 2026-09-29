from app.database import SessionLocal, engine, Base
from app.models.product import Product
from app.models.business import Business
import app.models

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create a default business if it doesn't exist
business = db.query(Business).filter(Business.name == "Dravex Demo").first()
if not business:
    business = Business(name="Dravex Demo")
    db.add(business)
    db.commit()
    db.refresh(business)

# Sample products
sample_products = [
    {"name": "Jollof Rice", "description": "Party jollof with chicken", "price": 2500, "stock": 50},
    {"name": "Fried Rice", "description": "Fried rice with mixed proteins", "price": 2800, "stock": 40},
    {"name": "Chicken (Full)", "description": "Grilled full chicken", "price": 4500, "stock": 20},
    {"name": "Pounded Yam & Egusi", "description": "Pounded yam with egusi soup", "price": 3200, "stock": 30},
    {"name": "Soft Drink", "description": "Coke, Fanta or Sprite", "price": 500, "stock": 100},
    {"name": "Bottle Water", "description": "75cl water", "price": 300, "stock": 150},
]

for item in sample_products:
    exists = db.query(Product).filter(Product.name == item["name"]).first()
    if not exists:
        product = Product(
            business_id=business.id,
            name=item["name"],
            description=item["description"],
            price=item["price"],
            stock=item["stock"]
        )
        db.add(product)

db.commit()
db.close()

print("✅ Sample products added successfully!")
