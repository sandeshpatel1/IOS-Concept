import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VscError, VscCheck, VscCircleFilled } from 'react-icons/vsc';
import './CodeIDE.css';

/* Step machine: idle(write) -> error -> fixing -> building -> success -> preview -> loop */
const STEPS = ['idle', 'error', 'fixing', 'building', 'success', 'preview'];
const DURATIONS = { idle: 2200, error: 2400, fixing: 1600, building: 2200, success: 1600, preview: 3200 };

const CODE = [
  { n: 1,  jsx: <><span className="kw">function</span> <span className="fn">getCartTotal</span>(<span className="pr">items</span>) {'{'}</> },
  { n: 2,  jsx: <>{'  '}<span className="kw">return</span> items.<span className="fn">reduce</span>((sum, item) {'=>'}</> },
  { n: 3,  jsx: <>{'    '}sum + item.price * item.qty,</> },
  { n: 4,  buggy: true },
  { n: 5,  jsx: <>{'}'}</> },
  { n: 6,  jsx: <></> },
  { n: 7,  jsx: <><span className="kw">export default function</span> <span className="fn">Checkout</span>() {'{'}</> },
  { n: 8,  jsx: <>{'  '}<span className="kw">const</span> total = <span className="fn">getCartTotal</span>(cart);</> },
  { n: 9,  jsx: <>{'  '}<span className="kw">return</span> <span className="tag">&lt;Price</span> <span className="pr">amount</span>={'{total}'} <span className="tag">/&gt;</span>;</> },
  { n: 10, jsx: <>{'}'}</> },
];

export default function CodeIDE() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  useEffect(() => {
    const t = setTimeout(() => setStepIdx(i => (i + 1) % STEPS.length), DURATIONS[step]);
    return () => clearTimeout(t);
  }, [step]);

  const showError = step === 'error';
  const showFix = step === 'fixing' || step === 'building' || step === 'success' || step === 'preview';

  const statusMap = {
    idle: { text: 'Editing…', color: 'var(--text-muted)' },
    error: { text: 'Debugging', color: 'var(--pink)' },
    fixing: { text: 'Applying fix', color: 'var(--orange)' },
    building: { text: 'Building', color: 'var(--cyan)' },
    success: { text: 'Build passing', color: 'var(--green)' },
    preview: { text: 'Live preview', color: 'var(--blue)' },
  };

  return (
    <div className="ide">
      <div className="ide-titlebar">
        <div className="ide-dots"><span className="d-red" /><span className="d-yellow" /><span className="d-green" /></div>
        <div className="ide-tabs">
          <span className="ide-tab active">Checkout.jsx</span>
          <span className="ide-tab">cart.js</span>
        </div>
        <div className="ide-status" style={{ color: statusMap[step].color }}>
          <VscCircleFilled className="status-dot" />
          {statusMap[step].text}
        </div>
      </div>

      <div className="ide-body">
        <div className="ide-gutter">
          {CODE.map(l => (
            <div key={l.n} className={`gutter-line${l.buggy && showError ? ' err-line' : ''}`}>
              {l.buggy && showError ? <VscError className="gutter-err-icon" /> : l.n}
            </div>
          ))}
        </div>
        <div className="ide-code">
          {CODE.map(l => {
            if (!l.buggy) return <div key={l.n} className="code-line">{l.jsx}</div>;
            return (
              <div key={l.n} className={`code-line${showError ? ' code-line-error' : ''}${showFix ? ' code-line-fixed' : ''}`}>
                {'    '}
                {showFix ? (
                  <><span className="num">0</span>);</>
                ) : (
                  <><span className="err-token">cartTotal</span>);</>
                )}
              </div>
            );
          })}

          <AnimatePresence>
            {showError && (
              <motion.div className="err-tooltip"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <VscError /> ReferenceError: <b>cartTotal</b> is not defined
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="ide-terminal">
        <AnimatePresence mode="wait">
          {step === 'error' && (
            <motion.div key="t-err" className="term-line term-err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              ✗ Uncaught ReferenceError: cartTotal is not defined
            </motion.div>
          )}
          {step === 'fixing' && (
            <motion.div key="t-fix" className="term-line term-warn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              → applying fix: initial accumulator <span className="num">0</span>
            </motion.div>
          )}
          {step === 'building' && (
            <motion.div key="t-build" className="term-lines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="term-line">$ npm run build</div>
              <div className="term-line term-dim">→ compiling 214 modules…</div>
            </motion.div>
          )}
          {step === 'success' && (
            <motion.div key="t-ok" className="term-line term-ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <VscCheck /> Build succeeded in 1.8s
            </motion.div>
          )}
          {(step === 'idle' || step === 'preview') && (
            <motion.div key="t-idle" className="term-line term-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {step === 'preview' ? '→ serving on http://localhost:5173' : '> watching for changes…'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {step === 'preview' && (
          <motion.div className="ide-preview-overlay"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}>
            <div className="preview-browser-bar">
              <span className="d-red" /><span className="d-yellow" /><span className="d-green" />
              <span className="preview-url">sandeshpatel.dev</span>
            </div>
            <div className="preview-site" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
