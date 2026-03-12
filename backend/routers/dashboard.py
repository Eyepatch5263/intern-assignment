from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    month_start = datetime(date.today().year, date.today().month, 1)

    # Today's sales
    today_sales = (
        db.query(models.Sale)
        .filter(models.Sale.created_at >= today_start, models.Sale.created_at <= today_end)
        .all()
    )
    today_revenue = sum(s.total_amount for s in today_sales)
    today_sales_count = len(today_sales)
    today_sale_ids = [s.id for s in today_sales]

    # Today's items sold
    if today_sale_ids:
        total_items_today = (
            db.query(func.sum(models.SaleItem.quantity))
            .filter(models.SaleItem.sale_id.in_(today_sale_ids))
            .scalar()
            or 0
        )
    else:
        total_items_today = 0

    # Monthly sales
    monthly_sales = (
        db.query(models.Sale)
        .filter(models.Sale.created_at >= month_start)
        .all()
    )
    monthly_revenue = sum(s.total_amount for s in monthly_sales)
    monthly_sales_count = len(monthly_sales)

    # Low stock and out of stock medicines
    today_str = date.today().isoformat()
    all_medicines = db.query(models.Medicine).all()

    low_stock_items = []
    out_of_stock_count = 0
    for m in all_medicines:
        if m.expiry_date and m.expiry_date < today_str:
            computed_status = "Expired"
        elif m.stock == 0:
            computed_status = "Out of Stock"
            out_of_stock_count += 1
        elif m.stock <= m.low_stock_threshold:
            computed_status = "Low Stock"
        else:
            computed_status = "Active"

        if computed_status in ("Low Stock", "Out of Stock", "Expired"):
            low_stock_items.append(
                schemas.LowStockItem(
                    id=m.id,
                    name=m.name,
                    stock=m.stock,
                    low_stock_threshold=m.low_stock_threshold,
                    status=computed_status,
                )
            )

    # Purchase order summary
    all_orders = db.query(models.PurchaseOrder).all()
    pending_count = sum(1 for o in all_orders if o.status == "Pending")
    approved_count = sum(1 for o in all_orders if o.status == "Approved")
    delivered_count = sum(1 for o in all_orders if o.status == "Delivered")
    total_pending_cost = sum(o.total_cost for o in all_orders if o.status == "Pending")

    return schemas.DashboardSummary(
        sales=schemas.SalesSummary(
            today_revenue=round(today_revenue, 2),
            today_sales_count=today_sales_count,
            total_items_sold_today=total_items_today,
            monthly_revenue=round(monthly_revenue, 2),
            monthly_sales_count=monthly_sales_count,
        ),
        low_stock_items=low_stock_items,
        purchase_orders=schemas.PurchaseOrderSummary(
            pending_count=pending_count,
            approved_count=approved_count,
            delivered_count=delivered_count,
            total_pending_cost=round(total_pending_cost, 2),
        ),
        total_medicines=len(all_medicines),
        out_of_stock_count=out_of_stock_count,
    )
