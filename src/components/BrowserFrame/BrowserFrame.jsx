import './BrowserFrame.css';

/* A lightweight CSS-only Safari/macOS browser window — used to preview
   live websites instead of native apps, since these are web projects. */
export default function BrowserFrame({ children, url = 'yoursite.dev' }) {
  return (
    <div className="browser-frame">
      <div className="browser-bar">
        <div className="browser-dots"><span className="d-red" /><span className="d-yellow" /><span className="d-green" /></div>
        <div className="browser-url">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 0a5 5 0 1 0 0 10A5 5 0 0 0 5 0Z" fill="#8b9dc3" opacity="0.5"/></svg>
          {url}
        </div>
        <div className="browser-bar-spacer" />
      </div>
      <div className="browser-viewport">{children}</div>
    </div>
  );
}
