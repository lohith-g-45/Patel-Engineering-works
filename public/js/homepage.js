/* ============================================================
   PATEL ENGINEERING WORKS - HOMEPAGE INTERACTIONS
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  initializeButtons();
  initializeScrollEffects();
});

/* ============================================================
   BUTTON INTERACTIONS
   ============================================================ */
function initializeButtons() {
  // Primary action buttons
  const btnExplore = document.querySelector('.hero-buttons .btn-primary');
  const btnWork = document.querySelector('.hero-buttons .btn-secondary');
  const btnCTA = document.querySelector('.btn-accent');
  const btnViewAll = document.querySelector('.projects-cta .btn-primary');

  if (btnExplore) {
    btnExplore.addEventListener('click', function(e) {
      e.preventDefault();
      const divisionsSection = document.querySelector('.section-deliver');
      if (divisionsSection) {
        divisionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (btnWork) {
    btnWork.addEventListener('click', function(e) {
      e.preventDefault();
      const contactForm = document.querySelector('footer');
      if (contactForm) {
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (btnCTA) {
    btnCTA.addEventListener('click', function(e) {
      e.preventDefault();
      const contactForm = document.querySelector('footer');
      if (contactForm) {
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (btnViewAll) {
    btnViewAll.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/html/media-projects.html';
    });
  }

  // Learn More buttons on project cards
  const projectButtons = document.querySelectorAll('.project-card .btn-secondary');
  projectButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/html/media-projects.html';
    });
  });
}

/* ============================================================
   SCROLL EFFECTS
   ============================================================ */
function initializeScrollEffects() {
  // Add animation to cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Apply to cards
  const cardsToObserve = document.querySelectorAll(
    '.stat-card, .deliver-card, .logo-item, .why-card, .project-card'
  );
  
  cardsToObserve.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function smoothScroll(target) {
  if (typeof target === 'string') {
    target = document.querySelector(target);
  }
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function addClass(element, className) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.add(className);
  }
}

function removeClass(element, className) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.remove(className);
  }
}

/* ============================================================
   EXPORT FUNCTIONS FOR EXTERNAL USE
   ============================================================ */
window.homepage = {
  smoothScroll: smoothScroll,
  addClass: addClass,
  removeClass: removeClass
};
