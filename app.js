const menuToggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#primary-nav");
const copyStatus = document.querySelector("#copy-status");
const buildStamp = document.querySelector("#build-stamp");
const routeCopy = {
  coding: "Routed to Codex for implementation, with Kimi supervising priorities and reporting.",
  ops: "Routed to Llama heartbeat or cron checks first, with Kimi escalating only when needed.",
  outbound: "Routed to Kimi for safety review before any external send leaves the machine."
};

const closeMobileNav = () => {
  if (!nav || !menuToggle) {
    return;
  }

  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
}

const scrollToTarget = (selector) => {
  const target = document.querySelector(selector);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

document.addEventListener("click", async (event) => {
  const actionEl = event.target.closest("[data-action]");
  const anchorEl = event.target.closest('a[href^="#"]');

  if (anchorEl) {
    const href = anchorEl.getAttribute("href");

    if (href && href.startsWith("#")) {
      event.preventDefault();
      scrollToTarget(href);
      history.replaceState(null, "", href);
      closeMobileNav();
    }
  }

  if (!actionEl) {
    return;
  }

  const action = actionEl.dataset.action;
  const target = actionEl.dataset.target;

  if (action === "scroll" && target) {
    scrollToTarget(target);
    closeMobileNav();
    return;
  }

  if (action === "copy-pitch" && target) {
    const source = document.querySelector(target);

    if (!source) {
      return;
    }

    const text = source.value.trim();

    try {
      await navigator.clipboard.writeText(text);
      if (copyStatus) {
        copyStatus.textContent = "Pitch copied to clipboard.";
      }
    } catch {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
      if (copyStatus) {
        copyStatus.textContent = "Pitch copied using fallback copy.";
      }
    }
    return;
  }

  if (action === "set-route" && target) {
    const outputEl = document.querySelector(target);
    const route = actionEl.dataset.route;

    if (!outputEl || !route || !routeCopy[route]) {
      return;
    }

    outputEl.textContent = routeCopy[route];
    const siblingButtons = Array.from(actionEl.parentElement?.querySelectorAll("[data-action='set-route']") ?? []);
    siblingButtons.forEach((button) => button.classList.toggle("is-active", button === actionEl));
  }
});

const tabs = Array.from(document.querySelectorAll(".tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

const activateTab = (tabName) => {
  tabs.forEach((tab) => {
    const selected = tab.dataset.tab === tabName;
    tab.setAttribute("aria-selected", String(selected));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.tabPanel !== tabName);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

const accordionTriggers = Array.from(document.querySelectorAll(".accordion-trigger"));
accordionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const panelId = trigger.getAttribute("aria-controls");

    if (!panelId) {
      return;
    }

    const panel = document.getElementById(panelId);

    if (!panel) {
      return;
    }

    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
});

const toggleTriggers = Array.from(document.querySelectorAll(".toggle-trigger"));
toggleTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = trigger.dataset.target;

    if (!target) {
      return;
    }

    const panel = document.querySelector(target);

    if (!panel) {
      return;
    }

    const expanded = trigger.getAttribute("aria-expanded") === "true";
    const showLabel = trigger.dataset.showLabel || "Show details";
    const hideLabel = trigger.dataset.hideLabel || "Hide details";
    trigger.setAttribute("aria-expanded", String(!expanded));
    trigger.textContent = expanded ? showLabel : hideLabel;
    panel.hidden = expanded;
  });
});

const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const navTargets = navLinks
  .map((link) => {
    const href = link.getAttribute("href");
    if (!href) {
      return null;
    }

    const section = document.querySelector(href);
    return section ? { link, section } : null;
  })
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = navTargets.find((item) => item.section === entry.target);

        if (!target) {
          return;
        }

        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("is-active"));
          target.link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: 0.02 }
  );

  navTargets.forEach((item) => sectionObserver.observe(item.section));
}

const revealEls = Array.from(document.querySelectorAll(".reveal"));
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

if (buildStamp && buildStamp.textContent.includes("{{BUILD_TIME}}")) {
  buildStamp.textContent = "dev";
}
