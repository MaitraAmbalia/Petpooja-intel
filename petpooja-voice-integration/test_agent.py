import asyncio
from agent import ConversationManager

async def test_llm():
    agent = ConversationManager("+919999999999")
    print("Agent init done.")
    
    # Force a direct process to trace the tools
    # Let's mock a fast forward where the user explicitly tells everything needed to place an order
    resp1 = await agent.get_initial_greeting()
    print("AI:", resp1)

    print("\n--- Sending Order directly ---")
    resp2 = await agent.process_user_input("My name is Test User. My address is 123 Main St. I want to order 2 Burgers for delivery.")
    print("AI:", resp2)
    
    # Just to let the Agent finalize
    resp3 = await agent.process_user_input("Yes confirm the order.")
    print("AI:", resp3)

if __name__ == "__main__":
    asyncio.run(test_llm())
