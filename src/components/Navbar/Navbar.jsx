import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Link, scroller } from 'react-scroll';
import { motion, useMotionValue, animate } from 'framer-motion';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineSparkles,
  HiOutlineSquares2X2, HiOutlineChatBubbleLeftRight, HiOutlineDocumentArrowDown,
} from 'react-icons/hi2';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import './Navbar.css';

const navItems = [
  { label: 'Home',     to: 'home',     Icon: HiOutlineHome },
  { label: 'Story',    to: 'about',    Icon: HiOutlineUser },
  { label: 'Skills',   to: 'skills',   Icon: HiOutlineSparkles },
  { label: 'Work',     to: 'projects', Icon: HiOutlineSquares2X2 },
  { label: 'Contact',  to: 'contact',  Icon: HiOutlineChatBubbleLeftRight },
];

// The mobile tab bar treats "Resume" as a real stop in the same row, even
// though it opens externally instead of scrolling.
const mobileTabs = [...navItems, { label: 'Resume', to: 'resume', Icon: HiOutlineDocumentArrowDown, external: true }];

const BLOB_SIZE = 44;

export default function Navbar({ config }) {
  const [active, setActive] = useState('home');
  const resumeUrl = config?.resumeUrl || '#';
  const { direction, scrolled } = useScrollDirection();
  const tucked = scrolled && direction === 'down';

  const tabWrapRef = useRef(null);
  const tabItemRefs = useRef({});
  const dragRef = useRef({ dragging: false, startX: 0, moved: false });
  const prevActiveRef = useRef(active);

  // Persistent motion values — the blob element is ALWAYS mounted (never
  // conditionally rendered on a successful measurement), so there's no
  // failure mode where it silently never appears.
  const blobX = useMotionValue(4);
  const blobWidth = useMotionValue(BLOB_SIZE);
  const blobScaleY = useMotionValue(1);

  const getRect = useCallback((key) => {
    const wrap = tabWrapRef.current;
    const el = tabItemRefs.current[key];
    if (!wrap || !el) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { center: r.left - wrapRect.left + r.width / 2, wrapWidth: wrapRect.width };
  }, []);

  const settleTo = useCallback((key, { stretch = false } = {}) => {
    const rect = getRect(key);
    if (!rect) return;
    const targetLeft = rect.center - BLOB_SIZE / 2;
    if (stretch) {
      const fromLeft = blobX.get();
      const bridgeLeft = Math.min(fromLeft, targetLeft);
      const bridgeWidth = Math.abs(targetLeft - fromLeft) + BLOB_SIZE;
      animate(blobX, [fromLeft, bridgeLeft, targetLeft], { duration: 0.5, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] });
      animate(blobWidth, [BLOB_SIZE, bridgeWidth, BLOB_SIZE], { duration: 0.5, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] });
      animate(blobScaleY, [1, 0.86, 1], { duration: 0.5, times: [0, 0.4, 1] });
    } else {
      animate(blobX, targetLeft, { type: 'spring', stiffness: 420, damping: 32 });
      animate(blobWidth, BLOB_SIZE, { type: 'spring', stiffness: 420, damping: 32 });
    }
  }, [getRect, blobX, blobWidth, blobScaleY]);

  // Position on mount + keep glued to its tab on resize/orientation change.
  useLayoutEffect(() => {
    settleTo(active);
    const onResize = () => settleTo(active);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safety net: re-measure one frame after mount in case fonts/icons were
  // still settling when the first layout pass ran.
  useEffect(() => {
    const id = requestAnimationFrame(() => settleTo(active));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap / scroll-spy driven changes (not drag) get the full stretch travel.
  useEffect(() => {
    if (prevActiveRef.current !== active && !dragRef.current.dragging) {
      settleTo(active, { stretch: true });
    }
    prevActiveRef.current = active;
  }, [active, settleTo]);

  const commit = (key) => {
    if (key === 'resume') { window.open(resumeUrl, '_blank', 'noopener'); return; }
    setActive(key);
    scroller.scrollTo(key, { smooth: true, duration: 500, offset: -40 });
  };

  // ── Real drag-to-follow: the blob tracks the finger continuously,
  //    lands wherever it's released, "dynamically anywhere" mid-bar. ──
  const handlePointerDown = (e) => {
    dragRef.current = { dragging: true, startX: e.clientX, moved: false };
    tabWrapRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    if (Math.abs(e.clientX - dragRef.current.startX) > 6) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;

    const wrap = tabWrapRef.current;
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const clamped = Math.max(4, Math.min(e.clientX - wrapRect.left - BLOB_SIZE / 2, wrapRect.width - BLOB_SIZE - 4));
    blobX.set(clamped);
    blobWidth.set(BLOB_SIZE);

    const fingerCenter = clamped + BLOB_SIZE / 2;
    let nearestKey = active, nearestDist = Infinity;
    mobileTabs.forEach(t => {
      const r = getRect(t.to);
      if (!r) return;
      const d = Math.abs(r.center - fingerCenter);
      if (d < nearestDist) { nearestDist = d; nearestKey = t.to; }
    });
    if (nearestKey !== active) setActive(nearestKey);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.dragging) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.dragging = false;
    if (wasDrag) {
      settleTo(active);
      commit(active);
    }
  };

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

      {/* Mobile floating "Liquid Glass" pill nav — draggable, same shrink/dip on scroll */}
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
          className="ios-tabbar-inner"
          ref={tabWrapRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <motion.span
            className="tab-blob"
            style={{ left: blobX, width: blobWidth, scaleY: blobScaleY }}
          />

          {mobileTabs.map(({ label, to, Icon, external }) => {
            const isActive = active === to;
            const content = (
              <>
                <span className="ios-tab-icon-wrap">
                  <Icon className="ios-tab-icon" />
                </span>
                <span className="ios-tab-label">{label}</span>
              </>
            );
            return (
              <div key={to} className="ios-tab-slot" ref={el => { tabItemRefs.current[to] = el; }}>
                {external ? (
                  <a
                    href={resumeUrl} target="_blank" rel="noreferrer"
                    className={`ios-tab-item${isActive ? ' tab-active' : ''}`}
                    onClick={() => setActive(to)}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    to={to} smooth duration={500} spy offset={-40}
                    className={`ios-tab-item${isActive ? ' tab-active' : ''}`}
                    onClick={() => setActive(to)}
                    onSetActive={() => setActive(to)}
                  >
                    {content}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
