from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from database import get_db
import models, schemas

# define router for purchase orders
router = APIRouter(prefix="/api/purchase-orders", tags=["purchase-orders"])


# define function to compute status of medicine
def compute_status(medicine: models.Medicine) -> str:
    today = date.today().isoformat()
    expiry_date = medicine.expiry_date
    stock = int(medicine.stock or 0)
    low_stock_threshold = int(medicine.low_stock_threshold or 0)

    if expiry_date and expiry_date < today:
        return "Expired"
    if stock == 0:
        return "Out of Stock"
    if stock <= low_stock_threshold:
        return "Low Stock"
    return "Active"


# define route for listing purchase orders
@router.get("", response_model=List[schemas.PurchaseOrderResponse])
def list_purchase_orders(
    status: str = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(models.PurchaseOrder)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    orders = (
        query.order_by(models.PurchaseOrder.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for order in orders:
        result.append(
            schemas.PurchaseOrderResponse(
                id=order.id,
                medicine_id=order.medicine_id,
                medicine_name=order.medicine.name if order.medicine else None,
                quantity=order.quantity,
                unit_cost=order.unit_cost,
                total_cost=order.total_cost,
                status=order.status,
                supplier=order.supplier,
                created_at=order.created_at,
            )
        )
    return result


# define route for creating purchase order
@router.post("", response_model=schemas.PurchaseOrderResponse, status_code=201)
def create_purchase_order(
    payload: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)
):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == payload.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    order = models.PurchaseOrder(
        medicine_id=payload.medicine_id,
        quantity=payload.quantity,
        unit_cost=payload.unit_cost,
        total_cost=payload.unit_cost * payload.quantity,
        supplier=payload.supplier,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return schemas.PurchaseOrderResponse(
        id=order.id,
        medicine_id=order.medicine_id,
        medicine_name=medicine.name,
        quantity=order.quantity,
        unit_cost=order.unit_cost,
        total_cost=order.total_cost,
        status=order.status,
        supplier=order.supplier,
        created_at=order.created_at,
    )


# define route for updating purchase order status
@router.patch("/{order_id}/status", response_model=schemas.PurchaseOrderResponse)
def update_order_status(
    order_id: int, payload: schemas.PurchaseOrderUpdate, db: Session = Depends(get_db)
):
    valid_statuses = ["Pending", "Approved", "Delivered", "Cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")

    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    previous_status = order.status
    order.status = payload.status
    order.updated_at = datetime.utcnow()

    if payload.status == "Delivered" and previous_status != "Delivered":
        # Add stock only on the first transition to Delivered.
        order.medicine.stock += order.quantity
        order.medicine.status = compute_status(order.medicine)
        order.medicine.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(order)

    return schemas.PurchaseOrderResponse(
        id=order.id,
        medicine_id=order.medicine_id,
        medicine_name=order.medicine.name if order.medicine else None,
        quantity=order.quantity,
        unit_cost=order.unit_cost,
        total_cost=order.total_cost,
        status=order.status,
        supplier=order.supplier,
        created_at=order.created_at,
    )
