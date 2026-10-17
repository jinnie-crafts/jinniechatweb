// landing.js — Advanced Motion Controller & Mobile Interaction Suite

document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     DOM Helpers
  =============================== */
  const $ = (id) => document.getElementById(id);

  /* ===============================
     Toast Utility
  =============================== */
  function showToast(message) {
    const toast = $('landingToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 280);
    }, 2200);
  }

  /* ===============================
     Footer Year
  =============================== */
  const yearEl = $('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===============================
     Download Modal Handling
  =============================== */
  const downloadModal = $('downloadModal');
  const closeDownload = $('closeDownload');
  const downloadButtons = [
    $('downloadBtn'),
    $('downloadBtn2'),
    $('downloadBtn3'),
    $('downloadBtn4')
  ].filter(Boolean);

  function openModal() {
    if (!downloadModal) return;
    downloadModal.classList.remove('hidden');
    downloadModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling on mobile
  }

  function closeModal() {
    if (!downloadModal) return;
    downloadModal.classList.add('hidden');
    downloadModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  downloadButtons.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (closeDownload) closeDownload.addEventListener('click', closeModal);

  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (quickList) {
        quickList.classList.add('hidden');
        quickFab?.classList.remove('active');
      }
    }
  });

  /* ===============================
     Copy Download Link
  =============================== */
  const copyDownload = $('copyDownload');
  const downloadLinkInput = $('downloadLink');

  if (copyDownload && downloadLinkInput) {
    copyDownload.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(downloadLinkInput.value);
        } else {
          downloadLinkInput.select();
          document.execCommand('copy');
        }
        showToast('Download link copied!');
      } catch {
        downloadLinkInput.select();
        document.execCommand('copy');
        showToast('Link copied!');
      }
    });
  }

  /* ===============================
     Quick Floating Action Menu
  =============================== */
  const quickFab = $('quickFab');
  const quickList = $('quickList');
  const quickInvite = $('quickInvite');
  const quickDownload = $('quickDownload');
  const quickContact = $('quickContact');

  if (quickFab && quickList) {
    quickFab.addEventListener('click', (e) => {
      e.stopPropagation();
      quickList.classList.toggle('hidden');
      quickFab.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!quickFab.contains(e.target) && !quickList.contains(e.target)) {
        quickList.classList.add('hidden');
        quickFab.classList.remove('active');
      }
    });
  }

  if (quickInvite) {
    quickInvite.addEventListener('click', async () => {
      const url = window.location.href;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const temp = document.createElement('input');
          temp.value = url;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }
        showToast('Invite link copied!');
      } catch {
        showToast('Copy failed');
      }
      quickList?.classList.add('hidden');
      quickFab?.classList.remove('active');
    });
  }

  if (quickDownload) {
    quickDownload.addEventListener('click', () => {
      openModal();
      quickList?.classList.add('hidden');
      quickFab?.classList.remove('active');
    });
  }

  if (quickContact) {
    quickContact.addEventListener('click', () => {
      window.open('https://www.instagram.com/karshsecurities/', '_blank', 'noopener,noreferrer');
      quickList?.classList.add('hidden');
      quickFab?.classList.remove('active');
    });
  }

  /* ===============================
     Advanced Motion Choreography & Scroll Reveals
  =============================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.motion-reveal, .motion-fade-in, .motion-scale-up');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Immediate reveal for reduced-motion or unsupported environments
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    // Initial entrance sequence for above-the-fold elements
    const heroElements = document.querySelectorAll('.hero .motion-reveal');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('is-visible');
      }, 100 + index * 120);
    });

    // Observer for scroll-linked reveals
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => {
      if (!el.closest('.hero')) {
        observer.observe(el);
      }
    });
  }

});
