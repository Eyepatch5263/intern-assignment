import { useState, useEffect, useCallback } from "react";
import { inventoryApi, purchaseOrderApi, salesApi } from "../api";
import Spinner from "../components/Spinner";
import { fmt } from "../utils";
import { EMPTY_FORM, EMPTY_SALE_LINE, EMPTY_PURCHASE_FORM } from "../constant";
import MedicineForm from "../components/MedicineForm";
import Modal from "../components/Modal";
import Topbar from "../components/inventory_components/Topbar";
import InventoryActions from "../components/inventory_components/InventoryActions";
import Stats from "../components/inventory_components/Stats";
import InventorySearch from "../components/inventory_components/InventorySearch";
import StatusChip from "../components/inventory_components/StatusChip";
import InventoryTable from "../components/inventory_components/InventoryTable";
import StatusChangeModal from "../components/inventory_components/StatusChangeModal";
import CreateSaleForm from "../components/inventory_components/CreateSaleForm";
import CreatePurchaseForm from "../components/inventory_components/CreatePurchaseForm";

export default function Inventory({ onNavigateDashboard }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [statusChangeMed, setStatusChangeMed] = useState(null);

  const [showSale, setShowSale] = useState(false);
  const [saleCustomer, setSaleCustomer] = useState("Walk-in Customer");
  const [saleItems, setSaleItems] = useState([{ ...EMPTY_SALE_LINE }]);
  const [saleMedicines, setSaleMedicines] = useState([]);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleSaving, setSaleSaving] = useState(false);
  const [saleError, setSaleError] = useState(null);

  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState(EMPTY_PURCHASE_FORM);
  const [purchaseMedicines, setPurchaseMedicines] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  const fetchData = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;

    setLoading(true);
    inventoryApi.getMedicines(params)
      .then(setMedicines)
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    inventoryApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(null); setShowAdd(true); };
  const openEdit = (med) => {
    setForm({
      name: med.name, category: med.category, manufacturer: med.manufacturer || "",
      price: String(med.price), stock: String(med.stock),
      low_stock_threshold: String(med.low_stock_threshold),
      expiry_date: med.expiry_date || "", description: med.description || "",
    });
    setFormError(null);
    setEditMed(med);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError(null);
    const payload = {
      name: form.name, category: form.category, manufacturer: form.manufacturer || null,
      price: parseFloat(form.price), stock: parseInt(form.stock),
      low_stock_threshold: parseInt(form.low_stock_threshold) || 20,
      expiry_date: form.expiry_date || null, description: form.description || null,
    };
    try {
      if (editMed) {
        await inventoryApi.updateMedicine(editMed.id, payload);
        setEditMed(null);
      } else {
        await inventoryApi.createMedicine(payload);
        setShowAdd(false);
      }
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to save medicine.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (med, newStatus) => {
    try {
      await inventoryApi.updateStatus(med.id, newStatus);
      fetchData();
    } catch {
      alert("Failed to update status.");
    }
    setStatusChangeMed(null);
  };

  const openSaleModal = async () => {
    setShowSale(true);
    setSaleError(null);
    setSaleLoading(true);
    setSaleCustomer("Walk-in Customer");
    setSaleItems([{ ...EMPTY_SALE_LINE }]);
    try {
      const all = await inventoryApi.getMedicines();
      setSaleMedicines(all.filter((m) => m.stock > 0 && m.status !== "Expired"));
    } catch {
      setSaleError("Failed to load medicines for sale.");
    } finally {
      setSaleLoading(false);
    }
  };

  const updateSaleLine = (idx, key, value) => {
    setSaleItems((lines) => lines.map((line, i) => (i === idx ? { ...line, [key]: value } : line)));
  };

  const addSaleLine = () => setSaleItems((lines) => [...lines, { ...EMPTY_SALE_LINE }]);
  const removeSaleLine = (idx) => setSaleItems((lines) => lines.filter((_, i) => i !== idx));

  const handleCreateSale = async (e) => {
    e.preventDefault();
    setSaleError(null);

    const validItems = saleItems
      .filter((line) => line.medicine_id)
      .map((line) => ({
        medicine_id: parseInt(line.medicine_id, 10),
        quantity: parseInt(line.quantity, 10),
      }))
      .filter((line) => Number.isInteger(line.medicine_id) && Number.isInteger(line.quantity) && line.quantity > 0);

    if (validItems.length === 0) {
      setSaleError("Add at least one medicine with a valid quantity.");
      return;
    }

    setSaleSaving(true);
    try {
      await salesApi.createSale({
        customer_name: saleCustomer?.trim() || "Walk-in Customer",
        items: validItems,
      });
      setShowSale(false);
      fetchData();
      if (onNavigateDashboard) {
        onNavigateDashboard("sales");
      }
    } catch (err) {
      setSaleError(err.response?.data?.detail || "Failed to create sale.");
    } finally {
      setSaleSaving(false);
    }
  };

  const openPurchaseModal = async () => {
    setShowPurchase(true);
    setPurchaseError(null);
    setPurchaseLoading(true);
    setPurchaseForm(EMPTY_PURCHASE_FORM);

    try {
      const all = await inventoryApi.getMedicines();
      setPurchaseMedicines(all);
    } catch {
      setPurchaseError("Failed to load medicines for purchase.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    setPurchaseError(null);

    const medicineId = parseInt(purchaseForm.medicine_id, 10);
    const quantity = parseInt(purchaseForm.quantity, 10);
    const unitCost = parseFloat(purchaseForm.unit_cost);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      setPurchaseError("Please select a medicine.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setPurchaseError("Quantity must be greater than 0.");
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      setPurchaseError("Unit cost must be 0 or greater.");
      return;
    }

    setPurchaseSaving(true);
    try {
      const order = await purchaseOrderApi.createOrder({
        medicine_id: medicineId,
        quantity,
        unit_cost: unitCost,
        supplier: purchaseForm.supplier?.trim() || null,
      });

      // Purchase impacts stock only when delivered.
      if (purchaseForm.mark_delivered) {
        await purchaseOrderApi.updateStatus(order.id, "Delivered");
      }

      setShowPurchase(false);
      fetchData();
      if (onNavigateDashboard) {
        onNavigateDashboard("purchase");
      }
    } catch (err) {
      setPurchaseError(err.response?.data?.detail || "Failed to create purchase.");
    } finally {
      setPurchaseSaving(false);
    }
  };

  const selectedMedicineIds = new Set(
    saleItems.filter((line) => line.medicine_id).map((line) => Number(line.medicine_id))
  );

  // Summary counts
  const counts = medicines.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const totalValue = medicines.reduce((sum, m) => sum + m.price * m.stock, 0);

  return (
    <>
      {/* Topbar */}
      <Topbar openAdd={() => setShowAdd(true)} />
      <div className="page-content">
        {/* Inventory Actions */}
        <InventoryActions onNavigateDashboard={onNavigateDashboard} openSaleModal={openSaleModal} openPurchaseModal={openPurchaseModal} />``
        {/* Stats */}
        <Stats medicines={medicines} counts={counts} totalValue={totalValue} fmt={fmt} />
        {/* Inventory table */}
        <div className="section">
          {/* Search and Filter */}
          <InventorySearch search={search} setSearch={setSearch} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} categories={categories} />

          {/* Status chips */}
          <StatusChip statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

          {error && <div className="error-box" style={{ margin: 20 }}>{error}</div>}
          {/* Inventory table */}
          <InventoryTable loading={loading} medicines={medicines} openEdit={openEdit} setStatusChangeMed={setStatusChangeMed} fmt={fmt} />
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Medicine" onClose={() => setShowAdd(false)}>
          <MedicineForm form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setShowAdd(false)} saving={saving} formError={formError} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editMed && (
        <Modal title={`Edit: ${editMed.name}`} onClose={() => setEditMed(null)}>
          <MedicineForm form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setEditMed(null)} saving={saving} formError={formError} />
        </Modal>
      )}

      {/* Status Change Modal */}
      {statusChangeMed && (
        <StatusChangeModal statusChangeMed={statusChangeMed} setStatusChangeMed={setStatusChangeMed} handleStatusChange={handleStatusChange} />
      )}

      {/* New Sale Modal */}
      {showSale && (
        <Modal title="Create New Sale" onClose={() => setShowSale(false)}>
          {saleLoading ? (
            <Spinner />
          ) : (
            <CreateSaleForm saleError={saleError} saleCustomer={saleCustomer} setSaleCustomer={setSaleCustomer} saleItems={saleItems} updateSaleLine={updateSaleLine} saleMedicines={saleMedicines} selectedMedicineIds={selectedMedicineIds} addSaleLine={addSaleLine} removeSaleLine={removeSaleLine} handleCreateSale={handleCreateSale} setShowSale={setShowSale} saleSaving={saleSaving} />
          )}
        </Modal>
      )}

      {/* New Purchase Modal */}
      {showPurchase && (
        <Modal title="Create New Purchase" onClose={() => setShowPurchase(false)}>
          {purchaseLoading ? (
            <Spinner />
          ) : (
            <CreatePurchaseForm purchaseError={purchaseError} purchaseForm={purchaseForm} setPurchaseForm={setPurchaseForm} purchaseMedicines={purchaseMedicines} handleCreatePurchase={handleCreatePurchase} setShowPurchase={setShowPurchase} purchaseSaving={purchaseSaving} />
          )}
        </Modal>
      )}
    </>
  );
}
