import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion'
import heroBg from '../assets/hero-bg.png';
import ChatHelper from '../components/ChatHelper'
import FireSale from '../components/FireSale'

export default function LandingPage() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, -120])
  return (
    <div className="hero-container">
      {/* Background Layer */}
      <motion.img style={{ y }} src={heroBg} className="hero-bg" alt="SokoYetu Marketplace" />
      <div className="hero-overlay" />

      {/* Navbar */}
      <nav style={{ 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        padding: '24px 40px', 
        zIndex: 100, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Link to="/">
          <img src="/logo.jpeg" alt="SokoYetu" style={{ height: "56px", width: "auto", display: "block" }} />
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link to="/careers" style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Careers</Link>
          <Link to="/login" className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary">Join the Community</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', overflowY: 'auto' }}>
        
        {/* Section 1: Hero */}
        <section className="landing-section" style={{ scrollSnapAlign: 'start', padding: '0 5vw 0 5vw' }}>
          <div style={{ maxWidth: '800px' }}>
            <h1 className="fade-up" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 24, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              The Local Economy,<br/><span style={{ color: 'var(--accent-2)' }}>Modernized.</span>
            </h1>
            <p className="fade-up" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', marginBottom: 40, lineHeight: 1.4, animationDelay: '0.2s' }}>
              Connecting students, local vendors, and independent drivers into one seamless, ultra-local marketplace.
            </p>
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16, animationDelay: '0.3s', width: '100%' }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Start Exploring</Link>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', width: '100%' }}>Member Login</Link>
            </div>
          </div>
          
          <div className="scroll-indicator">
            <span>Scroll to discover</span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--accent-2), transparent)', marginTop: 8 }} />
          </div>
        </section>

        {/* Section 2: Roles */}
        <section className="landing-section" style={{ scrollSnapAlign: 'start', padding: '80px 5vw' }}>
          <div className="grid-3" style={{ width: '100%', gap: '32px' }}>
            
            {/* Vendor Card (clickable whole card) */}
            <Link to="/register/vendor" className="glass-card fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)' }}>🏪</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, color: '#fff' }}>For Vendors</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
                Turn your local stall into a digital storefront. Manage inventory and reach thousands of buyers instantly without high commission fees.
              </p>
              <span className="btn btn-primary btn-full" style={{ marginTop: 'auto', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>Open Store</span>
            </Link>

            {/* Customer Card (clickable whole card) */}
            <Link to="/register/customer" className="glass-card fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '0.1s', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)' }}>🛍️</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, color: '#fff' }}>For Students</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
                Browse local kibandas and restaurants. Get fresh meals and products delivered right to your hostel with student-friendly pricing.
              </p>
              <span className="btn btn-primary btn-full" style={{ marginTop: 'auto', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>Start Shopping</span>
            </Link>

            {/* Driver Card (clickable whole card) */}
            <Link to="/register/driver" className="glass-card fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '0.2s', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)' }}>🛵</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, color: '#fff' }}>For Drivers</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
                Earn cash delivering packages on your daily walk or ride to class. Flexible hours, instant payouts, and safe campus-only routes.
              </p>
              <span className="btn btn-success btn-full" style={{ marginTop: 'auto', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>Apply to Drive</span>
            </Link>

          </div>
        </section>

        {/* Section 3: Trust Section */}
        <section className="landing-section" style={{ scrollSnapAlign: 'start', padding: '80px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="fade-up" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '32px' }}>
              Why You Can Trust SokoYetu
            </h2>
            <div className="grid-3" style={{ gap: '32px' }}>
              <div className="glass-card fade-up" style={{ animationDelay: '0.1s', textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', color: 'var(--accent)', marginBottom: '16px' }}>🛡️</div>
                <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>100% Cashback Guarantee</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>Full refund if vendor doesn't send your product from their store. No questions asked.</p>
              </div>
              <div className="glass-card fade-up" style={{ animationDelay: '0.2s', textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', color: 'var(--green)', marginBottom: '16px' }}>💳</div>
                <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Secure Wallet System</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>Your money is safe in our IntaSend-powered wallet. Balance displayed everywhere after login.</p>
              </div>
              <div className="glass-card fade-up" style={{ animationDelay: '0.3s', textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', color: 'var(--gold)', marginBottom: '16px' }}>📍</div>
                <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>GPS-Verified Delivery</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>15m GPS accuracy + QR handshake ensures your order arrives safely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fire Sale */}
        <FireSale />

        {/* Chat helper */}
        <ChatHelper />

        {/* Section 4: Testimonials */}
        <section className="landing-section" style={{ scrollSnapAlign: 'start', background: 'rgba(255,255,255,0.08)', padding: '80px 5vw' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="fade-up" style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '64px' }}>
              Loved by Thousands of Students
            </h2>
            <div className="grid-3" style={{ gap: '32px' }}>
              <div className="glass-card fade-up" style={{ padding: '32px', animationDelay: '0.1s' }}>
                <div style={{ fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#fff', marginBottom: '8px' }}>
                  "Got my chapo from mama mboga in 15 mins. Cashback when she didn't deliver on time. Perfect!"
                </div>
                <div style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', color: 'rgba(255,255,255,0.7)' }}>— Sarah, Year 2 Student</div>
              </div>
              <div className="glass-card fade-up" style={{ padding: '32px', animationDelay: '0.2s' }}>
                <div style={{ fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#fff', marginBottom: '8px' }}>
                  "Earned KES 800 last week delivering to fellow students. GPS protection keeps it fair."
                </div>
                <div style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', color: 'rgba(255,255,255,0.7)' }}>— John, Computer Science</div>
              </div>
              <div className="glass-card fade-up" style={{ padding: '32px', animationDelay: '0.3s' }}>
                <div style={{ fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#fff', marginBottom: '8px' }}>
                  "My small kibanda now gets 50 orders/day. No commissions, full control!"
                </div>
                <div style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', color: 'rgba(255,255,255,0.7)' }}>— Mama Fatuma</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Features */}
        <section className="landing-section" style={{ scrollSnapAlign: 'end', padding: '80px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="fade-up" style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '64px' }}>
              Everything You Need
            </h2>
            <div className="grid-4" style={{ gap: '24px' }}>
              <div className="fade-up" style={{ animationDelay: '0.1s', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--accent)', marginBottom: '16px' }}>💸</div>
                <h4 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Full Cashback</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)' }}>Cancel anytime before vendor sends. 100% money back.</p>
              </div>
              <div className="fade-up" style={{ animationDelay: '0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--green)', marginBottom: '16px' }}>📍</div>
                <h4 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>GPS Protected</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)' }}>15m accuracy + QR verification. No disputes.</p>
              </div>
              <div className="fade-up" style={{ animationDelay: '0.3s', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--blue-light)', marginBottom: '16px' }}>⚡</div>
                <h4 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Instant Wallet</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)' }}>Deposit, withdraw, balance visible everywhere.</p>
              </div>
              <div className="fade-up" style={{ animationDelay: '0.4s', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--purple)', marginBottom: '16px' }}>🌍</div>
                <h4 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Community First</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)' }}>Support local vendors & student drivers directly.</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '64px' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Today →</Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

