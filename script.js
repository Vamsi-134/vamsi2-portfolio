// script.js
// Handles nav toggle, portfolio filtering, lightbox, contact form, and year fill.

document.addEventListener('DOMContentLoaded', () => {
  // ---------- NAV TOGGLE ----------
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      // toggle a class to show/hide nav on small screens
      siteNav.classList.toggle('open');
      // when opened, focus first link
      if (!expanded) {
        const firstLink = siteNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  }

  // Close nav when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (!siteNav || !navToggle) return;
    if (!siteNav.contains(e.target) && !navToggle.contains(e.target) && siteNav.classList.contains('open')) {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------- PORTFOLIO FILTERS ----------
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const items = Array.from(document.querySelectorAll('.portfolio-item'));

  function applyFilter(filter) {
    items.forEach(it => {
      const type = it.dataset.type || 'photo';
      if (filter === 'all' || filter === type) {
        it.style.display = ''; // show
        it.setAttribute('aria-hidden', 'false');
      } else {
        it.style.display = 'none'; // hide
        it.setAttribute('aria-hidden', 'true');
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter || 'all';
      applyFilter(f);
    });

    // keyboard accessible (Enter/Space)
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        btn.click();
      }
    });
  });

  // Initialize: set "all" active if none
  if (!filterBtns.some(b => b.classList.contains('active')) && filterBtns.length) {
    filterBtns[0].classList.add('active');
    applyFilter(filterBtns[0].dataset.filter || 'all');
  }

  // ---------- LIGHTBOX / MODAL ----------
  // Create modal elements dynamically so HTML stays clean.
  const modal = document.createElement('div');
  modal.className = 'vk-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.style.cssText = `
    position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.6); z-index:1200; padding:20px; visibility:hidden; opacity:0; transition:opacity .18s ease, visibility .18s;
  `;

  const modalInner = document.createElement('div');
  modalInner.style.cssText = `
    max-width:1100px; width:100%; max-height:90vh; overflow:auto; border-radius:10px; position:relative;
  `;
  modal.appendChild(modalInner);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position:absolute; right:12px; top:12px; background:transparent; border:0; font-size:20px; color:white; cursor:pointer; z-index:2;
  `;
  modalInner.appendChild(closeBtn);

  // Prev / Next
  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '◀';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.style.cssText = 'position:absolute; left:12px; top:50%; transform:translateY(-50%); background:transparent; border:0; font-size:28px; color:white; cursor:pointer; z-index:2;';

  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '▶';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.style.cssText = 'position:absolute; right:12px; top:50%; transform:translateY(-50%); background:transparent; border:0; font-size:28px; color:white; cursor:pointer; z-index:2;';

  modal.appendChild(prevBtn);
  modal.appendChild(nextBtn);

  // Content wrapper
  const contentWrap = document.createElement('div');
  contentWrap.style.cssText = 'width:100%; background:transparent; display:flex; align-items:center; justify-content:center;';
  modalInner.appendChild(contentWrap);

  // Append modal to body
  document.body.appendChild(modal);

  // Prepare list of portfolio elements (visible ones)
  let portfolioOrder = items; // will use the original NodeList order
  let currentIndex = -1;

  // Build an image element for the modal content
  const modalImg = document.createElement('img');
  modalImg.style.cssText = 'max-width:100%; max-height:85vh; border-radius:8px; display:block; box-shadow:0 12px 40px rgba(0,0,0,0.4);';
  contentWrap.appendChild(modalImg);

  // Optional caption
  const caption = document.createElement('div');
  caption.style.cssText = 'color:white; text-align:center; margin-top:10px; font-weight:600;';
  modalInner.appendChild(caption);

  function openModal(index) {
    if (index < 0 || index >= portfolioOrder.length) return;
    currentIndex = index;
    const el = portfolioOrder[currentIndex];
    // find the image inside the card
    const img = el.querySelector('img');
    const titleEl = el.querySelector('.card-title');
    modalImg.src = img ? img.src : '';
    modalImg.alt = img ? img.alt : '';
    caption.textContent = titleEl ? titleEl.textContent : '';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.setAttribute('aria-hidden', 'false');
    // focus management: move focus to close button
    closeBtn.focus();
    // disable background scroll
    document.documentElement.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    // return focus to the current portfolio item
    if (portfolioOrder[currentIndex]) portfolioOrder[currentIndex].focus();
    currentIndex = -1;
  }

  function showNext() {
    if (portfolioOrder.length === 0) return;
    currentIndex = (currentIndex + 1) % portfolioOrder.length;
    openModal(currentIndex);
  }

  function showPrev() {
    if (portfolioOrder.length === 0) return;
    currentIndex = (currentIndex - 1 + portfolioOrder.length) % portfolioOrder.length;
    openModal(currentIndex);
  }

  // Click handlers on items to open modal
  items.forEach((it, idx) => {
    // make sure item is keyboard focusable (article already has tabindex in HTML)
    it.addEventListener('click', (e) => {
      // compute index among currently visible items
      portfolioOrder = Array.from(document.querySelectorAll('.portfolio-item')).filter(n => n.style.display !== 'none');
      const visibleIndex = portfolioOrder.indexOf(it);
      if (visibleIndex >= 0) openModal(visibleIndex);
    });

    it.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        it.click();
      }
    });
  });

  // Modal controls
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (ev) => {
    // click outside content closes modal
    if (ev.target === modal) closeModal();
  });
  nextBtn.addEventListener('click', () => {
    portfolioOrder = Array.from(document.querySelectorAll('.portfolio-item')).filter(n => n.style.display !== 'none');
    showNext();
  });
  prevBtn.addEventListener('click', () => {
    portfolioOrder = Array.from(document.querySelectorAll('.portfolio-item')).filter(n => n.style.display !== 'none');
    showPrev();
  });

  // Keyboard navigation for modal
  document.addEventListener('keydown', (ev) => {
    const open = modal.getAttribute('aria-hidden') === 'false';
    if (!open) return;
    if (ev.key === 'Escape') {
      closeModal();
    } else if (ev.key === 'ArrowRight') {
      portfolioOrder = Array.from(document.querySelectorAll('.portfolio-item')).filter(n => n.style.display !== 'none');
      showNext();
    } else if (ev.key === 'ArrowLeft') {
      portfolioOrder = Array.from(document.querySelectorAll('.portfolio-item')).filter(n => n.style.display !== 'none');
      showPrev();
    }
  });

  // ---------- CONTACT FORM ----------
  const contactForm = document.getElementById('contact-form');
  const formNote = contactForm ? contactForm.querySelector('.form-note') : null;

  function showFormMessage(msg, ok = true) {
    if (!formNote) return;
    formNote.textContent = msg;
    formNote.style.color = ok ? 'green' : '#c53030';
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');

      // Basic validation
      if (!name.value.trim()) {
        showFormMessage('Please enter your name.', false);
        name.focus();
        return;
      }
      if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value)) {
        showFormMessage('Please enter a valid email address.', false);
        email.focus();
        return;
      }
      if (!message.value.trim() || message.value.trim().length < 10) {
        showFormMessage('Please provide a short message (min 10 characters).', false);
        message.focus();
        return;
      }

      // Simulate sending: (since no backend). Provide friendly UX.
      showFormMessage('Sending message...');
      // A real site would POST to an API endpoint. We'll simulate a short delay.
      setTimeout(() => {
        // success
        showFormMessage('Thanks! Your message has been sent. I will reply soon.');
        contactForm.reset();
        // Clear message after a while
        setTimeout(() => {
          if (formNote) formNote.textContent = '';
        }, 7000);
      }, 900);
    });
  }

  // ---------- YEAR FILL ----------
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ---------- Small accessibility styles toggles ----------
  // Add a CSS rule for nav open class to show nav on mobile (we didn't add it in CSS to keep things simple)
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    /* show nav when .open is present */
    #site-nav.open{ display:block !important; }
    /* visible modal */
    .vk-modal[aria-hidden="false"]{ visibility:visible !important; opacity:1 !important; }
  `;
  document.head.appendChild(styleTag);
});
