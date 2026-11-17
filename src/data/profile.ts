export const profile = {
  name: 'Mateus Queiroz',
  email: 'romaomatq@gmail.com',
  github: 'https://github.com/MateusRQueiroz',
  linkedin: 'https://www.linkedin.com/in/mateus-r-queiroz/',
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
  /** Saved under this name when downloaded. */
  resumeFile: 'Mateus-Queiroz-Resume.pdf',
};

export const intro = 'I’m Mateus, a computer science student at UMass Amherst. I build data pipelines, web apps, and tools for exploring complex information.';

export const skillGroups = [
  { title: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'C'], usedIn: 'Python in SearchLens and UTrace · TypeScript in UMarket and this site' },
  { title: 'Data and ML', items: ['pandas', 'SQLAlchemy', 'SQLite', 'PostgreSQL', 'scikit-learn'], usedIn: 'SearchLens storage and reports · UTrace classifier' },
  { title: 'Web and APIs', items: ['React', 'FastAPI', 'Bun', 'Supabase', 'Flask', 'Next.js', 'HTML and CSS'], usedIn: 'UMarket API routes · UTrace inference API · RQ Best Prices site' },
  { title: 'Practice', items: ['Git and pull requests', 'pytest', 'API route tests', 'Vitest'], usedIn: 'Team workflows on UMarket and UTrace' },
];

export const coursework = [
  { school: 'UMass Amherst', title: 'Computer science', courses: ['Object-Oriented Programming', 'Data Structures', 'Programming Methodology', 'Intro to Computation', 'Software Engineering', 'Intro to Algorithms', 'Computer Systems Principles'] },
  { school: 'UMass Amherst', title: 'Math and reasoning', courses: ['Calculus II', 'Calculus III', 'Reasoning Under Uncertainty (probability)'] },
  { school: 'Suffolk University', title: 'Earlier coursework', courses: ['Foundations of Computer Science in Python', 'Calculus', 'Computational Science with NetLogo'] },
];
