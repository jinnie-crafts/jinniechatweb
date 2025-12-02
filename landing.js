// landing.js — small interactive behavior for landing page

document.addEventListener('DOMContentLoaded', () => {

  // Year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Modal elements
  const downloadModal = document.getElementById('downloadModal');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtn2 = document.getElementById('downloadBtn2');
  const downloadBtn3 = document.getElementById('downloadBtn3');
  const closeDownload = document.getElementById('closeDownload');
  const copyDownload = document.getElementById('copyDownload');
  const downloadLinkInput = document.getElementById('downloadLink');
  const toast = document.getElementById('landingToast');

  function openModal() {
    downloadModal.classList.remove('hidden');
    downloadModal.setAttribute('aria-hidden', 'false');
    // small entrance animation
    downloadModal.querySelector('.modal-card').style.transform = 'translateY(6px)';
  }
  function closeModal() {
    downloadModal.classList.add('hidden');
    downloadModal.setAttribute('aria-hidden', 'true');
  }

  [downloadBtn, downloadBtn2, downloadBtn3].forEach(btn => {
    if (btn) btn.addEventListener('click', openModal);
  });

  if (closeDownload) closeDownload.addEventListener('click', closeModal);
  downloadModal.addEventListener('click', (e) => {
    if (e.target === downloadModal) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Copy download link
  if (copyDownload) {
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

  // Small shared toast utility
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1700);
  }

  // Share buttons (invite via WhatsApp / Telegram / SMS)
  function getDownloadLink() {
    return downloadLinkInput.value || window.location.href;
  }

  const inviteWA = document.getElementById('invite-wa-btn');
  const inviteTG = document.getElementById('invite-tg-btn');
  const inviteSMS = document.getElementById('invite-sms-btn');
  const copyBtn = document.getElementById('copy-btn');

  if (inviteWA) inviteWA.addEventListener('click', () => {
    const m = encodeURIComponent(`Join me on Jinnie Chat: ${getDownloadLink()}`);
    window.open(`https://wa.me/?text=${m}`, '_blank');
  });
  if (inviteTG) inviteTG.addEventListener('click', () => {
    const link = encodeURIComponent(getDownloadLink());
    const text = encodeURIComponent('Join me on Jinnie Chat:');
    window.open(`https://t.me/share/url?url=${link}&text=${text}`, '_blank');
  });
  if (inviteSMS) inviteSMS.addEventListener('click', () => {
    const body = encodeURIComponent(`Hey! Join Jinnie Chat: ${getDownloadLink()}`);
    window.location.href = `sms:?body=${body}`;
    setTimeout(() => { window.location.href = `sms:&body=${body}`; }, 300);
  });
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(getDownloadLink()); showToast('Invite link copied'); } catch { showToast('Copy failed'); }
  });

  // Store button opens external links (play store / apk). If absent, hide gracefully.
  const playStoreBtn = document.getElementById('playStoreBtn');
  if (!playStoreBtn) {
    // nothing
  }

});





 quickFab && quickFab.addEventListener('click', ()=>{
    quickList.classList.toggle('hidden');
    quickFab.classList.toggle('active');
  });

  document.getElementById('quickInvite')?.addEventListener('click', ()=>{
    const inviteInput = document.getElementById('invite-url');
    const url = inviteInput?.value || window.location.href;
    navigator.clipboard.writeText(url).then(()=> alert('Invite link copied!'));
    quickList.classList.add('hidden');
  });
  document.getElementById('quickDownload')?.addEventListener('click', ()=>{
    const a = document.createElement('a');
    a.href = document.getElementById('downloadLink1')?.value || '/app/Jinnie-Chats-v2.apk';
    a.target = '_blank';
    a.click();
    quickList.classList.add('hidden');
  });
  document.getElementById('quickContact')?.addEventListener('click', ()=>{
    window.location.href = 'mailto:karshsecurities@gmail.com';
  });

  downloadBtn && downloadBtn.addEventListener('click', ()=>{
    window.location.href = document.getElementById('downloadLink1')?.value || '/app/Jinnie-Chats-v2.apk';
  });
  useOnlineBtn && useOnlineBtn.addEventListener('click', ()=>{
    window.open('/', '_blank');
  });

  // close drawer on Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && drawer.classList.contains('open')){ closeDrawerFn(); hamburger.classList.remove('active'); }
  });
