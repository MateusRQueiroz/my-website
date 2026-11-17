import type { CaseStudy } from '../data/projects';

function Tag() { return <p className="schematic-tag">Schematic · not a screenshot</p>; }

export function PipelineSchematic() {
  return <figure className="schematic schematic-pipeline" aria-labelledby="pipeline-caption">
    <Tag/>
    <ol className="flow">
      <li className="flow-step flow-sources"><span className="flow-kicker">1 · Sources</span>
        <ul><li>Greenhouse board API</li><li>HTML career pages</li><li>python.org jobs</li></ul></li>
      <li className="flow-step"><span className="flow-kicker">2 · Adapters</span><strong>One adapter per source type</strong><small>listed in sources.yaml</small></li>
      <li className="flow-step"><span className="flow-kicker">3 · Normalize</span><strong>One listing schema</strong><small>dedupe in run: URL, else composite key</small></li>
      <li className="flow-step is-key"><span className="flow-kicker">4 · Hash</span><strong>SHA-256 of title, company, location, work mode</strong></li>
      <li className="flow-step"><span className="flow-kicker">5 · Store</span><strong>SQLite via SQLAlchemy</strong><small>unique hash · existing rows skipped</small></li>
      <li className="flow-step flow-outputs"><span className="flow-kicker">6 · Outputs</span>
        <ul><li>clean CSV export</li><li>pandas metrics</li><li>data-quality report</li></ul></li>
    </ol>
    <div className="flow-notes">
      <p className="flow-rerun"><span aria-hidden="true">↻</span> Rerun the CLI: listings with a stored hash are skipped, new ones are added.</p>
      <p className="flow-future"><span aria-hidden="true">┄</span> Dashboard: a possible later step, not built.</p>
    </div>
    <figcaption id="pipeline-caption">How SearchLens moves a listing from a job board to a report.</figcaption>
  </figure>;
}

export function MarketplaceSchematic() {
  return <figure className="schematic schematic-market" aria-labelledby="market-caption">
    <Tag/>
    <ol className="journey" aria-label="What a student does">
      <li>Sign in</li><li>Post a listing</li><li>Add photos</li><li>Browse and search</li><li>Message the seller</li>
    </ol>
    <div className="lanes">
      <div className="lane"><h4 className="lane-title">Frontend</h4><ul><li className="team">Listing, profile, and chat screens</li></ul></div>
      <div className="lane lane-api"><h4 className="lane-title">Bun API routes</h4><ul>
        <li className="mine">User profiles</li><li className="mine">Listings CRUD</li><li className="mine">Listing photos</li>
        <li className="team">Accounts and auth</li><li className="team">Chats (WebSocket)</li><li className="team">Ranked search</li>
      </ul></div>
      <div className="lane"><h4 className="lane-title">Supabase</h4><ul><li className="team">Auth sessions</li><li className="team">PostgreSQL</li><li className="team">Photo storage</li></ul></div>
    </div>
    <p className="legend"><span className="key mine">My routes and tests</span><span className="key team">Teammates’ work</span></p>
    <figcaption id="market-caption">Request flow for UMarket, with my contributions marked.</figcaption>
  </figure>;
}

const papers = [
  { id: 'a', x: 160, y: 170, label: 'Seed paper', main: true, above: true },
  { id: 'b', x: 400, y: 70, label: 'Paper B', above: true },
  { id: 'c', x: 475, y: 215, label: 'Paper C' },
  { id: 'd', x: 360, y: 315, label: 'Paper D' },
  { id: 'e', x: 60, y: 315, label: 'Paper E' },
];
const links = [
  { from: 'a', to: 'b', intent: 'background', label: 'Background', dx: -10, dy: -10 },
  { from: 'a', to: 'c', intent: 'method', label: 'Method', selected: true, dx: 0, dy: -10 },
  { from: 'd', to: 'a', intent: 'result', label: 'Result', dx: 30, dy: 2 },
  { from: 'e', to: 'a', intent: 'none', label: 'No passage', dx: -48, dy: 0 },
];
const at = (id: string) => papers.find(p => p.id === id)!;

export function CitationSchematic() {
  return <figure className="schematic schematic-graph" aria-labelledby="graph-caption">
    <Tag/>
    <div className="graph-layout">
      <svg viewBox="0 0 540 375" role="img" aria-label="A seed paper linked to four papers. Links are labeled Background, Method, Result, or left unclassified when no citing passage is found." focusable="false">
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="arrowhead"/></marker></defs>
        <g className="graph-chart" fill="none" aria-hidden="true">
          <ellipse cx="270" cy="185" rx="232" ry="154"/>
          <ellipse cx="270" cy="185" rx="218" ry="145" strokeDasharray="1 9"/>
          <path d="M270 18 V350 M24 185 H516" strokeDasharray="2 8"/>
        </g>
        {links.map(link => {
          const a = at(link.from), b = at(link.to);
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), r = 30;
          const x1 = a.x + dx / len * r, y1 = a.y + dy / len * r, x2 = b.x - dx / len * (r + 4), y2 = b.y - dy / len * (r + 4);
          return <g key={link.from + link.to} className={`edge intent-${link.intent}${link.selected ? ' is-selected' : ''}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#arrow)"/>
            <text x={(x1 + x2) / 2 + link.dx} y={(y1 + y2) / 2 + link.dy} textAnchor="middle">{link.label}</text>
          </g>;
        })}
        {papers.map(p => <g key={p.id} className={`paper${p.main ? ' is-main' : ''}`}>
          <circle className="paper-orbit" cx={p.x} cy={p.y} r="34"/><circle cx={p.x} cy={p.y} r="28"/>
          <path className="paper-star" d={`M${p.x} ${p.y - 8} Q${p.x + 1} ${p.y - 1} ${p.x + 8} ${p.y} Q${p.x + 1} ${p.y + 1} ${p.x} ${p.y + 8} Q${p.x - 1} ${p.y + 1} ${p.x - 8} ${p.y} Q${p.x - 1} ${p.y - 1} ${p.x} ${p.y - 8}Z`}/>
          <text x={p.x} y={p.above ? p.y - 42 : p.y + 50} textAnchor="middle">{p.label}</text>
        </g>)}
      </svg>
      <div className="graph-panel">
        <p className="panel-kicker">Selected link · Seed paper → Paper C</p>
        <blockquote>“We adopt the architecture introduced by Vaswani et al. for our experiments.”</blockquote>
        <p className="panel-result"><strong>Method</strong> · 0.90 confidence</p>
        <p className="panel-note">Example passage and model output from the project documentation.</p>
      </div>
    </div>
    <dl className="intent-key">
      <div><dt className="intent-background">Background</dt><dd>cited for context</dd></div>
      <div><dt className="intent-method">Method</dt><dd>uses its method, tool, or data</dd></div>
      <div><dt className="intent-result">Result</dt><dd>compares with or discusses its findings</dd></div>
      <div><dt className="intent-none">Unclassified</dt><dd>no usable citing passage found</dd></div>
    </dl>
    <figcaption id="graph-caption">Arrows point from the citing paper to the cited paper.</figcaption>
  </figure>;
}

export function ProjectVisual({ kind }: { kind: CaseStudy['visual'] }) {
  if (kind === 'pipeline') return <PipelineSchematic/>;
  if (kind === 'marketplace') return <MarketplaceSchematic/>;
  return <CitationSchematic/>;
}
