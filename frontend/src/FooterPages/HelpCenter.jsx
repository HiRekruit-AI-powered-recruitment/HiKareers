import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//  Color tokens
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
  shadowSm: '0 2px 12px rgba(26,107,255,0.08)',
  shadowMd: '0 8px 32px rgba(26,107,255,0.15)',
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

//  SVG Icon
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const PATHS = {
    mail: [
      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
      'M22 6l-10 7L2 6',
    ],
    phone: [
      'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    ],
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
    chevronDown: ['M6 9l6 6 6-6'],
    chevronUp: ['M18 15l-6-6-6 6'],
  };
  const paths = PATHS[name];
  if (!paths) return null;
  return (
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
};

//  Accordion item
const AccordionItem = ({ q, a, isOpen, onToggle }) => (
  <div
    style={{
      border: `1.5px solid ${isOpen ? C.blue : C.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color .18s',
    }}
  >
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '18px 20px',
        background: isOpen ? C.blueLight : C.offWhite,
        border: 'none',
        cursor: 'pointer',
        fontFamily: FONT,
        transition: 'background .18s',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          fontSize: 14.5,
          fontWeight: 600,
          color: C.text,
          lineHeight: 1.5,
        }}
      >
        {q}
      </span>
      <span style={{ flexShrink: 0 }}>
        <Icon
          name={isOpen ? 'chevronUp' : 'chevronDown'}
          size={18}
          color={C.muted}
        />
      </span>
    </button>
    {isOpen && (
      <div
        style={{
          padding: '16px 20px 20px',
          background: C.white,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>{a}</p>
      </div>
    )}
  </div>
);

const HelpCenter = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const sections = [
    {
      label: 'Finding Jobs',
      items: [
        {
          q: 'How do I find job openings on HireKareers?',
          a: 'Simply visit HireKareers and browse all currently active job listings.',
        },
        {
          q: 'Are all jobs on HireKareers currently open?',
          a: 'Yes. Only active roles are visible.',
        },
        {
          q: 'Can I apply to multiple roles at the same time?',
          a: 'Yes, you can apply to multiple roles.',
        },
      ],
    },

    {
      label: 'Submitting Your Application',
      items: [
        {
          q: 'Do I need to create an account to apply?',
          a: 'No. HireKareers does not require you to create an account.',
        },
        {
          q: 'What information do I need to provide?',
          a: 'Name, contact details, resume, and other role-specific info.',
        },
        {
          q: 'What file format should my resume be in?',
          a: 'PDF format is supported.',
        },
        {
          q: 'Can I edit my application?',
          a: 'No, once submitted it cannot be edited.',
        },
      ],
    },

    {
      label: 'After You Apply',
      items: [
        {
          q: 'What happens after I submit?',
          a: 'Your application is forwarded to the hiring team.',
        },
        {
          q: 'How long does it take to hear back?',
          a: 'Depends on company.',
        },
      ],
    },

    {
      label: 'Your Data & Privacy',
      items: [
        {
          q: 'Who can see my data?',
          a: 'Only the hiring team.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes, fully encrypted.',
        },
      ],
    },

    {
      label: 'Technical Issues',
      items: [
        {
          q: 'Form not submitting?',
          a: 'Check required fields.',
        },
        {
          q: 'Resume upload failing?',
          a: 'Ensure PDF under 5MB.',
        },
      ],
    },
  ];
  const supportCards = [
    {
      icon: 'mail',
      title: 'Email Support',
      detail: 'hikareers@gmail.com',
      note: 'Response within 24 hours',
    },
    {
      icon: 'headset',
      title: 'Phone Support',
      detail: '+91-7255892578',
      note: 'Mon–Fri, 9am–6pm IST',
    },
    {
      icon: 'globe',
      title: 'Documentation',
      detail: 'Full product docs',
      note: 'Always available',
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

        .hc-btn-primary { transition: background .18s, color .18s; }
        .hc-btn-primary:hover { background: ${C.blueLight} !important; color: ${C.blue} !important; }

        .hc-btn-ghost { transition: border-color .18s; }
        .hc-btn-ghost:hover { border-color: rgba(255,255,255,.8) !important; }

        .hc-support-card { transition: border-color .18s, box-shadow .18s; }
        .hc-support-card:hover { border-color: ${C.blueMid} !important; box-shadow: ${C.shadowSm} !important; }

        .hc-support-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 640px) {
          .hc-support-grid { grid-template-columns: 1fr !important; }
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
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${C.blueMid} 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 620,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: C.blue,
              color: C.white,
              borderRadius: 999,
              padding: '5px 16px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            Candidate Help Center
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Everything you need to know
          </h1>
          <p
            style={{
              fontSize: 15,
              color: C.muted,
              lineHeight: 1.8,
              maxWidth: 460,
              margin: '0 auto',
            }}
          >
            Answers to common questions about finding jobs, submitting
            applications, and what to expect after you apply on HireKareers.
          </p>
        </div>
      </section>

      {/*  FAQ SECTIONS  */}
      <section
        style={{
          padding: '64px 24px',
          background: C.offWhite,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 48,
          }}
        >
          {sections.map((section, si) => (
            <div key={si}>
              {/* Section label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 20,
                    background: C.blue,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                  {section.label}
                </h2>
                {section.label === 'KareerAssist — Your AI Helper' && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: C.white,
                      background: C.blue,
                      borderRadius: 999,
                      padding: '2px 8px',
                    }}
                  >
                    AI
                  </span>
                )}
              </div>

              {/* Accordion items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`;
                  return (
                    <AccordionItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openFaq === key}
                      onToggle={() => setOpenFaq(openFaq === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  CONTACT SUPPORT  */}
      <section style={{ padding: '64px 24px', background: C.white }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: C.blue,
                marginBottom: 6,
              }}
            >
              Still stuck?
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 700,
                color: C.text,
              }}
            >
              Contact Support
            </h2>
            <p
              style={{
                fontSize: 14,
                color: C.muted,
                marginTop: 8,
                lineHeight: 1.7,
              }}
            >
              Can&apos;t find what you&apos;re looking for? Our team is ready to
              help.
            </p>
          </div>
          <div className="hc-support-grid">
            {supportCards.map((s, i) => {
              const isMid = i === 1;
              return (
                <div
                  key={i}
                  className="hc-support-card"
                  style={{
                    background: isMid
                      ? `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`
                      : C.offWhite,
                    border: `1.5px solid ${isMid ? C.blue : C.border}`,
                    borderRadius: 14,
                    padding: '28px 22px',
                    textAlign: 'center',
                    boxShadow: isMid ? C.shadowMd : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: isMid ? 'rgba(255,255,255,.12)' : C.blueLight,
                      border: `1.5px solid ${isMid ? 'rgba(255,255,255,.2)' : C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Icon
                      name={s.icon}
                      size={20}
                      color={isMid ? C.white : C.text}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.08em',
                      color: isMid ? 'rgba(255,255,255,.45)' : C.muted,
                      marginBottom: 6,
                    }}
                  >
                    {s.title}
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isMid ? C.white : C.text,
                      marginBottom: 6,
                    }}
                  >
                    {s.detail}
                  </p>
                  <div
                    style={{
                      width: 24,
                      height: 2,
                      background: isMid ? 'rgba(255,255,255,.2)' : C.border,
                      borderRadius: 2,
                      margin: '0 auto 8px',
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: isMid ? 'rgba(255,255,255,.5)' : C.muted,
                    }}
                  >
                    {s.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
