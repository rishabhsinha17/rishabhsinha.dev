const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColorTags = document.querySelectorAll('meta[name="theme-color"]');
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function readStoredTheme() {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {
    // Theme selection still works for the current page when storage is unavailable.
  }
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  // Setting this first means the custom properties below resolve to the new
  // theme, so the browser chrome colour can never drift from the stylesheet.
  root.dataset.theme = theme;

  themeToggle?.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} theme`,
  );
  themeToggle?.setAttribute("aria-pressed", String(isDark));

  const paper = getComputedStyle(root).getPropertyValue("--paper").trim();

  // Both media-scoped tags are set to the resolved colour: whichever one the
  // OS matches then agrees with the theme the visitor actually chose.
  if (paper) {
    themeColorTags.forEach((tag) => tag.setAttribute("content", paper));
  }
}

applyTheme(readStoredTheme() || (systemPrefersDark.matches ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  storeTheme(nextTheme);
  applyTheme(nextTheme);
});

function onSystemThemeChange(event) {
  if (!readStoredTheme()) {
    applyTheme(event.matches ? "dark" : "light");
  }
}

// Safari 13 and iOS 13 only implement the deprecated MediaQueryList listener
// API; without this branch the TypeError would abort the rest of the script.
if (typeof systemPrefersDark.addEventListener === "function") {
  systemPrefersDark.addEventListener("change", onSystemThemeChange);
} else if (typeof systemPrefersDark.addListener === "function") {
  systemPrefersDark.addListener(onSystemThemeChange);
}

const sectionLinks = [...document.querySelectorAll(".section-nav a")];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function setActiveSection(sectionId) {
  sectionLinks.forEach((link) => {
    const isActive = sectionId && link.hash === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const visibleSections = new Map(
    observedSections.map((section) => [section, { isIntersecting: false, ratio: 0 }]),
  );

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibleSections.set(entry.target, {
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
        });
      });

      const activeSection = [...visibleSections.entries()]
        .filter(([, state]) => state.isIntersecting)
        .sort(([, a], [, b]) => b.ratio - a.ratio)[0]?.[0];

      setActiveSection(activeSection?.id ?? null);
    },
    {
      rootMargin: "-20% 0px -62% 0px",
      threshold: [0, 0.15, 0.4],
    },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const stackedLayout = window.matchMedia("(max-width: 1240px)");
let scrollFrame;

window.addEventListener(
  "scroll",
  () => {
    // Above 1240px the intro rail is sticky and the observer owns the active
    // state outright, so skip the layout read entirely rather than measuring
    // on every frame and throwing the result away.
    if (scrollFrame || !stackedLayout.matches) {
      return;
    }

    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      const firstSection = observedSections[0];

      if (!firstSection) {
        return;
      }

      const firstSectionTop =
        firstSection.getBoundingClientRect().top + window.scrollY;

      if (window.scrollY < firstSectionTop - window.innerHeight * 0.2) {
        setActiveSection(null);
      }
    });
  },
  { passive: true },
);

const yearSlot = document.getElementById("current-year");

if (yearSlot) {
  yearSlot.textContent = new Date().getFullYear().toString();
}
