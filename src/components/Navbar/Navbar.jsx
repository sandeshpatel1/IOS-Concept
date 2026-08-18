import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Link, scroller } from 'react-scroll';
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from 'framer-motion';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineSparkles,
  HiOutlineSquares2X2, HiOutlineChatBubbleLeftRight, HiOutlineDocumentArrowDown,
} from 'react-icons/hi2';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import './Navbar.css';

const navItems = [
  { key: 'home',     label: 'Home',     to: 'home',     Icon: HiOutlineHome },
  { key: 'about',    label: 'Story',    to: 'about',    Icon: HiOutlineUser },
  { key: 'skills',   label: 'Skills',   to: 'skills',   Icon: HiOutlineSparkles },
  { key: 'projects', label: 'Work',     to: 'projects', Icon: HiOutlineSquares2X2 },
  { key: 'contact',  label: 'Contact',  to: 'contact',  Icon: HiOutlineChatBubbleLeftRight },
];

const BLOB_SIZE = 48;
// One single spring drives EVERY transition — taps, scroll-spy, and finger
// drag all just move the same target value. That's what makes it feel like
// one continuous physical object instead of separate tap/drag code paths.
const FOLLOW_SPRING = { stiffness: 620, damping: 44, mass: 0.7 };

/**
 * The real iOS 18 / Instagram "Liquid Glass" tab bar. The blob's center is a
 * single motion value; a spring continuously chases whatever that target is
 * — your raw finger position while dragging, or the active tab's center on
 * tap/scroll. Because it's ONE continuous spring the whole time, there is no
 * discrete "snap to nearest tab and re-anchor" step while dragging — it
 * glides smoothly the entire length of the bar and only resolves to a tab
 * when you actually lift your finger.
 */
