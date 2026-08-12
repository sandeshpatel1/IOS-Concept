import './MacFrame.css';

export default function MacFrame({ children }) {
  return (
    <div className="mac-frame">
      <div className="mac-notch" />
      <div className="mac-screen">{children}</div>
      <div className="mac-base">
        <div className="mac-base-notch" />
      </div>
    </div>
  );
}
