import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaGitAlt, FaBootstrap,
} from 'react-icons/fa';
import {
  SiJavascript, SiMongodb, SiExpress, SiFirebase, SiDotnet,
} from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';
import './Skills.css';

const techSkills = [
  { name: 'HTML5',      Icon: FaHtml5,       grad: 'linear-gradient(145deg,#ff8a5c,#e34f26)' },
  { name: 'CSS3',       Icon: FaCss3Alt,     grad: 'linear-gradient(145deg,#3ea0e0,#1572b6)' },
  { name: 'JavaScript', Icon: SiJavascript,  grad: 'linear-gradient(145deg,#ffe45c,#f7df1e)' },
  { name: 'React',      Icon: FaReact,       grad: 'linear-gradient(145deg,#7ee8ff,#61dafb)' },
  { name: 'Node.js',    Icon: FaNodeJs,      grad: 'linear-gradient(145deg,#5cbf5c,#339933)' },
  { name: 'Express',    Icon: SiExpress,     grad: 'linear-gradient(145deg,#6b6b6b,#3a3a3a)' },
  { name: 'MongoDB',    Icon: SiMongodb,     grad: 'linear-gradient(145deg,#6fce85,#47a248)' },
  { name: 'Firebase',   Icon: SiFirebase,    grad: 'linear-gradient(145deg,#ffdb70,#ffca28)' },
  { name: 'C#',         Icon: TbBrandCSharp, grad: 'linear-gradient(145deg,#c07ac0,#9b4f96)' },
  { name: 'ASP.NET',    Icon: SiDotnet,      grad: 'linear-gradient(145deg,#7a5cf0,#512bd4)' },
  { name: 'Git',        Icon: FaGitAlt,      grad: 'linear-gradient(145deg,#ff8a5c,#f05032)' },
  { name: 'Bootstrap',  Icon: FaBootstrap,   grad: 'linear-gradient(145deg,#a682e0,#7952b3)' },
];

const softSkills = [
  { icon: '🧩', title: 'Problem Solving', level: 88, color: '#0a84ff',
    evidence: 'Solved 100+ DSA problems on LeetCode. Debugged production SQL deadlocks at ATM Infotech.' },
  { icon: '💬', title: 'Communication', level: 82, color: '#64d2ff',
    evidence: 'Presented technical roadmaps to non-tech stakeholders. Wrote clear API documentation.' },
  { icon: '🤝', title: 'Team Work', level: 90, color: '#30d158',
    evidence: 'Collaborated across design, backend, and QA teams on CRM and parking management projects.' },
  { icon: '⚡', title: 'Adaptability', level: 92, color: '#ff9f0a',
    evidence: 'Switched between React, C# ASP.NET, and SQL Server in the same sprint when the project required it.' },
  { icon: '🎯', title: 'Ownership', level: 85, color: '#ff375f',
    evidence: 'Led front-end architecture decisions on 3 live products. Shipped features solo from design to deploy.' },
  { icon: '🔍', title: 'Attention to Detail', level: 87, color: '#bf5af2',
    evidence: 'Built pixel-accurate UIs matching Figma designs. Caught 12 edge-case bugs before QA pass.' },
];

function RadialProgress({ value, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [pct, setPct] = useState(0);
  useEffect(() => { if (inView) { const t = setTimeout(() => setPct(value), 150); return () => clearTimeout(t); } }, [inView, value]);
  return (
    <div ref={ref} className="radial" style={{ '--pct': pct, '--color': color }}>
      <span className="radial-num">{pct}%</span>
    </div>
  );
}

function SoftWidget({ skill, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      className={`soft-widget${flipped ? ' flipped' : ''} glass glass-panel`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22,1,0.36,1] }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className="soft-widget-inner">
        <div className="soft-face soft-front">
          <div className="soft-top"><span className="soft-icon">{skill.icon}</span><RadialProgress value={skill.level} color={skill.color} /></div>
          <div className="soft-title">{skill.title}</div>
          <span className="soft-tap">tap for proof</span>
        </div>
        <div className="soft-face soft-back">
          <span className="soft-icon">{skill.icon}</span>
          <div className="soft-title" style={{ color: skill.color }}>{skill.title}</div>
          <p className="soft-evidence">{skill.evidence}</p>
        </div>
      </div>
    </motion.div>
  );
}

