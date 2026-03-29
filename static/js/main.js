/* ================================================================
   MARINE ENGINEERING & SHIPBUILDING CORPORATE WEBSITE
   JavaScript Utilities & Components
   ================================================================ */

/**
 * Document Ready - Initialize all components
 */
document.addEventListener('DOMContentLoaded', function() {
  const isDynamicMediaPage = document.body.classList.contains('dynamic-media-page');

  initializeNavbar();
  initializeSmoothScroll();
  if (!isDynamicMediaPage) {
    initializeMediaCarousels();
    initializeLightbox();
    initializeArticleDetailsModal();
  }
  initializeFormValidation();
  initializeScrollAnimations();
  initializeParallax();
  initializeWordReveal();
  initializeProfessionalMotion();
  initializeScrollReveal();
  initializeAccordions();
  initializeJobFilters();
});

/* ================================================================
   1. NAVBAR FUNCTIONALITY
   ================================================================ */
function initializeNavbar() {
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.querySelector('.navbar-menu');
  const navbar = document.querySelector('.navbar');
  const links = document.querySelectorAll('.navbar-menu a');
  const dropdownLinks = document.querySelectorAll('.nav-dropdown > .nav-dropdown-link');
  const dropdownItems = document.querySelectorAll('.nav-dropdown');

  // Mobile menu toggle
  if (toggle) {
    toggle.addEventListener('click', function() {
      menu.classList.toggle('active');
    });
  }

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', function() {
      if (this.classList.contains('nav-dropdown-link') && window.innerWidth <= 768) {
        return;
      }
      menu.classList.remove('active');
      dropdownItems.forEach(item => item.classList.remove('open'));
    });
  });

  // Mobile dropdown support for About Us submenu
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth > 768) return;

      e.preventDefault();
      const parent = this.parentElement;
      dropdownItems.forEach(item => {
        if (item !== parent) item.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      dropdownItems.forEach(item => item.classList.remove('open'));
      menu.classList.remove('active');
    }
  });

  // Navbar scroll background change
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active link highlighting
  updateActiveNavLink();
  window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('[id]');
  const navLinks = document.querySelectorAll('.navbar-menu a');

  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ================================================================
   2. SMOOTH SCROLLING
   ================================================================ */
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ================================================================
   3. MEDIA CAROUSEL FUNCTIONALITY
   ================================================================ */
function initializeMediaCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevButton = carousel.querySelector('.carousel-prev');
    const nextButton = carousel.querySelector('.carousel-next');
    const titleElement = carousel.querySelector('.carousel-title');
    const countElement = carousel.querySelector('.carousel-count');

    if (!slides.length) {
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      return;
    }

    let currentIndex = 0;

    function getSlideTitle(slide) {
      if (slide.dataset.title) return slide.dataset.title;

      const heading = slide.querySelector('.card-title');
      if (heading && heading.textContent.trim()) return heading.textContent.trim();

      const image = slide.querySelector('img');
      if (image && image.alt.trim()) return image.alt.trim();

      return 'Media item';
    }

    function renderSlide(index) {
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      if (titleElement) {
        titleElement.textContent = getSlideTitle(slides[index]);
      }

      if (countElement) {
        countElement.textContent = `Item ${index + 1} of ${slides.length}`;
      }
    }

    function goToNext() {
      currentIndex = (currentIndex + 1) % slides.length;
      renderSlide(currentIndex);
    }

    function goToPrevious() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      renderSlide(currentIndex);
    }

    if (prevButton) prevButton.addEventListener('click', goToPrevious);
    if (nextButton) nextButton.addEventListener('click', goToNext);

    if (slides.length === 1) {
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
    }

    renderSlide(currentIndex);
  });
}

/* ================================================================
   4. LIGHTBOX FUNCTIONALITY
   ================================================================ */
