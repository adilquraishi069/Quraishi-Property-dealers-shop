import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProperty } from '../../../lib/db';
import { formatAFN } from '../../../lib/format';
import InquiryForm from '../../../components/InquiryForm';

export const dynamic = 'force-dynamic';

export default async function PropertyPage({ params }) {
  const property = await getProperty(params.id);
  if (!property) notFound();

  return (
    <div className="container detail">
      <Link href="/" className="back-link">← Back to all properties</Link>
      <div className="detail-hero">
        {property.image_url ? <img src={property.image_url} alt={property.title} /> : null}
      </div>
      <div className="detail-body">
        <div className="detail-info">
          <h1>{property.title}</h1>
          <div className="detail-price">
            {formatAFN(property.price)}
            {property.status === 'rent' ? <small> / month</small> : null}
          </div>
          <div className="detail-meta">
            <span className={`badge badge-${property.status}`}>
              {property.status === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span className="chip">Type: {property.type}</span>
            <span className="chip">📍 {property.city}{property.address ? ` — ${property.address}` : ''}</span>
            {property.bedrooms > 0 ? <span className="chip">🛏 {property.bedrooms} bedrooms</span> : null}
            {property.bathrooms > 0 ? <span className="chip">🛁 {property.bathrooms} bathrooms</span> : null}
            {property.area > 0 ? <span className="chip">📐 {property.area} m²</span> : null}
          </div>
          <p className="detail-desc">{property.description}</p>
        </div>
        <div>
          <InquiryForm propertyId={property.id} propertyTitle={property.title} />
        </div>
      </div>
      <PropertyMap property={property} />
    </div>
  );
}

function PropertyMap({ property }) {
  const query = [property.address, property.city, 'Afghanistan'].filter(Boolean).join(', ');
  return (
    <div className="map-card">
      <h3>Location</h3>
      <iframe
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`}
        title={`Map of ${property.title}`}
        loading="lazy"
      />
      <p className="map-note">
        Approximate location — for the exact address, <a href="#inq">send an inquiry</a>.
      </p>
    </div>
  );
}
