// landing.js — Clean Production Version

document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     Utility
  =============================== */

  const $ = (id) => document.getElementById(id);

  function showToast(message) {
    const toast = $('landingToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1700);
  }

  /* ===============================
     Footer Year
  =============================== */

  const yearEl = $('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===============================
     Download Modal
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
  }

  function closeModal() {
    if (!downloadModal) return;
    downloadModal.classList.add('hidden');
    downloadModal.setAttribute('aria-hidden', 'true');
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
    if (e.key === 'Escape') closeModal();
  });

  /* ===============================
     Copy Download Link
  =============================== */

  const copyDownload = $('copyDownload');
  const downloadLinkInput = $('downloadLink');

  if (copyDownload && downloadLinkInput) {
    copyDownload.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(downloadLinkInput.value);
        showToast('Download link copied');
      } catch {
        downloadLinkInput.select();
        document.execCommand('copy');
        showToast('Copied');
      }
    });
  }

  /* ===============================
     Quick Floating Menu
  =============================== */

  const quickFab = $('quickFab');
  const quickList = $('quickList');
  const quickInvite = $('quickInvite');
  const quickDownload = $('quickDownload');
  const quickContact = $('quickContact');

  if (quickFab && quickList) {
    quickFab.addEventListener('click', () => {
      quickList.classList.toggle('hidden');
      quickFab.classList.toggle('active');
    });
  }

  if (quickInvite) {
    quickInvite.addEventListener('click', async () => {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        showToast('Invite link copied');
      } catch {
        showToast('Copy failed');
      }
      quickList?.classList.add('hidden');
    });
  }

  if (quickDownload) {
    quickDownload.addEventListener('click', () => {
      openModal();
      quickList?.classList.add('hidden');
    });
  }

  if (quickContact) {
    quickContact.addEventListener('click', () => {
      window.open('https://www.instagram.com/karshsecurities/', '_blank');
      quickList?.classList.add('hidden');
    });
  }

});
