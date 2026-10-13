export default function SearchBar({ q = '', status = '', minPrice = '', maxPrice = '' }) {
  return (
    <form action="/" method="get" className="search-bar">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Search by title, city or address…"
      />
      <select name="status" defaultValue={status}>
        <option value="">Buy or Rent</option>
        <option value="sale">For Sale</option>
        <option value="rent">For Rent</option>
      </select>
      <input type="number" name="minPrice" defaultValue={minPrice} placeholder="Min AFN" min="0" />
      <input type="number" name="maxPrice" defaultValue={maxPrice} placeholder="Max AFN" min="0" />
      <button type="submit">Search</button>
    </form>
  );
}
