import os
import json
from typing import List, Dict, Any

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import tool

# Import database functions
from database import (
    get_menu,
    get_combos,
    get_categories,
    check_table_availability,
    book_table,
    create_order,
    cancel_order,
    get_user_by_phone,
    update_order_status
)

# Initialize Groq Chat Model
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant", 
    temperature=0.7
)

# --- Define Tools for the Agent ---

@tool
async def get_restaurant_menu() -> str:
    """Fetch the restaurant's food menu with prices and categories. Use this to know what is available to order."""
    menu = await get_menu()
    if not menu:
        return "The menu is currently empty."
    return json.dumps(menu)

@tool
async def get_menu_categories() -> str:
    """Fetch available food categories. Use this if the user asks about categories."""
    cats = await get_categories()
    if not cats:
        return "No categories found."
    return json.dumps(cats)

@tool
async def get_restaurant_combos() -> str:
    """Fetch available combo meal offers with prices. Suggest these to the user based on their order to upsell."""
    combos = await get_combos()
    if not combos:
        return "No combos are available right now."
    return json.dumps(combos)

@tool
async def place_order(user_phone: str, address: str, items: str, total_price: float, customer_name: str = "Customer") -> str:
    """
    Finalize the delivery order and save it to the database.
    items should be a JSON string representing a list of dicts: [{"name": "<food_name>", "quantity": <int>, "price": <float>}]
    """
    try:
        items_list = json.loads(items)
        order_id = await create_order(
            user_phone=user_phone, 
            address=address, 
            bill_type="delivery", 
            items=items_list, 
            total_price=total_price, 
            call_successful=False, # We mark true later in main.py
            upsell_successful=False,
            customer_name=customer_name
        )
        return f"Order placed successfully! Order ID is {order_id}."
    except Exception as e:
        return f"Failed to place order: {str(e)}"

@tool
async def get_user_details(phone: str) -> str:
    """Fetch details of the user calling by their phone number to address them by name and see past history."""
    user = await get_user_by_phone(phone)
    if user:
        return json.dumps(user)
    return "New user. No history found."

# Bind tools to the LLM (Removed table checking/canceling to enforce prompt rules strictly)
tools = [
    get_restaurant_menu,
    get_menu_categories,
    get_restaurant_combos,
    place_order,
    get_user_details
]
llm_with_tools = llm.bind_tools(tools)

# --- Agent System Prompt ---

SYSTEM_PROMPT = """You are a restaurant waiter taking orders on a phone call.

CRITICAL RULES:
- only one or two line to said by voice ai agent not so long sentences
- if customs say something than it should be listen
- Only delivery orders are supported
- Be polite and friendly
- Guide customer through ordering
- Suggest combos when possible
- Confirm order before ending call
- Calculate total bill
- Ask delivery address
- If user asks confusing things ask again

Important note (each step must be done by one-two small sentences not so long sentence talk by voice agent is good for better user experience. It must be listen to user):

FLOW OF CONVO:
1. Greet customer (one line only).
   If customer already exist in history, greet by name. Else just greet them + ask them their name.
2. Ask how you can help.
3. Ask their delivery address.
4. Only if customs ask other questions (skip otherwise): if customer wants to know or ask something related to menu categories or popular items, use the dataset of food and combos to answer them. Manipulate and convince them to buy combos if required.
5. Take order.
6. Suggest combos (use data set of food and combos match the foods with combos and suggest him best combos to buy).
7. Confirm order.
8. Tell total bill.
9. Confirm delivery.
10. End call politely (if user said bye then only cut the call and say them thank you).

CRITICAL: 
- Once confirmed and payment amount told, you MUST call 'place_order' tool.
- Never write LONG sentences. MAXIMUM 2 lines per response!
"""

# --- Conversation Manager ---

class ConversationManager:
    def __init__(self, phone_number: str):
        self.phone_number = phone_number
        self.messages = [SystemMessage(content=SYSTEM_PROMPT)]
        self.order_id = None
        self.is_cancelled = False
        self.is_completed = False
        
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
        low_text = text.lower()
        if "cancel" in low_text or "stop" in low_text:
            self.is_cancelled = True
            
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
                        
                        if tool_name == "place_order" and "Order ID is" in str(tool_result):
                            import re
                            match = re.search(r"Order ID is ([\w-]+)", str(tool_result))
                            if match:
                                self.order_id = match.group(1)
                                self.is_completed = True
                                
                    except Exception as e:
                        tool_result = f"Error: {e}"
                    
                    # Append tool result to messages
                    from langchain_core.messages import ToolMessage
                    self.messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"]))
            
            # Get final AI response after tool execution
            final_response = await llm_with_tools.ainvoke(self.messages)
            self.messages.append(final_response)
            return final_response.content
        else:
            return response.content
