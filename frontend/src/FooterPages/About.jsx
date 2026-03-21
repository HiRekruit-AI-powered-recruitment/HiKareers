import React, { useState, useEffect, useRef } from 'react';

//  Animated counter hook
const useCounter = (end, duration = 2000, active = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * end));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(end);
    };
    requestAnimationFrame(tick);
  }, [end, duration, active]);
  return val;
};

//  Intersection observer hook
const useVisible = (threshold = 0.2) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

//  Fade-in wrapper
const Fade = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useVisible(0.12);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

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
};

//
const About = () => {
  const [statsRef, statsVisible] = useVisible(0.3);
  const jobs = useCounter(500, 2000, statsVisible);
  const cands = useCounter(5, 2200, statsVisible);
  const acc = useCounter(100, 2500, statsVisible);

  const problems = [
    {
      text: 'HR teams manually collected resumes via email, causing version chaos and data loss',
    },
    {
      text: 'Applicant data had to be re-uploaded into hiring tools by hand — tedious and error-prone',
    },
    {
      text: 'Unstructured applications made it impossible to run automated screening at scale',
    },
    {
      text: 'Candidates had no clear portal to discover openings or track their application status',
    },
  ];

  const solutions = [
    {
      text: 'A clean, public-facing careers portal where candidates discover and apply to live roles',
    },
    {
      text: 'Structured application forms capture data in a clean, scalable format from day one',
    },
    {
      text: 'Seamless data transfer pipes every applicant directly into HiRekruit — zero manual uploads',
    },
    {
      text: 'Automated hiring workflows trigger instantly once a candidate enters the pipeline',
    },
  ];

  const features = [
    {
      title: 'Candidate Entry Point',
      body: 'HireKareers is the primary gateway for candidates — a branded portal where they explore open roles and submit structured applications.',
    },
    {
      title: 'Auto Data Transfer',
      body: 'Every application is automatically structured and forwarded into HiRekruit, eliminating the need for HR to manually upload or re-enter any data.',
    },
    {
      title: 'Structured from the Start',
      body: 'Applicant data is captured in a clean, consistent format that feeds directly into HiRekruit AI screening and shortlisting engine.',
    },
    {
      title: 'Part of the Ecosystem',
      body: 'HireKareers is built to work hand-in-hand with HiRekruit — the two platforms form a complete end-to-end hiring solution.',
    },
  ];

  const stats = [
    {
      value: jobs,
      suffix: '+',
      label: 'Jobs Listed',
      note: 'across all industries',
    },
    {
      value: cands,
      suffix: 'K+',
      label: 'Candidates Onboarded',
      note: 'structured & ready',
    },
    {
      value: acc,
      suffix: '%',
      label: 'Data Transfer Accuracy',
      note: 'zero manual uploads',
    },
  ];

  const flowSteps = [
    {
      step: '01',
      label: 'Candidate Visits',
      desc: 'Discovers open roles on the HireKareers portal',
    },
    {
      step: '02',
      label: 'Applies Directly',
      desc: 'Fills a structured application form online',
    },
    {
      step: '03',
      label: 'Auto-Transfer',
      desc: 'Data flows instantly into HiRekruit — no manual upload',
    },
    {
      step: '04',
      label: 'AI Screening',
      desc: 'HiRekruit engine screens, shortlists and schedules',
    },
  ];

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        background: C.white,
        color: C.text,
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hk-btn-blue { transition: background .18s; }
        .hk-btn-blue:hover { background: #0F4FCC !important; }

        .hk-btn-out { transition: border-color .18s, color .18s; }
        .hk-btn-out:hover { border-color: #1A6BFF !important; color: #1A6BFF !important; }

        .hk-row:hover { background: #EEF4FF !important; border-color: #D4E4FF !important; }
        .hk-sol-row:hover { background: rgba(255,255,255,.2) !important; }

        .hk-feat-card:hover { border-color: #1A6BFF !important; }
        .hk-flow-step:hover { border-color: #1A6BFF !important; }

        @media (max-width: 768px) {
          .hk-g2  { grid-template-columns: 1fr !important; }
          .hk-g4  { grid-template-columns: 1fr !important; }
          .hk-g3  { grid-template-columns: 1fr !important; }
          .hk-flow { flex-direction: column !important; }
          .hk-arrow { transform: rotate(90deg); }
        }
      `}</style>

      {/*  HERO  */}
      <section
        style={{
          padding: '110px 24px 90px',
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
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 800,
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
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            HiKareers
          </div>

          <h1
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: C.text,
              marginBottom: 24,
            }}
          >
            Where Candidates Meet
            <br />
            <span style={{ color: C.blue }}>Their Next Role</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: C.muted,
              lineHeight: 1.8,
              maxWidth: 580,
              margin: '0 auto 40px',
            }}
          >
            HireKareers is the public-facing career portal of HiRekruit — the
            primary entry point for candidates to discover open roles and apply
            directly, while automatically feeding clean, structured data into
            HiRekruit&apos;s automated hiring engine.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="#how-it-works"
              className="hk-btn-blue"
              style={{
                background: C.blue,
                color: C.white,
                borderRadius: 8,
                padding: '13px 26px',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              See How It Works
            </a>
            <a
              href="#mission"
              className="hk-btn-out"
              style={{
                background: C.white,
                color: C.text,
                border: `1.5px solid ${C.border}`,
                borderRadius: 8,
                padding: '13px 26px',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Our Mission
            </a>
          </div>
        </div>
      </section>

      {/*  OVERVIEW  */}
      <section style={{ padding: '90px 24px', background: C.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Fade>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: C.blue,
                  marginBottom: 10,
                }}
              >
                Overview
              </p>
              <h2
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.15,
                  maxWidth: 640,
                  margin: '0 auto',
                }}
              >
                The career portal built for the modern hiring pipeline
              </h2>
            </div>
          </Fade>

          <div
            className="hk-g2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              alignItems: 'stretch',
            }}
          >
            <Fade delay={0.05} style={{ display: 'flex' }}>
              <div
                style={{
                  background: C.offWhite,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 20,
                  padding: '44px 38px',
                  flex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: C.blue,
                    marginBottom: 14,
                  }}
                >
                  What is HireKareers?
                </p>
                <h3
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 16,
                    lineHeight: 1.25,
                  }}
                >
                  The public-facing career portal for HiRekruit
                </h3>
                <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15 }}>
                  HireKareers is the primary entry point for candidates to
                  discover job openings and apply directly. It serves as the
                  front door of the HiRekruit ecosystem — giving every applicant
                  a smooth, professional experience from the very first click.
                </p>
                <div
                  style={{
                    marginTop: 24,
                    padding: '16px 18px',
                    background: C.blueLight,
                    borderRadius: 10,
                    border: `1px solid ${C.blueMid}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color: C.blue,
                      fontWeight: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    HireKareers is the front door. HiRekruit is the engine
                    behind it.
                  </p>
                </div>
              </div>
            </Fade>

            <Fade delay={0.12} style={{ display: 'flex' }}>
              <div
                style={{
                  background: `linear-gradient(150deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                  borderRadius: 20,
                  padding: '44px 38px',
                  flex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.55)',
                    marginBottom: 14,
                  }}
                >
                  What problem does it solve?
                </p>
                <h3
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 16,
                    lineHeight: 1.25,
                  }}
                >
                  Eliminating manual resume uploads entirely
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,.82)',
                    lineHeight: 1.8,
                    fontSize: 15,
                  }}
                >
                  The portal eliminates manual resume uploads by HR and ensures
                  that all candidate data is captured in a clean, structured,
                  and scalable manner from the start — feeding directly into
                  HiRekruit&apos;s automated hiring workflows without any human
                  intervention.
                </p>
                <div
                  style={{
                    marginTop: 24,
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,.1)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,.18)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,.88)',
                      fontWeight: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    No re-uploads. No data loss. No manual effort. A clean
                    pipeline from day one.
                  </p>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/*  PIPELINE FLOW  */}
      <section
        id="how-it-works"
        style={{ padding: '90px 24px', background: C.offWhite }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Fade>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: C.blue,
                  marginBottom: 10,
                }}
              >
                The Pipeline
              </p>
              <h2
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.15,
                }}
              >
                From application to automated workflow
              </h2>
              <p
                style={{
                  color: C.muted,
                  marginTop: 12,
                  fontSize: 15,
                  maxWidth: 520,
                  margin: '12px auto 0',
                }}
              >
                HireKareers sits at Step 1 of the HiRekruit ecosystem —
                capturing structured candidate data so the rest of the pipeline
                runs itself.
              </p>
            </div>
          </Fade>

          <Fade delay={0.08}>
            <div
              className="hk-flow"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              {flowSteps.map((s, i) => (
                <React.Fragment key={i}>
                  <div
                    className="hk-flow-step"
                    style={{
                      flex: 1,
                      background: C.white,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 16,
                      padding: '28px 22px',
                      textAlign: 'center',
                      transition: 'border-color .18s',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '.1em',
                        color: C.blue,
                        marginBottom: 14,
                        textTransform: 'uppercase',
                      }}
                    >
                      Step {s.step}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: C.text,
                        marginBottom: 8,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: C.muted,
                        lineHeight: 1.6,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                  {i < 3 && (
                    <div
                      className="hk-arrow"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: C.blue,
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      &#8594;
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/*  BEFORE & AFTER  */}
      <section style={{ padding: '90px 24px', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Fade>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: C.blue,
                  marginBottom: 10,
                }}
              >
                Before & After
              </p>
              <h2
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.15,
                }}
              >
                Hiring without HireKareers.
                <br />
                <span style={{ color: C.blue }}>Hiring with HireKareers.</span>
              </h2>
            </div>
          </Fade>

          <div
            className="hk-g2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              alignItems: 'stretch',
            }}
          >
            <Fade delay={0.05} style={{ display: 'flex' }}>
              <div
                style={{
                  background: C.offWhite,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 20,
                  padding: '44px 38px',
                  flex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: C.muted,
                    marginBottom: 14,
                  }}
                >
                  Without HireKareers
                </p>
                <p
                  style={{
                    color: C.muted,
                    marginBottom: 24,
                    lineHeight: 1.75,
                    fontSize: 15,
                  }}
                >
                  HR teams juggle inboxes, spreadsheets, and siloed tools —
                  creating a fragmented, error-prone hiring process.
                </p>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {problems.map((p, i) => (
                    <div
                      key={i}
                      className="hk-row"
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        transition: 'background .18s, border-color .18s',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: C.muted,
                          flexShrink: 0,
                          marginTop: 7,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          color: C.muted,
                          lineHeight: 1.6,
                        }}
                      >
                        {p.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>

            <Fade delay={0.12} style={{ display: 'flex' }}>
              <div
                style={{
                  background: `linear-gradient(150deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                  borderRadius: 20,
                  padding: '44px 38px',
                  flex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.55)',
                    marginBottom: 14,
                  }}
                >
                  With HireKareers
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,.82)',
                    marginBottom: 24,
                    lineHeight: 1.75,
                    fontSize: 15,
                  }}
                >
                  Every applicant flows through a single, structured portal —
                  clean data, zero manual effort, instant pipeline activation.
                </p>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {solutions.map((s, i) => (
                    <div
                      key={i}
                      className="hk-sol-row"
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        background: 'rgba(255,255,255,.1)',
                        border: '1px solid rgba(255,255,255,.18)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        transition: 'background .18s',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,.7)',
                          flexShrink: 0,
                          marginTop: 7,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          color: 'rgba(255,255,255,.88)',
                          lineHeight: 1.6,
                        }}
                      >
                        {s.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/*  STATS  */}
      <section
        ref={statsRef}
        style={{
          padding: '80px 24px',
          background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.5)',
              marginBottom: 10,
            }}
          >
            By the numbers
          </p>
          <h2
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 700,
              color: C.white,
              marginBottom: 48,
            }}
          >
            The portal that never sleeps
          </h2>
          <div
            className="hk-g3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,.1)',
                  border: '1px solid rgba(255,255,255,.18)',
                  borderRadius: 16,
                  padding: '40px 24px',
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: 'clamp(2.6rem, 4.5vw, 4rem)',
                    color: C.white,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                  {s.suffix}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: C.white,
                    marginBottom: 4,
                    fontSize: 15,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  KEY FEATURES  */}
      <section style={{ padding: '90px 24px', background: C.offWhite }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Fade>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: C.blue,
                  marginBottom: 10,
                }}
              >
                What makes us different
              </p>
              <h2
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                Built for scale, designed for simplicity
              </h2>
            </div>
          </Fade>
          <div
            className="hk-g4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            {features.map((f, i) => (
              <Fade key={i} delay={i * 0.07} style={{ display: 'flex' }}>
                <div
                  className="hk-feat-card"
                  style={{
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 16,
                    padding: '32px 24px',
                    flex: 1,
                    transition: 'border-color .18s',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 3,
                      background: C.blue,
                      borderRadius: 2,
                      marginBottom: 20,
                    }}
                  />
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 15.5,
                      color: C.text,
                      marginBottom: 10,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>
                    {f.body}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/*  MISSION & VISION  */}
      <section
        id="mission"
        style={{ padding: '90px 24px', background: C.white }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Fade>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: C.blue,
                  marginBottom: 10,
                }}
              >
                Our North Star
              </p>
              <h2
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                Mission & Vision
              </h2>
            </div>
          </Fade>

          <div
            className="hk-g2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              alignItems: 'stretch',
            }}
          >
            <Fade delay={0.05} style={{ display: 'flex' }}>
              <div
                style={{
                  background: C.offWhite,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 20,
                  padding: '44px 38px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: C.blue,
                    marginBottom: 16,
                  }}
                >
                  Mission
                </p>
                <h3
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: '1.9rem',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 20,
                    lineHeight: 1.2,
                  }}
                >
                  Connecting talent to opportunity — frictionlessly
                </h3>
                <p
                  style={{
                    color: C.muted,
                    lineHeight: 1.8,
                    fontSize: 15,
                    flexGrow: 1,
                  }}
                >
                  To provide every candidate with a seamless, professional entry
                  point into the hiring process, while giving HR teams a
                  structured, scalable data pipeline that plugs directly into
                  HiRekruit&apos;s automated workflows — eliminating manual
                  effort from day one.
                </p>
              </div>
            </Fade>

            <Fade delay={0.12} style={{ display: 'flex' }}>
              <div
                style={{
                  background: `linear-gradient(150deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                  borderRadius: 20,
                  padding: '44px 38px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.5)',
                    marginBottom: 16,
                  }}
                >
                  Vision
                </p>
                <h3
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: '1.9rem',
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 20,
                    lineHeight: 1.2,
                  }}
                >
                  A world where no great candidate ever slips through the cracks
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,.78)',
                    lineHeight: 1.8,
                    fontSize: 15,
                    flexGrow: 1,
                  }}
                >
                  To build a future where every applicant is seen, every data
                  point is captured perfectly, and every hiring decision is
                  powered by clean, structured intelligence — not inbox chaos.
                </p>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/*  CTA  */}
      <section
        style={{
          padding: '90px 24px',
          textAlign: 'center',
          background: `linear-gradient(160deg, ${C.blueLight} 0%, ${C.offWhite} 50%, ${C.white} 100%)`,
        }}
      >
        <Fade>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: C.blue,
              marginBottom: 14,
            }}
          >
            Start your journey
          </p>
          <h2
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            Discover your next role.
            <br />
            <span style={{ color: C.blue }}>Apply in minutes.</span>
          </h2>
          <p
            style={{
              color: C.muted,
              maxWidth: 460,
              margin: '0 auto 36px',
              lineHeight: 1.75,
              fontSize: 15,
            }}
          >
            Browse open positions, submit a structured application, and let
            HiRekruit&apos;s AI pipeline handle the rest.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/jobs"
              className="hk-btn-blue"
              style={{
                background: C.blue,
                color: C.white,
                borderRadius: 8,
                padding: '13px 28px',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Browse Open Roles
            </a>
            <a
              href="#how-it-works"
              className="hk-btn-out"
              style={{
                background: C.white,
                color: C.text,
                border: `1.5px solid ${C.border}`,
                borderRadius: 8,
                padding: '13px 28px',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              How It Works
            </a>
          </div>
        </Fade>
      </section>
    </div>
  );
};

export default About;
