(function() {
  'use strict';

  const THEME_STORAGE_KEY = 'portfolio-theme';
  const animatedSelector = '.fade-in, .slide-up, .reveal';
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function init() {
    initThemeToggle();

    if (reduceMotionQuery.matches) {
      revealAnimatedElements();
    } else {
      initScrollAnimations();
    }

    initStickyHeader();
    initModals();
  }

  function revealAnimatedElements() {
    document.querySelectorAll(animatedSelector).forEach((element) => {
      element.classList.add('is-visible');
    });
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function getPreferredTheme() {
    const storedTheme = getStoredTheme();
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return colorSchemeQuery.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, shouldPersist) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    updateThemeButtons(theme);

    if (shouldPersist) {
      saveTheme(theme);
    }
  }

  function updateThemeButtons(theme) {
    const isDark = theme === 'dark';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = button.querySelector('.theme-toggle__label');
      if (label) {
        label.textContent = isDark ? 'Theme clair' : 'Theme sombre';
      }

      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute(
        'aria-label',
        isDark ? 'Activer le theme clair' : 'Activer le theme sombre'
      );
    });
  }

  function initThemeToggle() {
    let usingStoredTheme = getStoredTheme() === 'dark' || getStoredTheme() === 'light';
    applyTheme(getPreferredTheme(), false);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextTheme =
          document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        usingStoredTheme = true;
        applyTheme(nextTheme, true);
      });
    });

    if (typeof colorSchemeQuery.addEventListener === 'function') {
      colorSchemeQuery.addEventListener('change', (event) => {
        if (!usingStoredTheme) {
          applyTheme(event.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(animatedSelector);

    if (animatedElements.length === 0) {
      return;
    }

    if (typeof IntersectionObserver !== 'function') {
      revealAnimatedElements();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  function initStickyHeader() {
    const header = document.querySelector('.header');

    if (!header) {
      return;
    }

    function syncHeaderState() {
      if (window.scrollY > 24) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }

    let ticking = false;
    syncHeaderState();

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          syncHeaderState();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  function initModals() {
    const modalButtons = document.querySelectorAll('.sae-btn');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    if (modalButtons.length === 0 || modals.length === 0) {
      return;
    }

    modalButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const modalId = button.id.replace('-btn', '-modal');
        const modal = document.getElementById(modalId);

        if (modal) {
          openModal(modal);
        }
      });
    });

    closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          closeModal(modal);
        }
      });
    });

    modals.forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      modals.forEach((modal) => {
        if (modal.classList.contains('active')) {
          closeModal(modal);
        }
      });
    });
  }

  function openModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
