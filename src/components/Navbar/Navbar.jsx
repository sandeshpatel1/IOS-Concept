import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';
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

/**
 * The real iOS 18 "Liquid Glass" tab travel: a glassy blob that elongates
 * into the gap between the old and new tab mid-transition, then snaps back
 * to a circle at rest — not just a pill that fades/slides. Positions are
 * measured from the actual DOM (getBoundingClientRect) so the stretch
 * spans the true distance between icons, however many tabs there are.
 */
function LiquidTabBlob({ activeKey, itemRefs, wrapRef }) {
  const [travel, setTravel] = useState(null); // { from:{left,width}, to:{left,width}, id }
  const restRef = useRef(null); // last settled {left, width}
  const prevKeyRef = useRef(null);

  const measure = useCallback((key) => {
    const wrap = wrapRef.current;
    const el = itemRefs.current[key];
    if (!wrap || !el) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { left: r.left - wrapRect.left + r.width / 2 - 22, width: 44 };
  }, [itemRefs, wrapRef]);

  useLayoutEffect(() => {
    const to = measure(activeKey);
    if (!to) return;
    const from = restRef.current || to;
    if (prevKeyRef.current !== activeKey) {
      setTravel({ from, to, id: `${activeKey}-${Date.now()}` });
      prevKeyRef.current = activeKey;
      restRef.current = to;
    }
  }, [activeKey, measure]);

  // Re-measure on resize so the blob stays glued to its tab
  useEffect(() => {
    const onResize = () => {
      const to = measure(activeKey);
      if (to) { restRef.current = to; setTravel(t => t ? { ...t, to } : t); }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeKey, measure]);

  if (!travel) return null;
  const { from, to } = travel;
  const bridgeLeft = Math.min(from.left, to.left);
  const bridgeWidth = Math.abs(to.left - from.left) + 44;

  return (
    <motion.span
      key={travel.id}
      className="tab-blob"
      initial={{ left: from.left, width: from.width, scaleY: 1 }}
      animate={{
        left: [from.left, bridgeLeft, to.left],
        width: [from.width, bridgeWidth, to.width],
        scaleY: [1, 0.86, 1],
      }}
      transition={{ duration: 0.52, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] }}
    />
  );
}

export default function Navbar({ config }) {
  const [active, setActive] = useState('home');
  const resumeUrl = config?.resumeUrl || '#';
  const { direction, scrolled } = useScrollDirection();
  const tabWrapRef = useRef(null);
  const tabItemRefs = useRef({});

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

      {/* Mobile floating "Liquid Glass" pill nav — same shrink/dip behavior */}
      <motion.nav
        className="ios-tabbar"
        animate={{
          y: tucked ? 20 : 0,
          opacity: tucked ? 0.88 : 1,
          scale: tucked ? 0.94 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="ios-tabbar-inner" ref={tabWrapRef}>
          <LiquidTabBlob activeKey={active} itemRefs={tabItemRefs} wrapRef={tabWrapRef} />

          {navItems.map(({ label, to, Icon }) => {
            const isActive = active === to;
            return (
              <div key={to} className="ios-tab-slot" ref={el => { tabItemRefs.current[to] = el; }}>
                <Link
                  to={to} smooth duration={500} spy offset={-40}
                  className={`ios-tab-item${isActive ? ' tab-active' : ''}`}
                  onClick={() => setActive(to)}
                  onSetActive={() => setActive(to)}
                >
                  <span className="ios-tab-icon-wrap">
                    <Icon className="ios-tab-icon" />
                  </span>
                  <span className="ios-tab-label">{label}</span>
                </Link>
              </div>
            );
          })}

          <div className="ios-tab-slot" ref={el => { tabItemRefs.current.resume = el; }}>
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="ios-tab-item">
              <span className="ios-tab-icon-wrap">
                <HiOutlineDocumentArrowDown className="ios-tab-icon" />
              </span>
              <span className="ios-tab-label">Resume</span>
            </a>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
