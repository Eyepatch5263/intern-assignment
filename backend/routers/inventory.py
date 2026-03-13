from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, Optional, List, cast
from datetime import datetime, date, timezone
from database import get_db
import models, schemas

# define router for inventory
router = APIRouter(prefix="/api/inventory", tags=["inventory"])

# define function to compute status of medicine
def compute_status(medicine: models.Medicine) -> str:
    m = cast(Any, medicine)
    today = date.today().isoformat()
    expiry_date = m.expiry_date
    stock = int(m.stock or 0)
    threshold = int(m.low_stock_threshold or 0)
    if expiry_date and expiry_date < today:
        return "Expired"
    if stock == 0:
        return "Out of Stock"
    if stock <= threshold:
        return "Low Stock"
    return "Active"


@router.get("/medicines", response_model=List[schemas.MedicineResponse])
def list_medicines(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Medicine)
    if search:
        query = query.filter(
            models.Medicine.name.ilike(f"%{search}%")
            | models.Medicine.manufacturer.ilike(f"%{search}%")
        )
    if category:
        query = query.filter(models.Medicine.category == category)
    if status:
        query = query.filter(models.Medicine.status == status)

    medicines = query.order_by(models.Medicine.name).all()
    return medicines


@router.get("/medicines/{medicine_id}", response_model=schemas.MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine


# define route for creating medicine
@router.post("/medicines", response_model=schemas.MedicineResponse, status_code=201)
def create_medicine(payload: schemas.MedicineCreate, db: Session = Depends(get_db)):
    medicine = models.Medicine(**payload.model_dump())
    if not medicine.status:
        cast(Any, medicine).status = compute_status(medicine)
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


# define route for updating medicine
@router.put("/medicines/{medicine_id}", response_model=schemas.MedicineResponse)
def update_medicine(
    medicine_id: int, payload: schemas.MedicineUpdate, db: Session = Depends(get_db)
):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(medicine, key, value)

    med = cast(Any, medicine)
    # Only auto-compute if status was NOT explicitly updated in this request
    if "status" not in update_data:
        med.status = compute_status(medicine)
    
    med.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(medicine)
    return medicine


# define route for updating medicine status
@router.patch("/medicines/{medicine_id}/status", response_model=schemas.MedicineResponse)
def update_medicine_status(
    medicine_id: int, status: str = Query(...), db: Session = Depends(get_db)
):
    valid_statuses = ["Active", "Low Stock", "Expired", "Out of Stock"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")

    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    med = cast(Any, medicine)
    med.status = status
    med.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(medicine)
    return medicine


# define route for deleting medicine
@router.delete("/medicines/{medicine_id}", status_code=204)
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(medicine)
    db.commit()


# define route for listing categories
@router.get("/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Medicine.category).distinct().all()
    return [c[0] for c in categories]
