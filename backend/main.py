from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import dashboard, inventory, sales, purchase_orders

try:
    # Create all tables
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Table creation skipped or failed (likely already exist): {e}")

app = FastAPI(title="Pharmacy CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(inventory.router)
app.include_router(sales.router)
app.include_router(purchase_orders.router)


@app.on_event("startup")
def startup_event():
    pass


@app.get("/health")
def health_check():
    return {"status": "ok"}
