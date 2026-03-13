
const InventorySearch = ({ search, setSearch, categoryFilter, setCategoryFilter, categories }) => {
  return (
    < div className="section-header" >
      <div className="section-title">Medicine List</div>
      <div className="flex items-center gap-8" style={{ flexWrap: "wrap", gap: 10 }}>
        {/* Search */}
        <div className="search-wrap" style={{ width: 220 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {/* Category filter */}
        <select className="select" style={{ width: 150 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div >
  )
}

export default InventorySearch