import Link from 'next/link';
import { listProperties } from '../lib/db';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const sp = searchParams || {};
  const filters = {
    q: sp.q || '',
    status: sp.status || '',
    minPrice: sp.minPrice || '',
    maxPrice: sp.maxPrice || '',
  };
  const properties = await listProperties(filters);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            Find Your Home in <span>Kabul</span>
          </h1>
          <p>Buy, sell and rent with Quraishi Property Dealers Shop — trusted local service since day one.</p>
          <SearchBar {...filters} />
        </div>
      </section>

      <section className="section" id="properties">
        <div className="container">
          <div className="section-head">
            <div className="rule" />
            <h2>{filters.q || filters.status || filters.minPrice || filters.maxPrice ? 'Search Results' : 'Available Properties'}</h2>
            <p>
              {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
              {(filters.q || filters.status || filters.minPrice || filters.maxPrice) ? (
                <> — <Link href="/">clear filters</Link></>
              ) : null}
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="empty">
              <p>No properties match your search.</p>
              <Link href="/" className="btn">Show all properties</Link>
            </div>
          ) : (
            <div className="grid">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
