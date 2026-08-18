import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AiOutlineMail, AiOutlineEnvironment, AiOutlineSend, AiOutlineUser,
  AiOutlineTag, AiOutlineMessage, AiOutlineCheckCircle, AiOutlineCloseCircle,
} from 'react-icons/ai';
import { FaLinkedinIn, FaGithub, FaInstagram } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import './Contact.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

/* A single floating-label glass field, icon-led, iOS-compose style. */
function Field({ icon: Icon, label, name, value, onChange, type = 'text', textarea, placeholder, accent, required }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const Tag = textarea ? 'textarea' : 'input';

  return (
    <motion.div
      className={`field-card glass${focused ? ' focused' : ''}`}
      animate={{ y: focused ? -2 : 0, borderColor: focused ? accent : 'var(--glass-border)' }}
      transition={{ duration: 0.25 }}
      style={{ '--field-accent': accent }}
    >
      <span className="field-icon" style={{ background: accent }}><Icon /></span>
      <div className="field-inputwrap">
        <motion.label
          className="field-label"
          animate={{
            y: floated ? 0 : (textarea ? 14 : 11),
            scale: floated ? 0.78 : 1,
            color: focused ? accent : 'var(--text-muted)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          {label}
        </motion.label>
        <Tag
          name={name}
          type={!textarea ? type : undefined}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          rows={textarea ? 3 : undefined}
          placeholder={floated ? placeholder : ''}
          className="field-input"
        />
      </div>
    </motion.div>
  );
}

export default function Contact({ config }) {
  const name = config?.name || 'Sandesh Patel';
  const email = config?.email || 'patelsandesh1@gmail.com';
  const location = config?.location || 'Mumbai, Maharashtra, India';

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', project: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const { firstName, lastName, email: em, project, message } = form;
    if (!firstName || !lastName || !em || !project || !message) return;
    setStatus('loading');
    try {
      const endpoints = import.meta.env.DEV
        ? ['/api/submit-form', 'https://portfoliobackend-oy98.onrender.com/api/submit-form']
        : ['https://portfoliobackend-oy98.onrender.com/api/submit-form'];
      let ok = false;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
          if (res.ok) { ok = true; break; }
        } catch { /* try next */ }
      }
      setStatus(ok ? 'success' : 'error');
      if (ok) setForm({ firstName: '', lastName: '', email: '', project: '', message: '' });
    } catch { setStatus('error'); }
  };

  const socials = [
    { href: 'https://www.linkedin.com/in/sandeshpatel1/', Icon: FaLinkedinIn, label: 'LinkedIn' },
    { href: 'https://github.com/sandeshpatel1', Icon: FaGithub, label: 'GitHub' },
    { href: 'https://leetcode.com/sandeshpatel/', Icon: SiLeetcode, label: 'LeetCode' },
    { href: 'https://www.instagram.com/patel_sandesh_/', Icon: FaInstagram, label: 'Instagram' },
  ];

  return (
    <section id="contact" className="ios-contact">
      <div className="container">
        <motion.span className="section-kicker" {...fadeUp(0)}>Get in Touch</motion.span>
        <motion.h2 className="section-heading" {...fadeUp(0.05)}>
          Let's build <span className="liquid-text">something great</span>
        </motion.h2>

        <div className="contact-grid">
          {/* iOS contact card */}
          <motion.div className="contact-card-ios glass glass-panel" {...fadeUp(0.15)}>
            <div className="cc-avatar">{name.split(' ').map(w => w[0]).join('')}</div>
            <h3 className="cc-name">{name}</h3>
            <p className="cc-role">Full Stack Developer</p>

            <div className="cc-quick-row">
              <a href={`mailto:${email}`} className="cc-quick-btn"><AiOutlineMail /><span>Mail</span></a>
              <a href={socials[0].href} target="_blank" rel="noreferrer" className="cc-quick-btn"><FaLinkedinIn /><span>Linked&shy;In</span></a>
              <a href={socials[1].href} target="_blank" rel="noreferrer" className="cc-quick-btn"><FaGithub /><span>GitHub</span></a>
            </div>

            <div className="cc-detail-list">
              <div className="cc-detail-row"><AiOutlineMail /><span>{email}</span></div>
              <div className="cc-detail-row"><AiOutlineEnvironment /><span>{location}</span></div>
            </div>

            <div className="cc-socials">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="cc-social-btn" title={label}><Icon /></a>
              ))}
            </div>
          </motion.div>

          {/* Compose-sheet form */}
          <motion.form className="compose-form" onSubmit={submit} noValidate {...fadeUp(0.22)}>
            <div className="compose-header glass glass-panel">
              <span className="compose-title">New Message</span>
              <span className="compose-to">To: {name.split(' ')[0]}</span>
            </div>

            <div className="field-row-2">
              <Field icon={AiOutlineUser} label="First Name" name="firstName" value={form.firstName} onChange={handle} accent="var(--blue)" placeholder="John" required />
              <Field icon={AiOutlineUser} label="Last Name" name="lastName" value={form.lastName} onChange={handle} accent="var(--purple)" placeholder="Doe" required />
            </div>
            <Field icon={AiOutlineMail} label="Email" name="email" type="email" value={form.email} onChange={handle} accent="var(--cyan)" placeholder="john@example.com" required />
            <Field icon={AiOutlineTag} label="Subject" name="project" value={form.project} onChange={handle} accent="var(--orange)" placeholder="Portfolio Website" required />
            <Field icon={AiOutlineMessage} label="Message" name="message" value={form.message} onChange={handle} accent="var(--green)" placeholder="Hi Sandesh, I'd love to..." textarea required />

            <motion.button className="send-btn" type="submit" disabled={status === 'loading'}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.96 }}>
              <AnimatePresence mode="wait">
                {status === 'loading' ? (
                  <motion.span key="loading" className="send-btn-inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span className="spinner" /> Sending…
                  </motion.span>
                ) : (
                  <motion.span key="idle" className="send-btn-inner"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ x: 40, opacity: 0 }}>
                    Send Message <AiOutlineSend />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {status === 'success' && (
                <motion.div className="form-toast success"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}>
                  <AiOutlineCheckCircle /> Message sent! I'll reply within 24 hours.
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div className="form-toast error"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}>
                  <AiOutlineCloseCircle /> Something went wrong. Email me directly at {email}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
