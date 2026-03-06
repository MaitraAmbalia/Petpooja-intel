import os
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# --- Setup MongoDB Connection ---
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.petpooja_db  # Using 'petpooja_db' as default database

# Database Collections
users_collection = db["users"]
restaurants_collection = db["restaurants"]
menu_collection = db["menu"]      # Food items
combos_collection = db["combos"]
orders_collection = db["orders"]
tables_collection = db["tables"]


# --- Pydantic Schemas for Reference & Validation ---

class UserSchema(BaseModel):
    name: Optional[str] = None
    phone: str
    address: Optional[str] = None
    history: List[Dict[str, Any]] = [] # list of {"order_id": "...|combo_id", "quantity": int}
    final_bill: Optional[float] = 0.0

class RestaurantSchema(BaseModel):
    name: str
    address: str

class FoodItemSchema(BaseModel):
    food_id: str
    food_name: str
    price: float

class ComboSchema(BaseModel):
    combo_id: str
    description: str
    price: float

class OrderItemSchema(BaseModel):
    name: str
    quantity: int
    price: float

class OrderSchema(BaseModel):
    order_id: str
    user_phone: str
    time_placed: datetime = Field(default_factory=datetime.utcnow)
    bill_type: str # e.g., "delivery", "dine-in", "pickup"
    items: List[OrderItemSchema]
    total_price: float
    status: str = "placed" # e.g., "placed", "cancelled", "completed"
    payment_method: str = "offline"
    frontend_view: Dict[str, Any] = {}

class TableSchema(BaseModel):
    table_no: int
    time_slots_booked: List[str] # e.g., ["19:00", "20:00"]


# --- Database Operations (CRUD) ---

async def get_menu() -> List[Dict]:
    """Retrieve all food items from the menu."""
    cursor = menu_collection.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

async def get_combos() -> List[Dict]:
    """Retrieve all combos."""
    cursor = combos_collection.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

async def check_table_availability(time_str: str, persons: int) -> Dict:
    """ Check if any table is available for a given time. """
    tables = await tables_collection.find({}).to_list(length=100)
    for table in tables:
        if time_str not in table.get("time_slots_booked", []):
            return {"available": True, "table_no": table["table_no"]}
    
    # If not available, find available slots
    # Simple dummy logic for available slots:
    all_slots = ["18:00", "19:00", "20:00", "21:00", "22:00"]
    available_slots = []
    for table in tables:
        for slot in all_slots:
            if slot not in table.get("time_slots_booked", []) and slot not in available_slots:
                available_slots.append(slot)
            if len(available_slots) >= 2:
                break
    return {"available": False, "alternate_slots": available_slots[:2]}

async def book_table(table_no: int, time_str: str) -> bool:
    """Book a time slot for a table"""
    result = await tables_collection.update_one(
        {"table_no": table_no},
        {"$push": {"time_slots_booked": time_str}}
    )
    return result.modified_count > 0

async def create_order(user_phone: str, address: str, bill_type: str, items: List[Dict], total_price: float, payment_method: str = "offline", pickup_time: str = "", dine_in_time: str = "") -> str:
    """ Create a new order and update the user's history """
    import uuid
    order_id = str(uuid.uuid4())[:8] # Simple short order id
    
    # Format the requested frontend JSON view
    frontend_view = {
        "Combo id / order id - quantity": f"{order_id} - {len(items)} items",
        "Phone no.": user_phone,
        "Online Delivery : address": address if bill_type.lower() == "delivery" else "N/A",
        "dinin-time/reservation etc": dine_in_time if bill_type.lower() == "dine-in" else "N/A",
        "Pick-up": f"No delivery charge . Time: {pickup_time}" if bill_type.lower() == "pickup" else "N/A",
        "Detail of restaurant": "Petpooja",
        "Calculate total order bill": f"${total_price}",
        "Payment method : online/offline": payment_method
    }
    
    order = {
        "order_id": order_id,
        "user_phone": user_phone,
        "time_placed": datetime.utcnow(),
        "bill_type": bill_type,
        "items": items,
        "total_price": total_price,
        "status": "placed",
        "payment_method": payment_method,
        "frontend_view": frontend_view
    }
    await orders_collection.insert_one(order)
    
    # Update or insert User
    await users_collection.update_one(
        {"phone": user_phone},
        {
            "$set": {"address": address, "name": "Customer"},
            "$push": {"history": {"order_id": order_id, "items": len(items), "amount": total_price}},
            "$inc": {"final_bill": total_price}
        },
        upsert=True
    )
    return order_id

async def cancel_order(order_id: str) -> Dict:
    """Cancel an order only if it exists. (5 mins logic can be handled by the caller or AI agent context)"""
    order = await orders_collection.find_one({"order_id": order_id})
    if not order:
        return {"success": False, "message": "Order does not exist"}
    
    # Check 5 minutes rule
    time_diff = datetime.utcnow() - order["time_placed"]
    if time_diff.total_seconds() > 300: # 5 minutes
        return {"success": False, "message": "Order cannot be cancelled after 5 minutes"}
    
    await orders_collection.update_one(
        {"order_id": order_id},
        {"$set": {"status": "cancelled"}}
    )
    return {"success": True, "message": f"Order {order_id} cancelled successfully."}

async def get_user_by_phone(phone: str) -> Optional[Dict]:
    return await users_collection.find_one({"phone": phone}, {"_id": 0})
