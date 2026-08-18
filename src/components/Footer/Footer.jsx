import { motion } from 'framer-motion';
import { AiFillLinkedin, AiFillGithub, AiOutlineMail } from 'react-icons/ai';
import { SiLeetcode } from 'react-icons/si';
import { Link } from 'react-scroll';
import './Footer.css';

const NAV = [
  { label: 'Home', to: 'home' }, { label: 'Story', to: 'about' },
  { label: 'Skills', to: 'skills' }, { label: 'Work', to: 'projects' }, { label: 'Contact', to: 'contact' },
];

export default function Footer({ config }) {
  const name = config?.name || 'Sandesh Patel';
  const email = config?.email || 'patelsandesh1@gmail.com';
  const linkedin = config?.linkedin || '#';
  const github = config?.github || '#';
  const leetcode = config?.leetcode || '#';

  const socials = [
    { href: linkedin, Icon: AiFillLinkedin, label: 'LinkedIn' },
    { href: github, Icon: AiFillGithub, label: 'GitHub' },
    { href: `mailto:${email}`, Icon: AiOutlineMail, label: 'Email' },
    { href: leetcode, Icon: SiLeetcode, label: 'LeetCode' },
  ];

  return (
    <footer className="ios-footer">
      <div className="footer-glow-line" />
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="fb-logo">{name.split(' ')[0]}<span className="dot" /></span>
            <p className="fb-tag">Designed with iOS glass, built with React.</p>
          </div>
          <div className="footer-nav">
            {NAV.map(({ label, to }) => (
              <Link key={to} to={to} smooth duration={500} offset={-70} className="footer-link">{label}</Link>
            ))}
          </div>
          <div className="footer-socials">
            {socials.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="footer-social glass" title={label}><Icon /></a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Made in Mumbai 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
