import os
import json
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')

RESTAURANT_NAME = "Petpooja"

def _send_sms(to_number: str, body: str):
    """Internal function to send SMS via Twilio"""
    if not account_sid or not auth_token or not twilio_number:
        print("[SMS Error] Twilio credentials not set. Cannot send SMS.")
        return False
        
    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=body,
            from_=twilio_number,
            to=to_number
        )
        print(f"[SMS Sent] to {to_number}, SID: {message.sid}")
        return True
    except Exception as e:
        print(f"[SMS Error] Failed to send SMS: {e}")
        return False

def send_order_success_sms(phone_no: str, order_id: str, items: list, total_bill: float):
    """
    Case 1 - Successful Order Call
    """
    items_text = ""
    if items:
        for item in items:
            name = item.get("name", "Item")
            qty = item.get("quantity", 1)
            items_text += f"{qty} {name}\n"
    
    body = f"""Thank you for ordering from {RESTAURANT_NAME}.
Order ID: {order_id}

Your Order
{items_text.strip()}

Total Bill: Rs. {total_bill}
Your order will be delivered shortly."""

    return _send_sms(phone_no, body)

def send_unsuccessful_call_sms(phone_no: str):
    """
    Case 2 - Unsuccessful Call (ended early or failed convo)
    """
    body = f"""Thank you for calling {RESTAURANT_NAME}.
Unfortunately, your order could not be completed during the call.
Please call again to place your order.
We look forward to serving you."""

    return _send_sms(phone_no, body)

def send_missing_info_sms(phone_no: str, missing_info_type: str = "Delivery Address/Confirmation"):
    """
    Case 3 - Missing Information During Call
    """
    body = f"""Hello from {RESTAURANT_NAME}.
We were unable to complete your order because some details were missing.
Please reply with the following information:
{missing_info_type}:

Once we receive your response, we will complete your order and send the final bill."""

    return _send_sms(phone_no, body)
