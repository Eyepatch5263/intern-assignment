from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, date
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


def compute_status(medicine: models.Medicine) -> str:
    today = date.today().isoformat()
    if medicine.expiry_date and medicine.expiry_date < today:
        return "Expired"
    if medicine.stock == 0:
        return "Out of Stock"
    if medicine.stock <= medicine.low_stock_threshold:
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

    medicines = query.order_by(models.Medicine.name).all()

    # Recompute statuses dynamically
    result = []
    for m in medicines:
        m.status = compute_status(m)
        if status and m.status != status:
            continue
        result.append(m)
    return result


@router.get("/medicines/{medicine_id}", response_model=schemas.MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicine.status = compute_status(medicine)
    return medicine


@router.post("/medicines", response_model=schemas.MedicineResponse, status_code=201)
def create_medicine(payload: schemas.MedicineCreate, db: Session = Depends(get_db)):
    medicine = models.Medicine(**payload.model_dump())
    medicine.status = compute_status(medicine)
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


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

    medicine.status = compute_status(medicine)
    medicine.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(medicine)
    return medicine


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

    medicine.status = status
    medicine.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(medicine)
    return medicine


@router.delete("/medicines/{medicine_id}", status_code=204)
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(medicine)
    db.commit()


@router.get("/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Medicine.category).distinct().all()
    return [c[0] for c in categories]
