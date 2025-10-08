/**
 * TechGeeks Computer Science Club - Main JavaScript
 * Modern SaaS-style interactions and animations
 */

// ==========================================
// Configuration - PLACEHOLDERS FOR FORM CONNECTION
// ==========================================

const CONFIG = {
    // Google Form URL for TechGeeks registration
    FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScmQ5j2KLqjnychz3PKwL3BY_isse6RIZjxcyFKw50Ah3PIsw/formResponse',

    // Google Form entry IDs mapped to form fields - CORRECT IDs
    ENTRY_IDS: {
        firstName: 'entry.2047506724',     // First Name
        lastName: 'entry.869392316',       // Last Name
        gender: 'entry.1909484609',        // Gender
        email: 'entry.1375451342',         // Email Address
        phoneNumber: 'entry.916565930',    // Phone Number
        academicYear: 'entry.2063032020',  // Academic Year
        system: 'entry.1675208490',        // System (Engineer/LMD/Professional)
        aboutYourself: 'entry.1000529810', // Tell us about yourself (skills, hobbies...)
        motivation: 'entry.1517384005'     // Why Do You Want To Join Us
    }
};

// ==========================================
// Navigation Functionality
// ==========================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileToggle = document.getElementById('mobileMenuToggle');
        this.navLinksContainer = document.querySelector('.nav-links');
        this.lastScrollTop = 0;
        this.scrollThreshold = 10;

        this.init();
    }

    init() {
        // Enhanced scroll effect with hide/show navbar
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        // Active link on scroll with smooth transition
        window.addEventListener('scroll', () => this.updateActiveLink(), { passive: true });

        // Smooth scroll on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });

        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target) && this.navLinksContainer.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class for styling
        if (scrollTop > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll (optional enhancement)
        if (Math.abs(scrollTop - this.lastScrollTop) > this.scrollThreshold) {
            if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                // Scrolling down
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.navbar.style.transform = 'translateY(0)';
            }
            this.lastScrollTop = scrollTop;
        }
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    handleLinkClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        // Close mobile menu after click
        if (window.innerWidth <= 968) {
            this.toggleMobileMenu();
        }
    }

    toggleMobileMenu() {
        this.mobileToggle.classList.toggle('active');
        this.navLinksContainer.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (this.navLinksContainer.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// ==========================================
// Form Submission Handler
// ==========================================

class FormHandler {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.submitButton = this.form?.querySelector('.btn-submit');
        this.formMessage = document.getElementById('formMessage');
        this.iframe = document.getElementById('hidden_iframe');

        if (this.form) {
            this.init();
        }
    }

    init() {
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Handle iframe load (means form was submitted)
        if (this.iframe) {
            this.iframe.addEventListener('load', () => this.handleIframeLoad());
        }

        // Add real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    handleIframeLoad() {
        // This fires when the iframe loads (either initial load or after form submission)
        // We need to check if it's actually from a form submission
        try {
            // Check if iframe has content (means form was submitted)
            if (this.iframe && this.iframe.contentWindow) {
                console.log('📥 Iframe loaded');
                console.log(this.iframe)
                // Set a flag to track if form was submitted
                if (this.formSubmitting) {
                    console.log('✅ Form successfully submitted to Google Forms!');
                    this.showMessage('success', '🎉 Thank you for joining TechGeeks! We\'ll be in touch soon.');
                    this.form.reset();
                    this.setLoadingState(false);
                    this.celebrateSubmission();
                    this.formSubmitting = false;
                }
            }
        } catch (error) {
            // Cross-origin error is expected and means form was submitted successfully
            console.log("error ",error);
            this.showMessage('success', '🎉 Thank you for joining TechGeeks! We\'ll be in touch soon.');
            this.form.reset();
            this.setLoadingState(false);
            this.celebrateSubmission();
            this.formSubmitting = false;
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        // Check if field is required and empty
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }

        // Phone number validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            isValid = phoneRegex.test(value) && value.replace(/\D/g, '').length >= 9;
        }

        // Select field validation
        if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            isValid = false;
        }

        // Textarea validation
        if (field.tagName === 'TEXTAREA' && field.hasAttribute('required')) {
            if (!value || value.length < 10) {
                isValid = false;
            }
        }

        // Add/remove error class
        if (isValid) {
            field.classList.remove('error');
            field.parentElement.classList.remove('error');
        } else {
            field.classList.add('error');
            field.parentElement.classList.add('error');
        }

        return isValid;
    }

    handleSubmit(e) {
        console.log('📝 Form submit event triggered');

        // Validate all fields before allowing submission
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            console.warn('⚠️ Form validation failed');
            this.showMessage('error', 'Please fill in all required fields correctly.');
            return false;
        }

        console.log('✅ Validation passed');

        // Set flag that form is being submitted
        this.formSubmitting = true;

        // Show loading state
        this.setLoadingState(true);
        this.hideMessage();

        console.log('🚀 Form will submit to Google Forms...');

        // Don't prevent default - let the form submit naturally to the iframe
        // The iframe load event will handle the success message
    }


    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = false;
        }
    }

    showMessage(type, text) {
        this.formMessage.className = `form-message ${type}`;
        this.formMessage.textContent = text;

        // Smooth reveal animation
        setTimeout(() => {
            this.formMessage.style.opacity = '1';
            this.formMessage.style.transform = 'translateY(0)';
        }, 10);

        // Auto-hide success message after 5 seconds
        if (type === 'success') {
            setTimeout(() => this.hideMessage(), 5000);
        }
    }

    hideMessage() {
        this.formMessage.style.opacity = '0';
        this.formMessage.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            this.formMessage.className = 'form-message';
            this.formMessage.textContent = '';
        }, 300);
    }

    celebrateSubmission() {
        // Simple celebration effect - could add more sophisticated animations
        const button = this.submitButton;
        button.style.transform = 'scale(1.05)';
        setTimeout(() => {
            button.style.transform = '';
        }, 300);
    }
}

