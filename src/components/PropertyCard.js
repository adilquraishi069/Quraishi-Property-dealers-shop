import Link from 'next/link';
import { formatAFN } from '../lib/format';

export default function PropertyCard({ property }) {
  return (
    <Link href={`/property/${property.id}`} className="card">
      <div className="card-img">
        {property.image_url ? (
          <img src={property.image_url} alt={property.title} />
        ) : null}
        <div className="badges">
          <span className={`badge badge-${property.status}`}>
            {property.status === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          <span className="badge badge-type">{property.type}</span>
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-title">{property.title}</h3>
        <div className="card-price">
          {formatAFN(property.price)}
          {property.status === 'rent' ? <small> / month</small> : null}
        </div>
        <div className="card-city">📍 {property.city}{property.address ? ` — ${property.address}` : ''}</div>
        <div className="card-specs">
          {property.bedrooms > 0 ? <span>🛏 {property.bedrooms} bd</span> : null}
          {property.bathrooms > 0 ? <span>🛁 {property.bathrooms} ba</span> : null}
          {property.area > 0 ? <span>📐 {property.area} m²</span> : null}
        </div>
      </div>
    </Link>
  );
}
