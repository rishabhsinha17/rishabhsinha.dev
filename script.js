const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeColor = document.querySelector('meta[name="theme-color"]');
const storedTheme = localStorage.getItem("portfolio-theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

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

applyTheme(storedTheme || (systemPrefersDark.matches ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("portfolio-theme", nextTheme);
  applyTheme(nextTheme);
});

systemPrefersDark.addEventListener("change", (event) => {
  if (!localStorage.getItem("portfolio-theme")) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

const sectionLinks = [...document.querySelectorAll(".section-nav a")];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function setActiveSection(sectionId) {
  sectionLinks.forEach((link) => {
    const isActive = link.hash === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveSection(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -62% 0px",
      threshold: [0, 0.15, 0.4],
    },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.getElementById("current-year").textContent = new Date()
  .getFullYear()
  .toString();
