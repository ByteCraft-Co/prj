const THEME_KEY = "theme";
const SIDEBAR_KEY = "sidebarCollapsed";

function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage errors (private mode / blocked storage).
  }
}

function getPreferredTheme() {
  const savedTheme = getStorageItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function updateThemeSwitchUI(theme) {
  const isDark = theme === "dark";
  const switchEl = document.getElementById("themeSwitch");
  if (!switchEl) return;

  switchEl.classList.toggle("is-on", isDark);
  switchEl.setAttribute("aria-checked", String(isDark));
}

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
}

function updateSidebarToggleUI(collapsed) {
  const toggle = document.getElementById("sidebarToggle");
  if (!toggle) return;

  const icon = toggle.querySelector(".material-symbols-outlined");
  if (icon) icon.textContent = collapsed ? "chevron_right" : "chevron_left";
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.setAttribute("aria-label", collapsed ? "Show sidebar" : "Hide sidebar");
}

// Apply early to reduce visual flicker between themes.
applyTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
  // Auto-year for About page (and anywhere #year exists)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Active link highlighting in sidebar
  const path = window.location.pathname.replace(/\\/g, "/");
  const current = path.split("/").pop(); // e.g. "earth.html" or "index.html"

  document.querySelectorAll(".side-nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    // Match exact current file name
    const target = href.split("/").pop();
    if (target === current) a.classList.add("active");
  });

  // Inject a shared iOS-style theme switch into the sidebar.
  const sidebar = document.querySelector(".sidebar");
  if (sidebar && !document.getElementById("themeSwitch")) {
    const wrap = document.createElement("div");
    wrap.className = "theme-toggle-wrap";
    wrap.innerHTML = `
      <span class="theme-label">Dark mode</span>
      <button id="themeSwitch" class="theme-switch" type="button" role="switch" aria-label="Toggle dark mode" aria-checked="false">
        <span class="theme-switch-thumb" aria-hidden="true"></span>
      </button>
    `;
    sidebar.appendChild(wrap);
  }

  if (!document.getElementById("sidebarToggle")) {
    const sidebarToggle = document.createElement("button");
    sidebarToggle.id = "sidebarToggle";
    sidebarToggle.className = "sidebar-toggle";
    sidebarToggle.type = "button";
    sidebarToggle.innerHTML = `
      <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      <span class="sr-only">Toggle sidebar</span>
    `;
    document.body.appendChild(sidebarToggle);
  }

  const canCollapseSidebar = window.matchMedia("(min-width: 901px)").matches;
  const savedCollapsed = getStorageItem(SIDEBAR_KEY) === "1";
  const initialCollapsed = canCollapseSidebar ? savedCollapsed : false;
  setSidebarCollapsed(initialCollapsed);
  updateSidebarToggleUI(initialCollapsed);

  const switchEl = document.getElementById("themeSwitch");
  const currentTheme = getPreferredTheme();
  updateThemeSwitchUI(currentTheme);

  if (switchEl) {
    switchEl.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      setStorageItem(THEME_KEY, nextTheme);
      updateThemeSwitchUI(nextTheme);
    });
  }

  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const collapsed = !document.body.classList.contains("sidebar-collapsed");
      setSidebarCollapsed(collapsed);
      setStorageItem(SIDEBAR_KEY, collapsed ? "1" : "0");
      updateSidebarToggleUI(collapsed);
    });
  }

  const desktopMedia = window.matchMedia("(min-width: 901px)");
  const onDesktopChange = (event) => {
    if (!event.matches) {
      setSidebarCollapsed(false);
      updateSidebarToggleUI(false);
      return;
    }

    const collapsed = getStorageItem(SIDEBAR_KEY) === "1";
    setSidebarCollapsed(collapsed);
    updateSidebarToggleUI(collapsed);
  };

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", onDesktopChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(onDesktopChange);
  }
});
