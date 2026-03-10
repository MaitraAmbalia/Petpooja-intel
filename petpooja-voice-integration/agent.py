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
    check_table_availability,
    book_table,
    create_order,
    cancel_order,
    get_user_by_phone,
    save_transcript
)
from send_sms import send_order_sms

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
    """Fetch the restaurant's food menu with prices (in Rupees). Use this to know what is available to order."""
    menu = await get_menu()
    if not menu:
        return "The menu is currently empty. Please check back later."
    return json.dumps(menu)

@tool
async def get_restaurant_combos() -> str:
    """Fetch available combo meal offers with prices (in Rupees). Suggest these to the user based on their order."""
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
async def cancel_existing_order(order_id: str) -> str:
    """Cancel an existing order using its order ID (only if within 5 mins of placing it)."""
    result = await cancel_order(order_id)
    return result.get("message", "Error cancelling order.")

# --- Agent System Prompt ---

SYSTEM_PROMPT = """You are a restaurant waiter taking orders on a phone call.

Restaurant rules:
- only one or two line to said by voice ai agent not so long sentences
if customs say something than it should be listen
- Only delivery orders are supported
- Be polite and friendly
- Guide customer through ordering
- Suggest combos when possible
- Confirm order before ending call
- Calculate total bill in Rupees (₹)
- Ask delivery address
- If user asks confusing things ask again

Important note (each step must be done by one-two small sentences not so long sentence talk by voice agent is good for better user experience. It must be listen to user) : 
Flow of convo:
1. Greet customer (one line only)
   if(custom already exist in out voice order dataset) greet by his/her name
   else just greet them + ask them their name also
2. Ask how you can help
3. Ask their address
4. Only if customs ask other questions (skip otherwise): if customer wants to know or ask something related to menu categories or and popular items use the dataset of food and combos. To answer them manipulate and convince them to buy combos if required.
5. Take order
6. Suggest combos (use data set of food and combos match the foods with combos and suggest him best combos to buy)
7. Confirm order
8. Tell total bill
9. Confirm delivery
10. End call politely (if user said bye then only cut the call and say them thank you or if user don't call cut till 5 minutes then automatically cut the call)

CRITICAL: KEEP YOUR ANSWERS EXTREMELY SHORT AND CONCISE. Use maximum 1 short sentence per response. DO NOT ask multiple questions at once. ALWAYS use tools silently to answer. Do not announce tool usage. Once everything is confirmed, Call `place_order` tool."""

# --- Conversation Manager ---

