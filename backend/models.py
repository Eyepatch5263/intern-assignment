from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, func, Sequence
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class MedicineStatus(str, enum.Enum):
    active = "Active"
    low_stock = "Low Stock"
    expired = "Expired"
    out_of_stock = "Out of Stock"


class PurchaseOrderStatus(str, enum.Enum):
    pending = "Pending"
    approved = "Approved"
    delivered = "Delivered"
    cancelled = "Cancelled"


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, Sequence('medicines_id_seq'), primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    manufacturer = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    low_stock_threshold = Column(Integer, default=20)
    expiry_date = Column(String, nullable=True)
    status = Column(String, default=MedicineStatus.active)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    sale_items = relationship("SaleItem", back_populates="medicine")
    purchase_orders = relationship("PurchaseOrder", back_populates="medicine")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, Sequence('sales_id_seq'), primary_key=True, index=True)
    customer_name = Column(String, nullable=True, default="Walk-in Customer")
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())

    items = relationship("SaleItem", back_populates="sale")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, Sequence('sale_items_id_seq'), primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")
    medicine = relationship("Medicine", back_populates="sale_items")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, Sequence('purchase_orders_id_seq'), primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    status = Column(String, default=PurchaseOrderStatus.pending)
    supplier = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    medicine = relationship("Medicine", back_populates="purchase_orders")
