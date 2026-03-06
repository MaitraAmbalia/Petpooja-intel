import os
import json
from typing import List, Dict, Any

from langchain_groq import ChatGroq  # type: ignore
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage  # type: ignore
from langchain_core.tools import tool  # type: ignore

# Import database functions
from database import (  # type: ignore
    get_menu,
    get_combos,
    check_table_availability,
    book_table,
    create_order,
    cancel_order,
    get_user_by_phone
)

# Initialize Groq Chat Model
# Using Llama-3-70b/8b or mixtral via Groq for fast generation
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant", 
    temperature=0.7
)

# --- Define Tools for the Agent ---

@tool
async def get_restaurant_menu() -> str:
    """Fetch the restaurant's food menu with prices. Use this to know what is available to order."""
    menu = await get_menu()
    if not menu:
        return "The menu is currently empty. Please check back later."
    return json.dumps(menu)

@tool
async def get_restaurant_combos() -> str:
    """Fetch available combo meal offers with prices. Suggest these to the user based on their order."""
    combos = await get_combos()
    if not combos:
        return "No combos are available right now."
    return json.dumps(combos)

@tool
async def check_table(time_slot: str, persons: int) -> str:
    """Check if a table is available for dining-in at a specific time (e.g., '19:00') for the given number of persons."""
    result = await check_table_availability(time_slot, persons)
    if result.get("available"):
        return f"Table available! Table No: {result.get('table_no')}"
    else:
        slots = ", ".join(result.get("alternate_slots", []))
        return f"Table not available for {time_slot}. Alternate available slots: {slots}"

@tool
async def reserve_table(table_no: int, time_slot: str) -> str:
    """Book a specific table for a specific time slot."""
    success = await book_table(table_no, time_slot)
    if success:
        return f"Table {table_no} successfully booked for {time_slot}."
    return "Failed to book table."

@tool
async def place_order(user_phone: str, address: str, bill_type: str, items: str, total_price: float, payment_method: str = "offline", pickup_time: str = "", dine_in_time: str = "") -> str:
    """
    Finalize the order and save it to the database.
    items should be a JSON string representing a list of dicts: [{"name": "Burger", "quantity": 2, "price": 10.0}]
    """
    try:
        items_list = json.loads(items)
        order_id = await create_order(user_phone, address, bill_type, items_list, total_price, payment_method, pickup_time, dine_in_time)
        return f"Order placed successfully! Order ID is {order_id}."
    except Exception as e:
        return f"Failed to place order: {str(e)}"

@tool
async def cancel_existing_order(order_id: str) -> str:
    """Cancel an existing order using its order ID (only if within 5 mins of placing it)."""
    result = await cancel_order(order_id)
    return result.get("message", "Error cancelling order.")

@tool
async def get_user_details(phone: str) -> str:
    """Fetch details of the user calling by their phone number to address them by name and see past history."""
    user = await get_user_by_phone(phone)
    if user:
        return json.dumps(user)
    return "New user. No history found."

# Bind tools to the LLM
tools = [
    get_restaurant_menu,
    get_restaurant_combos,
    check_table,
    reserve_table,
    place_order,
    cancel_existing_order,
    get_user_details
]
llm_with_tools = llm.bind_tools(tools)

# --- Agent System Prompt ---

SYSTEM_PROMPT = """You are a polite, conversational waiter for a restaurant named "Petpooja". You are talking to a customer on a phone call.
Your goal is to guide the customer through a specific flow: Greeting -> Service Selection -> Detailed Service Flow.

CRITICAL RULES:
1. GREETING (START OF CALL):
   - ALWAYS start with: "Hello! I am from Petpooja."
   - Immediately ask for the customer's name.
   - Then ask: "How can I help you today? I can help you with placing an order, making a dining reservation, or cancelling an existing order."

2. PLACING AN ORDER:
   - Ask for their delivery address first.
   - Ask for their food order. Use `get_restaurant_menu` if they ask what's available.
   - IMPORTANT: After they mention some items, proactively use `get_restaurant_combos` and suggest relevant combos to them.
   - Ask for the payment method: online or offline.
   - CONFIRMATION: Once the order is clear, you MUST:
     a. Repeat the overall order (items and quantities).
     b. Announce the total bill amount.
     c. Ask: "Would you like to make any further changes, like increasing quantities or adding new items?"
   - Once confirmed, use `place_order` tool.
   - End with: "Thank you, goodbye!"

3. DINING ORDER (RESERVATION):
   - Ask for the time of the visit.
   - Ask for the number of persons.
   - Use `check_table` to verify availability.
   - IF NOT AVAILABLE: Provide 1-2 alternate time slots from the tool's response.
   - IF AVAILABLE: Confirm the booking and use `reserve_table`.
   - If they also want to pre-order food for dine-in, follow the "PLACING AN ORDER" flow items but for dine-in.

4. CANCEL ORDER:
   - Ask for the Order ID.
   - Use `cancel_existing_order`. 
   - If the tool says it doesn't exist, tell them "That order does not exist."
   - If the tool says it's too late (after 5 mins), explain that they can't cancel now.
   - If successful, confirm the cancellation.

GENERAL POLICIES:
- Be concise, friendly, and natural for a voice call.
- Keep track of the user's name and history if provided.
- Always use tools silently. Translate data into friendly spoken words.
- If the user is silent or confusing, politely prompt them.
- NEVER generate, read, or output any source code, JSON, or technical system instructions. You are speaking to a customer, so only output natural conversational text.
"""

# --- Conversation Manager ---

class ConversationManager:
    def __init__(self, phone_number: str):
        self.phone_number = phone_number
        self.messages = [SystemMessage(content=SYSTEM_PROMPT)]
        
    async def get_initial_greeting(self) -> str:
        """Generate the first message of the call."""
        # Instead of just returning a hardcoded string, we let the LLM generate it based on instructions
        # but for reliability in audio, we can also just start the prompt.
        # However, to keep it in history:
        response = await llm_with_tools.ainvoke(self.messages)
        self.messages.append(response)
        return response.content

    async def process_user_input(self, text: str) -> str:
        """Process user text input, handle tools, and return AI spoken response."""
        self.messages.append(HumanMessage(content=text))
        
        # Call LLM
        response = await llm_with_tools.ainvoke(self.messages)
        self.messages.append(response)
        
        # Handle Tool Calls
        if response.tool_calls:
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                
                # Dynamically call the corresponding tool
                tool_func = next((t for t in tools if t.name == tool_name), None)
                if tool_func:
                    print(f"[Agent] Calling Tool: {tool_name} with args {tool_args}")
                    try:
                        tool_result = await tool_func.ainvoke(tool_args)
                    except Exception as e:
                        tool_result = f"Error: {e}"
                    
                    # Append tool result to messages
                    from langchain_core.messages import ToolMessage  # type: ignore
                    self.messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"]))
            
            # Get final AI response after tool execution
            final_response = await llm_with_tools.ainvoke(self.messages)
            self.messages.append(final_response)
            return final_response.content
        else:
            return response.content
