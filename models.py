from pydantic import BaseModel
from typing import Optional
from datetime import date

class PayoutDashboardEntry(BaseModel):
    """
    Model representing a single entry in the payout dashboard
    """
    destination_id: str
    financial_year: str
    month: date
    destination_type: str
    reason_name: str
    payment_type: str
    customer_created: int
    total_customers: int
    upfront_referral: float
    trail_referral: float
    total_payout_amount: float
    avg_aum: float
    tds: float
    actual_payout: float
    actual_tds: float
    gst_amount: float 