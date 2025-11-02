// Navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); }
        }
    });
});

// Smooth scrolling (native support with fallback)
navLinks.forEach(anchor => {
    anchor.addEventListener('click', event => {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar style on scroll
function handleNavbarState() {
    if (!navbar) return;
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleNavbarState);
handleNavbarState();

// Intersection observer for reveal animations
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -80px 0px'
});

document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', event => {
        event.preventDefault();

        if (!validateForm(contactForm)) {
            showNotification('Revisa los campos marcados en rojo.', 'error');
            return;
        }

        const originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            contactForm.reset();
            showNotification('Recibimos tu consulta. Te contactamos pronto.', 'success');
        }, 1500);
    });

    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => {
            field.classList.remove('has-error');
            field.style.borderColor = '';
        });
    });
}

function validateForm(form) {
    let isValid = true;

    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            setFieldError(field);
            isValid = false;
        }
    });

    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            setFieldError(emailField);
            isValid = false;
        }
    }

    return isValid;
}

function setFieldError(field) {
    field.classList.add('has-error');
    field.style.borderColor = '#ef4444';
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;

    const text = document.createElement('span');
    text.textContent = message;

    const close = document.createElement('button');
    close.type = 'button';
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Cerrar notificacion');

    notification.append(icon, text, close);
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    const removeNotification = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    };

    close.addEventListener('click', removeNotification);
    setTimeout(removeNotification, 4000);
}
// Tour carousel
const carousels = document.querySelectorAll('[data-carousel]');

carousels.forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) {
        return;
    }

    const slides = Array.from(track.children);
    if (!slides.length) {
        return;
    }

    const prevButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const dotsContainer = carousel.querySelector('[data-carousel-dots]');
    const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

    let currentIndex = slides.findIndex(slide => slide.classList.contains('active'));
    if (currentIndex < 0) {
        currentIndex = 0;
    }

    const moveTo = index => {
        if (!slides.length) {
            return;
        }

        currentIndex = (index + slides.length) % slides.length;
        const slideWidth = carousel.getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        slides.forEach((slide, idx) => {
            const isActive = idx === currentIndex;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', (!isActive).toString());
        });

        dots.forEach((dot, idx) => {
            const isActive = idx === currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-pressed', isActive.toString());
            dot.setAttribute('aria-selected', isActive.toString());
        });
    };

    const showPrevious = () => moveTo(currentIndex - 1);
    const showNext = () => moveTo(currentIndex + 1);

    if (prevButton) {
        prevButton.addEventListener('click', showPrevious);
    }

    if (nextButton) {
        nextButton.addEventListener('click', showNext);
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => moveTo(idx));
        dot.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                moveTo(idx);
            }
        });
    });

    carousel.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showPrevious();
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showNext();
        }
    });

    window.addEventListener('resize', () => moveTo(currentIndex));
    moveTo(currentIndex);
});