function initializeLightbox() {
  const galleryItems = document.querySelectorAll('[data-lightbox]');
  const expandableImages = document.querySelectorAll('img[data-expand-image]');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  if (!lightbox) return;

  let currentImageIndex = 0;
  let currentGallery = [];

  function getImageData(item) {
    if (!item) return { src: '', alt: 'Gallery image' };

    if (item.tagName === 'IMG') {
      return {
        src: item.dataset.src || item.currentSrc || item.src,
        alt: item.alt || 'Gallery image'
      };
    }

    const nestedImage = item.querySelector('img');
    if (nestedImage) {
      return {
        src: item.dataset.src || nestedImage.dataset.src || nestedImage.currentSrc || nestedImage.src,
        alt: nestedImage.alt || 'Gallery image'
      };
    }

    return { src: item.dataset.src || '', alt: 'Gallery image' };
  }

  // Open lightbox
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const lightboxGroup = this.getAttribute('data-lightbox');
      currentGallery = Array.from(document.querySelectorAll(`[data-lightbox="${lightboxGroup}"]`));
      currentImageIndex = currentGallery.indexOf(this);
      showLightboxImage();
    });
  });

  expandableImages.forEach(image => {
    image.addEventListener('click', function(e) {
      e.preventDefault();
      currentGallery = [this];
      currentImageIndex = 0;
      showLightboxImage();
    });
  });

  // Close lightbox
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
  });

  // Navigation
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    showLightboxImage();
  });

  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    showLightboxImage();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
      showLightboxImage();
    }
    if (e.key === 'ArrowRight') {
      currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
      showLightboxImage();
    }
  });

  function showLightboxImage() {
    if (!currentGallery.length) return;

    const currentItem = currentGallery[currentImageIndex];
    const { src, alt } = getImageData(currentItem);

    if (!src) return;

    lightboxImg.src = src;
    lightboxImg.alt = alt;

    const hasMultipleItems = currentGallery.length > 1;
    prevBtn.style.display = hasMultipleItems ? '' : 'none';
    nextBtn.style.display = hasMultipleItems ? '' : 'none';

    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
  }
}

/* ================================================================
   5. ARTICLE DETAILS MODAL
   ================================================================ */
function initializeArticleDetailsModal() {
  const articleLinks = document.querySelectorAll('[data-article-id]');
  const modal = document.getElementById('articleModal');
  const closeButton = modal ? modal.querySelector('.article-modal-close') : null;
  const titleElement = document.getElementById('articleModalTitle');
  const metaElement = document.getElementById('articleModalMeta');
  const bodyElement = document.getElementById('articleModalBody');

  if (!modal || !titleElement || !metaElement || !bodyElement) return;

  const articleDetails = {
    'featured-green-initiative': {
      title: 'Revolutionary Green Shipbuilding Initiative Launched',
      meta: 'March 2024 | Strategic Sustainability Program',
      paragraphs: [
        'Marine Engineering & Shipbuilding has launched a multi-year green shipbuilding initiative focused on reducing lifecycle emissions across design, fabrication, and operations.',
        'The program includes low-emission propulsion options, energy-optimized hull design, and the integration of digital monitoring systems to improve fuel efficiency during vessel operations.',
        'A dedicated investment plan has been approved for cleaner fabrication workflows, yard electrification, and supplier alignment to support measurable ESG targets.',
        'Pilot vessel classes under this initiative are scheduled for phased rollout, with performance metrics tracked against baseline emissions and energy consumption benchmarks.'
      ]
    },
    'industry-awards': {
      title: 'Industry Awards & Recognition',
      meta: 'January 2024 | Corporate Milestone',
      paragraphs: [
        'The company received multiple recognitions for manufacturing excellence, quality assurance, and sustainability leadership in maritime engineering.',
        'Independent evaluators highlighted improvements in process standardization, defect reduction, and delivery reliability across key programs.',
        'Internal capability development and cross-functional execution were cited as major drivers behind the recognition, particularly in high-complexity projects.'
      ]
    },
    'research-lab': {
      title: 'Advanced Research Lab Inaugurated',
      meta: 'December 2023 | Innovation Infrastructure',
      paragraphs: [
        'A new marine R&D lab has been inaugurated to accelerate testing of propulsion systems, materials, and digital performance analytics.',
        'The facility supports controlled simulation environments and rapid prototyping for next-generation vessel systems.',
        'Research priorities include durability, energy optimization, and reduced maintenance overhead under real-world operating conditions.'
      ]
    },
    'major-contract': {
      title: 'Major Contract Secured',
      meta: 'November 2023 | International Program',
      paragraphs: [
        'Marine Engineering & Shipbuilding has secured a high-value international contract for a fleet of advanced container vessels.',
        'The scope covers end-to-end execution including design finalization, construction, integration, and delivery milestones.',
        'Dedicated program governance, supplier alignment, and schedule controls are in place to ensure on-time, quality-compliant delivery.'
      ]
    },
    'technology-partnership': {
      title: 'Technology Partnership Announced',
      meta: 'October 2023 | Digital Transformation',
      paragraphs: [
        'Strategic technology partnerships have been announced to strengthen AI and IoT integration across shipbuilding workflows.',
        'Planned use cases include predictive maintenance, yard productivity analytics, and enhanced quality visibility across production stages.',
        'The partnership roadmap focuses on scalable deployment, workforce enablement, and measurable efficiency gains over staged implementation cycles.'
      ]
    },
    'employment-campaign': {
      title: 'Employment Campaign Success',
      meta: 'September 2023 | Workforce Development',
      paragraphs: [
        'A focused hiring and skilling campaign added over 150 professionals across production, engineering, and support functions.',
        'The campaign included structured onboarding, technical training, and role-specific certification pathways to improve readiness.',
        'This expansion strengthens execution capacity while building a long-term talent pipeline aligned with future project demand.'
      ]
    }
  };

  function openArticle(articleId) {
    const article = articleDetails[articleId];
    if (!article) return;

    titleElement.textContent = article.title;
    metaElement.textContent = article.meta;
    bodyElement.innerHTML = article.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeArticleModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  articleLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      openArticle(this.dataset.articleId);
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeArticleModal);
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeArticleModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeArticleModal();
    }
  });
}

