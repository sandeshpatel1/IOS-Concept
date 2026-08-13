import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Navbar        from './components/Navbar/Navbar';
import Hero          from './components/Hero/Hero';
import About         from './components/About/About';
import Skills        from './components/Skills/Skills';
import Projects      from './components/Projects/Projects';
import Contact       from './components/Contact/Contact';
import Footer        from './components/Footer/Footer';
import DynamicIsland from './components/DynamicIsland/DynamicIsland';
import Chatbot       from './components/Chatbot/Chatbot';
import { HiArrowUp } from 'react-icons/hi2';
import './App.css';

export default function App() {
  const [backTop, setBackTop] = useState(false);
  const [config, setConfig] = useState(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    fetch('/config.json').then(r => r.json()).then(setConfig).catch(() => setConfig({}));
  }, []);

  useEffect(() => {
    const fn = () => setBackTop(window.scrollY > 600);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      {/* Scroll progress bar — iOS activity ring, flattened */}
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />

      <DynamicIsland />
      <Navbar config={config} />

      <main>
        <Hero config={config} />
        <About config={config} />
        <Skills />
        <Projects config={config} />
        <Contact config={config} />
      </main>

      <Footer config={config} />
      <Chatbot config={config} />

      <AnimatePresence>
        {backTop && (
          <motion.button className="back-top-btn glass-strong"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top">
            <HiArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
