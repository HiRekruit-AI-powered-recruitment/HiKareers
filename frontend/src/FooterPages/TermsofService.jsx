import React, { useState, useEffect } from 'react';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'description', title: 'Description of Service' },
  { id: 'accounts', title: 'Accounts & Registration' },
  { id: 'usage', title: 'Acceptable Use' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'data', title: 'Data & Privacy' },
  { id: 'payment', title: 'Payment & Billing' },
  { id: 'termination', title: 'Termination' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'changes', title: 'Changes to Terms' },
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

const Para = ({ children }) => (
  <p
    style={{
      fontSize: 16,
      color: '#6b7280',
      lineHeight: '26px',
      marginBottom: 4,
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

export default function TermsOfService() {
  const [active, setActive] = useState('acceptance');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
            Terms of Service
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
            These Terms of Service govern your access to and use of Hikareers'
            AI-powered recruitment platform. By accessing or using our services,
            you agree to be bound by these terms. Please read them carefully
            before using the platform.
          </p>

          {/* 01 */}
          <Section id="acceptance" num="01" title="Acceptance of Terms">
            <Para>
              By creating an account or using any part of the Hikareers
              platform, you confirm that you have read, understood, and agree to
              these Terms of Service and our Privacy Policy. If you do not
              agree, you may not use our services.
            </Para>
            <Para>
              If you are using the platform on behalf of a company or
              organization, you represent that you have the authority to bind
              that entity to these terms.
            </Para>
          </Section>

          {/* 02 */}
          <Section id="description" num="02" title="Description of Service">
            <Para>
              Hikareers provides an AI-powered recruitment automation platform
              that enables employers to streamline their hiring process. Our
              services include:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>AI-driven resume screening and candidate shortlisting</Item>
              <Item>
                Automated interview scheduling and AI-assisted interviews
              </Item>
              <Item>Candidate communication and email automation</Item>
              <Item>Hiring analytics, reporting, and pipeline management</Item>
              <Item>Integration with third-party HR and ATS tools</Item>
            </ul>
            <Note>
              We reserve the right to modify, suspend, or discontinue any part
              of the service at any time with reasonable notice to users.
            </Note>
          </Section>

          {/* 03 */}
          <Section id="accounts" num="03" title="Accounts & Registration">
            <Para>
              To access the platform, you must register for an account. You
              agree to:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 4 }}>
              <Item>
                Provide accurate, current, and complete information during
                registration
              </Item>
              <Item>
                Maintain the security of your password and account credentials
              </Item>
              <Item>
                Notify us immediately of any unauthorized access or breach
              </Item>
              <Item>
                Accept responsibility for all activity that occurs under your
                account
              </Item>
            </ul>
            <Note>
              You may not share your account credentials or create accounts on
              behalf of others without authorization. We reserve the right to
              suspend accounts that violate this policy.
            </Note>
          </Section>

          {/* 04 */}
          <Section id="usage" num="04" title="Acceptable Use">
            <Para>
              You agree to use the platform only for lawful purposes. You must
              not:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>
                Use the platform to discriminate against candidates based on
                protected characteristics
              </Item>
              <Item>
                Upload false, misleading, or fraudulent candidate or job
                information
              </Item>
              <Item>
                Attempt to reverse-engineer, scrape, or exploit the platform or
                its AI systems
              </Item>
              <Item>
                Transmit malware, viruses, or any harmful or disruptive code
              </Item>
              <Item>
                Violate any applicable local, national, or international law or
                regulation
              </Item>
              <Item>
                Harass, abuse, or harm any candidate, user, or third party
                through the platform
              </Item>
            </ul>
            <Para>
              We may investigate and take appropriate action — including
              suspension or termination — against any account found to be in
              violation of these rules.
            </Para>
          </Section>

          {/* 05 */}
          <Section id="ip" num="05" title="Intellectual Property">
            <SubHead>Our Property</SubHead>
            <Para>
              All content, software, algorithms, designs, logos, and trademarks
              on the Hikareers platform are owned by or licensed to us. You may
              not copy, reproduce, distribute, or create derivative works
              without our express written permission.
            </Para>
            <SubHead>Your Content</SubHead>
            <Para>
              You retain ownership of any data, resumes, or content you upload
              to the platform. By uploading content, you grant Hikareers a
              limited, non-exclusive license to use that content solely for the
              purpose of providing our services to you.
            </Para>
            <Note>
              We do not claim ownership over candidate resumes or employer job
              postings uploaded through the platform.
            </Note>
          </Section>

          {/* 06 */}
          <Section id="data" num="06" title="Data & Privacy">
            <Para>
              Your use of the platform is also governed by our{' '}
              <Bold>Privacy Policy</Bold>, which is incorporated into these
              Terms by reference. By using the platform, you consent to the
              collection and use of your information as described in that
              policy.
            </Para>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>
                You are responsible for ensuring you have lawful grounds to
                upload candidate data
              </Item>
              <Item>
                You must obtain necessary consents from candidates before
                processing their personal data
              </Item>
              <Item>
                We process data only as outlined in our Privacy Policy and
                applicable data protection laws
              </Item>
            </ul>
          </Section>

          {/* 07 */}
          <Section id="payment" num="07" title="Payment & Billing">
            <Para>
              Certain features of the platform require a paid subscription. By
              subscribing, you agree to:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>
                Pay all applicable fees as described in your selected plan
              </Item>
              <Item>
                Provide accurate billing information and keep it up to date
              </Item>
              <Item>
                Authorize us to charge your payment method on a recurring basis
              </Item>
            </ul>
            <SubHead>Refunds</SubHead>
            <Para>
              All payments are non-refundable except where required by law or at
              our sole discretion. If you believe you have been incorrectly
              charged, contact us within 14 days of the charge.
            </Para>
            <Note>
              We reserve the right to change pricing with at least 30 days'
              notice. Continued use of the service after a price change
              constitutes acceptance of the new pricing.
            </Note>
          </Section>

          {/* 08 */}
          <Section id="termination" num="08" title="Termination">
            <Para>
              Either party may terminate the agreement at any time. You may
              close your account through the platform settings. We may suspend
              or terminate your access if:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>You breach any provision of these Terms</Item>
              <Item>
                You engage in fraudulent, abusive, or illegal activity
              </Item>
              <Item>
                Payment obligations are not met after reasonable notice
              </Item>
              <Item>We are required to do so by law or regulation</Item>
            </ul>
            <Para>
              Upon termination, your access to the platform will cease. Data
              deletion will follow our retention policy as outlined in the
              Privacy Policy.
            </Para>
          </Section>

          {/* 09 */}
          <Section id="liability" num="09" title="Limitation of Liability">
            <Para>
              To the maximum extent permitted by law, Hikareers shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>Loss of profits, data, or business opportunities</Item>
              <Item>
                Errors or inaccuracies in AI-generated assessments or
                recommendations
              </Item>
              <Item>Unauthorized access to or alteration of your data</Item>
              <Item>Any third-party conduct or content on the platform</Item>
            </ul>
            <Note>
              Our total liability to you for any claim arising from these Terms
              shall not exceed the amount you paid to us in the 3 months
              preceding the claim.
            </Note>
          </Section>

          {/* 10 */}
          <Section id="changes" num="10" title="Changes to Terms">
            <Para>
              We may update these Terms of Service from time to time. When we
              do, we will update the date at the top of this page and notify you
              via email or an in-platform notice for material changes.
            </Para>
            <Para>
              Your continued use of the platform after any changes constitutes
              your acceptance of the updated Terms. If you do not agree with the
              revised terms, you should stop using the platform and close your
              account.
            </Para>
          </Section>

          {/* 11 */}
          <Section id="contact" num="11" title="Contact Us" last>
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: '26px',
                marginBottom: 24,
              }}
            >
              If you have questions or concerns about these Terms of Service,
              reach out to us directly.
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
