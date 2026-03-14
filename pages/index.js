import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>SwasthyaSathi</title>
      </Head>
      <iframe
        src="/index.html"
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
      {/* Floating dashboard button */}
      <Link href="/dashboard" style={{
        position: 'fixed', bottom: '2rem', right: '2rem',
        background: '#1a7a4a', color: 'white',
        padding: '0.8rem 1.5rem', borderRadius: '50px',
        textDecoration: 'none', fontWeight: '700',
        fontSize: '0.95rem', zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', gap: '0.4rem'
      }}>
        🩺 Open Dashboard
      </Link>
    </>
  );
}