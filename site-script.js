
// site-script.js - drawer, dark mode, quick menu
(function(){
  const hamburger = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('sideDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const themeToggle = document.getElementById('themeToggle');
  const quickFab = document.getElementById('quickFab');
  const quickList = document.getElementById('quickList');
  const downloadBtn = document.getElementById('downloadApp');
  const useOnlineBtn = document.getElementById('useOnline');

  function openDrawer(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
  function closeDrawerFn(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }

  hamburger && hamburger.addEventListener('click', ()=>{
    hamburger.classList.toggle('active');
    if(window.innerWidth <= 880){
      if(drawer.classList.contains('open')) closeDrawerFn(); else openDrawer();
    } else {
      // toggle nav on wide screens (if needed)
      document.getElementById('navMenu')?.classList.toggle('open');
    }
  });

  closeDrawer && closeDrawer.addEventListener('click', closeDrawerFn);

  // close drawer when clicking outside
  document.addEventListener('click', (e)=>{
    if(drawer && drawer.classList.contains('open') && !drawer.contains(e.target) && !hamburger.contains(e.target)){
      closeDrawerFn();
      hamburger.classList.remove('active');
    }
  });

  // Theme toggle with persistence
  const THEME_KEY = 'jinnie_theme';
  function applyTheme(t){
    if(t === 'dark'){ document.documentElement.classList.add('dark'); themeToggle.textContent = '☀️'; }
    else { document.documentElement.classList.remove('dark'); themeToggle.textContent = '🌙'; }
  }
  const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);

  themeToggle && themeToggle.addEventListener('click', ()=>{
    const now = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(now);
    localStorage.setItem(THEME_KEY, now);
  });

  // Quick FAB
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
    a.href = document.getElementById('downloadLink')?.value || '/app/Jinnie-Chats-v2.apk';
    a.target = '_blank';
    a.click();
    quickList.classList.add('hidden');
  });
  document.getElementById('quickContact')?.addEventListener('click', ()=>{
    window.location.href = 'mailto:karshsecurities@gmail.com';
  });

  downloadBtn && downloadBtn.addEventListener('click', ()=>{
    window.location.href = document.getElementById('downloadLink')?.value || '/app/Jinnie-Chats-v2.apk';
  });
  useOnlineBtn && useOnlineBtn.addEventListener('click', ()=>{
    window.open('/', '_blank');
  });

  // close drawer on Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && drawer.classList.contains('open')){ closeDrawerFn(); hamburger.classList.remove('active'); }
  });

})();