function LeetcodeWidget() {
  const username = 'sandeshpatel';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setLoading(true); setError(false);
    const endpoints = import.meta.env.DEV
      ? [`/api/leetcode/${username}`, `https://portfoliobackend-oy98.onrender.com/api/leetcode/${username}`]
      : [`https://portfoliobackend-oy98.onrender.com/api/leetcode/${username}`];
    for (const url of endpoints) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!r.ok) continue;
        const d = await r.json();
        if (d.success) { setStats(d); setLoading(false); return; }
      } catch { /* try next */ }
    }
    setError(true); setLoading(false);
  };
  useEffect(() => { fetchStats(); }, []);

  const totalSolved = stats?.totalSolved ?? 0;
  const totalQ = stats?.totalQuestions ?? 3566;
  const pct = totalQ ? Math.round((totalSolved / totalQ) * 100) : 0;
  const cats = [
    { label: 'Easy', val: stats?.easySolved ?? 0, total: stats?.easyTotal ?? 882, color: '#30d158' },
    { label: 'Medium', val: stats?.mediumSolved ?? 0, total: stats?.mediumTotal ?? 1861, color: '#ff9f0a' },
    { label: 'Hard', val: stats?.hardSolved ?? 0, total: stats?.hardTotal ?? 823, color: '#ff375f' },
  ];

  return (
    <motion.div className="lc-widget glass glass-panel"
      initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <div className="lc-widget-head">
        <span className="widget-label">LeetCode</span>
        <button className="lc-refresh-btn" onClick={fetchStats}>↻</button>
      </div>
      {loading ? (
        <div className="lc-skel-wrap"><div className="lc-skel" /><div className="lc-skel short" /></div>
      ) : error ? (
        <p className="lc-err">Backend offline — showing profile link only.</p>
      ) : (
        <>
          <div className="lc-top-row">
            <span className="lc-solved">{totalSolved}<small>/{totalQ}</small></span>
            <span className="lc-pct">{pct}%</span>
          </div>
          <div className="lc-bars">
            {cats.map(c => (
              <div key={c.label} className="lc-bar-line">
                <span>{c.label}</span>
                <div className="lc-track"><motion.div className="lc-fill" style={{ background: c.color }}
                  initial={{ width: 0 }} whileInView={{ width: `${(c.val/c.total)*100}%` }} viewport={{once:true}} transition={{duration:1}} /></div>
              </div>
            ))}
          </div>
        </>
      )}
      <a href={`https://leetcode.com/u/${username}/`} target="_blank" rel="noreferrer" className="lc-link">Open Profile ↗</a>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="ios-skills">
      <div className="container">
        <motion.span className="section-kicker" initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>Home Screen</motion.span>
        <motion.h2 className="section-heading" initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.06}}>
          Apps I <span className="liquid-text">ship with</span>
        </motion.h2>

        <div className="app-grid">
          {techSkills.map(({ name, Icon, grad }, i) => (
            <motion.div key={name} className="app-icon-tile"
              initial={{ opacity: 0, scale: 0.6, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.03, duration: 0.45, type: 'spring', stiffness: 220 }}
              whileHover={{ y: -6, scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <div className="app-icon" style={{ background: grad }}>
                <Icon />
              </div>
              <span className="app-label">{name}</span>
            </motion.div>
          ))}
        </div>

        <div className="widgets-header">
          <span className="section-kicker" style={{ marginBottom: 0 }}>Widget Gallery</span>
        </div>
        <div className="widget-gallery">
          {softSkills.map((s, i) => <SoftWidget key={s.title} skill={s} index={i} />)}
          <LeetcodeWidget />
        </div>
      </div>
    </section>
  );
}
