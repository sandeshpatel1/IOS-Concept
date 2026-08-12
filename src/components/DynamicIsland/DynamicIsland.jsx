import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DynamicIsland.css';

function getIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
function getDate() {
  return new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric',
  });
}

export default function DynamicIsland() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(getIST);
  const [date] = useState(getDate);

  useEffect(() => {
    const id = setInterval(() => setTime(getIST()), 1000);
    return () => clearInterval(id);
  }, []);

  const [t, ap] = [time.slice(0, -3), time.slice(-2)];

  return (
    <div className="dyn-island-anchor">
      <motion.button
        className="dyn-island"
        onClick={() => setOpen(v => !v)}
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        title="IST clock"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!open ? (
            <motion.div
              key="collapsed"
              className="di-collapsed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className="di-dot" />
              <span className="di-time-mini">{t}</span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              className="di-expanded"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <div className="di-ring">
                <span className="di-ring-dot" />
              </div>
              <div className="di-info">
                <span className="di-time">{t}<em>{ap}</em></span>
                <span className="di-date">{date} · IST</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
