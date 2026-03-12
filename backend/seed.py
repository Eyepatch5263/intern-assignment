from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime, timedelta, date
import random


MEDICINES = [
    {"name": "Paracetamol 500mg", "category": "Analgesic", "manufacturer": "GSK", "price": 5.50, "stock": 200, "low_stock_threshold": 30, "expiry_date": "2026-12-31", "description": "Pain reliever and fever reducer"},
    {"name": "Amoxicillin 250mg", "category": "Antibiotic", "manufacturer": "Pfizer", "price": 12.00, "stock": 15, "low_stock_threshold": 20, "expiry_date": "2026-06-30", "description": "Broad-spectrum antibiotic"},
    {"name": "Ibuprofen 400mg", "category": "Analgesic", "manufacturer": "Reckitt", "price": 8.75, "stock": 80, "low_stock_threshold": 25, "expiry_date": "2026-09-15", "description": "Anti-inflammatory pain reliever"},
    {"name": "Metformin 500mg", "category": "Antidiabetic", "manufacturer": "Sun Pharma", "price": 15.00, "stock": 0, "low_stock_threshold": 20, "expiry_date": "2026-11-30", "description": "Controls blood sugar levels"},
    {"name": "Atorvastatin 10mg", "category": "Cardiovascular", "manufacturer": "Lipitor Inc", "price": 22.50, "stock": 60, "low_stock_threshold": 20, "expiry_date": "2027-01-31", "description": "Cholesterol-lowering statin"},
    {"name": "Cetirizine 10mg", "category": "Antihistamine", "manufacturer": "UCB", "price": 6.25, "stock": 10, "low_stock_threshold": 20, "expiry_date": "2026-08-20", "description": "Allergy relief"},
    {"name": "Omeprazole 20mg", "category": "Antacid", "manufacturer": "AstraZeneca", "price": 18.00, "stock": 90, "low_stock_threshold": 25, "expiry_date": "2027-02-28", "description": "Proton pump inhibitor for acid reflux"},
    {"name": "Salbutamol Inhaler", "category": "Respiratory", "manufacturer": "GSK", "price": 45.00, "stock": 35, "low_stock_threshold": 15, "expiry_date": "2026-07-15", "description": "Bronchodilator for asthma"},
    {"name": "Vitamin C 1000mg", "category": "Supplement", "manufacturer": "NOW Foods", "price": 9.00, "stock": 5, "low_stock_threshold": 30, "expiry_date": "2025-03-01", "description": "Immune system booster"},
    {"name": "Azithromycin 500mg", "category": "Antibiotic", "manufacturer": "Pfizer", "price": 35.00, "stock": 25, "low_stock_threshold": 15, "expiry_date": "2026-10-31", "description": "Macrolide antibiotic"},
    {"name": "Lisinopril 10mg", "category": "Cardiovascular", "manufacturer": "Merck", "price": 14.50, "stock": 70, "low_stock_threshold": 20, "expiry_date": "2027-03-31", "description": "ACE inhibitor for blood pressure"},
    {"name": "Dextromethorphan Syrup", "category": "Cough & Cold", "manufacturer": "Robitussin", "price": 11.00, "stock": 8, "low_stock_threshold": 15, "expiry_date": "2026-05-31", "description": "Cough suppressant"},
    {"name": "Diclofenac 50mg", "category": "Analgesic", "manufacturer": "Novartis", "price": 7.50, "stock": 110, "low_stock_threshold": 25, "expiry_date": "2026-12-15", "description": "NSAID for pain and inflammation"},
    {"name": "Amlodipine 5mg", "category": "Cardiovascular", "manufacturer": "Norvasc", "price": 19.00, "stock": 55, "low_stock_threshold": 20, "expiry_date": "2027-04-30", "description": "Calcium channel blocker"},
    {"name": "Pantoprazole 40mg", "category": "Antacid", "manufacturer": "Wyeth", "price": 23.00, "stock": 45, "low_stock_threshold": 15, "expiry_date": "2026-11-20", "description": "Gastric acid reducer"},
]

CUSTOMERS = [
    "John Smith", "Mary Johnson", "Robert Williams", "Patricia Brown",
    "James Davis", "Linda Miller", "Michael Wilson", "Barbara Moore",
    "Walk-in Customer", "David Taylor", "Susan Anderson", "Walk-in Customer",
    "Jennifer Thomas", "William Jackson", "Walk-in Customer",
]

SUPPLIERS = ["MediSupply Co.", "PharmaDistrib Ltd.", "HealthCare Wholesale", "BioMed Suppliers"]


def seed_database():
    db = SessionLocal()
    try:
        # Skip seeding if already done
        if db.query(models.Medicine).count() > 0:
            return

        # Add medicines
        med_objects = []
        for med_data in MEDICINES:
            today_str = date.today().isoformat()
            expiry = med_data["expiry_date"]
            stock = med_data["stock"]
            threshold = med_data["low_stock_threshold"]
            if expiry < today_str:
                status = "Expired"
            elif stock == 0:
                status = "Out of Stock"
            elif stock <= threshold:
                status = "Low Stock"
            else:
                status = "Active"

            med = models.Medicine(**{**med_data, "status": status})
            db.add(med)
            med_objects.append(med)

        db.flush()

        # Generate sales for last 30 days
        for days_ago in range(30, 0, -1):
            sale_date = datetime.now() - timedelta(days=days_ago)
            sales_per_day = random.randint(3, 8)

            for _ in range(sales_per_day):
                available_meds = [m for m in med_objects if m.stock > 5]
                if not available_meds:
                    continue

                num_items = random.randint(1, 3)
                chosen = random.sample(available_meds, min(num_items, len(available_meds)))
                total = 0.0
                items_data = []
                valid = True

                for med in chosen:
                    qty = random.randint(1, min(3, med.stock // 2 + 1))
                    if qty > med.stock:
                        valid = False
                        break
                    item_total = med.price * qty
                    total += item_total
                    items_data.append({"med": med, "qty": qty, "unit": med.price, "total": item_total})

                if not valid or not items_data:
                    continue

                sale = models.Sale(
                    customer_name=random.choice(CUSTOMERS),
                    total_amount=round(total, 2),
                    created_at=sale_date,
                )
                db.add(sale)
                db.flush()

                for item_data in items_data:
                    si = models.SaleItem(
                        sale_id=sale.id,
                        medicine_id=item_data["med"].id,
                        quantity=item_data["qty"],
                        unit_price=item_data["unit"],
                        total_price=round(item_data["total"], 2),
                    )
                    db.add(si)
                    item_data["med"].stock = max(0, item_data["med"].stock - item_data["qty"])

        # Generate purchase orders
        po_statuses = ["Pending", "Approved", "Delivered", "Pending", "Approved"]
        for i, med in enumerate(med_objects[:8]):
            qty = random.randint(50, 200)
            unit_cost = round(med.price * 0.6, 2)
            po = models.PurchaseOrder(
                medicine_id=med.id,
                quantity=qty,
                unit_cost=unit_cost,
                total_cost=round(unit_cost * qty, 2),
                status=po_statuses[i % len(po_statuses)],
                supplier=random.choice(SUPPLIERS),
                created_at=datetime.now() - timedelta(days=random.randint(1, 15)),
            )
            db.add(po)

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seeding error: {e}")
    finally:
        db.close()
