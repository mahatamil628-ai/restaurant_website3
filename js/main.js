/**
 * Savory & Sage - Interactive Logic
 * Fully custom vanilla JS script implementing UX features:
 * - Mobile hamburger drawer menu
 * - Sticky glassmorphic header
 * - Scrollspy navigation link highlighting
 * - Animated menu category filtering
 * - Autoplay testimonial/review slider
 * - Lightbox modal image viewer with navigation
 * - Reservation & Contact form validation & feedback
 * - Toast notification banner generator
 * - Intersection Observer scroll reveal effects
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Core DOM Elements
  // ==========================================================================
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // ==========================================================================
  // 2. Sticky Navbar & Scrollspy
  // ==========================================================================
  const handleScroll = () => {
    // Sticky header transition
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scrollspy: active nav link based on scroll position
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150; // offset for nav height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger on page load in case scroll is already offset

  // ==========================================================================
  // 3. Mobile Hamburger Menu Toggle
  // ==========================================================================
  const toggleMobileMenu = () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
    // Prevent body scrolling when menu is open
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggleMobileMenu);

  // Close menu when a navigation link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // ==========================================================================
  // 4. Smooth Scrolling for Navigation Links
  // ==========================================================================
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetPosition = targetSection.offsetTop - 70; // Header offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // 5. Dynamic Menu Filtering
  // ==========================================================================
  const menuButtons = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  menuButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active button class
      menuButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      // Animate cards exit
      menuCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8) translateY(15px)';
      });

      // Filter and animate entry after exit completion
      setTimeout(() => {
        menuCards.forEach(card => {
          const category = card.getAttribute('data-category');
          const shouldShow = filterValue === 'all' || category === filterValue;

          if (shouldShow) {
            card.classList.remove('hidden');
            // Trigger browser reflow to enable CSS transition
            void card.offsetWidth;
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
          } else {
            card.classList.add('hidden');
          }
        });
      }, 350);
    });
  });

  // ==========================================================================
  // 6. Testimonial / Review Carousel
  // ==========================================================================
  const track = document.querySelector('.testimonial-track');
  const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const dotsContainer = document.querySelector('.slider-dots');

  if (track && slides.length > 0) {
    let currentIndex = 0;
    let autoPlayInterval;

    // Create dynamic slide indicator dots
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        moveToSlide(index);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(document.querySelectorAll('.dot'));

    const updateDots = (index) => {
      dots.forEach(dot => dot.classList.remove('active'));
      dots[index].classList.add('active');
    };

    const moveToSlide = (index) => {
      if (index < 0) {
        index = slides.length - 1;
      } else if (index >= slides.length) {
        index = 0;
      }
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots(currentIndex);
    };

    // Button event listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        moveToSlide(currentIndex + 1);
        resetAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        moveToSlide(currentIndex - 1);
        resetAutoPlay();
      });
    }

    // Auto Play functionality
    const startAutoPlay = () => {
      autoPlayInterval = setInterval(() => {
        moveToSlide(currentIndex + 1);
      }, 6000);
    };

    const resetAutoPlay = () => {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    };

    // Pause autoplay on hover
    const carouselContainer = document.querySelector('.slider-container');
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carouselContainer.addEventListener('mouseleave', startAutoPlay);

    // Init slider
    startAutoPlay();
  }

  // ==========================================================================
  // 7. Gallery Lightbox Modal
  // ==========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  if (lightbox && galleryItems.length > 0) {
    let activeGalleryIndex = 0;
    
    // Store image objects in array
    const imagesData = Array.from(galleryItems).map(item => ({
      src: item.getAttribute('data-image') || item.querySelector('img').src,
      title: item.querySelector('.gallery-overlay-title').textContent
    }));

    const openLightbox = (index) => {
      activeGalleryIndex = index;
      updateLightboxContent();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    const updateLightboxContent = () => {
      const currentImg = imagesData[activeGalleryIndex];
      if (lightboxImg && lightboxCaption) {
        // Apply brief fade transitions to image swap
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
          lightboxImg.src = currentImg.src;
          lightboxCaption.textContent = currentImg.title;
          lightboxImg.style.opacity = '1';
        }, 150);
      }
    };

    const nextImage = () => {
      activeGalleryIndex = (activeGalleryIndex + 1) % imagesData.length;
      updateLightboxContent();
    };

    const prevImage = () => {
      activeGalleryIndex = (activeGalleryIndex - 1 + imagesData.length) % imagesData.length;
      updateLightboxContent();
    };

    // Bind gallery click events
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    // Lightbox Control Buttons
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content-box')) {
        closeLightbox();
      }
    });

    // Keyboard bindings
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
  }

  // ==========================================================================
  // 8. Custom Toast Notification Generator
  // ==========================================================================
  const showToast = (message, type = 'success') => {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.classList.add('toast-container');
      document.body.appendChild(toastContainer);
    }

    // Create toast node
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    // Set icons based on message type
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-body">${message}</span>
      <span class="toast-close">&times;</span>
    `;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      dismissToast(toast);
    }, 4500);

    // Close button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(dismissTimer);
      dismissToast(toast);
    });
  };

  const dismissToast = (toast) => {
    toast.classList.remove('show');
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  };

  // ==========================================================================
  // 9. Input & Form Validation
  // ==========================================================================
  const forms = {
    reservation: document.getElementById('reservationForm'),
    contact: document.getElementById('contactForm')
  };

  // Regular expressions for validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;

  const validateInput = (input) => {
    const value = input.value.trim();
    let isValid = true;
    
    // Check required fields
    if (input.hasAttribute('required') && value === '') {
      isValid = false;
    } 
    // Check specific formats
    else if (value !== '') {
      if (input.type === 'email' && !emailRegex.test(value)) {
        isValid = false;
      } else if (input.type === 'tel' && !phoneRegex.test(value)) {
        isValid = false;
      }
    }

    if (!isValid) {
      input.classList.add('invalid');
    } else {
      input.classList.remove('invalid');
    }

    return isValid;
  };

  // Initialize input listeners for real-time validation feedback
  Object.values(forms).forEach(form => {
    if (!form) return;
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          validateInput(input);
        }
      });
    });
  });

  // --- RESERVATION FORM SUBMIT ---
  if (forms.reservation) {
    forms.reservation.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = forms.reservation.querySelectorAll('input, select');
      let isFormValid = true;

      inputs.forEach(input => {
        if (!validateInput(input)) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        const name = document.getElementById('resName').value;
        const guests = document.getElementById('resGuests').value;
        const date = document.getElementById('resDate').value;
        const time = document.getElementById('resTime').value;

        // Display success toast notification
        showToast(`Thank you, ${name}! Your table for ${guests} guests on ${date} at ${time} is requested.`, 'success');
        forms.reservation.reset();
      } else {
        showToast('Please correct the marked fields in the reservation form.', 'error');
      }
    });
  }

  // --- CONTACT FORM SUBMIT ---
  if (forms.contact) {
    forms.contact.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = forms.contact.querySelectorAll('input, textarea');
      let isFormValid = true;

      inputs.forEach(input => {
        if (!validateInput(input)) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        const name = document.getElementById('contactName').value;
        showToast(`Thank you for reaching out, ${name}! Your message has been sent successfully.`, 'success');
        forms.contact.reset();
      } else {
        showToast('Please correct the marked fields in the contact form.', 'error');
      }
    });
  }

  // ==========================================================================
  // 10. Scroll Animations (Intersection Observer)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15, // trigger when 15% of the element is visible
      rootMargin: '0px 0px -50px 0px' // adjust viewport boundary slightly bottom
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }
});
