export interface CaseStudy {
  id: 'searchlens' | 'umarket' | 'utrace';
  title: string;
  context: string;
  tagline: string;
  what: string;
  role: string;
  built: string[];
  team?: string[];
  stack: string[];
  decision: { title: string; body: string };
  how: string;
  status: string;
  links: { label: string; href: string }[];
  visual: 'pipeline' | 'marketplace' | 'citation-graph';
  /** The mythic image behind the project's emblem, said plainly. */
  emblem: string;
}

export const featuredProjects: CaseStudy[] = [
  {
    id: 'searchlens',
    title: 'SearchLens',
    context: 'Independent project · 2026',
    tagline: 'A job-listing pipeline that is safe to rerun.',
    what: 'A Python CLI that collects job listings from several boards, normalizes them into one schema, and stores them in SQLite for analysis.',
    role: 'Solo: I designed and wrote the whole pipeline.',
    built: [
      'Source adapters for the Greenhouse API and HTML career pages, configured in YAML',
      'Normalization into one listing schema, stored with SQLAlchemy in SQLite',
      'A CLI that exports a clean CSV and pandas reports on work mode, salary, and data quality',
    ],
    stack: ['Python', 'SQLAlchemy', 'SQLite', 'pandas', 'Beautiful Soup', 'YAML'],
    decision: {
      title: 'Hash-based deduplication',
      body: 'Each listing gets a SHA-256 hash of its title, company, location, and work mode, stored in a unique column. Inserts skip any hash that already exists, so reruns only add new listings. Within one run, listings are also deduplicated by URL, with a composite key when a source has no URL.',
    },
    how: 'Adapters fetch and parse each source → listings are normalized and deduplicated → new rows go into SQLite → a clean CSV is exported → pandas writes metrics and a quality report.',
    status: 'Works today as a command-line pipeline. A dashboard would be a separate, future piece; it is not built.',
    links: [{ label: 'Repository', href: 'https://github.com/MateusRQueiroz/SearchLens' }],
    visual: 'pipeline',
    emblem: 'Argus, the many-eyed watcher: one pipeline keeping watch over many boards',
  },
  {
    id: 'umarket',
    title: 'UMarket',
    context: 'Team project · Spring 2026',
    tagline: 'A marketplace for students on campus.',
    what: 'Students post items with photos, browse and search listings, and message sellers.',
    role: 'Backend developer on the API team, working with frontend teammates on integration.',
    built: [
      'TypeScript API routes for user profiles and listings',
      'Routes that attach photos to a listing and remove them',
      'Listing-route updates for the frontend integration, with route tests for auth, validation, and not-found cases',
    ],
    team: ['Sign-up and login with Supabase Auth', 'WebSocket chat', 'Ranked PostgreSQL search', 'Row-level security policies'],
    stack: ['TypeScript', 'Bun', 'PostgreSQL', 'Supabase'],
    decision: {
      title: 'Reject bad requests before the database',
      body: 'Listing routes check IDs and required fields first and return a JSON error with a clear status: 400 for invalid input, 401 when the user is not signed in, 404 for a missing listing. My tests pin those responses down, so frontend teammates could rely on them while integrating.',
    },
    how: 'The frontend calls Bun API routes → routes check the Supabase session → listings and profiles live in PostgreSQL, photo files in Supabase Storage → chat runs over WebSockets.',
    status: 'Course team project, Spring 2026. The backend code is public.',
    links: [{ label: 'Repository', href: 'https://github.com/Jamie11111/CS320_Project' }],
    visual: 'marketplace',
    emblem: 'The agora, the city’s marketplace',
  },
  {
    id: 'utrace',
    title: 'UTrace',
    context: 'Team research project · Fall 2026',
    tagline: 'Citation graphs that say why papers cite each other.',
    what: 'Explore research papers as an interactive citation graph built on OpenAlex. Select a link to see whether a citation is background, a method, or a result.',
    role: 'I owned the machine-learning side in a three-person team.',
    built: [
      'Trained and evaluated a citation-intent classifier on the SciCite dataset',
      'Integrated inference into the FastAPI backend, with version and checksum checks',
      'Helped improve how the app finds the citation passage the classifier reads',
    ],
    stack: ['Python', 'scikit-learn', 'FastAPI', 'OpenAlex', 'Next.js', 'React Flow'],
    decision: {
      title: 'Classify only real passages',
      body: 'The model only sees an actual sentence from the citing paper; if no usable passage is found, the link stays unclassified rather than guessed. I kept a TF-IDF and logistic regression model chosen on validation macro F1 because it is small and fast to serve. On the 1,859-sentence SciCite test set it reached 0.835 accuracy and 0.815 macro F1, against 0.536 accuracy for always predicting Background.',
    },
    how: 'Select a link → the API looks for the citing sentence in available full text → if found, the classifier returns an intent and confidence → the panel shows the label beside the original passage.',
    status: 'In active development and runs locally. Not publicly deployed.',
    links: [{ label: 'Repository', href: 'https://github.com/RichardCarlson3/Trace' }],
    visual: 'citation-graph',
    emblem: 'Ariadne’s thread, followed through a labyrinth of citations',
  },
];

export interface Experiment {
  id: string;
  title: string;
  context: string;
  description: string;
  stack: string[];
  link: { label: string; href: string };
  demo?: boolean;
}

export const experiments: Experiment[] = [
  {
    id: 'quizmaker',
    title: 'QuizMaker',
    context: 'Java CLI · 2025',
    description: 'Create, edit, and take quizzes from the command line, saved as JSON. The sample here is a small React adaptation; it does not run the Java code or save answers.',
    stack: ['Java', 'JSON'],
    link: { label: 'Repository', href: 'https://github.com/MateusRQueiroz/QuizMaker' },
    demo: true,
  },
  {
    id: 'devtracker',
    title: 'DevTracker',
    context: 'Team project · February 2026',
    description: 'A Django app that estimates project effort: Gemini scores complexity, and a deterministic estimator turns the scores into per-role hours. My commits covered the backend, the Gemini integration, the estimator, and the first frontend.',
    stack: ['Python', 'Django', 'Gemini API'],
    link: { label: 'Repository', href: 'https://github.com/MateusRQueiroz/DevTracker' },
  },
];
