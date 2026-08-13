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
<<<<<<< HEAD
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
=======
  { key: 'home',     label: 'Home',     to: 'home',     Icon: HiOutlineHome },
  { key: 'about',    label: 'Story',    to: 'about',    Icon: HiOutlineUser },
  { key: 'skills',   label: 'Skills',   to: 'skills',   Icon: HiOutlineSparkles },
  { key: 'projects', label: 'Work',     to: 'projects', Icon: HiOutlineSquares2X2 },
  { key: 'contact',  label: 'Contact',  to: 'contact',  Icon: HiOutlineChatBubbleLeftRight },
];

const SPRING = { type: 'spring', stiffness: 420, damping: 32 };
const HYSTERESIS = 10; // px — must be clearly closer to switch anchor tab, avoids flicker at the midpoint

/**
 * The real iOS 18 / Instagram "Liquid Glass" tab bar. The blob's anchor is
 * always whichever tab is CURRENTLY nearest your finger — not the tab you
 * started the drag on — so the stretch is always bounded to roughly one
 * slot-width (an "inchworm" crawl), never a smear across the whole bar no
 * matter how far or fast you drag. On release it snaps into a clean rounded
 * capsule around the nearest icon.
 */
function MobileTabBar({ config, tucked }) {
  const items = [
    ...navItems,
    { key: 'resume', label: 'Resume', Icon: HiOutlineDocumentArrowDown, isResume: true },
  ];

  const [active, setActive] = useState('home');
  const [dragging, setDragging] = useState(false);
  const [hotKey, setHotKey] = useState('home'); // tab currently under/nearest the blob

  const wrapRef = useRef(null);
  const itemRefs = useRef({});
  const rectsRef = useRef(null);           // cached slot rects, captured once per drag
  const anchorKeyRef = useRef('home');      // tab the blob is currently anchored to (drag-only)
  const dragRef = useRef({ x: 0, moved: false });
  const suppressClickRef = useRef(false);
  const activeRef = useRef('home');
  useEffect(() => { activeRef.current = active; }, [active]);

  const blobLeft = useMotionValue(0);
  const blobWidth = useMotionValue(56);
  const blobScaleY = useMotionValue(1);

  const getRect = useCallback((key) => {
    const wrap = wrapRef.current;
    const el = itemRefs.current[key];
    if (!wrap || !el) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const inset = 6;
    return {
      key,
      left: r.left - wrapRect.left + inset,
      width: r.width - inset * 2,
      center: r.left - wrapRect.left + r.width / 2,
    };
  }, []);

  const snapTo = useCallback((key, animated = true) => {
    const r = getRect(key);
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
  }, [getRect, blobLeft, blobWidth, blobScaleY]);

  // Seed the blob the moment the bar mounts, so it's visible around "Home"
  // immediately — no tap required first.
  useLayoutEffect(() => { snapTo(active, false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onResize = () => { if (!dragging) snapTo(activeRef.current, false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dragging, snapTo]);

  const onPointerDown = (e) => {
    wrapRef.current?.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, moved: false };
    // Cache every slot's rect ONCE per drag — avoids layout thrashing on
    // every pointermove, and keeps the anchor logic below cheap.
    rectsRef.current = items.map(i => getRect(i.key)).filter(Boolean);
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

    // Find the nearest slot to the finger, with hysteresis so it doesn't
    // flicker back and forth right at the midpoint between two icons.
    let nearest = rects[0], nearestDist = Infinity;
    for (const r of rects) {
      const d = Math.abs(r.center - x);
      if (d < nearestDist) { nearestDist = d; nearest = r; }
    }
    const current = rects.find(r => r.key === anchorKeyRef.current) || nearest;
    const currentDist = Math.abs(current.center - x);
    const anchor = (nearest.key !== current.key && currentDist - nearestDist > HYSTERESIS) ? nearest : current;
    if (anchor.key !== anchorKeyRef.current) {
      anchorKeyRef.current = anchor.key;
      setHotKey(anchor.key);
    }

    // Stretch: trailing edge stays on the current anchor slot, leading edge
    // reaches toward the finger — but since the anchor itself now tracks
    // whichever tab is nearest, this never exceeds ~1 slot-width of stretch.
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
      // Real drag — we own navigation; swallow the ghost click that follows.
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 250);
      setActive(nearest);
      setHotKey(nearest);
      snapTo(nearest);

      const item = items.find(i => i.key === nearest);
      if (item?.isResume) window.open(config?.resumeUrl || '#', '_blank', 'noreferrer');
      else scroller.scrollTo(nearest, { smooth: true, duration: 500, offset: -40 });
    } else {
      // Plain tap — let the underlying Link's own onClick handle navigation;
      // just make sure the blob is sitting where it should.
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
        {/* Separate clipping layer so the blob's glow can never bleed past
            the pill's own rounded edge, while the pill's outer drop-shadow
            (on .ios-tabbar-inner itself) stays untouched. */}
        <div className="ios-tabbar-clip">
          <motion.span
            className="tab-blob"
            style={{ left: blobLeft, width: blobWidth, scaleY: blobScaleY }}
          />

          {items.map(({ key, label, Icon, isResume }) => {
            const isHot = dragging ? hotKey === key : active === key;
            const iconEl = (
              <span className="ios-tab-icon-wrap">
                <Icon className="ios-tab-icon" />
              </span>
            );
            const onClickCapture = (e) => {
              if (suppressClickRef.current) { e.preventDefault(); e.stopPropagation(); }
            };

            if (isResume) {
              return (
                <div key={key} className="ios-tab-slot" ref={el => { itemRefs.current[key] = el; }}>
                  <a
                    href={config?.resumeUrl || '#'} target="_blank" rel="noreferrer"
                    className={`ios-tab-item${isHot ? ' tab-active' : ''}`}
                    aria-label={label} title={label}
                    onClickCapture={onClickCapture}
                  >
                    {iconEl}
                  </a>
                </div>
              );
            }

            return (
              <div key={key} className="ios-tab-slot" ref={el => { itemRefs.current[key] = el; }}>
                <Link
                  to={key} smooth duration={500} spy offset={-40}
                  className={`ios-tab-item${isHot ? ' tab-active' : ''}`}
                  aria-label={label} title={label}
                  onClickCapture={onClickCapture}
                  onClick={() => { setActive(key); setHotKey(key); snapTo(key); }}
                  onSetActive={() => { if (!dragging) { setActive(key); setHotKey(key); snapTo(key); } }}
                >
                  {iconEl}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
>>>>>>> 8c8c5bdf7684faaf4fc0d3dc0cdc7a5bcfad1e8a

export default function Navbar({ config }) {
  const [active, setActive] = useState('home');
  const resumeUrl = config?.resumeUrl || '#';
  const { direction, scrolled } = useScrollDirection();
<<<<<<< HEAD
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

=======

  // Only tuck away once actually scrolled down the page — at the very top
  // it always shows full-size, Instagram-style.
  const tucked = scrolled && direction === 'down';

>>>>>>> 8c8c5bdf7684faaf4fc0d3dc0cdc7a5bcfad1e8a
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

<<<<<<< HEAD
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
=======
      {/* Mobile floating "Liquid Glass" pill nav — icon-only, bounded
          finger-drag blob tracking, same shrink/dip behavior on scroll */}
      <MobileTabBar config={config} tucked={tucked} />
    </>
  );
}
>>>>>>> 8c8c5bdf7684faaf4fc0d3dc0cdc7a5bcfad1e8a
