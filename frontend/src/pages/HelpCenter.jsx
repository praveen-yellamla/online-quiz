import React from 'react';
import { HelpCircle, MessageCircle, FileText, ExternalLink, ChevronRight, Mail, Phone } from 'lucide-react';

const HelpCenter = () => {
  const faqs = [
    { q: 'How do I resolve a proctoring alert?', a: 'Immediate stabilization is required. Return focus to your assessment browser and ensure no other background applications are transmitting data.' },
    { q: 'Can I re-take a technical assessment?', a: 'Credential re-attempts vary by technological track. Please contact your administrator to request a protocol reset if eligible.' },
    { q: 'My biometric feed is not initializing.', a: 'Ensure your device camera has authorized browser permissions. Refresh the session if the feed remains inactive.' },
    { q: 'Where can I download my certification report?', a: 'Detailed performance telemetry is available in your "Performance Hub" immediately following assessment validation.' }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem' }}>Global Help Center</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Find technical documentation and connect with our support nodes.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { title: 'Technical Docs', icon: FileText, desc: 'Detailed protocol documentation' },
          { title: 'Community Node', icon: MessageCircle, desc: 'Connect with other candidates' },
          { title: 'Live Support', icon: Phone, desc: 'Triage critical infrastructure issues' }
        ].map((box, i) => (
          <div key={i} className="card hover-scale" style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--accent-gradient)', borderRadius: '1rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <box.icon size={28} />
            </div>
            <h4 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>{box.title}</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{box.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Standard FAQ</h3>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <HelpCircle size={18} color="var(--accent)" /> {faq.q}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Contact Liaison</h3>
          <div className="card" style={{ padding: '2rem', background: 'var(--bg-dark)', color: 'white' }}>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.6 }}>Our technical liaisons are available to resolve infrastructure and assessment conclude issues.</p>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
                  <Mail size={20} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.625rem', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', margin: 0 }}>Email Protocol</p>
                  <p style={{ fontWeight: '700', fontSize: '1rem', margin: 0 }}>support@cgs.com</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
                  <ExternalLink size={20} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.625rem', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', margin: 0 }}>Secure Portal</p>
                  <p style={{ fontWeight: '700', fontSize: '1rem', margin: 0 }}>liaison.cgs.com/help</p>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '2.5rem', padding: '1rem' }}>
              Initialize Live Chat <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
