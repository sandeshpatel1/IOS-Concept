import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { HiArrowUpRight } from 'react-icons/hi2';
import BrowserFrame from '../BrowserFrame/BrowserFrame';
import './Projects.css';

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function siteUrl(project) {
  if (project.demo) {
    try { return new URL(project.demo).hostname.replace('www.', ''); } catch { /* fall through */ }
  }
  return `${(project.title || project.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '')}.dev`;
}

function FeaturedCard({ project, index }) {
  return (
    <motion.div
      className="feat-card"
      style={{ '--card-color': project.color || '#0a84ff' }}
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="feat-card-glow" />
      <div className="feat-card-top">
        <span className="feat-badge">FEATURED</span>
        <a
          href={project.demo || project.github}
          target="_blank" rel="noreferrer"
          className="feat-get-btn"
        >
          {project.demo ? 'VISIT' : 'CODE'}
        </a>
      </div>

      <div className="feat-card-body">
        <div className="feat-icon">{initials(project.title)}</div>
        <h3 className="feat-title">{project.title}</h3>
        <p className="feat-desc">{project.desc}</p>
        <div className="feat-tags">
          {(project.tags || []).slice(0, 3).map(t => <span key={t} className="feat-tag">{t}</span>)}
        </div>
      </div>

      <div className="feat-browser-wrap">
        <BrowserFrame url={siteUrl(project)}>
          <div className="feat-site-preview" style={{ background: `linear-gradient(155deg, ${project.color || '#0a84ff'}22, #05070d 120%)` }}>
            <span className="feat-site-initial" style={{ color: project.color || '#0a84ff' }}>{initials(project.title)}</span>
            <motion.span className="feat-cursor"
              animate={{ x: [0, 60, 30, 0], y: [0, 20, 50, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </BrowserFrame>
      </div>
    </motion.div>
  );
}

function ListRow({ project, index }) {
  return (
    <motion.a
      href={project.github || project.demo}
      target="_blank" rel="noreferrer"
      className="proj-row glass"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ x: 4 }}
    >
      <div className="row-icon" style={{ background: project.color || '#0a84ff' }}>{initials(project.title || project.name)}</div>
      <div className="row-info">
        <div className="row-title">{project.title || project.name}</div>
        <div className="row-desc">{project.desc || project.description || 'No description.'}</div>
        {(project.stars !== undefined) && (
          <div className="row-stats">
            <span><FaStar /> {project.stars}</span>
            <span><FaCodeBranch /> {project.forks}</span>
          </div>
        )}
      </div>
      <span className="row-get">
        {project.demo ? 'VISIT' : 'CODE'}
      </span>
    </motion.a>
  );
}

export default function Projects({ config }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const githubUsername = config?.githubUsername || 'sandeshpatel1';
  const pinnedProjects = config?.pinnedProjects || [];
  const fetchGithub = config?.fetchGithubProjects !== false;

  const loadProjects = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      if (!fetchGithub) { setProjects(pinnedProjects); setLoading(false); return; }
      const res = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=20&type=public`,
        { headers: { Accept: 'application/vnd.github.v3+json' } });
      if (!res.ok) throw new Error('GitHub API error');
      const repos = await res.json();
      const sorted = repos.filter(r => !r.fork && r.name !== githubUsername)
        .sort((a, b) => (b.stargazers_count + b.watchers_count) - (a.stargazers_count + a.watchers_count))
        .slice(0, 10);
      const mapped = sorted.map(r => ({
        title: r.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        name: r.name,
        desc: r.description || 'No description.',
        tags: r.language ? [r.language] : [],
        github: r.html_url,
        demo: r.homepage || null,
        color: `hsl(${Math.abs(r.name.charCodeAt(0) * 47) % 360}, 70%, 55%)`,
        stars: r.stargazers_count,
        forks: r.forks_count,
      }));
      const pinnedTitles = pinnedProjects.map(p => p.title.toLowerCase());
      const githubOnly = mapped.filter(r => !pinnedTitles.includes(r.title.toLowerCase()));
      setProjects([...pinnedProjects, ...githubOnly].slice(0, 10));
    } catch {
      setError(true); setProjects(pinnedProjects);
    } finally { setLoading(false); }
  }, [githubUsername, fetchGithub, JSON.stringify(pinnedProjects)]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const featured = projects.slice(0, 2);
  const rest = projects.slice(2);

  return (
    <section id="projects" className="ios-projects">
      <div className="container">
        <div className="proj-header-row">
          <div>
            <span className="section-kicker">Showcase</span>
            <h2 className="section-heading">Websites I've <span className="liquid-text">Shipped</span></h2>
          </div>
          {fetchGithub && (
            <button className="ios-btn ios-btn-glass refresh-btn" onClick={loadProjects}>↻ Refresh</button>
          )}
        </div>

        {loading ? (
          <div className="proj-skel-row">
            {[1, 2].map(i => <div key={i} className="proj-skel glass glass-panel" />)}
          </div>
        ) : (
          <>
            <div className="featured-scroll">
              {featured.map((p, i) => <FeaturedCard key={p.title} project={p} index={i} />)}
            </div>

            {rest.length > 0 && (
              <div className="proj-list">
                <span className="section-kicker" style={{ marginTop: 50, display: 'block' }}>More Projects</span>
                <div className="proj-list-rows">
                  {rest.map((p, i) => <ListRow key={p.title} project={p} index={i} />)}
                </div>
              </div>
            )}

            {error && <p className="proj-error-note">⚠️ Could not reach GitHub — showing saved projects.</p>}

            {fetchGithub && (
              <p className="gh-note">
                Live from <a href={`https://github.com/${githubUsername}`} target="_blank" rel="noreferrer">
                  GitHub @{githubUsername} <HiArrowUpRight />
                </a>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
