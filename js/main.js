// ============================================================
// PORTFOLIO — main.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ──────────────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left  = mouseX + 'px';
      dot.style.top   = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .skill-tab, .project-card, .stat-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  } else {
    if (dot)  dot.style.display  = 'none';
    if (ring) ring.style.display = 'none';
    document.body.classList.add('no-cursor-custom');
  }

  // ── Hero Canvas — Animated Mesh Background ─────────────────
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.r  = Math.random() * 180 + 60;
        this.dx = (Math.random() - 0.5) * 0.4;
        this.dy = (Math.random() - 0.5) * 0.4;
        this.hue = Math.random() > 0.5 ? 270 : 190; // purple or cyan
        this.alpha = Math.random() * 0.12 + 0.04;
      }
      update() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < -this.r || this.x > W + this.r ||
            this.y < -this.r || this.y > H + this.r) {
          this.reset();
        }
      }
      draw() {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        g.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${this.alpha})`);
        g.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(Math.floor(W / 80), 14);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawConnections() {
      const maxDist = 220;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      animId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animId);
      resize();
      initParticles();
      animate();
    });
    ro.observe(canvas);
  }

  // ── Navbar — Scroll & Active Highlight ─────────────────────
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateScrollspy();
  });

  function updateScrollspy() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 120;
      if (window.scrollY >= top) current = s.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ── Mobile Nav Toggle ──────────────────────────────────────
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // ── Smooth Scroll ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Typing Animation ───────────────────────────────────────
  const typingEl = document.getElementById('typing-text');
  const roles = [
    'Front-End Developer',
    'UI/UX Enthusiast',
    'Web Designer',
    'JavaScript Developer',
    'Responsive Design Expert',
  ];
  let roleIdx = 0, charIdx = 0, deleting = false;

  function typeLoop() {
    const current = roles[roleIdx];
    if (deleting) {
      typingEl.textContent = current.substring(0, charIdx--);
      if (charIdx < 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(typeLoop, 500);
        return;
      }
    } else {
      typingEl.textContent = current.substring(0, charIdx++);
      if (charIdx > current.length) {
        deleting = true;
        setTimeout(typeLoop, 1800);
        return;
      }
    }
    setTimeout(typeLoop, deleting ? 50 : 90);
  }
  if (typingEl) typeLoop();

  // ── Skill Tabs ─────────────────────────────────────────────
  const tabs   = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skills-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('active');
        animateSkillBars(panel);
      }
    });
  });

  // ── Skill Bar Animation ────────────────────────────────────
  function animateSkillBars(container) {
    container.querySelectorAll('.skill-bar-fill').forEach(bar => {
      const level = bar.dataset.level;
      setTimeout(() => {
        bar.style.width = level + '%';
      }, 100);
    });
  }

  // ── Intersection Observer — Reveal Animations ──────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
          // Animate skill bars when they appear
          entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.level + '%';
          });
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  // Also observe the first skills panel on load
  const firstPanel = document.querySelector('.skills-panel.active');
  if (firstPanel) {
    const panelObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateSkillBars(firstPanel);
        panelObs.disconnect();
      }
    }, { threshold: 0.2 });
    panelObs.observe(firstPanel);
  }

  // ── 3D Card Tilt ───────────────────────────────────────────
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX =  (y - cy) / cy * -6;
      const rotY =  (x - cx) / cx *  6;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  // ── Contact Form Validation ────────────────────────────────
  const form = document.getElementById('contact-form');
  const formMsg = document.getElementById('form-message');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = document.getElementById('form-name').value.trim();
      const email   = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message-text').value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      formMsg.className = 'form-message';
      formMsg.style.display = 'none';

      if (!name || !email || !message) {
        formMsg.textContent = '⚠️ Please fill in all fields.';
        formMsg.classList.add('error');
        return;
      }
      if (!emailRe.test(email)) {
        formMsg.textContent = '⚠️ Please enter a valid email address.';
        formMsg.classList.add('error');
        return;
      }
      if (message.length < 10) {
        formMsg.textContent = '⚠️ Message must be at least 10 characters.';
        formMsg.classList.add('error');
        return;
      }

      // Simulate submission
      const btn = form.querySelector('.form-submit');
      btn.innerHTML = '<span>Sending…</span>';
      btn.disabled = true;

      setTimeout(() => {
        formMsg.textContent = '✅ Message sent! I\'ll get back to you soon.';
        formMsg.classList.add('success');
        form.reset();
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
        btn.disabled = false;
      }, 1600);
    });
  }

  // ── Stagger Delay Helpers ──────────────────────────────────
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.querySelectorAll(parent.dataset.stagger);
    children.forEach((child, i) => {
      child.dataset.delay = i * 100;
      child.classList.add('reveal');
      observer.observe(child);
    });
  });

  // ── Counter Animation ─────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
});
