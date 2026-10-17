// site-script.js — Claymorphism Interactive Controller for Secondary Pages

(function () {
  const hamburger = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('sideDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const themeToggle = document.getElementById('themeToggle');
  const quickFab = document.getElementById('quickFab');
  const quickList = document.getElementById('quickList');
  const downloadBtn = document.getElementById('downloadApp');
  const useOnlineBtn = document.getElementById('useOnline');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawerFn() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      if (window.innerWidth <= 880) {
        if (drawer && drawer.classList.contains('open')) {
          closeDrawerFn();
        } else {
          openDrawer();
        }
      } else {
        document.getElementById('navMenu')?.classList.toggle('open');
      }
    });
  }

  if (closeDrawer) closeDrawer.addEventListener('click', () => {
    closeDrawerFn();
    hamburger?.classList.remove('active');
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (drawer && drawer.classList.contains('open') && !drawer.contains(e.target) && !hamburger?.contains(e.target)) {
      closeDrawerFn();
      hamburger?.classList.remove('active');
    }
  });

  // Theme toggle with persistence
  const THEME_KEY = 'jinnie_theme';
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      if (themeToggle) {
        themeToggle.textContent = '☀️';
        themeToggle.title = 'Switch to light mode';
      }
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      if (themeToggle) {
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Switch to dark mode';
      }
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
    });
  }

  // Quick FAB
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

  document.getElementById('quickInvite')?.addEventListener('click', () => {
    const inviteInput = document.getElementById('invite-url');
    const url = inviteInput?.value || window.location.href;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => alert('Invite link copied!'));
    } else {
      const temp = document.createElement('input');
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      alert('Invite link copied!');
    }
    quickList?.classList.add('hidden');
    quickFab?.classList.remove('active');
  });

  document.getElementById('quickDownload')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = document.getElementById('downloadLink')?.value || 'app/Jinnie-Chats-v2.apk';
    a.download = 'Jinnie-Chats-v2.apk';
    a.click();
    quickList?.classList.add('hidden');
    quickFab?.classList.remove('active');
  });

  document.getElementById('quickContact')?.addEventListener('click', () => {
    window.open('https://www.instagram.com/karshsecurities/', '_blank', 'noopener,noreferrer');
    quickList?.classList.add('hidden');
    quickFab?.classList.remove('active');
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = document.getElementById('downloadLink')?.value || 'app/Jinnie-Chats-v2.apk';
      a.download = 'Jinnie-Chats-v2.apk';
      a.click();
    });
  }

  if (useOnlineBtn) {
    useOnlineBtn.addEventListener('click', () => {
      window.location.href = 'chat.html';
    });
  }

  // Close drawer on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawer && drawer.classList.contains('open')) {
        closeDrawerFn();
        hamburger?.classList.remove('active');
      }
      if (quickList) {
        quickList.classList.add('hidden');
        quickFab?.classList.remove('active');
      }
    }
  });

  // Footer Year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

})();