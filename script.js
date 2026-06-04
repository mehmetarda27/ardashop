const $body = document.body;
const loader = document.querySelector('.page-loader');

window.addEventListener('load', () => {
  loader?.classList.add('is-hidden');
});

const savedTheme = localStorage.getItem('ma-theme');
if (savedTheme === 'light') {
  $body.classList.add('light-mode');
}

const themeSlider = document.querySelector('.theme-slider');
const themeOptions = document.querySelectorAll('[data-theme-choice]');

function setTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  $body.classList.toggle('light-mode', nextTheme === 'light');
  localStorage.setItem('ma-theme', nextTheme);
  themeSlider?.setAttribute('data-selected', nextTheme);
  themeOptions.forEach((option) => {
    option.setAttribute('aria-pressed', String(option.dataset.themeChoice === nextTheme));
  });
}

setTheme(savedTheme === 'light' ? 'light' : 'dark');

themeOptions.forEach((option) => {
  option.addEventListener('click', () => {
    setTheme(option.dataset.themeChoice);
  });
});

// GSAP Scroll Animations
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray('[data-anim]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 84%' }
    });
  });
}

// Lottie Hero Animation
if (window.lottie && document.getElementById('hero-lottie')) {
  lottie.loadAnimation({
    container: document.getElementById('hero-lottie'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'https://assets4.lottiefiles.com/packages/lf20_x62chJ.json'
  });
}

// Skills Charts
function createChart(id, value, label) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: [label, 'Kalan'],
      datasets: [{
        data: [value, 100 - value],
        backgroundColor: ['#e83e8c', 'rgba(255,255,255,0.14)'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });
}

createChart('skill1', 92, 'UI/CSS');
createChart('skill2', 84, 'JavaScript');
createChart('skill3', 78, 'SEO');

// Portfolio Filter with Animation
const filterBtns = document.querySelectorAll('.filter-btns button');
const projects = document.querySelectorAll('.portfolio-grid .glass-card');
const projectSearch = document.getElementById('projectSearch');
let activeProjectFilter = 'all';

function updateProjects() {
  const searchTerm = (projectSearch?.value || '').trim().toLocaleLowerCase('tr-TR');

  projects.forEach((project) => {
    const text = [
      project.dataset.title,
      project.dataset.desc,
      project.dataset.category,
      project.textContent
    ].join(' ').toLocaleLowerCase('tr-TR');
    const categoryMatch = activeProjectFilter === 'all' || project.dataset.category === activeProjectFilter;
    const searchMatch = !searchTerm || text.includes(searchTerm);
    const shouldShow = categoryMatch && searchMatch;

    if (window.gsap) {
      if (shouldShow) {
        project.style.display = 'block';
        gsap.to(project, { opacity: 1, y: 0, duration: 0.45 });
      } else {
        gsap.to(project, {
          opacity: 0,
          y: 18,
          duration: 0.35,
          onComplete: () => {
            project.style.display = 'none';
          }
        });
      }
    } else {
      project.style.display = shouldShow ? 'block' : 'none';
    }
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeProjectFilter = btn.dataset.filter;
    updateProjects();
  });
});

projectSearch?.addEventListener('input', updateProjects);

// Encrypt-style action buttons
const ENCRYPT_CHARS = '!@#$%^&*():{};|,.<>/?';
const ENCRYPT_CYCLES_PER_LETTER = 2;
const ENCRYPT_SHUFFLE_TIME = 50;
const encryptIntervals = new WeakMap();

function setEncryptText(target, text) {
  const label = target.querySelector('.encrypt-text');
  if (label) label.textContent = text;
}

function stopEncrypt(target) {
  const interval = encryptIntervals.get(target);
  if (interval) window.clearInterval(interval);
  encryptIntervals.delete(target);
  setEncryptText(target, target.dataset.encryptText || '');
}

function scrambleEncrypt(target) {
  const targetText = target.dataset.encryptText || '';
  if (!targetText) return;
  stopEncrypt(target);

  let position = 0;
  const interval = window.setInterval(() => {
    const scrambled = targetText
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        if (position / ENCRYPT_CYCLES_PER_LETTER > index) return char;
        return ENCRYPT_CHARS[Math.floor(Math.random() * ENCRYPT_CHARS.length)];
      })
      .join('');

    setEncryptText(target, scrambled);
    position += 1;

    if (position >= targetText.length * ENCRYPT_CYCLES_PER_LETTER) {
      stopEncrypt(target);
    }
  }, ENCRYPT_SHUFFLE_TIME);

  encryptIntervals.set(target, interval);
}

function initEncryptActions() {
  const targets = document.querySelectorAll([
    'a.btn',
    'button.btn',
    '.filter-btns button',
    '.service-grid a',
    '.apple-glass-overlay button',
    '#lightbox .project-info a'
  ].join(','));

  targets.forEach((target) => {
    if (target.dataset.encryptReady === 'true') return;
    if (target.closest('.social-btns') || target.classList.contains('theme-option')) return;

    const originalText = target.textContent.trim();
    if (!originalText) return;

    target.dataset.encryptReady = 'true';
    target.dataset.encryptText = originalText;
    target.classList.add('encrypt-action');
    if (!target.getAttribute('aria-label')) target.setAttribute('aria-label', originalText);
    target.innerHTML = `
      <span class="encrypt-action-inner">
        <i class="fa-solid fa-lock encrypt-lock" aria-hidden="true"></i>
        <span class="encrypt-text"></span>
      </span>
    `;
    setEncryptText(target, originalText);

    target.addEventListener('mouseenter', () => scrambleEncrypt(target));
    target.addEventListener('focus', () => scrambleEncrypt(target));
    target.addEventListener('mouseleave', () => stopEncrypt(target));
    target.addEventListener('blur', () => stopEncrypt(target));
  });
}