// ==========================================
// Advanced Scroll Animations
// ==========================================

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        this.init();
    }

    init() {
        // Observe elements for fade-in animations
        const observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );

        // Add animation classes to elements
        const animatedElements = document.querySelectorAll(
            '.activity-card, .stat-item, .visual-item, .benefits-list li'
        );

        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.transitionDelay = `${(index % 6) * 0.1}s`;
            observer.observe(element);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }
}

// ==========================================
// Stats Counter Animation
// ==========================================

class StatsCounter {
    constructor() {
        this.stats = document.querySelectorAll('.stat-number');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.5 }
        );

        this.stats.forEach(stat => observer.observe(stat));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.hasAnimated) {
                this.animateCounter(entry.target);
                this.hasAnimated = true;
            }
        });
    }

    animateCounter(element) {
        const text = element.textContent;
        const target = parseInt(text);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = text; // Restore original text with '+'
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }
}

// ==========================================
// Parallax Effects
// ==========================================

class ParallaxEffects {
    constructor() {
        this.heroBackground = document.querySelector('.hero-background');
        this.floatingCards = document.querySelectorAll('.floating-card');
        this.init();
    }

    init() {
        window.addEventListener('scroll', debounce(() => this.handleParallax(), 10), { passive: true });
        window.addEventListener('mousemove', throttle((e) => this.handleMouseMove(e), 100));
    }

    handleParallax() {
        const scrolled = window.pageYOffset;

        // Hero background parallax
        if (this.heroBackground && scrolled < window.innerHeight) {
            this.heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    }

    handleMouseMove(e) {
        // Subtle mouse movement effect for floating cards
        if (window.innerWidth > 968) {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.floatingCards.forEach((card, index) => {
                const speed = (index + 1) * 0.01;
                const x = (clientX - centerX) * speed;
                const y = (clientY - centerY) * speed;

                card.style.transform = `translate(${x}px, ${y}px)`;
            });
        }
    }
}

// ==========================================
// Smooth Page Transitions
// ==========================================

class PageTransitions {
    constructor() {
        this.init();
    }

    init() {
        // Fade in page on load
        document.body.style.opacity = '0';
        window.addEventListener('load', () => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        });

        // Add loading state for internal navigation
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href !== '#' && document.querySelector(href)) {
                    // Link is handled by Navigation class
                }
            });
        });
    }
}

// ==========================================
// Activity Cards Interactive Effects
// ==========================================

class ActivityCardsEffects {
    constructor() {
        this.cards = document.querySelectorAll('.activity-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleCardHover(e));
            card.addEventListener('mousemove', (e) => this.handleCardMove(e));
            card.addEventListener('mouseleave', (e) => this.handleCardLeave(e));
        });
    }

    handleCardHover(e) {
        const card = e.currentTarget;
        card.style.transition = 'transform 0.3s ease';
    }

    handleCardMove(e) {
        if (window.innerWidth <= 968) return;

        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    }

    handleCardLeave(e) {
        const card = e.currentTarget;
        card.style.transform = '';
    }
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Debounce function to limit how often a function is called
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
 * Throttle function to limit function execution rate
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
 * Smooth reveal for sections
 */
function revealOnScroll() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (isInViewport(section)) {
            section.classList.add('revealed');
        }
    });
}

// ==========================================
// Initialize Everything on DOM Load
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    new Navigation();

    // Initialize form handler
    new FormHandler();

    // Initialize scroll animations
    new ScrollAnimations();

    // Initialize stats counter
    new StatsCounter();

    // Initialize parallax effects
    new ParallaxEffects();

    // Initialize page transitions
    new PageTransitions();

    // Initialize activity cards effects
    new ActivityCardsEffects();

    // Add smooth reveal on scroll
    window.addEventListener('scroll', debounce(revealOnScroll, 100), { passive: true });

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.querySelector('.nav-links.active');
            if (mobileMenu) {
                document.getElementById('mobileMenuToggle').click();
            }
        }
    });

    // Performance optimization: Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.classList.add('reduced-motion');
    }

    // Add custom cursor effect for activity cards (optional)
    if (window.innerWidth > 968) {
        document.querySelectorAll('.activity-card, .btn').forEach(element => {
            element.style.cursor = 'pointer';
        });
    }

    // Log initialization
    console.log('%c🚀 TechGeeks Website Initialized!', 'color: #0073B7; font-size: 16px; font-weight: bold;');
    console.log('%c📝 Remember to update CONFIG object in main.js with your Google Form details', 'color: #F7931E; font-size: 12px;');
});

// ==========================================
// Export for potential future use
// ==========================================

window.TechGeeks = {
    Navigation,
    FormHandler,
    ScrollAnimations,
    StatsCounter,
    ParallaxEffects,
    PageTransitions,
    ActivityCardsEffects,
    CONFIG
};

// Add service worker for PWA support (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}
