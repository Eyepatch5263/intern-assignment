import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {page === "dashboard" && <Dashboard />}
        {page === "inventory" && <Inventory />}
      </main>
    </div>
  );
}
