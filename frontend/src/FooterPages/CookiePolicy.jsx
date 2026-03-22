import React, { useState, useEffect } from 'react';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const sections = [
  { id: 'what', title: 'What Are Cookies' },
  { id: 'types', title: 'Types of Cookies We Use' },
  { id: 'purpose', title: 'Why We Use Cookies' },
  { id: 'third', title: 'Third-Party Cookies' },
  { id: 'manage', title: 'Managing Your Cookies' },
  { id: 'retention', title: 'Cookie Retention' },
  { id: 'updates', title: 'Updates to This Policy' },
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
      marginBottom: 12,
    }}
  >
    {children}
  </p>
);

const CookieTag = ({ type, color }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      padding: '2px 10px',
      borderRadius: 100,
      background:
        color === 'blue'
          ? '#dbeafe'
          : color === 'green'
            ? '#dcfce7'
            : color === 'yellow'
              ? '#fef9c3'
              : '#f3f4f6',
      color:
        color === 'blue'
          ? '#1d4ed8'
          : color === 'green'
            ? '#15803d'
            : color === 'yellow'
              ? '#854d0e'
              : '#6b7280',
      marginBottom: 10,
    }}
  >
    {type}
  </span>
);

const CookieCard = ({ tag, tagColor, title, children }) => (
  <div
    style={{
      background: '#f8faff',
      border: '1px solid #dbeafe',
      borderRadius: 10,
      padding: '20px 24px',
      marginBottom: 14,
    }}
  >
    <CookieTag type={tag} color={tagColor} />
    <p
      style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#0f1117',
        marginBottom: 6,
      }}
    >
      {title}
    </p>
    <p
      style={{ fontSize: 15, color: '#6b7280', lineHeight: '24px', margin: 0 }}
    >
      {children}
    </p>
  </div>
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

