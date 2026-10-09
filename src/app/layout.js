import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Quraishi Property Dealers Shop',
  description: 'Buy, sell and rent properties in Kabul, Afghanistan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark">Q</span>
              <span className="brand-text">
                Quraishi <em>Property Dealers Shop</em>
              </span>
            </Link>
            <nav className="site-nav">
              <Link href="/">Home</Link>
              <Link href="/#properties">Properties</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p><strong>Quraishi Property Dealers Shop</strong></p>
            <p>Buy · Sell · Rent — trusted local property dealer in Kabul, Afghanistan.</p>
            {process.env.FACEBOOK_PAGE_URL ? (
              <p>
                <a
                  href={process.env.FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--gold)' }}
                >
                  ƒ Follow us on Facebook for new listings
                </a>
              </p>
            ) : null}
          </div>
        </footer>
      </body>
    </html>
  );
}