initEncryptActions();

// Enhanced Apple glass tilt cards
document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('mouseenter', () => {
    card.classList.add('is-tilting');
  });

  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((0.5 - y / rect.height)) * 10;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.classList.remove('is-tilting');
    card.style.transform = '';
  });
});

document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Lightbox with info and navigation
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox?.querySelector('img');
const titleEl = lightbox?.querySelector('.project-info h3');
const descEl = lightbox?.querySelector('.project-info p');
const linkEl = lightbox?.querySelector('.project-info a');
const closeBtn = lightbox?.querySelector('.close-btn');
const prevBtn = lightbox?.querySelector('.nav-prev');
const nextBtn = lightbox?.querySelector('.nav-next');
let currentIndex = 0;
const images = [...document.querySelectorAll('.lightbox-trigger')];

function openLightbox(index) {
  if (!lightbox || !lightboxImg || !titleEl || !descEl || !linkEl || images.length === 0) return;
  const image = images[index];
  const card = image.closest('.glass-card');
  lightboxImg.src = image.src;
  titleEl.textContent = card?.dataset.title || image.alt;
  descEl.textContent = card?.dataset.desc || '';
  linkEl.href = card?.dataset.link || '#contact';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  currentIndex = index;
}

function closeLightbox() {
  lightbox?.classList.remove('is-open');
  lightbox?.setAttribute('aria-hidden', 'true');
}

images.forEach((img, index) => {
  img.addEventListener('click', () => openLightbox(index));
});

closeBtn?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
prevBtn?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  openLightbox(currentIndex);
});
nextBtn?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % images.length;
  openLightbox(currentIndex);
});

// Sidebar preview
const sidePanel = document.querySelector('.side-panel');
const panelBackdrop = document.querySelector('.panel-backdrop');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sideClose = document.querySelector('.side-close');

function setPanel(open) {
  sidePanel?.classList.toggle('is-open', open);
  panelBackdrop?.classList.toggle('is-open', open);
}

sidebarToggle?.addEventListener('click', () => setPanel(true));
sideClose?.addEventListener('click', () => setPanel(false));
panelBackdrop?.addEventListener('click', () => setPanel(false));

// Popup
const popup = document.querySelector('.project-popup');
const popupOpen = document.querySelector('.open-popup');
const popupClose = document.querySelector('.popup-close');

function setPopup(open) {
  popup?.classList.toggle('is-open', open);
  popup?.setAttribute('aria-hidden', open ? 'false' : 'true');
}

popupOpen?.addEventListener('click', () => setPopup(true));
popupClose?.addEventListener('click', () => setPopup(false));
popup?.addEventListener('click', (event) => {
  if (event.target === popup) setPopup(false);
});

// Menu active states and mobile close
const navLinks = document.querySelectorAll('.nav-link[href^="#"], .dropdown-item[href^="#"]');
const sections = [...document.querySelectorAll('section[id]')];
const navMenu = document.getElementById('navMenu');

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const collapse = window.bootstrap?.Collapse.getInstance(navMenu);
    collapse?.hide();
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 });

sections.forEach((section) => observer.observe(section));

// Contact Form
const contactForm = document.getElementById('contactForm');
const formStatus = document.querySelector('.form-status');

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!formStatus) return;
  formStatus.textContent = 'Mesajınız gönderiliyor...';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error('Form gönderilemedi');
    formStatus.textContent = 'Teşekkürler! Mesajınız başarıyla gönderildi.';
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = 'Şu an gönderim yapılamadı. Lütfen Instagram üzerinden ulaşın: @mehmetardastudio';
  }
});

// WhatsApp support widget
const whatsappBalloon = document.getElementById('whatsappBalloon');
const whatsappToggle = document.getElementById('ackapa');
const whatsappClose = document.getElementById('kapatac');
const whatsappForm = document.getElementById('whatsappForm');

function setWhatsappOpen(open) {
  whatsappBalloon?.classList.toggle('is-open', open);
  whatsappToggle?.setAttribute('aria-expanded', String(open));
}

whatsappToggle?.addEventListener('click', () => {
  setWhatsappOpen(!whatsappBalloon?.classList.contains('is-open'));
});

whatsappClose?.addEventListener('click', () => {
  setWhatsappOpen(false);
});

whatsappForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const messageInput = whatsappForm.querySelector('input[name="text"]');
  const text = messageInput?.value.trim() || 'Merhaba, web tasarım hizmetleriniz hakkında bilgi almak istiyorum.';
  window.open(`https://wa.me/905314668927?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
    setPanel(false);
    setPopup(false);
    setWhatsappOpen(false);
  }
});
