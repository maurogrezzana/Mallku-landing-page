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
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async event => {
        event.preventDefault();

        if (!validateForm(contactForm)) {
            showNotification('Revisá los campos marcados en rojo.', 'error');
            updateFormStatus('Revisá los campos marcados para continuar.', 'error');
            return;
        }

        const originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        updateFormStatus('Enviando tu consulta...', 'info');

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action || '#', {
                method: contactForm.method || 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            if (!response.ok) {
                throw new Error('No se pudo enviar el formulario');
            }

            contactForm.reset();
            contactForm.querySelectorAll('.input-error').forEach(element => {
                element.textContent = '';
            });
            showNotification('Recibimos tu consulta. Te contactamos pronto.', 'success');
            updateFormStatus('Recibimos tu consulta. Te escribimos en menos de 24 horas.', 'success');
        } catch (error) {
            showNotification('No pudimos enviar el formulario. Probá nuevamente o escribinos por WhatsApp.', 'error');
            updateFormStatus('No pudimos enviar el formulario. Probá nuevamente.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
        field.addEventListener('blur', () => {
            if (!field.hasAttribute('required')) {
                return;
            }
            const isCheckbox = field.type === 'checkbox';
            const value = isCheckbox ? field.checked : field.value.trim();
            if (!value) {
                setFieldError(field);
            }
        });
    });
}

function updateFormStatus(message, type = 'info') {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.dataset.status = type;
}

function validateForm(form) {
    let isValid = true;

    form.querySelectorAll('[required]').forEach(field => {
        clearFieldError(field);
        const isCheckbox = field.type === 'checkbox';
        const value = isCheckbox ? field.checked : field.value.trim();
        if (!value) {
            const message = isCheckbox ? 'Debés aceptar la política de privacidad.' : 'Campo obligatorio.';
            setFieldError(field, message);
            isValid = false;
        }
    });

    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            setFieldError(emailField, 'Ingresá un correo válido.');
            isValid = false;
        }
    }

    return isValid;
}

function setFieldError(field, message = 'Campo obligatorio.') {
    field.classList.add('has-error');
    field.style.borderColor = '#ef4444';
    field.setAttribute('aria-invalid', 'true');
    const errorTarget = field.form ? field.form.querySelector(`[data-error-for="${field.id}"]`) : null;
    if (errorTarget) {
        errorTarget.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('has-error');
    field.style.borderColor = '';
    field.removeAttribute('aria-invalid');
    const errorTarget = field.form ? field.form.querySelector(`[data-error-for="${field.id}"]`) : null;
    if (errorTarget) {
        errorTarget.textContent = '';
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    notification.setAttribute('aria-atomic', 'true');
    notification.tabIndex = -1;

    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;

    const text = document.createElement('span');
    text.textContent = message;

    const close = document.createElement('button');
    close.type = 'button';
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Cerrar notificación');

    notification.append(icon, text, close);
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('show');
        notification.focus();
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

// Gallery filters
const galleryFilters = document.querySelectorAll('[data-gallery-filter]');
const galleryItems = document.querySelectorAll('[data-gallery-item]');

if (galleryFilters.length && galleryItems.length) {
    galleryFilters.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-gallery-filter');
            galleryFilters.forEach(btn => btn.classList.toggle('active', btn === button));
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                const shouldShow = filter === 'todas' || category === filter;
                item.style.display = shouldShow ? '' : 'none';
            });
        });
    });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', (!isExpanded).toString());
        if (item) {
            item.classList.toggle('active', !isExpanded);
        }
    });
});