/* ================================================================
  6. FORM VALIDATION & SUBMISSION
   ================================================================ */
function initializeFormValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Validate form
      if (!validateForm(this)) {
        return;
      }

      // Submit form
      await submitForm(this);
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('[required]');

  inputs.forEach(input => {
    if (!input.value.trim()) {
      showError(input, 'This field is required');
      isValid = false;
    } else {
      clearError(input);
    }

    // Email validation
    if (input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        showError(input, 'Please enter a valid email address');
        isValid = false;
      } else {
        clearError(input);
      }
    }

    // Phone validation
    if (input.type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (input.value && !phoneRegex.test(input.value)) {
        showError(input, 'Please enter a valid phone number');
        isValid = false;
      } else {
        clearError(input);
      }
    }
  });

  return isValid;
}

function showError(input, message) {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;

  let errorDiv = formGroup.querySelector('.error-text');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-text';
    errorDiv.style.color = 'var(--danger)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--spacing-xs)';
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }
  errorDiv.textContent = message;
  input.style.borderColor = 'var(--danger)';
}

function clearError(input) {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;

  const errorDiv = formGroup.querySelector('.error-text');
  if (errorDiv) errorDiv.remove();
  input.style.borderColor = '';
}

async function submitForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Check if we should submit to backend or just show success
    const action = form.getAttribute('action');
    
    if (action && action !== '#') {
      // Submit to backend
      const response = await fetch(action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Network response was not ok');
    }

    // Show success message
    showSuccessMessage(form, 'Form submitted successfully! We will be in touch soon.');
    form.reset();

  } catch (error) {
    showErrorMessage(form, 'An error occurred. Please try again later.');
    console.error('Form submission error:', error);

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function showSuccessMessage(form, message) {
  let messageDiv = form.parentNode.querySelector('.success-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.className = 'success-message fade-in';
    form.parentNode.insertBefore(messageDiv, form);
  }
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';

  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

function showErrorMessage(form, message) {
  let messageDiv = form.parentNode.querySelector('.error-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.className = 'error-message fade-in';
    form.parentNode.insertBefore(messageDiv, form);
  }
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
}

/* ================================================================
  7. SCROLL ANIMATIONS
   ================================================================ */
function initializeScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards and sections for animation
  document.querySelectorAll('.card:not(.motion-reveal), .section:not(.motion-reveal), .fade-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/* ================================================================
  8. PARALLAX EFFECT
   ================================================================ */
function initializeParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', function() {
    parallaxElements.forEach(el => {
      const scrollPosition = window.scrollY;
      const parallaxValue = scrollPosition * 0.5;
      el.style.transform = `translateY(${parallaxValue}px)`;
    });
  });
}

/* ================================================================
  9. HERO WORD REVEAL
   ================================================================ */
function initializeWordReveal() {
  const targets = document.querySelectorAll('[data-word-reveal]');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  targets.forEach(target => {
    const originalText = target.textContent.trim();
    if (!originalText) return;

    if (prefersReducedMotion) {
      target.textContent = originalText;
      return;
    }

    const startDelay = Number.parseInt(target.getAttribute('data-word-reveal-start') || '0', 10);
    const wordDelay = Number.parseInt(target.getAttribute('data-word-reveal-step') || '130', 10);
    const words = originalText.split(/\s+/);

    target.textContent = '';

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word-reveal-item';
      span.style.animationDelay = `${startDelay + (index * wordDelay)}ms`;
      span.textContent = word;
      target.appendChild(span);

      if (index < words.length - 1) {
        target.appendChild(document.createTextNode(' '));
      }
    });
  });
}

function initializeProfessionalMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.body.classList.add('motion-ready');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('page-loaded');
    });
  });

  const revealTargets = document.querySelectorAll(
    '.section, .card, .about-panel, .stats-strip .stat-item, .division-card, .leader-card, .media-post-card'
  );

  if (!revealTargets.length) return;

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('motion-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
  });

  revealTargets.forEach((el, index) => {
    el.classList.add('motion-reveal');
    el.style.setProperty('--motion-delay', `${(index % 6) * 70}ms`);
    observer.observe(el);
  });
}

/* ================================================================
  10. UTILITY FUNCTIONS
   ================================================================ */

