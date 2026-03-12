from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.post("", response_model=schemas.SaleResponse, status_code=201)
def create_sale(payload: schemas.SaleCreate, db: Session = Depends(get_db)):
    total_amount = 0.0
    sale_items_data = []

    for item in payload.items:
        medicine = db.query(models.Medicine).filter(models.Medicine.id == item.medicine_id).first()
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine {item.medicine_id} not found")
        if medicine.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {medicine.name}. Available: {medicine.stock}",
            )

        item_total = medicine.price * item.quantity
        total_amount += item_total
        sale_items_data.append(
            {
                "medicine": medicine,
                "quantity": item.quantity,
                "unit_price": medicine.price,
                "total_price": item_total,
            }
        )

    sale = models.Sale(
        customer_name=payload.customer_name,
        total_amount=total_amount,
    )
    db.add(sale)
    db.flush()

    for item_data in sale_items_data:
        sale_item = models.SaleItem(
            sale_id=sale.id,
            medicine_id=item_data["medicine"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total_price=item_data["total_price"],
        )
        db.add(sale_item)
        # Deduct stock
        item_data["medicine"].stock -= item_data["quantity"]
        item_data["medicine"].updated_at = datetime.utcnow()

    db.commit()
    db.refresh(sale)

    # Build response
    response_items = []
    for si in sale.items:
        response_items.append(
            schemas.SaleItemResponse(
                id=si.id,
                medicine_id=si.medicine_id,
                medicine_name=si.medicine.name if si.medicine else None,
                quantity=si.quantity,
                unit_price=si.unit_price,
                total_price=si.total_price,
            )
        )

    return schemas.SaleResponse(
        id=sale.id,
        customer_name=sale.customer_name,
        total_amount=sale.total_amount,
        created_at=sale.created_at,
        items=response_items,
    )


@router.get("", response_model=List[schemas.SaleResponse])
def list_sales(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    sales = (
        db.query(models.Sale)
        .order_by(models.Sale.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for sale in sales:
        items = []
        for si in sale.items:
            items.append(
                schemas.SaleItemResponse(
                    id=si.id,
                    medicine_id=si.medicine_id,
                    medicine_name=si.medicine.name if si.medicine else None,
                    quantity=si.quantity,
                    unit_price=si.unit_price,
                    total_price=si.total_price,
                )
            )
        result.append(
            schemas.SaleResponse(
                id=sale.id,
                customer_name=sale.customer_name,
                total_amount=sale.total_amount,
                created_at=sale.created_at,
                items=items,
            )
        )
    return result


@router.get("/recent", response_model=List[schemas.SaleResponse])
def recent_sales(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    sales = (
        db.query(models.Sale)
        .order_by(models.Sale.created_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for sale in sales:
        items = []
        for si in sale.items:
            items.append(
                schemas.SaleItemResponse(
                    id=si.id,
                    medicine_id=si.medicine_id,
                    medicine_name=si.medicine.name if si.medicine else None,
                    quantity=si.quantity,
                    unit_price=si.unit_price,
                    total_price=si.total_price,
                )
            )
        result.append(
            schemas.SaleResponse(
                id=sale.id,
                customer_name=sale.customer_name,
                total_amount=sale.total_amount,
                created_at=sale.created_at,
                items=items,
            )
        )
    return result
