from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import Any, cast, Optional
from datetime import date, datetime, timezone
from database import get_db
import models, schemas

# define router for dashboard
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# define route for dashboard summary, it will fetch all the required data for the dashboard
@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(tz: Optional[str] = Query("UTC"), db: Session = Depends(get_db)):
    
    # date time logic for syncronization between sales and purchase history
    if tz:
        try:
            db.execute(text(f"SET TimeZone = :tz"), {"tz": tz})
        except:
             db.execute(text("SET TimeZone = 'UTC'"))

    today = db.query(func.current_date()).scalar()
    month_start = date(today.year, today.month, 1)

    # sales aggregates are computed from DB-side filters to keep stats in sync
    # with transaction history even as records grow.
    today_revenue = (
        db.query(func.sum(models.Sale.total_amount))
        .filter(func.date(models.Sale.created_at) == today)
        .scalar()
    ) or 0.0
    today_sales_count = (
        db.query(func.count(models.Sale.id))
        .filter(func.date(models.Sale.created_at) == today)
        .scalar()
        or 0
    )
    total_items_today = (
        db.query(func.sum(models.SaleItem.quantity))
        .join(models.Sale, models.Sale.id == models.SaleItem.sale_id)
        .filter(func.date(models.Sale.created_at) == today)
        .scalar()
    ) or 0

    monthly_revenue = (
        db.query(func.sum(models.Sale.total_amount))
        .filter(func.date(models.Sale.created_at) >= month_start)
        .scalar()
    ) or 0.0
    monthly_sales_count = (
        db.query(func.count(models.Sale.id))
        .filter(func.date(models.Sale.created_at) >= month_start)
        .scalar()
        or 0
    )
    total_items_monthly = (
        db.query(func.sum(models.SaleItem.quantity))
        .join(models.Sale, models.Sale.id == models.SaleItem.sale_id)
        .filter(func.date(models.Sale.created_at) >= month_start)
        .scalar()
    ) or 0
    total_sales_count = db.query(func.count(models.Sale.id)).scalar() or 0

    # Low stock and out of stock medicines
    today_str = today.isoformat()
    all_medicines = db.query(models.Medicine).all()

    low_stock_items = []
    out_of_stock_count = 0
    for m in all_medicines:
        med = cast(Any, m)
        expiry_date = med.expiry_date
        stock = int(med.stock or 0)
        threshold = int(med.low_stock_threshold or 0)
        if expiry_date and expiry_date < today_str:
            computed_status = "Expired"
        elif stock == 0:
            computed_status = "Out of Stock"
            out_of_stock_count += 1
        elif stock <= threshold:
            computed_status = "Low Stock"
        else:
            computed_status = "Active"

        if computed_status in ("Low Stock", "Out of Stock"):
            low_stock_items.append(
                schemas.LowStockItem(
                    id=int(med.id),
                    name=str(med.name),
                    stock=stock,
                    low_stock_threshold=threshold,
                    status=computed_status,
                )
            )

    # Purchase order summary
    all_orders = db.query(models.PurchaseOrder).all()
    pending_count = sum(1 for o in all_orders if cast(Any, o).status == "Pending")
    approved_count = sum(1 for o in all_orders if cast(Any, o).status == "Approved")
    delivered_count = sum(1 for o in all_orders if cast(Any, o).status == "Delivered")
    total_pending_cost = sum(
        float(cast(Any, o).total_cost) for o in all_orders if cast(Any, o).status == "Pending"
    )

    return schemas.DashboardSummary(
        sales=schemas.SalesSummary(
            today_revenue=round(float(today_revenue), 2),
            today_sales_count=today_sales_count,
            total_items_sold_today=int(total_items_today),
            monthly_revenue=round(float(monthly_revenue), 2),
            monthly_sales_count=monthly_sales_count,
            total_items_monthly=int(total_items_monthly),
            total_sales_count=total_sales_count,
        ),
        low_stock_items=low_stock_items,
        purchase_orders=schemas.PurchaseOrderSummary(
            pending_count=pending_count,
            approved_count=approved_count,
            delivered_count=delivered_count,
            total_pending_cost=round(float(total_pending_cost), 2),
        ),
        total_medicines=len(all_medicines),
        out_of_stock_count=out_of_stock_count,
    )
