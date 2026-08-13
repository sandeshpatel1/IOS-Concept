import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './About.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
});

// Pull short "focus" chips straight out of the real desc text instead of
// inventing fake stats — first clause, comma-split, first few terms.
function extractChips(desc) {
  if (!desc) return [];
  const firstClause = desc.split('.')[0];
  return firstClause.split(/,| and /i).map(s => s.trim()).filter(Boolean).slice(0, 4);
}

function PhaseCard({ item, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.92', 'start 0.35'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale   = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y       = useTransform(scrollYProgress, [0, 1], [50, 0]);

  const chips = extractChips(item.desc);
  const chapterNum = String(index + 1).padStart(2, '0');

  return (
    <div className="phase-row" ref={ref}>
      <div className="phase-marker">
        <motion.span className="phase-dot"
          initial={{ scale: 0.5, opacity: 0.4 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
      </div>

      <motion.div
        className="phase-card glass glass-panel"
        style={{ rotateX, scale, opacity, y, transformPerspective: 1200 }}
      >
        <div className="phase-top">
          <span className="phase-chapter">CHAPTER {chapterNum}</span>
          <span className="phase-date">{item.date}</span>
        </div>

        <h3 className="phase-title">{item.title}</h3>
        <p className="phase-sub">{item.sub}</p>

        {item.desc && (
          <div className="phase-quote">
            <span className="phase-quote-avatar">S</span>
            <p>{item.desc}</p>
          </div>
        )}

        {chips.length > 0 && (
          <div className="phase-chips">
            {chips.map(c => <span key={c} className="phase-chip">{c}</span>)}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function JourneyRail({ containerRef }) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start center', 'end center'] });
  const glowTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <div className="journey-rail">
      <div className="rail-track" />
      <motion.div className="rail-fill" style={{ scaleY: scrollYProgress }} />
      <motion.div className="rail-glow" style={{ top: glowTop }} />
    </div>
  );
}

export default function About({ config }) {
  const ab = config?.about || {};
  const name = config?.name || 'Sandesh Patel';
  const email = config?.email || '';
  const location = config?.location || '';
  const status = config?.status || '';
  const bio1 = ab.bio1 || '';
  const bio2 = ab.bio2 || '';
  const timeline = (ab.timeline || []).slice().reverse(); // oldest -> newest, the actual arc
  const stats = ab.stats || [];
  const journeyRef = useRef(null);

  return (
    <section id="about" className="ios-about">
      <div className="container">
        <motion.span className="section-kicker" {...fadeUp(0)}>The Journey</motion.span>
        <motion.h2 className="section-heading" {...fadeUp(0.05)}>
          Every chapter, <span className="liquid-text">rendered in depth</span>
        </motion.h2>
        <motion.p className="about-lede" {...fadeUp(0.1)}>{bio1}</motion.p>

        <div className="about-grid">
          {/* 3D scroll-driven journey */}
          <div className="journey-wrap" ref={journeyRef}>
            <JourneyRail containerRef={journeyRef} />
            <div className="journey-phases">
              {timeline.map((item, i) => (
                <PhaseCard key={item.title + item.date} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Right rail: widgets */}
          <div className="about-rail">
            <motion.div className="ios-widget glass glass-panel" {...fadeUp(0.2)}>
              <span className="widget-label">Now</span>
              <p className="widget-body">{bio2}</p>
            </motion.div>

            <motion.div className="ios-widget contact-card glass glass-panel" {...fadeUp(0.25)}>
              <span className="widget-label">Contact Card</span>
              <div className="cc-row"><span>Name</span><strong>{name}</strong></div>
              <div className="cc-row"><span>Location</span><strong>{location}</strong></div>
              <div className="cc-row"><span>Status</span><strong className="cc-green">{status}</strong></div>
              <div className="cc-row"><span>Email</span><strong>{email}</strong></div>
            </motion.div>

            <motion.div className="stat-widgets-grid" {...fadeUp(0.3)}>
              {stats.map(s => (
                <div key={s.label} className="mini-widget glass glass-panel">
                  <span className="mw-icon">{s.icon}</span>
                  <span className="mw-num">{s.num}</span>
                  <span className="mw-label">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
