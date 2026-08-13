import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-scroll';
import { AiFillLinkedin, AiFillGithub, AiOutlineMail } from 'react-icons/ai';
import { SiLeetcode } from 'react-icons/si';
import { HiArrowDown } from 'react-icons/hi2';
import MacFrame from '../MacFrame/MacFrame';
import CodeIDE from './CodeIDE';
import './Hero.css';

// Three.js scene is the heaviest chunk — load it after first paint so
// the hero text/CTAs are interactive immediately, even on 3G/older iPhones.
const GlassScene = lazy(() => import('./GlassScene'));

const ROLES = ['Full Stack Developer', 'MERN Stack Engineer', 'React.js Developer', 'C# / ASP.NET Dev'];

function TypeCycle() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = ROLES[roleIdx];
    const speed = deleting ? 32 : 55;
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < full.length) setText(full.slice(0, text.length + 1));
        else setTimeout(() => setDeleting(true), 1400);
      } else {
        if (text.length > 0) setText(text.slice(0, -1));
        else { setDeleting(false); setRoleIdx((roleIdx + 1) % ROLES.length); }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, roleIdx]);

  return <span className="role-type">{text}<span className="type-cursor" /></span>;
}

export default function Hero({ config }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const sceneScale   = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const textY        = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const name      = config?.name      || 'Sandesh Patel';
  const [first, last] = name.split(' ');
  const linkedin  = config?.linkedin  || '#';
  const github    = config?.github    || '#';
  const email     = config?.email     || '';
  const leetcode  = config?.leetcode  || '#';
  const status    = config?.status    || 'Available for work';

  const socials = [
    { href: linkedin, Icon: AiFillLinkedin, label: 'LinkedIn' },
    { href: github,   Icon: AiFillGithub,  label: 'GitHub' },
    { href: `mailto:${email}`, Icon: AiOutlineMail, label: 'Email' },
    { href: leetcode, Icon: SiLeetcode,    label: 'LeetCode' },
  ];

  return (
    <section id="home" className="ios-hero" ref={sectionRef}>
      <motion.div className="hero-3d-layer" style={{ opacity: sceneOpacity, scale: sceneScale }}>
        <Suspense fallback={null}>
          <GlassScene />
        </Suspense>
      </motion.div>
      <div className="hero-noise" />
      <div className="hero-vignette" />

      <div className="hero-grid container">
        <motion.div className="hero-content" style={{ y: textY }}>
          <motion.div className="eyebrow hero-status"
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22,1,0.36,1] }}>
            <span className="dot" /> {status}
          </motion.div>

          <motion.h1 className="hero-title"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8, ease: [0.22,1,0.36,1] }}>
            Hi, I'm <span className="liquid-text">{first}</span><br />{last}
          </motion.h1>

          <motion.p className="hero-role"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}>
            <TypeCycle />
          </motion.p>

          <motion.p className="hero-sub"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7 }}>
            I design and build fast, glassy, production-grade interfaces — 1+ year shipping
            real enterprise software at ATM Infotech with React, Node and SQL Server.
          </motion.p>

          <motion.div className="hero-cta-row"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}>
            <Link to="projects" smooth duration={600} offset={-70} className="ios-btn ios-btn-primary">
              See my work
            </Link>
            <Link to="contact" smooth duration={600} offset={-70} className="ios-btn ios-btn-glass">
              Let's talk
            </Link>
          </motion.div>

          <motion.div className="hero-socials"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.7 }}>
            {socials.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="hero-social-btn glass" title={label}>
                <Icon />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* MacBook IDE — debugging → build → live preview loop */}
        <motion.div className="hero-ide-col"
          initial={{ opacity: 0, x: 60, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.6, duration: 0.9, type: 'spring', stiffness: 70 }}
        >
          <MacFrame>
            <CodeIDE />
          </MacFrame>
          <motion.div className="ide-caption glass"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
            <span className="ide-caption-dot" /> Watching a real bug get fixed, live
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="hero-scroll-cue"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        <Link to="about" smooth duration={600} offset={-70}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <HiArrowDown />
          </motion.div>
          <span>scroll the story</span>
        </Link>
      </motion.div>
    </section>
  );
}