/**
 * Format phone number
 */
function formatPhoneNumber(input) {
  input.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length <= 3) {
        value = value;
      } else if (value.length <= 6) {
        value = value.slice(0, 3) + '-' + value.slice(3);
      } else {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
      }
    }
    e.target.value = value;
  });
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!');
  });
}

/**
 * Show notification
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--success);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 9999;
    animation: slideInRight 0.3s ease-in-out;
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Lazy load images
 */
function initializeLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('lazy-loaded');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

/**
 * Initialize lazy loading on page load
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLazyLoad);
} else {
  initializeLazyLoad();
}

/* ================================================================
  11. SCROLL REVEAL ANIMATIONS
   ================================================================ */
function initializeScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('show'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delayStr = entry.target.style.getPropertyValue('--delay');
        const delay = delayStr ? parseInt(delayStr, 10) : 0;
        
        const timeoutId = setTimeout(() => {
          entry.target.classList.add('show');
        }, delay);
        entry.target.dataset.timeoutId = timeoutId;
      } else {
        // Cancel pending timeout if it scrolls out too quickly
        if (entry.target.dataset.timeoutId) {
          clearTimeout(parseInt(entry.target.dataset.timeoutId, 10));
        }
        // Remove class to play animation again next time it scrolls in
        entry.target.classList.remove('show');
      }
    });
  }, {
    threshold: 0,
    rootMargin: '-15% 0px -15% 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ================================================================
   11. ACCORDION FUNCTIONALITY
   ================================================================ */
function initializeAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const item = this.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all other accordion items in the same container
      const container = item.closest('.accordion-container');
      if (container) {
        container.querySelectorAll('.accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
      }
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });
}

/* ================================================================
  12. EXPORT FOR USE IN OTHER MODULES
  ================================================================ */
window.MarineEngineeringUI = {
  validateForm,
  submitForm,
  showNotification,
  copyToClipboard,
  debounce,
  throttle,
  isInViewport
};
/* ================================================================
   JOB DETAILS MODAL
   ================================================================ */
function openJobModal(jobId) {
  const modal = document.getElementById('job-modal');
  const modalContent = document.getElementById('modal-content');
  const jobData = document.getElementById('job-data-' + jobId);

  if (modal && modalContent && jobData) {
    modalContent.innerHTML = jobData.innerHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeJobModal() {
  const modal = document.getElementById('job-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.addEventListener('click', function(e) {
  const jobModal = document.getElementById('job-modal');
  const applyModal = document.getElementById('apply-modal');
  if (e.target === jobModal) {
    closeJobModal();
  }
  if (e.target === applyModal) {
    closeApplyModal();
  }
});

/* ================================================================
   JOB DETAILS MODAL
   ================================================================ */
function openJobModal(jobId) {
  const modal = document.getElementById('job-modal');
  const modalContent = document.getElementById('modal-content');
  const jobData = document.getElementById('job-data-' + jobId);
  const applyBtn = document.getElementById('modal-apply-btn');

  if (modal && modalContent && jobData) {
    modalContent.innerHTML = jobData.innerHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set up the Apply Now button inside the modal
    if (applyBtn) {
      applyBtn.onclick = function() {
        closeJobModal();
        openApplyModal(jobId);
      };
    }
  }
}

function closeJobModal() {
  const modal = document.getElementById('job-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ================================================================
   APPLICATION MODAL
   ================================================================ */
function openApplyModal(jobId) {
  const modal = document.getElementById('apply-modal');
  const jobSelect = document.getElementById('modal-job-select');

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (jobSelect && jobId && jobId !== 'all') {
      jobSelect.value = jobId;
    } else if (jobSelect && jobId === 'all') {
      jobSelect.value = '';
    }
  }
}

function closeApplyModal() {
  const modal = document.getElementById('apply-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ================================================================
   JOB FILTERING LOGIC
   ================================================================ */
function initializeJobFilters() {
  const filterType = document.getElementById('filter-type');
  const filterLocation = document.getElementById('filter-location');

  if (filterType && filterLocation) {
    const filterJobs = () => {
      const typeValue = filterType.value;
      const locationValue = filterLocation.value.toLowerCase();
      const jobCards = document.querySelectorAll('.pew-job-card');

      jobCards.forEach(card => {
        const cardType = card.getAttribute('data-job-type');
        const cardLocation = card.getAttribute('data-location').toLowerCase();
        
        const typeMatch = (typeValue === 'all' || cardType === typeValue);
        const locationMatch = (locationValue === 'all' || cardLocation.includes(locationValue));

        if (typeMatch && locationMatch) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.3s ease';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    };

    filterType.addEventListener('change', filterJobs);
    filterLocation.addEventListener('change', filterJobs);
  }
}
