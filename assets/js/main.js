// assets/js/main.js

// Load header.html, footer.html, hero.html
fetch('/components/header.html')
    .then(response => {
        if (!response.ok) {
            console.error('Failed to fetch header.html:', response.status, response.statusText);
            return response.text();
        }
        return response.text();
    })
    .then(data => {
        const headerContainer = document.getElementById('header');
        if (!headerContainer) {
            console.error('No element with id "header" found to inject header.html');
            return;
        }
        headerContainer.innerHTML = data;
        console.debug('header.html injected');
        // Initialize header-related interactions after the header is injected
        try { initHeaderInteractions(); } catch (e) { console.debug('initHeaderInteractions threw', e); /* will init on DOMContentLoaded as fallback */ }
    });

fetch('/components/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    });

fetch('/components/hero.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('hero').innerHTML = data;
    });

// Initialize call to action section
fetch('/components/cta.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('cta').innerHTML = data;
    });

// Initialize header / mobile menu interactions after dynamic load
function initHeaderInteractions() {
    // avoid double initialization
    if (window._headerInitDone) return;

    console.debug('initHeaderInteractions: attempting init');

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileMenuButton || !mobileMenu) {
        console.debug('initHeaderInteractions: required elements missing', { mobileMenuButton: !!mobileMenuButton, mobileMenu: !!mobileMenu });
        return;
    }

    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        console.debug('mobile-menu-button clicked');
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuButton.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            if (icon) icon.className = 'fas fa-bars text-2xl';
        } else {
            if (icon) icon.className = 'fas fa-times text-2xl';
        }
    });

    // prevent clicks inside menu from closing it
    mobileMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                if (icon) icon.className = 'fas fa-bars text-2xl';
            }
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuButton.querySelector('i');
            if (icon) icon.className = 'fas fa-bars text-2xl';
        }
    });

    // mark initialized only after handlers attached
    window._headerInitDone = true;
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Ensure header interactions are initialized (header may be injected async)
    initHeaderInteractions();
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
        
        // Scroll to top when clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Consultation form submission
    const consultationForm = document.getElementById('consultation-form');
    
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(consultationForm);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            if (!data.name || !data.phone) {
                showNotification('Пожалуйста, заполните обязательные поля', 'error');
                return;
            }
            
            // In a real application, you would send this data to your server
            // For now, we'll just show a success message
            showNotification('Спасибо! Мы свяжемся с вами в течение 2 часов', 'success');
            consultationForm.reset();
            
            // You would typically send the data to your backend here:
            // fetch('/api/consultation', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(data)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showNotification('Спасибо! Мы свяжемся с вами в течение 2 часов', 'success');
            //     consultationForm.reset();
            // })
            // .catch(error => {
            //     showNotification('Произошла ошибка. Пожалуйста, попробуйте позже', 'error');
            // });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without scrolling
                history.pushState(null, null, href);
                
                // Close mobile menu if open (query elements at click time)
                const mobileMenu = document.getElementById('mobile-menu');
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    if (mobileMenuButton) {
                        const icon = mobileMenuButton.querySelector('i');
                        if (icon) icon.className = 'fas fa-bars text-2xl';
                    }
                }
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('header');
    
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('shadow-lg', 'py-3');
                header.classList.remove('py-4');
                
                if (currentScroll > lastScroll && currentScroll > 200) {
                    // Scrolling down
                    header.classList.add('-translate-y-full');
                } else {
                    // Scrolling up
                    header.classList.remove('-translate-y-full');
                }
            } else {
                header.classList.remove('shadow-lg', 'py-3', '-translate-y-full');
                header.classList.add('py-4');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // Add animation classes to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class based on data attribute
                const animationClass = entry.target.getAttribute('data-animation') || 'fade-in';
                entry.target.classList.add(animationClass);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with data-animation attribute
    document.querySelectorAll('[data-animation]').forEach(el => {
        observer.observe(el);
    });
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize counters
    initializeCounters();
    
    // Set current year in footer (if needed)
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl transform transition-all duration-300 translate-x-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3"></i>
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Close button
    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', function() {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('translate-x-0');
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Tooltip initialization
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap';
            tooltip.textContent = tooltipText;
            tooltip.id = 'tooltip-' + Date.now();
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            // Store reference
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
}

// Counter animation
function initializeCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    
    if (counterElements.length > 0) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.getAttribute('data-counter'));
                    const duration = parseInt(element.getAttribute('data-duration')) || 2000;
                    const suffix = element.getAttribute('data-suffix') || '';
                    const prefix = element.getAttribute('data-prefix') || '';
                    
                    animateCounter(element, target, duration, prefix, suffix);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        counterElements.forEach(el => observer.observe(el));
    }
}

function animateCounter(element, target, duration, prefix = '', suffix = '') {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = prefix + Math.floor(current) + suffix;
    }, 16);
}

// Form validation helper
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^[\+]?[7-8]?[0-9\s\-\(\)]+$/;
    return re.test(String(phone));
}

// Debounce function for performance
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .custom-notification {
        min-width: 300px;
        max-width: 400px;
    }
    
    @media (max-width: 640px) {
        .custom-notification {
            min-width: auto;
            max-width: calc(100vw - 2rem);
            left: 1rem;
            right: 1rem;
            top: 1rem;
            transform: translateY(-100%) !important;
        }
        
        .custom-notification.translate-x-0 {
            transform: translateY(0) !important;
        }
    }
`;
document.head.appendChild(style);

// Service Worker registration (if needed)
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
    window.addEventListener('load', function() {
        // You can register a service worker here for PWA functionality
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('ServiceWorker registered:', registration);
        //     })
        //     .catch(error => {
        //         console.log('ServiceWorker registration failed:', error);
        //     });
    });
}