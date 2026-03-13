from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Any, List, cast
from datetime import datetime, date, timezone
from database import get_db
import models, schemas

# define router for sales
router = APIRouter(prefix="/api/sales", tags=["sales"])


# define function to compute status of medicine
def compute_status(medicine: models.Medicine) -> str:
    med = cast(Any, medicine)
    today = date.today().isoformat()
    expiry_date = med.expiry_date
    stock = int(med.stock or 0)
    low_stock_threshold = int(med.low_stock_threshold or 0)

    if expiry_date and expiry_date < today:
        return "Expired"
    if stock == 0:
        return "Out of Stock"
    if stock <= low_stock_threshold:
        return "Low Stock"
    return "Active"


# define function to map sale item
def map_sale_item(si: models.SaleItem) -> schemas.SaleItemResponse:
    item = cast(Any, si)
    medicine = cast(Any, item.medicine) if item.medicine else None
    return schemas.SaleItemResponse(
        id=int(item.id),
        medicine_id=int(item.medicine_id),
        medicine_name=medicine.name if medicine else None,
        quantity=int(item.quantity),
        unit_price=float(item.unit_price),
        total_price=float(item.total_price),
    )


# define function to map sale
def map_sale(sale: models.Sale) -> schemas.SaleResponse:
    s = cast(Any, sale)
    return schemas.SaleResponse(
        id=int(s.id),
        customer_name=s.customer_name,
        total_amount=float(s.total_amount),
        created_at=s.created_at,
        items=[map_sale_item(si) for si in s.items],
    )


# define route for creating sale
@router.post("", response_model=schemas.SaleResponse, status_code=201)
def create_sale(payload: schemas.SaleCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Sale must include at least one item")

    total_amount = 0.0
    sale_items_data = []

    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        medicine = db.query(models.Medicine).filter(models.Medicine.id == item.medicine_id).first()
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine {item.medicine_id} not found")
        med = cast(Any, medicine)
        available_stock = int(med.stock or 0)
        if available_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {medicine.name}. Available: {available_stock}",
            )

        item_total = float(med.price) * item.quantity
        total_amount += item_total
        sale_items_data.append(
            {
                "medicine": medicine,
                "quantity": item.quantity,
                "unit_price": float(med.price),
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
        item_data["medicine"].status = compute_status(item_data["medicine"])
        item_data["medicine"].updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(sale)

    return map_sale(sale)


# define route for listing sales
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
        result.append(map_sale(sale))
    return result


# define route for recent sales
@router.get("/recent", response_model=List[schemas.SaleResponse])
def recent_sales(limit: int = Query(10, ge=1, le=200), db: Session = Depends(get_db)):
    sales = (
        db.query(models.Sale)
        .order_by(models.Sale.created_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for sale in sales:
        result.append(map_sale(sale))
    return result
