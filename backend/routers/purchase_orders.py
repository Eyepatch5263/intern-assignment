from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/purchase-orders", tags=["purchase-orders"])


@router.get("", response_model=List[schemas.PurchaseOrderResponse])
def list_purchase_orders(
    status: str = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.PurchaseOrder)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    orders = query.order_by(models.PurchaseOrder.created_at.desc()).all()

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

    order.status = payload.status
    if payload.status == "Delivered":
        # Add stock to medicine
        order.medicine.stock += order.quantity

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
