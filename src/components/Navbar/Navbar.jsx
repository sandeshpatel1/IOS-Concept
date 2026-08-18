import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Link, scroller } from 'react-scroll';
import { motion, useMotionValue, animate } from 'framer-motion';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineSparkles,
  HiOutlineSquares2X2, HiOutlineChatBubbleLeftRight,
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

// A snappier, closer-to-critically-damped spring reads as a direct "snap"
// rather than a bouncy overshoot — this is what makes Instagram's version
// feel tight instead of jelly-like.
const SPRING = { type: 'spring', stiffness: 520, damping: 40, mass: 0.7 };
const HYSTERESIS = 10;     // px — must be clearly closer to switch drag-anchor, avoids flicker
const BLOB_SIZE = 48;      // fixed capsule size — matches the icon's own footprint,
                            // never bleeds toward neighboring tabs regardless of slot width

/**
 * The real iOS 18 / Instagram "Liquid Glass" tab bar.
 * - At rest, a fixed-size capsule sits centered on the active tab (not sized
 *   to the whole flex slot — this is what keeps it from visually crowding
 *   neighbors and makes every gap read as equal).
 * - Dragging: the anchor continuously re-targets whichever tab is nearest
 *   your finger (with hysteresis), so the stretch never exceeds ~1 slot.
 * - Tapping: the blob snaps directly to the tapped tab immediately and
 *   ignores scroll-spy until the page finishes smooth-scrolling there, so it
 *   never hops through intermediate tabs while the page is still moving.
 */
function MobileTabBar({ config, tucked }) {
  const items = navItems;

  const [active, setActive] = useState('home');
  const [dragging, setDragging] = useState(false);
  const [hotKey, setHotKey] = useState('home');

  const wrapRef = useRef(null);
  const itemRefs = useRef({});
  const rectsRef = useRef(null);
  const anchorKeyRef = useRef('home');
  const dragRef = useRef({ x: 0, moved: false });
  const suppressClickRef = useRef(false);
  const navigatingRef = useRef(false);   // true while a tap-triggered scroll is in flight
  const navTimerRef = useRef(null);
  const activeRef = useRef('home');
  useEffect(() => { activeRef.current = active; }, [active]);

  const blobLeft = useMotionValue(0);
  const blobWidth = useMotionValue(BLOB_SIZE);
  const blobScaleY = useMotionValue(1);

  // A "slot" rect (full flex-1 width, for hit-testing / nearest-tab math)
  // vs a "capsule" rect (fixed BLOB_SIZE, centered in the slot, for what the
  // blob actually renders as) — keeping these separate is what fixes the
  // "blob bleeds into the next icon" look.
  const getSlotRect = useCallback((key) => {
    const wrap = wrapRef.current;
    const el = itemRefs.current[key];
    if (!wrap || !el) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const center = r.left - wrapRect.left + r.width / 2;
    return { key, center, slotWidth: r.width };
  }, []);

  const getCapsuleRect = useCallback((key) => {
    const s = getSlotRect(key);
    if (!s) return null;
    const width = Math.min(BLOB_SIZE, s.slotWidth - 8);
    return { key, left: s.center - width / 2, width, center: s.center };
  }, [getSlotRect]);

  const snapTo = useCallback((key, animated = true) => {
    const r = getCapsuleRect(key);
    if (!r) return;
    if (animated) {
      animate(blobLeft, r.left, SPRING);
      animate(blobWidth, r.width, SPRING);
      animate(blobScaleY, 1, SPRING);
    } else {
      blobLeft.set(r.left);
      blobWidth.set(r.width);
      blobScaleY.set(1);
    }
  }, [getCapsuleRect, blobLeft, blobWidth, blobScaleY]);

  // Seed the blob the moment the bar mounts, so it's visible around "Home"
  // immediately — no tap required first.
  useLayoutEffect(() => { snapTo(active, false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onResize = () => { if (!dragging) snapTo(activeRef.current, false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dragging, snapTo]);

  useEffect(() => () => clearTimeout(navTimerRef.current), []);

  const goToTab = (key, { fromDrag = false } = {}) => {
    clearTimeout(navTimerRef.current);
    navigatingRef.current = true;
    setActive(key);
    setHotKey(key);
    snapTo(key);
    if (fromDrag) scroller.scrollTo(key, { smooth: true, duration: 500, offset: -40 });
    // Scroll (and its scroll-spy side-effects) settles well within 500ms —
    // re-enable spy shortly after so manual scrolling still updates the tab.
    navTimerRef.current = setTimeout(() => { navigatingRef.current = false; }, 650);
  };

  const onPointerDown = (e) => {
    wrapRef.current?.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, moved: false };
    rectsRef.current = items.map(i => getSlotRect(i.key)).filter(Boolean);
    anchorKeyRef.current = activeRef.current;
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const rects = rectsRef.current;
    const wrap = wrapRef.current;
    if (!rects || !wrap) return;

    const wrapRect = wrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - wrapRect.left, wrapRect.width));
    if (Math.abs(e.clientX - dragRef.current.x) > 6) dragRef.current.moved = true;

    let nearest = rects[0], nearestDist = Infinity;
    for (const r of rects) {
      const d = Math.abs(r.center - x);
      if (d < nearestDist) { nearestDist = d; nearest = r; }
    }
    const current = rects.find(r => r.key === anchorKeyRef.current) || nearest;
    const currentDist = Math.abs(current.center - x);
    const anchorSlot = (nearest.key !== current.key && currentDist - nearestDist > HYSTERESIS) ? nearest : current;
    if (anchorSlot.key !== anchorKeyRef.current) {
      anchorKeyRef.current = anchorSlot.key;
      setHotKey(anchorSlot.key);
    }

    const anchor = getCapsuleRect(anchorSlot.key);
    if (!anchor) return;
    const half = anchor.width / 2;
    const left = Math.min(anchor.left, x - half);
    const right = Math.max(anchor.left + anchor.width, x + half);
    blobLeft.set(left);
    blobWidth.set(right - left);

    const stretch = (right - left) - anchor.width;
    blobScaleY.set(Math.max(0.82, 1 - stretch / 220));
  };

  const endDrag = () => {
    if (!rectsRef.current) return;
    const nearest = anchorKeyRef.current;
    setDragging(false);
    rectsRef.current = null;

    if (dragRef.current.moved) {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 250);
      goToTab(nearest, { fromDrag: true });
    } else {
      snapTo(activeRef.current);
    }
  };

  return (
    <motion.nav
      className="ios-tabbar"
      animate={{
        y: tucked ? 20 : 0,
        opacity: tucked ? 0.88 : 1,
        scale: tucked ? 0.94 : 1,
      }}
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
            style={{ left: blobLeft, width: blobWidth, scaleY: blobScaleY }}
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