export default function CookiePolicy() {
  const [active, setActive] = useState('what');
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
            Cookie Policy
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
            This Cookie Policy explains how Hikareers uses cookies and similar
            tracking technologies when you visit our platform. It describes what
            cookies are, why we use them, and how you can control them.
          </p>

          {/* 01 */}
          <Section id="what" num="01" title="What Are Cookies">
            <Para>
              Cookies are small text files placed on your device (computer,
              tablet, or phone) when you visit a website. They are widely used
              to make websites work more efficiently and to provide information
              to site owners.
            </Para>
            <Para>
              Cookies allow a website to recognize your device, remember your
              preferences, and understand how you interact with the platform
              over time. They do not contain executable code or viruses.
            </Para>
            <Note>
              Cookies are stored locally on your device. You can view, manage,
              or delete them at any time through your browser settings.
            </Note>
          </Section>

          {/* 02 */}
          <Section id="types" num="02" title="Types of Cookies We Use">
            <Para>
              We use the following categories of cookies on the Hikareers
              platform:
            </Para>

            <CookieCard
              tag="Essential"
              tagColor="blue"
              title="Strictly Necessary Cookies"
            >
              These cookies are required for the platform to function. They
              enable core features like logging in, maintaining your session,
              and accessing secure areas. These cannot be disabled without
              affecting platform functionality.
            </CookieCard>

            <CookieCard
              tag="Analytics"
              tagColor="green"
              title="Performance & Analytics Cookies"
            >
              These cookies help us understand how visitors use the platform —
              which pages are visited most, how long users spend on each
              section, and where errors occur. All data collected is aggregated
              and anonymous.
            </CookieCard>

            <CookieCard
              tag="Functional"
              tagColor="yellow"
              title="Functional / Preference Cookies"
            >
              These cookies remember choices you make — such as your language
              preference, sidebar state, or display settings — so you don't have
              to reconfigure them on every visit.
            </CookieCard>

            <CookieCard
              tag="Optional"
              tagColor="gray"
              title="Marketing Cookies"
            >
              We may use these to measure the effectiveness of our marketing
              campaigns and deliver relevant content. These are only set with
              your explicit consent.
            </CookieCard>
          </Section>

          {/* 03 */}
          <Section id="purpose" num="03" title="Why We Use Cookies">
            <Para>
              Cookies help us deliver a better, faster, and more secure
              experience. Specifically, we use them to:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>Keep you logged in securely across platform sessions</Item>
              <Item>Remember your preferences and customizations</Item>
              <Item>
                Analyze how the platform is used to improve features and fix
                issues
              </Item>
              <Item>Detect and prevent fraud, abuse, and security threats</Item>
              <Item>
                Measure the performance of our pages and recruiting tools
              </Item>
              <Item>
                Provide a consistent experience across devices when logged in
              </Item>
            </ul>
          </Section>

          {/* 04 */}
          <Section id="third" num="04" title="Third-Party Cookies">
            <Para>
              Some cookies on our platform are set by trusted third-party
              services we use to operate and improve Hikareers. These third
              parties have their own privacy and cookie policies.
            </Para>
            <SubHead>Analytics Providers</SubHead>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 4 }}>
              <Item>
                <Bold>Google Analytics</Bold> — tracks usage patterns and
                platform performance anonymously
              </Item>
              <Item>
                <Bold>Mixpanel</Bold> — helps us understand feature adoption and
                user flows
              </Item>
            </ul>
            <SubHead>Infrastructure & Security</SubHead>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <Item>
                <Bold>Cloudflare</Bold> — provides security, performance, and
                DDoS protection
              </Item>
              <Item>
                <Bold>Stripe</Bold> — handles payment processing securely
              </Item>
            </ul>
            <Note>
              We do not sell data collected through third-party cookies. We only
              work with providers whose data practices align with our Privacy
              Policy.
            </Note>
          </Section>

          {/* 05 */}
          <Section id="manage" num="05" title="Managing Your Cookies">
            <Para>
              You have full control over cookies. Here's how you can manage
              them:
            </Para>
            <SubHead>Browser Settings</SubHead>
            <Para>
              Most browsers allow you to view, block, or delete cookies through
              their settings. Below are links to cookie management guides for
              common browsers:
            </Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>
                <Bold>Chrome</Bold> — Settings → Privacy and Security → Cookies
              </Item>
              <Item>
                <Bold>Firefox</Bold> — Settings → Privacy & Security → Cookies
                and Site Data
              </Item>
              <Item>
                <Bold>Safari</Bold> — Preferences → Privacy → Manage Website
                Data
              </Item>
              <Item>
                <Bold>Edge</Bold> — Settings → Cookies and Site Permissions
              </Item>
            </ul>
            <SubHead>Opting Out of Analytics</SubHead>
            <Para>
              You can opt out of Google Analytics tracking by installing the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1d4ed8',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </Para>
            <Note>
              Blocking essential cookies may prevent you from logging in or
              using core features of the Hikareers platform. Non-essential
              cookies can be disabled without affecting basic functionality.
            </Note>
          </Section>

          {/* 06 */}
          <Section id="retention" num="06" title="Cookie Retention">
            <Para>Cookies vary in how long they remain on your device:</Para>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              <Item>
                <Bold>Session cookies</Bold> — deleted automatically when you
                close your browser
              </Item>
              <Item>
                <Bold>Persistent cookies</Bold> — remain on your device for a
                set period (typically 30 days to 2 years) or until manually
                deleted
              </Item>
              <Item>
                <Bold>Third-party cookies</Bold> — governed by the retention
                policies of the respective third-party providers
              </Item>
            </ul>
            <Note>
              You can clear all cookies at any time through your browser
              settings, regardless of their set expiration.
            </Note>
          </Section>

          {/* 07 */}
          <Section id="updates" num="07" title="Updates to This Policy">
            <Para>
              We may update this Cookie Policy from time to time to reflect
              changes in technology, regulation, or our platform. When we make
              material changes, we will update the date at the top of this page
              and notify you via the platform or email.
            </Para>
            <Para>
              Continued use of the Hikareers platform after any changes to this
              policy constitutes your acceptance of the updated Cookie Policy.
            </Para>
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
              If you have any questions about how we use cookies or this Cookie
              Policy, feel free to reach out.
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
