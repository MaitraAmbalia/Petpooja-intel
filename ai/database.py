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

# Database Collections mapped exactly to the required names
users_collection = db["users"]
menu_collection = db["FoodItem"]
combos_collection = db["Combo"]
orders_collection = db["VoiceOrder"]
transcripts_collection = db["Transcript"]
categories_collection = db["Category"]
tables_collection = db["tables"] # keeping tables for dine-in availability check if needed


# --- Pydantic Schemas for Reference & Validation ---

class UserSchema(BaseModel):
    name: Optional[str] = None
    phone: str
    address: Optional[str] = None
    history: List[Dict[str, Any]] = [] # list of {"order_id": "...|combo_id", "quantity": int}
    final_bill: Optional[float] = 0.0

class CategorySchema(BaseModel):
    categoryId: str
    name: str
    icon: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class FoodItemSchema(BaseModel):
    foodId: str
    name: str
    description: Optional[str] = ""
    price: float
    cost: Optional[float] = 0.0
    margin: Optional[float] = 0.0
    category: str
    isVeg: bool = True
    ingredients: List[Dict[str, Any]] = []
    addons: List[Dict[str, Any]] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ComboSchema(BaseModel):
    comboId: str
    name: str
    description: Optional[str] = ""
    items: List[Dict[str, Any]] = []
    totalPrice: float
    triggerCategory: Optional[str] = ""
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class OrderItemSchema(BaseModel):
    name: str
    quantity: int
    price: float

class VoiceOrderSchema(BaseModel):
    orderId: str
    phoneNo: str
    customerName: Optional[str] = "Customer"
    orderType: str = "delivery"
    address: Optional[str] = ""
    time: str
    status: str = "pending"
    kotStatus: Optional[str] = "pending"
    items: List[OrderItemSchema]
    totalPrice: float
    callSuccessful: bool = False
    upsellSuccessful: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TranscriptSchema(BaseModel):
    transcriptId: str
    phoneNo: str
    orderId: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    messages: List[Dict[str, Any]] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TableSchema(BaseModel):
    table_no: int
    time_slots_booked: List[str] # e.g., ["19:00", "20:00"]


# --- Database Operations (CRUD) ---

async def get_menu() -> List[Dict]:
    """Retrieve all food items from the menu."""
    cursor = menu_collection.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

async def get_categories() -> List[Dict]:
    """Retrieve all categories."""
    cursor = categories_collection.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

async def get_combos() -> List[Dict]:
    """Retrieve all active combos."""
    cursor = combos_collection.find({"isActive": True}, {"_id": 0})
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

async def create_order(user_phone: str, address: str, bill_type: str, items: List[Dict], total_price: float, call_successful: bool = False, upsell_successful: bool = False, customer_name: str = "Customer") -> str:
    """ Create a new order via voice in the VoiceOrder table. Update user data."""
    import uuid
    order_id = str(uuid.uuid4())[:10]
    
    now = datetime.utcnow()
    
    # Exact VoiceOrder schema defined in prompt
    order = {
        "orderId": order_id,
        "phoneNo": user_phone,
        "customerName": customer_name,
        "orderType": bill_type.lower(), # typically "delivery"
        "address": address,
        "time": now.isoformat(),
        "status": "pending",
        "kotStatus": "pending",
        "items": items,
        "totalPrice": total_price,
        "callSuccessful": call_successful,
        "upsellSuccessful": upsell_successful,
        "createdAt": now,
        "updatedAt": now
    }
    
    await orders_collection.insert_one(order)
    
    # Update User schema for basic history context
    history_string = f"{order_id} - {len(items)}"
    await users_collection.update_one(
        {"phone": user_phone},
        {
            "$set": {
                "address": address, 
                "name": customer_name
            },
            "$push": {"history": history_string},
            "$inc": {"final_bill": total_price}
        },
        upsert=True
    )
    return order_id
    
async def update_order_status(order_id: str, updates: Dict[str, Any]) -> bool:
    """Update order details like callSuccessful after completion."""
    updates["updatedAt"] = datetime.utcnow()
    result = await orders_collection.update_one(
        {"orderId": order_id},
        {"$set": updates}
    )
    return result.modified_count > 0

async def cancel_order(order_id: str) -> Dict:
    """Cancel an order."""
    order = await orders_collection.find_one({"orderId": order_id})
    if not order:
        return {"success": False, "message": "Order does not exist"}
        
    await orders_collection.update_one(
        {"orderId": order_id},
        {"$set": {"status": "cancelled", "updatedAt": datetime.utcnow()}}
    )
    return {"success": True, "message": f"Order {order_id} cancelled successfully."}

async def get_user_by_phone(phone: str) -> Optional[Dict]:
    return await users_collection.find_one({"phone": phone}, {"_id": 0})

async def save_transcript(phone_no: str, order_id: Optional[str], messages_list: List[Dict[str, str]]) -> str:
    """Save the chat history transcript after the call ends."""
    import uuid
    transcript_id = str(uuid.uuid4())[:12]
    now = datetime.utcnow()
    
    transcript = {
        "transcriptId": transcript_id,
        "phoneNo": phone_no,
        "orderId": order_id, # Can be null if no order placed
        "timestamp": now,
        "messages": messages_list,
        "createdAt": now,
        "updatedAt": now
    }
    await transcripts_collection.insert_one(transcript)
    return transcript_id