function MobileTabBar({ config, tucked }) {
  const items = navItems;

  const [active, setActive] = useState('home');
  const [dragging, setDragging] = useState(false);
  const [hotKey, setHotKey] = useState('home'); // icon highlight only — doesn't drive blob position

  const wrapRef = useRef(null);
  const itemRefs = useRef({});
  const centersRef = useRef({});          // cached {key: centerX} for the active drag gesture
  const dragRef = useRef({ x: 0, moved: false });
  const suppressClickRef = useRef(false);
  const navigatingRef = useRef(false);     // true while a tap-triggered scroll is in flight
  const navTimerRef = useRef(null);
  const activeRef = useRef('home');
  useEffect(() => { activeRef.current = active; }, [active]);

  // Raw target the spring chases, plus the spring itself.
  const targetX = useMotionValue(0);
  const smoothX = useSpring(targetX, FOLLOW_SPRING);
  const velocity = useVelocity(smoothX);
  // Subtle horizontal stretch proportional to how fast the blob is moving —
  // the "liquid" part of liquid glass. Settles to 1 the instant motion stops.
  const stretch = useTransform(velocity, v => Math.min(1 + Math.abs(v) / 3200, 1.45));
  const blobLeft = useTransform([smoothX, stretch], ([x, s]) => x - (BLOB_SIZE * s) / 2);
  const blobWidth = useTransform(stretch, s => BLOB_SIZE * s);

  const getCenter = useCallback((key) => {
    const wrap = wrapRef.current;
    const el = itemRefs.current[key];
    if (!wrap || !el) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.left - wrapRect.left + r.width / 2;
  }, []);

  const goToCenter = useCallback((key) => {
    const c = getCenter(key);
    if (c != null) targetX.set(c);
  }, [getCenter, targetX]);

  // Seed the blob the moment the bar mounts, so it's visible around "Home"
  // immediately — no tap required first. The spring animates the first
  // ~150ms from 0 to the real position, which reads as a quick, deliberate
  // "arrive" rather than a flash — matches the reference feel on load.
  useLayoutEffect(() => {
    const c = getCenter('home');
    if (c != null) targetX.set(c);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Whenever the active tab changes AND we're not mid-drag, glide there.
  useEffect(() => { if (!dragging) goToCenter(active); }, [active, dragging, goToCenter]);

  useEffect(() => {
    const onResize = () => { if (!dragging) goToCenter(activeRef.current); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dragging, goToCenter]);

  useEffect(() => () => clearTimeout(navTimerRef.current), []);

  const goToTab = (key, { fromDrag = false } = {}) => {
    clearTimeout(navTimerRef.current);
    navigatingRef.current = true;
    setActive(key);
    setHotKey(key);
    if (fromDrag) scroller.scrollTo(key, { smooth: true, duration: 500, offset: -40 });
    // Scroll (and its scroll-spy side-effects) settles well within 500ms —
    // re-enable spy shortly after so manual scrolling still updates the tab.
    navTimerRef.current = setTimeout(() => { navigatingRef.current = false; }, 650);
  };

  const findNearestKey = (x) => {
    let best = activeRef.current, bestDist = Infinity;
    for (const { key } of items) {
      const c = centersRef.current[key];
      if (c == null) continue;
      const d = Math.abs(c - x);
      if (d < bestDist) { bestDist = d; best = key; }
    }
    return best;
  };

  const onPointerDown = (e) => {
    wrapRef.current?.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, moved: false };
    const c = {};
    for (const { key } of items) { const v = getCenter(key); if (v != null) c[key] = v; }
    centersRef.current = c;
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const wrap = wrapRef.current;
    if (!wrap || !dragging) return;
    const wrapRect = wrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - wrapRect.left, wrapRect.width));
    if (Math.abs(e.clientX - dragRef.current.x) > 6) dragRef.current.moved = true;

    // Pure 1:1 continuous follow — no discrete re-anchoring, no stepwise
    // jumps. This is what makes the drag feel like one fluid motion instead
    // of hopping tab-to-tab.
    targetX.set(x);

    const nearest = findNearestKey(x);
    if (nearest !== hotKey) setHotKey(nearest);
  };

  const endDrag = (e) => {
    if (!dragging) return;
    const wrap = wrapRef.current;
    const wrapRect = wrap?.getBoundingClientRect();
    const x = wrapRect ? e.clientX - wrapRect.left : 0;
    const nearest = findNearestKey(x);

    setDragging(false);

    if (dragRef.current.moved) {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 250);
      goToTab(nearest, { fromDrag: true });
      goToCenter(nearest); // spring glides from wherever the finger let go, smoothly, to the tab center
    } else {
      goToCenter(activeRef.current);
    }
  };

  return (
    <motion.nav
      className="ios-tabbar"
      animate={{ y: tucked ? 20 : 0, scale: tucked ? 0.94 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div
        className={`ios-tabbar-inner${dragging ? ' dragging' : ''}`}
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ touchAction: 'none' }}
      >
        <div className="ios-tabbar-clip">
          <motion.span
            className="tab-blob"
            style={{ left: blobLeft, width: blobWidth }}
          />

          {items.map(({ key, label, Icon }) => {
            const isHot = dragging ? hotKey === key : active === key;
            const onClickCapture = (e) => {
              if (suppressClickRef.current) { e.preventDefault(); e.stopPropagation(); }
            };

            return (
              <div key={key} className="ios-tab-slot" ref={el => { itemRefs.current[key] = el; }}>
                <Link
                  to={key} smooth duration={500} spy offset={-40}
                  className={`ios-tab-item${isHot ? ' tab-active' : ''}`}
                  aria-label={label} title={label}
                  onClickCapture={onClickCapture}
                  onClick={() => goToTab(key)}
                  onSetActive={() => { if (!dragging && !navigatingRef.current) goToTab(key); }}
                >
                  <span className="ios-tab-icon-wrap">
                    <Icon className="ios-tab-icon" />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

export default function Navbar({ config }) {
  const [active, setActive] = useState('home');
  const resumeUrl = config?.resumeUrl || '#';
  const { direction, scrolled } = useScrollDirection();

  // Only tuck away once actually scrolled down the page — at the very top
  // it always shows full-size, Instagram-style.
  const tucked = scrolled && direction === 'down';

  return (
    <>
      {/* Desktop floating glass pill — shrinks & dips on scroll-down, restores on scroll-up */}
      <div className="ios-navbar-anchor">
        <motion.nav
          className={`ios-navbar${scrolled ? ' scrolled' : ''}`}
          initial={{ y: -60, opacity: 0 }}
          animate={{
            y: tucked ? 10 : 0,
            opacity: tucked ? 0.9 : 1,
            scale: tucked ? 0.92 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <span className="ios-navbar-logo">S<span className="dot" /></span>
          <ul className="ios-navbar-items">
            {navItems.map(({ label, to, Icon }) => (
              <li key={to}>
                <Link
                  to={to} smooth duration={500} spy offset={-90}
                  className="ios-nav-link"
                  activeClass="active"
                  onClick={() => setActive(to)}
                  onSetActive={() => setActive(to)}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <a href={resumeUrl} target="_blank" rel="noreferrer" className="ios-navbar-cta">
            Resume
          </a>
        </motion.nav>
      </div>

      {/* Mobile floating "Liquid Glass" pill nav — 5 evenly-spaced icons,
          Resume moved to the Hero section for mobile (see Hero.jsx) */}
      <MobileTabBar config={config} tucked={tucked} />
    </>
  );
}