class ConversationManager:
    def __init__(self, phone_number: str):
        self.phone_number = phone_number
        self.messages = [SystemMessage(content=SYSTEM_PROMPT)]
        self.order_id = None
        
        # State machine tracking for fast address collection
        self.waiting_for_address = False
        self.collected_address = None
        
        @tool
        async def ask_for_address_directly() -> str:
            """Call this tool when you need to ask for the delivery address. It tells the system to pause the AI and collect the user's next spoken sentence directly as the address."""
            self.waiting_for_address = True
            return "System Action: Address collection mode activated. The next user input will be saved directly as the address."

        @tool
        async def place_order(
            customer_name: str, 
            order_type: str, 
            items: str, 
            total_price: float,
            call_successful: bool = True,
            upsell_successful: bool = False
        ) -> str:
            """
            Finalize the order and save it to the database.
            items should be a JSON string representing a list of dicts: [{"name": "<food_name>", "qty": <int>, "price": <float>}]
            order_type must be one of: "delivery", "pickup", "dine-in".
            NOTE: You do not need to provide the 'address' argument here anymore, the system automatically provides the stored address.
            """
            try:
                items_list = json.loads(items)
                order_id = await create_order(
                    phone_no=self.phone_number, 
                    customer_name=customer_name, 
                    order_type=order_type, 
                    address=str(self.collected_address) if self.collected_address else "", 
                    items=items_list, 
                    total_price=total_price, 
                    call_successful=call_successful, 
                    upsell_successful=upsell_successful
                )
                
                # Send SMS receipt
                sms_sent = send_order_sms(self.phone_number, order_id, total_price, call_successful)
                if sms_sent:
                    print(f"[Agent] Sent confirmation SMS for Order {order_id} to {self.phone_number}")

                return f"Order placed successfully! Order ID is {order_id}."
            except Exception as e:
                return f"Failed to place order: {str(e)}"

        @tool
        async def get_user_details() -> str:
            """Fetch details of the user calling to address them by name and see past history."""
            user = await get_user_by_phone(self.phone_number)
            if user:
                return json.dumps(user)
            return "New user. No history found."

        self.tools = [
            get_restaurant_menu,
            get_restaurant_combos,
            check_table,
            reserve_table,
            ask_for_address_directly,
            place_order,
            cancel_existing_order,
            get_user_details
        ]
        self.llm_with_tools = llm.bind_tools(self.tools)
        
    async def get_initial_greeting(self) -> str:
        """Generate the first message of the call."""
        response = await self.llm_with_tools.ainvoke(self.messages)
        self.messages.append(response)
        return response.content

    async def process_user_input(self, text: str) -> str:
        """Process user text input, handle tools, and return AI spoken response."""
        
        # Intercept for fast address collection
        if self.waiting_for_address:
            self.collected_address = text
            self.waiting_for_address = False
            self.messages.append(HumanMessage(content=f"System: The user provided their address directly as: {text}"))
            # Skip heavy tool loop, just acknowledge directly for ultra-fast response, 
            # but allow LLM to generate the bridging sentence.
            print(f"[Fast Path] Collected Address: {self.collected_address}")
            
            # Fast response generation directly acknowledging the address
            fast_ack = f"Got it, address saved."
            self.messages.append(AIMessage(content=fast_ack))
            return fast_ack + " What would you like to order today?"
            
        self.messages.append(HumanMessage(content=text))
        
        # Call LLM
        response = await self.llm_with_tools.ainvoke(self.messages)
        self.messages.append(response)
        
        # Handle Tool Calls
        if response.tool_calls:
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                
                # Dynamically call the corresponding tool
                tool_func = next((t for t in self.tools if t.name == tool_name), None)
                if tool_func:
                    print(f"[Agent] Calling Tool: {tool_name} with args {tool_args}")
                    try:
                        tool_result = await tool_func.ainvoke(tool_args)
                        
                        # Set waiting state if the AI explicitly wants to ask for address
                        if tool_name == "ask_for_address_directly":
                            self.waiting_for_address = True
                            
                        # Capture order_id if place_order was successful
                        if tool_name == "place_order" and "Order placed successfully" in str(tool_result):
                            import re
                            match = re.search(r"Order ID is ([\w\-]+)", str(tool_result))
                            if match:
                                self.order_id = match.group(1)

                    except Exception as e:
                        tool_result = f"Error: {e}"
                    
                    # Append tool result to messages
                    from langchain_core.messages import ToolMessage
                    self.messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"]))
            
            # Get final AI response after tool execution
            final_response = await self.llm_with_tools.ainvoke(self.messages)
            self.messages.append(final_response)
            
            # If waiting for address was triggered in this cycle, we override the AI's complex response with a fast short question.
            if self.waiting_for_address:
                fast_ask = "What is your delivery address?"
                self.messages[-1] = AIMessage(content=fast_ask)
                return fast_ask
                
            return final_response.content
        else:
            return response.content
            
    async def save_call_transcript(self):
        """Format and save the transcript based on conversation messages."""
        formatted_messages = []
        for msg in self.messages:
            if isinstance(msg, SystemMessage):
                continue
            elif isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                if msg.content:
                    formatted_messages.append({"role": "assistant", "content": msg.content})
            # We omit storing raw ToolMessages to keep the transcript lightweight, 
            # unless desired. Currently logging just conversational turns.
        
        try:
            from database import save_transcript
            await save_transcript(
                phone_no=self.phone_number,
                messages=formatted_messages,
                order_id=self.order_id
            )
            print("[Agent] Saved call transcript successfully.")
        except Exception as e:
            print(f"[Agent] Database Error saving transcript: {e}")
