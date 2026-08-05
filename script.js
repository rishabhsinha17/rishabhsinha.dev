const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeColor = document.querySelector('meta[name="theme-color"]');
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

  root.dataset.theme = theme;
  themeToggle?.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} theme`,
  );

  if (themeIcon) {
    themeIcon.textContent = isDark ? "☼" : "◐";
  }

  themeColor?.setAttribute("content", isDark ? "#171714" : "#f2f0e9");
}

applyTheme(readStoredTheme() || (systemPrefersDark.matches ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  storeTheme(nextTheme);
  applyTheme(nextTheme);
});

systemPrefersDark.addEventListener("change", (event) => {
  if (!readStoredTheme()) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

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
    if (scrollFrame) {
      return;
    }

    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      const firstSection = observedSections[0];
      const firstSectionTop = firstSection
        ? firstSection.getBoundingClientRect().top + window.scrollY
        : 0;

      if (
        stackedLayout.matches &&
        firstSection &&
        window.scrollY < firstSectionTop - window.innerHeight * 0.2
      ) {
        setActiveSection(null);
      }
    });
  },
  { passive: true },
);

document.getElementById("current-year").textContent = new Date()
  .getFullYear()
  .toString();
