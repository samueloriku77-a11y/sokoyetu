import React from 'react';
import { Link } from 'react-router-dom';

export default function Careers() {
  const steps = [
    {
      title: "Student Account Setup",
      description: "Create your unique student profile using your official university credentials. Our platform is exclusively for verified students.",
      number: "01"
    },
    {
      title: "Profile Validation",
      description: "Upload a clear identification document for verification. We maintain strict security protocols to protect our community members.",
      number: "02"
    },
    {
      title: "Security Vetting",
      description: "Our administrative team will review your application to ensure all safety and community standards are met.",
      number: "03"
    },
    {
      title: "Begin Earning",
      description: "Once approved, you can immediately start accepting delivery assignments that align with your daily campus routes.",
      number: "04"
    }
  ];

  return (
    <div className="page" style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>SokoYetu</Link>
        <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
      </header>

      <main className="container" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', lineHeight: 1.1 }}>
            Work With Us. Earn While You Walk.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: 1.6 }}>
            Join the SokoYetu delivery network. We provide students with flexible opportunities to support the local economy while earning a competitive income.
          </p>
        </div>

        <section style={{ marginBottom: '100px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '48px', color: '#0f172a' }}>
            Hiring Process
          </h2>
          <div className="grid-2">
            {steps.map((step, index) => (
              <div key={index} className="card" style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(233, 69, 96, 0.15)', lineHeight: 1 }}>
                  {step.number}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>{step.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', background: '#f8fafc', padding: '64px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Ready to get started?</h2>
          <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px auto' }}>
            Create your driver account today and become a vital part of your local community's logistics network.
          </p>
          <Link to="/register?role=DRIVER" className="btn btn-primary btn-lg" style={{ padding: '16px 48px' }}>
            Apply to Deliver
          </Link>
        </section>
      </main>

      <footer style={{ padding: '48px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        &copy; 2026 SokoYetu. All rights reserved.
      </footer>
    </div>
  );
}
