/* ============================================
   TAEKEON - Interactive Features
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Particle Canvas ----
    const canvas = document.getElementById('heroParticles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x -= (dx / dist) * force * 0.5;
                this.y -= (dy / dist) * force * 0.5;
            }

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(58, 140, 63, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(100, Math.floor(window.innerWidth / 15));
        particles = Array.from({ length: count }, () => new Particle());
    }
    initParticles();

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(58, 140, 63, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        animationId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ---- Cursor Glow ----
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // ---- Navigation ----
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('.section, .hero');
    function updateActiveLink() {
        const scrollPos = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.id;
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.section === id);
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);

    // ---- Scroll Animations ----
    // Hero elements animate immediately on load
    const heroAnimated = document.querySelectorAll('.hero [data-animate]');
    heroAnimated.forEach(el => {
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('visible'), 300 + parseInt(delay));
    });

    // Other elements animate on scroll
    const animatedElements = document.querySelectorAll('[data-animate]:not(.hero [data-animate])');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    animatedElements.forEach(el => observer.observe(el));

    // ---- Counter Animation ----
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const start = performance.now();

                function updateCount(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * eased);
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        el.textContent = target;
                    }
                }
                requestAnimationFrame(updateCount);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    // ---- Marquee Duplication ----
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        const items = marqueeTrack.innerHTML;
        marqueeTrack.innerHTML = items + items;
    }

    // ---- Contact Form ----
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"] span');
            const originalText = btn.textContent;
            btn.textContent = '전송 완료!';
            setTimeout(() => {
                btn.textContent = originalText;
                form.reset();
            }, 2000);
        });
    }

    // ---- Service Detail Modals ----
    const modalLinks = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal-overlay');

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(link.dataset.modal);
        });
    });

    modals.forEach(overlay => {
        const closeBtn = overlay.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => closeModal(overlay));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay);
        });

        // Close modal and scroll to contact when clicking CTA
        const contactBtn = overlay.querySelector('.modal-contact-btn');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(overlay);
                setTimeout(() => {
                    const contact = document.getElementById('contact');
                    if (contact) {
                        const top = contact.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                }, 300);
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(m => { if (m.classList.contains('active')) closeModal(m); });
        }
    });

    // ---- Map Tabs ----
    const mapTabs = document.querySelectorAll('.map-tab');
    mapTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            mapTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.map-frame').forEach(f => f.classList.remove('active'));
            const mapId = 'map-' + tab.dataset.map;
            document.getElementById(mapId)?.classList.add('active');
        });
    });

    // ---- Smooth Scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Skip if inside a modal (handled separately)
            if (this.closest('.modal-overlay')) return;
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

});
