import React, { useState, useEffect } from 'react';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const sections = [
  { id: 'collect', title: 'Information We Collect' },
  { id: 'use', title: 'How We Use Your Information' },
  { id: 'security', title: 'Data Security' },
  { id: 'sharing', title: 'Sharing & Disclosure' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'rights', title: 'Your Rights & Choices' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'contact', title: 'Contact Us' },
];

const Item = ({ children }) => (
  <li
    style={{
      display: 'flex',
      gap: 12,
      padding: '6px 0',
      color: '#4b5563',
      fontSize: 16,
      lineHeight: '26px',
    }}
  >
    <span
      style={{ color: '#93c5fd', flexShrink: 0, marginTop: 2, fontWeight: 600 }}
    >
      –
    </span>
    <span>{children}</span>
  </li>
);

const Bold = ({ children }) => (
  <span style={{ fontWeight: 600, color: '#1A6BFF' }}>{children}</span>
);

const Note = ({ children }) => (
  <p
    style={{
      fontSize: 15,
      color: '#6b7280',
      lineHeight: '24px',
      padding: '14px 18px',
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      borderRadius: 8,
      marginTop: 16,
    }}
  >
    {children}
  </p>
);

const SubHead = ({ children }) => (
  <p
    style={{
      fontSize: 14,
      fontWeight: 600,
      color: '#1A6BFF',
      marginBottom: 8,
      marginTop: 20,
    }}
  >
    {children}
  </p>
);

