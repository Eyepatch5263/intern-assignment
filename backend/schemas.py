from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MedicineBase(BaseModel):
    name: str
    category: str
    manufacturer: Optional[str] = None
    price: float
    stock: int
    low_stock_threshold: int = 20
    expiry_date: Optional[str] = None
    description: Optional[str] = None


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class MedicineResponse(MedicineBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: int


class SaleCreate(BaseModel):
    customer_name: Optional[str] = "Walk-in Customer"
    items: List[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: int
    customer_name: Optional[str]
    total_amount: float
    created_at: datetime
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True


class PurchaseOrderCreate(BaseModel):
    medicine_id: int
    quantity: int
    unit_cost: float
    supplier: Optional[str] = None


class PurchaseOrderUpdate(BaseModel):
    status: str


class PurchaseOrderResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    quantity: int
    unit_cost: float
    total_cost: float
    status: str
    supplier: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SalesSummary(BaseModel):
    today_revenue: float
    today_sales_count: int
    total_items_sold_today: int
    monthly_revenue: float
    monthly_sales_count: int
    total_items_monthly: int
    total_sales_count: int


class LowStockItem(BaseModel):
    id: int
    name: str
    stock: int
    low_stock_threshold: int
    status: str


class PurchaseOrderSummary(BaseModel):
    pending_count: int
    approved_count: int
    delivered_count: int
    total_pending_cost: float


class DashboardSummary(BaseModel):
    sales: SalesSummary
    low_stock_items: List[LowStockItem]
    purchase_orders: PurchaseOrderSummary
    total_medicines: int
    out_of_stock_count: int
