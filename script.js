// =========================
// TIME + MOOD
// =========================

const moods = {
  dawn: { label: 'Early morning', skyTop: '#0d1520', skyBottom: '#1a2d4a', horizon: '#2d4a6b', accent: '#e8956d', glow: 'rgba(232,149,109,0.12)', starOpacity: '0.3', sunOpacity: '0.4', sunTop: '35%', description: 'Pre-dawn focus' },
  morning: { label: 'Morning', skyTop: '#1a3a5c', skyBottom: '#2d6494', horizon: '#e8a87c', accent: '#f0a500', glow: 'rgba(240,165,0,0.15)', starOpacity: '0', sunOpacity: '0.8', sunTop: '30%', description: 'Fully caffeinated' },
  midday: { label: 'Midday', skyTop: '#0e2240', skyBottom: '#1a3a6a', horizon: '#2a5080', accent: '#f5c842', glow: 'rgba(245,200,66,0.12)', starOpacity: '0', sunOpacity: '1', sunTop: '15%', description: 'Deep work hours' },
  afternoon: { label: 'Afternoon', skyTop: '#12243a', skyBottom: '#1e3850', horizon: '#c47a4a', accent: '#e8956d', glow: 'rgba(232,149,109,0.15)', starOpacity: '0.1', sunOpacity: '0.6', sunTop: '40%', description: 'Golden hour thinking' },
  evening: { label: 'Evening', skyTop: '#0a0e1a', skyBottom: '#1a2440', horizon: '#2a1f3d', accent: '#c084e8', glow: 'rgba(192,132,232,0.12)', starOpacity: '0.7', sunOpacity: '0', sunTop: '60%', description: 'Second wind' },
  night: { label: 'Night', skyTop: '#050810', skyBottom: '#0a0e1a', horizon: '#0d1525', accent: '#f0a500', glow: 'rgba(240,165,0,0.1)', starOpacity: '1', sunOpacity: '0', sunTop: '80%', description: 'Late night shipping' }
};

function getMood(hour) {
  if (hour >= 5 && hour < 8) return moods.dawn;
  if (hour >= 8 && hour < 11) return moods.morning;
  if (hour >= 11 && hour < 14) return moods.midday;
  if (hour >= 14 && hour < 18) return moods.afternoon;
  if (hour >= 18 && hour < 22) return moods.evening;
  return moods.night;
}

function applyMood(mood) {
  const root = document.documentElement;

  root.style.setProperty('--sky-top', mood.skyTop);
  root.style.setProperty('--sky-bottom', mood.skyBottom);
  root.style.setProperty('--horizon', mood.horizon);
  root.style.setProperty('--accent', mood.accent);
  root.style.setProperty('--glow', mood.glow);
  root.style.setProperty('--star-opacity', mood.starOpacity);
  root.style.setProperty('--sun-opacity', mood.sunOpacity);

  const sun = document.getElementById('sun');
  if (sun) sun.style.top = mood.sunTop;
}

function updateTime() {
  const now = new Date();
  const mood = getMood(now.getHours());

  applyMood(mood);

  const timeTag = document.getElementById('timeTag');
  const timeDisplay = document.getElementById('timeDisplay');
  const timeClock = document.getElementById('timeClock');
  const footerMood = document.getElementById('footerMood');

  if (timeTag) timeTag.textContent = mood.label;
  if (timeDisplay) timeDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
  if (timeClock) timeClock.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (footerMood) footerMood.textContent = mood.description;
}

// =========================
// STARS
// =========================

function generateStars() {
  const container = document.getElementById('stars');
  if (!container) return;

  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const size = Math.random() * 2 + 0.5;

    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 60}%;
      left: ${Math.random() * 100}%;
      --d: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 3}s;
    `;

    container.appendChild(star);
  }
}

// =========================
// REVEAL
// =========================

function initReveal() {
  const els = document.querySelectorAll('.reveal');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => obs.observe(el));
}

// =========================
// PROJECT MODAL (CLEANED)
// =========================

const projectDetails = {
  searchlens: {
    title: "SearchLens",
    overview: "A modular data pipeline for collecting, cleaning, and analyzing job listings.",
    working: "Working on analytics dashboard + more sources.",
    next: "Add application tracking functionality."
  },
  orbit: {
    title: "Orbit",
    overview: "A visual journaling system based on emotion graphs.",
    working: "Designing data model + interaction.",
    next: "Build interactive visualization."
  },
  vault: {
    title: "Password Vault",
    overview: "CLI password manager with encryption.",
    working: "Focused on secure storage and CLI UX.",
    next: "Add better encryption + usability."
  },
  habitflow: {
    title: "HabitFlow",
    overview: "CLI habit tracker with persistent storage.",
    working: "Working on an interactive dashboard for the user.",
    next: "Add safe user authentication."
  },
  quizmaker: {
    title: "QuizMaker",
    overview: "CLI app for creating, editing, and taking quizzes.",
    working: "Working on an interactive dashboard for the user.",
    next: "Allow for users to share quizzes with friends easily."
  },
  quizmaker: {
    title: "QuizMaker",
    overview: "CLI app for creating, editing, and taking quizzes.",
    working: "Working on an interactive dashboard for the user.",
    next: "Allow for users to share quizzes with friends easily."
  }
};

function initModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  const title = document.getElementById("projectModalTitle");
  const overview = document.getElementById("projectModalOverview");
  const working = document.getElementById("projectModalWorking");
  const next = document.getElementById("projectModalNext");

  document.querySelectorAll(".work-details-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = projectDetails[btn.dataset.project];
      if (!p) return;

      title.textContent = p.title;
      overview.textContent = p.overview;
      working.textContent = p.working;
      next.textContent = p.next;

      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  document.getElementById("projectModalBackdrop")?.addEventListener("click", close);
  document.getElementById("projectModalClose")?.addEventListener("click", close);

  function close() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// =========================
//  SKILLS FILTER
// =========================

function initSkillsFilter() {
  const buttons = document.querySelectorAll('.expertise-tab');
  const skills = document.querySelectorAll('.skill-pill');

  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      skills.forEach((skill) => {
        const matches = category === 'all' || skill.dataset.category === category;
        skill.classList.toggle('hidden', !matches);
      });
    });
  });
}

// =========================
// NAV HIGHLIGHT
// =========================

function initNavHighlight() {
  const sections = document.querySelectorAll("section");
  const links = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  });
}

// =========================
// INIT
// =========================

generateStars();
updateTime();
setInterval(updateTime, 60000);
initReveal();
initModal();
initSkillsFilter();
initNavHighlight();