function Section({ id, num, title, children, last }) {
  return (
    <div
      id={id}
      style={{
        marginBottom: last ? 0 : 56,
        paddingBottom: last ? 0 : 56,
        borderBottom: last ? 'none' : '1px solid #eff6ff',
        scrollMarginTop: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#93c5fd',
            letterSpacing: '0.06em',
            minWidth: 26,
          }}
        >
          {num}
        </span>
        <h2
          style={{
            fontSize: 19,
            fontWeight: 600,
            color: '#0f1117',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function PrivacyPolicy() {
  const [active, setActive] = useState('collect');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const hit = sections
        .map(({ id }) => ({
          id,
          top:
            document.getElementById(id)?.getBoundingClientRect().top ??
            Infinity,
        }))
        .filter((o) => o.top <= 120)
        .pop();
      if (hit) setActive(hit.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <div
      style={{
        fontFamily: FONT,
        background: '#ffffff',
        minHeight: '100vh',
        color: '#111827',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#1A6BFF',
          padding: isMobile ? '40px 20px 36px' : '52px 40px 44px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#93c5fd',
              marginBottom: 14,
            }}
          >
            Legal
          </p>
          <h1
            style={{
              fontSize: isMobile ? 28 : 36,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: '#bfdbfe', marginTop: 10 }}>
            Last updated March 2026 · Hikareers, Karnataka, India
          </p>
        </div>
      </div>

      {/* Mobile TOC toggle */}
      {isMobile && (
        <div
          style={{ borderBottom: '1px solid #dbeafe', background: '#f8faff' }}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: '#1d4ed8',
              fontFamily: FONT,
            }}
          >
            <span>On this page</span>
            <span style={{ fontSize: 18, lineHeight: 1 }}>
              {menuOpen ? '↑' : '↓'}
            </span>
          </button>
          {menuOpen && (
            <div style={{ padding: '4px 20px 16px' }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: active === s.id ? 600 : 400,
                    color: active === s.id ? '#1d4ed8' : '#6b7280',
                    fontFamily: FONT,
                    borderBottom: '1px solid #eff6ff',
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: isMobile ? '0 20px' : '0 40px',
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 0,
        }}
      >
        {/* Sidebar — desktop only */}
        {!isMobile && (
          <div
            style={{
              position: 'sticky',
              top: 32,
              alignSelf: 'start',
              padding: '48px 32px 48px 0',
              borderRight: '1px solid #dbeafe',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#bfdbfe',
                marginBottom: 16,
              }}
            >
              On this page
            </p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '7px 0',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active === s.id ? 600 : 400,
                  color: active === s.id ? '#1d4ed8' : '#9ca3af',
                  fontFamily: FONT,
                  transition: 'color 0.15s',
                  lineHeight: '22px',
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: isMobile ? '36px 0 64px' : '48px 0 96px 56px' }}>
          {/* Intro */}
          <p
            style={{
              fontSize: 16,
              color: '#6b7280',
              lineHeight: '28px',
              marginBottom: 48,
              paddingBottom: 48,
              borderBottom: '1px solid #eff6ff',
            }}
          >
            At Hikareers, your privacy is a foundational commitment. This policy
            explains how we collect, use, and protect your information when you
            use our AI-powered recruitment platform. Please read it carefully.
          </p>

          {/* 01 */}
          <Section id="collect" num="01" title="Information We Collect">
            <SubHead>Personal Information</SubHead>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 4 }}>
              <Item>
                Account details — name, email address, company name, and phone
                number
              </Item>
              <Item>
                Payment information, processed securely via third-party
                processors
              </Item>
              <Item>Communication preferences and correspondence with us</Item>
            </ul>
            <SubHead>Candidate Data</SubHead>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 4 }}>
              <Item>
                Resume content including skills, experience, education, and
                contact info
              </Item>
              <Item>
                Interview responses, AI assessment results, and scoring data
              </Item>
              <Item>Job application metadata and hiring decisions</Item>
            </ul>
            <SubHead>Automatically Collected</SubHead>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>
                Log data — IP address, browser type, pages visited, time on
                platform
              </Item>
              <Item>Device information and usage patterns</Item>
              <Item>Cookies and similar tracking technologies</Item>
            </ul>
          </Section>

          {/* 02 */}
          <Section id="use" num="02" title="How We Use Your Information">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>
                Provide, maintain, and improve our AI recruitment platform
              </Item>
              <Item>
                Process resumes and conduct AI-powered screening and interviews
              </Item>
              <Item>
                Send automated emails and notifications related to recruitment
              </Item>
              <Item>
                Generate analytics and insights about hiring processes
              </Item>
              <Item>
                Communicate with you about updates, features, and support
              </Item>
              <Item>
                Detect, prevent, and address technical issues and fraud
              </Item>
              <Item>Comply with legal obligations and enforce our terms</Item>
            </ul>
          </Section>

          {/* 03 */}
          <Section id="security" num="03" title="Data Security">
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 4,
              }}
            >
              We implement industry-standard security measures across all layers
              of our platform:
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>End-to-end encryption for all data in transit</Item>
              <Item>
                Secure cloud storage with automated, redundant backups
              </Item>
              <Item>
                Strict access controls and multi-factor authentication
              </Item>
              <Item>
                Regular third-party security audits and vulnerability
                assessments
              </Item>
            </ul>
            <Note>
              No method of transmission over the Internet is 100% secure. While
              we apply every reasonable safeguard, we cannot guarantee absolute
              security.
            </Note>
          </Section>

          {/* 04 */}
          <Section id="sharing" num="04" title="Sharing & Disclosure">
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 4,
              }}
            >
              We do not sell your personal information. We may share data only
              in these limited circumstances:
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>
                <Bold>With your consent</Bold> — when you explicitly authorize
                sharing
              </Item>
              <Item>
                <Bold>Service providers</Bold> — vendors performing services on
                our behalf under strict data agreements
              </Item>
              <Item>
                <Bold>Legal requirements</Bold> — when required by law or to
                protect rights and safety
              </Item>
              <Item>
                <Bold>Business transfers</Bold> — in connection with a merger,
                acquisition, or asset sale
              </Item>
            </ul>
          </Section>

          {/* 05 */}
          <Section id="retention" num="05" title="Data Retention">
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 4,
              }}
            >
              We retain your information only as long as necessary to:
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>Deliver our services and maintain your account</Item>
              <Item>Comply with legal obligations and resolve disputes</Item>
              <Item>Enforce our agreements and protect our legal rights</Item>
            </ul>
            <Note>
              When you delete your account, your personal information will be
              deleted or anonymized within{' '}
              <strong style={{ color: '#1A6BFF' }}>90 days</strong>, unless
              legally required to retain it.
            </Note>
          </Section>

          {/* 06 */}
          <Section id="rights" num="06" title="Your Rights & Choices">
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 4,
              }}
            >
              You have the following rights regarding your personal data:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
              <Item>
                <Bold>Access</Bold> — request a copy of your personal
                information
              </Item>
              <Item>
                <Bold>Correction</Bold> — update or correct inaccurate
                information
              </Item>
              <Item>
                <Bold>Deletion</Bold> — request erasure of your personal data
              </Item>
              <Item>
                <Bold>Portability</Bold> — receive your data in a structured
                format
              </Item>
              <Item>
                <Bold>Opt-out</Bold> — unsubscribe from marketing communications
                at any time
              </Item>
            </ul>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: '26px' }}>
              To exercise these rights, email{' '}
              <a
                href="mailto:hikareers@gmail.com"
                style={{
                  color: '#1d4ed8',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                hikareers@gmail.com
              </a>
              . We respond within 30 days.
            </p>
          </Section>

          {/* 07 */}
          <Section id="cookies" num="07" title="Cookies & Tracking">
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 4,
              }}
            >
              We use cookies and similar technologies to enhance your
              experience:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>
                <Bold>Essential cookies</Bold> — required for the platform to
                function
              </Item>
              <Item>
                <Bold>Analytics cookies</Bold> — help us understand usage
                patterns
              </Item>
              <Item>
                <Bold>Preference cookies</Bold> — remember your settings and
                choices
              </Item>
            </ul>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: '26px' }}>
              You can manage cookie preferences through your browser settings at
              any time.
            </p>
          </Section>

          {/* 08 */}
          <Section id="contact" num="08" title="Contact Us" last>
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 24,
              }}
            >
              If you have questions or requests regarding this Privacy Policy,
              reach out directly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                    minWidth: 64,
                  }}
                >
                  Email
                </span>
                <a
                  href="mailto:hikareers@gmail.com"
                  style={{
                    fontSize: 16,
                    color: '#1d4ed8',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  hikareers@gmail.com
                </a>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                    minWidth: 64,
                  }}
                >
                  Address
                </span>
                <span style={{ fontSize: 16, color: '#6b7280' }}>
                  hiKareers, Karnataka, India
                </span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
