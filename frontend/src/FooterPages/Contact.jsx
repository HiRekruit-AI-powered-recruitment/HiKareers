import React from 'react';

const C = {
  blue: '#1A6BFF',
  blueDark: '#0F4FCC',
  blueLight: '#EEF4FF',
  blueMid: '#D4E4FF',
  white: '#FFFFFF',
  offWhite: '#F7F9FF',
  text: '#0D1B3E',
  muted: '#5A6A8A',
  border: '#DDE6F7',
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const Icon = ({ paths, size = 18, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

const ICONS = {
  mail: [
    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
    'M22 6l-10 7L2 6',
  ],
  phone: [
    'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  ],
  mapPin: [
    'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z',
    'M12 13a3 3 0 100-6 3 3 0 000 6z',
  ],
  clock: [
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
    'M12 6v6l4 2',
  ],
  chat: ['M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'],
  headset: [
    'M3 18v-6a9 9 0 0118 0v6',
    'M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z',
    'M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z',
  ],
  globe: [
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
    'M2 12h20',
    'M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  ],
};

const Contact = () => {
  const contactInfo = [
    {
      icon: 'mail',
      title: 'Email Us',
      details: 'hikareer@gmail.com',
      description: 'Send us an email anytime',
    },
    {
      icon: 'phone',
      title: 'Call Us',
      details: '+91-7255892578',
      description: 'Mon–Fri, 9am–6pm IST',
    },
    {
      icon: 'mapPin',
      title: 'Visit Us',
      details: 'Bihar, India',
      description: 'Our headquarters',
    },
    {
      icon: 'clock',
      title: 'Business Hours',
      details: '9:00 AM – 6:00 PM IST',
      description: 'Monday through Friday',
    },
  ];

  return (
    <div
      style={{
        fontFamily: FONT,
        background: C.white,
        color: C.text,
        minHeight: '100vh',
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ct-btn-white { transition: background .18s, color .18s; }
        .ct-btn-white:hover { background: ${C.blueLight} !important; color: ${C.blue} !important; }
        .ct-faq:hover { border-color: ${C.blueMid} !important; }

        .ct-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .ct-info-card:hover {
          border-color: ${C.blueMid} !important;
          box-shadow: 0 4px 24px rgba(26,107,255,.08) !important;
        }
        .ct-info-card:hover .ct-info-icon {
          background: ${C.blueMid} !important;
        }

        @media (max-width: 900px) {
          .ct-info-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .ct-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/*  HERO  */}
      <section
        style={{
          padding: '90px 24px 72px',
          textAlign: 'center',
          background: `linear-gradient(160deg, ${C.white} 0%, ${C.offWhite} 60%, ${C.blueLight} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${C.blueMid} 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
            opacity: 0.45,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 680,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: C.blueLight,
              color: C.blue,
              border: `1px solid ${C.blueMid}`,
              borderRadius: 999,
              padding: '5px 16px',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            HiKareers
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: C.text,
              marginBottom: 20,
            }}
          >
            Get in <span style={{ color: C.blue }}>Touch</span>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: C.muted,
              lineHeight: 1.8,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            HireKareers is the public-facing career portal for the HiRekruit
            ecosystem — the primary entry point for candidates to discover job
            openings and apply directly. Have a question? We&apos;re here to
            help.
          </p>
        </div>
      </section>
      {/* CONTACT INFO CARDS */}
      <section style={{ padding: '72px 24px 56px', background: C.white }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ marginBottom: 40 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: C.blue,
                marginBottom: 8,
              }}
            >
              Reach Out
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 700,
                color: C.text,
              }}
            >
              Contact Information
            </h2>
            <p
              style={{
                fontSize: 15,
                color: C.muted,
                marginTop: 8,
                lineHeight: 1.7,
              }}
            >
              Multiple ways to get in touch with our team — pick what works best
              for you.
            </p>
          </div>

          <div className="ct-info-grid">
            {contactInfo.map((info, i) => (
              <div
                key={i}
                className="ct-info-card"
                style={{
                  background: C.offWhite,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 16,
                  padding: '32px 26px',
                  transition: 'border-color .18s, box-shadow .18s',
                }}
              >
                <div
                  className="ct-info-icon"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 13,
                    background: C.blueLight,
                    border: `1.5px solid ${C.blueMid}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    transition: 'background .18s',
                  }}
                >
                  <Icon paths={ICONS[info.icon]} size={20} color={C.blue} />
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.blue,
                    textTransform: 'uppercase',
                    letterSpacing: '.1em',
                    marginBottom: 8,
                  }}
                >
                  {info.title}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 6,
                  }}
                >
                  {info.details}
                </p>
                <div
                  style={{
                    width: 28,
                    height: 2,
                    background: C.blueMid,
                    borderRadius: 2,
                    marginBottom: 10,
                  }}
                />
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/*  FAQ */}
      <section style={{ padding: '24px 24px 72px', background: C.white }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: C.blue,
              marginBottom: 8,
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              marginBottom: 24,
            }}
          >
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                q: 'What is HireKareers?',
                a: 'HireKareers is the public-facing career portal for the HiRekruit ecosystem. It lets candidates discover open roles and apply directly, while ensuring all applicant data flows cleanly into HiRekruit for automated hiring workflows.',
              },
              {
                q: 'Do HR teams need to upload resumes manually?',
                a: 'No. HireKareers eliminates manual resume uploads entirely. Candidate data is captured at the source — structured and transferred automatically into HiRekruit without any HR intervention.',
              },
              {
                q: 'How does HireKareers connect to HiRekruit?',
                a: 'Every application submitted through HireKareers is automatically structured and transferred into HiRekruit Drives, where AI-powered screening, shortlisting, and scheduling take over immediately.',
              },
              {
                q: 'What does "structured data at the source" mean?',
                a: 'It means candidate information is captured in a clean, consistent format from the moment they apply — so there is no reformatting, re-entry, or data cleanup required before it enters the hiring pipeline.',
              },
              {
                q: 'Is HireKareers suitable for companies of all sizes?',
                a: 'Yes. Whether you are a startup posting your first role or an enterprise hiring at scale, HireKareers provides a centralised, professional portal that grows with your hiring needs.',
              },
              {
                q: 'How does this improve the candidate experience?',
                a: 'Candidates get a dedicated, professional portal to explore roles and apply — no emailing CVs, no chasing HR. Applications are acknowledged and processed promptly through the automated pipeline.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="ct-faq"
                style={{
                  background: C.offWhite,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                  transition: 'border-color .18s',
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 6,
                  }}
                >
                  {faq.q}
                </h3>
                <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        style={{
          padding: '72px 24px',
          textAlign: 'center',
          background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: C.white,
              marginBottom: 14,
              lineHeight: 1.15,
            }}
          >
            Discover your next role.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,.75)',
              marginBottom: 36,
              lineHeight: 1.75,
            }}
          >
            Browse open positions, submit a structured application, and let
            HiRekruit&apos;s AI pipeline handle the rest.
          </p>
          <a
            href="/jobs"
            className="ct-btn-white"
            style={{
              display: 'inline-block',
              background: C.white,
              color: C.text,
              borderRadius: 8,
              padding: '13px 28px',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Browse Open Roles
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
