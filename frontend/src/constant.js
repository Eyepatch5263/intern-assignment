export const EMPTY_FORM = {
  name: "", category: "", manufacturer: "", price: "", stock: "",
  low_stock_threshold: "20", expiry_date: "", description: "",
};

export const STATUS_OPTS = ["Active", "Low Stock", "Expired", "Out of Stock"];
export const EMPTY_SALE_LINE = { medicine_id: "", quantity: "1" };
export const EMPTY_PURCHASE_FORM = {
  medicine_id: "",
  quantity: "1",
  unit_cost: "",
  supplier: "",
  mark_delivered: true,
};
