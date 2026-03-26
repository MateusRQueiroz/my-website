// time and mood 

const moods = {
  dawn: {
    label: 'Early morning',
    skyTop: '#0d1520',
    skyBottom: '#1a2d4a',
    horizon: '#2d4a6b',
    accent: '#e8956d',
    glow: 'rgba(232,149,109,0.12)',
    starOpacity: '0.3',
    sunOpacity: '0.4',
    sunTop: '35%',
    description: 'Pre-dawn focus'
  },
  morning: {
    label: 'Morning',
    skyTop: '#1a3a5c',
    skyBottom: '#2d6494',
    horizon: '#e8a87c',
    accent: '#f0a500',
    glow: 'rgba(240,165,0,0.15)',
    starOpacity: '0',
    sunOpacity: '0.8',
    sunTop: '30%',
    description: 'Fully caffeinated'
  },
  midday: {
    label: 'Midday',
    skyTop: '#0e2240',
    skyBottom: '#1a3a6a',
    horizon: '#2a5080',
    accent: '#f5c842',
    glow: 'rgba(245,200,66,0.12)',
    starOpacity: '0',
    sunOpacity: '1',
    sunTop: '15%',
    description: 'Deep work hours'
  },
  afternoon: {
    label: 'Afternoon',
    skyTop: '#12243a',
    skyBottom: '#1e3850',
    horizon: '#c47a4a',
    accent: '#e8956d',
    glow: 'rgba(232,149,109,0.15)',
    starOpacity: '0.1',
    sunOpacity: '0.6',
    sunTop: '40%',
    description: 'Golden hour thinking'
  },
  evening: {
    label: 'Evening',
    skyTop: '#0a0e1a',
    skyBottom: '#1a2440',
    horizon: '#2a1f3d',
    accent: '#c084e8',
    glow: 'rgba(192,132,232,0.12)',
    starOpacity: '0.7',
    sunOpacity: '0',
    sunTop: '60%',
    description: 'Second wind'
  },
  night: {
    label: 'Night',
    skyTop: '#050810',
    skyBottom: '#0a0e1a',
    horizon: '#0d1525',
    accent: '#f0a500',
    glow: 'rgba(240,165,0,0.1)',
    starOpacity: '1',
    sunOpacity: '0',
    sunTop: '80%',
    description: 'Late night shipping'
  }
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
  root.style.setProperty('--sun-top', mood.sunTop || '25%');

  const sun = document.getElementById('sun');
  if (sun) {
    sun.style.top = mood.sunTop || '25%';
  }
}

function updateTime() {
  const now = new Date();
  const hour = now.getHours();
  const mood = getMood(hour);

  applyMood(mood);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const dayStr = now.toLocaleDateString('en-US', {
    weekday: 'long'
  });

  const timeTag = document.getElementById('timeTag');
  const timeDisplay = document.getElementById('timeDisplay');
  const timeClock = document.getElementById('timeClock');
  const footerMood = document.getElementById('footerMood');

  if (timeTag) timeTag.textContent = mood.label;
  if (timeDisplay) timeDisplay.textContent = dayStr;
  if (timeClock) timeClock.textContent = timeStr;
  if (footerMood) footerMood.textContent = mood.description;
}

// stars

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

// scroll

function initReveal() {
  const els = document.querySelectorAll('.reveal');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el) => obs.observe(el));
}

const projectDetails = {
  searchlens: {
    title: "SearchLens",
    overview:
      "A modular data pipeline for collecting, cleaning, and analyzing job listings from multiple sources.",
    working:
      "At the time, I was focused on building the scraping pipeline, structuring source adapters cleanly, and making normalization and deduplication reliable.",
    next:
      "Next, I want to improve the analytics layer, add a frontend dashboard, and make it easier to plug in more sources."
  },

  orbit: {
    title: "Orbit",
    overview:
      "An experimental journaling app that visualizes personal entries as an interactive graph of emotions and experiences.",
    working:
      "At the time, I was thinking through the product direction, the data model for entries, and how the visual graph should balance exploration with readability.",
    next:
      "Next, I plan to build the first interactive version of the visualization and connect it to a real entry system."
  },

  vault: {
    title: "Password Vault",
    overview:
      "A CLI password manager that encrypts credentials using a master password and stores them securely.",
    working:
      "At the time, I was focused on learning how to build small, effective, CRUD systems while working on encryption, persistent storage, and clean command-line flows.",
    next:
      "Next, I’d improve usability, practicity, and potentially evolve it into a more polished desktop tool."
  },

  habitflow: {
    title: "HabitFlow",
    overview:
      "A command-line task and habit tracker built to help users manage work, track progress, and build streaks.",
    working:
      "At the time, I was practicing program structure, state handling, and persistent JSON-based storage in a way that kept the tool simple and usable.",
    next:
      "Next, I’d develop a dashboard to facilitate user navigation and habit report."
  },

  quizmaker: {
    title: "QuizMaker",
    overview:
      "A CLI application that lets users create, edit, and take quizzes with persistent JSON storage.",
    working:
      "At the time, I was focused on CRUD-style interactions, file persistence, and making the quiz flow feel good from creation to completion.",
    next:
      "Next, I’d like to add scoring improvements, better editing flows, and a cleaner content structure."
  },

  rqbestprices: {
    title: "RQBestprices Website",
    overview:
      "A business website created for the Amazon reseller company RQBestprices.",
    working:
      "At the time, I was focused on turning business needs into a clean website structure, improving presentation, and making the site feel straightforward and credible.",
    next:
      "Next, I’d refine the design and improve responsiveness"
  }
};

const modal = document.getElementById("projectModal");
const modalBackdrop = document.getElementById("projectModalBackdrop");
const modalClose = document.getElementById("projectModalClose");

const modalTitle = document.getElementById("projectModalTitle");
const modalOverview = document.getElementById("projectModalOverview");
const modalWorking = document.getElementById("projectModalWorking");
const modalNext = document.getElementById("projectModalNext");

function openProjectModal(projectKey) {
  const project = projectDetails[projectKey];
  if (!project) return;

  modalTitle.textContent = project.title;
  modalOverview.textContent = project.overview;
  modalWorking.textContent = project.working;
  modalNext.textContent = project.next;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".work-details-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const projectKey = button.dataset.project;
    openProjectModal(projectKey);
  });
});

modalBackdrop.addEventListener("click", closeProjectModal);
modalClose.addEventListener("click", closeProjectModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeProjectModal();
  }
});

generateStars();
updateTime();
setInterval(updateTime, 60000);
initReveal();