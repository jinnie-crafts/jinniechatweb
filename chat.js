// chat.js — Claymorphism Realtime Chat Controller with Mobile Keyboard Ergonomics

// Connect to backend server (auto-detecting host or connecting to live Render deployment)
const BACKEND_URL = (window.location.origin.includes('onrender.com')) 
  ? undefined 
  : 'https://jinniechat.onrender.com';

const socket = io(BACKEND_URL, { 
  reconnection: true, 
  reconnectionAttempts: Infinity, 
  reconnectionDelay: 1000 
});

// DOM Elements
const splash = document.getElementById("splash-screen");
const usernameModal = document.getElementById("username-modal");
const usernameInput = document.getElementById("username-input");
const usernameBtn = document.getElementById("username-btn");

const roomModal = document.getElementById("room-modal");
const createSection = document.getElementById("create-section");
const newRoomInput = document.getElementById("new-room-input");
const newRoomPassword = document.getElementById("new-room-password");
const newRoomBtn = document.getElementById("new-room-btn");

const roomList = document.getElementById("room-list");
const joinPasswordContainer = document.getElementById("join-password-container");
const joinRoomPassword = document.getElementById("join-room-password");
const joinRoomBtn = document.getElementById("join-room-btn");
const passwordAlert = document.getElementById("password-alert");

const chatWrapper = document.querySelector(".chat-wrapper");
const chatBody = document.getElementById("chat-body");
const chatSubtitle = document.getElementById("chat-subtitle");
const statusBar = document.getElementById("status-bar");

const typingIndicator = document.getElementById("typing-indicator");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const fileBtn = document.getElementById("file-btn");
const fileInput = document.getElementById("file-input");

const inviteBtn = document.getElementById("invite-btn");
const inviteModal = document.getElementById("inviteModal");
const closeInvite = document.getElementById("close-invite");
const inviteUrlInput = document.getElementById("invite-url");
const copyBtn = document.getElementById("copy-btn");

const toast = document.getElementById("toast");

let username = null;
let room = null;
let typingTimeout = null;
let hasSubscribedForPush = false;

/* ==========================================================================
   MOBILE VIRTUAL KEYBOARD & VISUAL VIEWPORT ADAPTATION
   ========================================================================== */
function isNearBottom(threshold = 120) {
  if (!chatBody) return true;
  return (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight) <= threshold;
}

function scrollToBottom(smooth = false) {
  if (!chatBody) return;
  if (smooth) {
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
  } else {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

// VisualViewport synchronization for iOS Safari & Android Chrome
function updateViewportMetrics() {
  if (window.visualViewport) {
    const vh = window.visualViewport.height;
    document.documentElement.style.setProperty('--vvh', `${vh}px`);
    if (chatWrapper && !chatWrapper.classList.contains('hidden')) {
      chatWrapper.style.height = `${vh}px`;
      window.scrollTo(0, 0);
      
      // If user was reading recent messages, keep bottom anchored
      if (isNearBottom()) {
        requestAnimationFrame(() => scrollToBottom(false));
      }
    }
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateViewportMetrics);
  window.visualViewport.addEventListener('scroll', updateViewportMetrics);
  updateViewportMetrics();
}

// Focus handling for on-screen keyboard appearance
if (messageInput) {
  messageInput.addEventListener('focus', () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (isNearBottom()) {
        scrollToBottom(true);
      }
    }, 180);
  });
}

/* Splash Screen Fade-out */
window.addEventListener("load", () => {
  setTimeout(() => {
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => { splash.style.display = "none"; }, 550);
    }
  }, 500);
});

/* Toast Utility */
function showToast(msg, time = 1800) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.classList.add("hidden"); }, 280);
  }, time);
}

function formatTime(date) {
  const d = new Date(date);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/* Password Visibility Toggle */
window.togglePassword = function(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.type = el.type === "password" ? "text" : "password";
};

/* Room List Updates */
socket.on('room list', rooms => {
  if (!roomList) return;
  roomList.innerHTML = '';
  if (!rooms || rooms.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No active rooms yet — create one above!';
    li.style.cursor = 'default';
    roomList.appendChild(li);
    return;
  }
  rooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    roomList.appendChild(li);
  });
});

function showRoomModal() {
  if (!roomModal) return;
  roomModal.classList.remove("hidden");
  joinPasswordContainer.classList.add("hidden");
  createSection.style.display = "";
  newRoomBtn.style.display = "";
  passwordAlert.classList.add("hidden");
}

function showChatInterface() {
  if (!chatWrapper) return;
  roomModal.classList.add("hidden");
  usernameModal.classList.add("hidden");
  chatWrapper.classList.remove("hidden");
  if (window.visualViewport) {
    chatWrapper.style.height = `${window.visualViewport.height}px`;
  }
  scrollToBottom(false);
  setTimeout(() => { 
    if (window.innerWidth > 600) {
      messageInput.focus(); 
    }
  }, 200);
}

/* Username Flow */
(function initUsernameFlow() {
  const params = new URLSearchParams(window.location.search);
  const r = params.get('room');

  if (r) {
    usernameModal.classList.remove("hidden");
    usernameBtn.onclick = () => {
      const name = usernameInput.value.trim();
      if (!name) { showToast('Please enter your name'); return; }
      username = name;
      usernameModal.classList.add("hidden");
      roomModal.classList.remove("hidden");
      newRoomInput.value = r;
      createSection.style.display = 'none';
      newRoomBtn.style.display = 'none';
      joinPasswordContainer.classList.remove('hidden');
      passwordAlert.classList.add('hidden');
      joinRoomBtn.onclick = () => {
        const pwd = joinRoomPassword.value.trim();
        if (!pwd) { showToast('Enter room password'); return; }
        socket.emit('join room request', r, pwd, username);
      };
    };
    return;
  }

  usernameModal.classList.remove("hidden");
  usernameBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) { showToast('Please enter your name'); return; }
    username = name;
    usernameModal.classList.add("hidden");
    showRoomModal();
  };

  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') usernameBtn.click();
  });
})();

/* Create Room */
newRoomBtn.addEventListener('click', () => {
  const r = newRoomInput.value.trim();
  const p = newRoomPassword.value.trim();
  if (!r || !p) { showToast('Room name and password required'); return; }
  if (!socket.connected) {
    showToast('Connecting to server...');
    setTimeout(() => {
      if (!room && (!socket.connected || !roomModal.classList.contains('hidden'))) {
        room = r;
        chatSubtitle.textContent = `Room: ${room} • ${username}`;
        showChatInterface();
        addSystemMessage(`Entered room "${room}" (Live server reconnecting in background)`);
      }
    }, 1500);
  }
  socket.emit('create room', r, p, username);
});

newRoomPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') newRoomBtn.click();
});

/* Click Room List to Join */
roomList.addEventListener('click', e => {
  if (e.target && e.target.tagName === 'LI') {
    const selected = e.target.textContent.replace('Join →', '').trim();
    if (selected.includes('No active rooms')) return;
    newRoomInput.value = selected;
    createSection.style.display = 'none';
    newRoomBtn.style.display = 'none';
    joinPasswordContainer.classList.remove('hidden');
    passwordAlert.classList.add('hidden');
    joinRoomPassword.focus();
    joinRoomBtn.onclick = () => {
      const pwd = joinRoomPassword.value.trim();
      if (!pwd) { showToast('Enter password'); return; }
      if (!socket.connected) {
        showToast('Connecting to server...');
        setTimeout(() => {
          if (!room && (!socket.connected || !roomModal.classList.contains('hidden'))) {
            room = selected;
            chatSubtitle.textContent = `Room: ${room} • ${username}`;
            showChatInterface();
            addSystemMessage(`Entered room "${room}" (Live server reconnecting in background)`);
          }
        }, 1500);
      }
      socket.emit('join room request', selected, pwd, username);
    };
  }
});

joinRoomPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinRoomBtn.click();
});

/* Room Socket Responses */
socket.on('no such room', () => showToast('Room does not exist'));
socket.on('wrong password', () => {
  passwordAlert.textContent = 'Incorrect password, please try again';
  passwordAlert.classList.remove('hidden');
});

socket.on('room joined', roomName => {
  room = roomName;
  chatSubtitle.textContent = `Room: ${room} • ${username}`;
  showChatInterface();
  addSystemMessage(`You entered room "${room}"`);
});

/* Chat Rendering */
function addSystemMessage(text) {
  const el = document.createElement('div');
  el.className = 'message system';
  el.innerHTML = `<em>${escapeHtml(text)}</em>`;
  chatBody.appendChild(el);
  if (isNearBottom()) scrollToBottom(true);
}

function addMessage(user, text, timeStamp) {
  const isMine = user === username;
  const wasAtBottom = isNearBottom();

  const el = document.createElement('div');
  el.className = 'message ' + (isMine ? 'user' : 'other');
  const time = timeStamp ? formatTime(timeStamp) : formatTime(new Date());
  el.innerHTML = `<strong>${escapeHtml(user)}</strong><div>${escapeHtml(text)}</div><div class="timestamp">${time}</div>`;
  chatBody.appendChild(el);

  // Auto-scroll if it's my own message or if user is already near bottom
  if (isMine || wasAtBottom) {
    scrollToBottom(true);
  }
}

function addFileMessage(user, data) {
  const isMine = user === username;
  const wasAtBottom = isNearBottom();

  const el = document.createElement('div');
  el.className = 'message ' + (isMine ? 'user' : 'other');
  let content = '';
  if (data.fileType && data.fileType.startsWith('image/')) {
    content = `<img src="${data.fileData}" class="chat-image" alt="${escapeHtml(data.fileName)}" onclick="window.open('${data.fileData}')">`;
  } else {
    content = `<a href="${data.fileData}" class="chat-file-link" download="${encodeURIComponent(data.fileName)}"><i class="fas fa-file-download"></i> ${escapeHtml(data.fileName)}</a>`;
  }
  const time = formatTime(new Date());
  el.innerHTML = `<strong>${escapeHtml(user)}</strong><div>${content}</div><div class="timestamp">${time}</div>`;
  chatBody.appendChild(el);

  if (isMine || wasAtBottom) {
    scrollToBottom(true);
  }
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* Socket Handlers for Chat Messages & History */
socket.on('chat message', data => {
  if (!data) return;
  if (data.type === 'text') addMessage(data.user, data.text, data.time);
  else addMessage(data.user, data.text || '');
});

socket.on('file message', data => addFileMessage(data.user || 'Unknown', data));

socket.on('chat history', history => {
  if (!history || !history.length) return;
  chatBody.innerHTML = '';
  history.forEach(h => {
    if (h.type === 'text') addMessage(h.user, h.text, h.time);
    else addFileMessage(h.user, h);
  });
  scrollToBottom(false);
});

/* Typing Indicator */
socket.on('typing', user => {
  if (user === username) return;
  const textSpan = typingIndicator.querySelector('#typing-text') || typingIndicator;
  textSpan.textContent = `${user} is typing`;
  typingIndicator.classList.remove('hidden');
});

socket.on('stop typing', user => {
  if (user === username) return;
  typingIndicator.classList.add('hidden');
});

/* Sending Messages */
if (sendBtn) {
  // Prevent keyboard from dismissing on touch/click of send button
  const keepInputFocus = (e) => {
    if (document.activeElement === messageInput) {
      e.preventDefault();
    }
  };
  sendBtn.addEventListener('mousedown', keepInputFocus);
  sendBtn.addEventListener('pointerdown', keepInputFocus);
}

sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (!msg) return;
  socket.emit('chat message', msg);
  messageInput.value = '';
  socket.emit('stop typing', username);
  // Keep focus on input so the virtual keyboard stays open
  messageInput.focus();
  if (isNearBottom()) {
    scrollToBottom(true);
  }
});

messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  } else {
    socket.emit('typing', username);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('stop typing', username), 900);
  }
});

/* File Upload */
fileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const data = { fileName: file.name, fileType: file.type, fileData: reader.result };
    addFileMessage(username, data);
    socket.emit('file upload', data);
  };
  reader.readAsDataURL(file);
});

/* Invite Modal */
function setInviteUrl() {
  if (!room) return;
  inviteUrlInput.value = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
}

inviteBtn.addEventListener('click', () => {
  setInviteUrl();
  inviteModal.classList.remove('hidden');
});

closeInvite.addEventListener('click', () => inviteModal.classList.add('hidden'));

copyBtn.addEventListener('click', async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(inviteUrlInput.value);
    } else {
      inviteUrlInput.select();
      document.execCommand('copy');
    }
    inviteModal.classList.add('hidden');
    showToast('Invite link copied!');
  } catch {
    showToast('Copy failed');
  }
});

/* Connection Status */
socket.on('connect_error', () => {
  statusBar.textContent = '⚠️ Server unreachable — reconnecting...';
  statusBar.classList.add('show');
});

socket.on('disconnect', () => {
  statusBar.textContent = '⚠️ Disconnected — trying to reconnect...';
  statusBar.classList.add('show');
});

socket.on('connect', () => {
  statusBar.classList.remove('show');
});

/* Share Popups & Options */
const sharePopup = document.getElementById("shareOptionsPopup");
const shareBtn = document.getElementById("share-options-btn");
const popupWA = document.getElementById("popup-whatsapp");
const popupTG = document.getElementById("popup-telegram");
const popupSMS = document.getElementById("popup-sms");
const popupCOPY = document.getElementById("popup-copy");

function getInviteLink() {
  return inviteUrlInput?.value || `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room || '')}`;
}

if (shareBtn && sharePopup) {
  shareBtn.addEventListener("click", () => {
    sharePopup.classList.add("show");
    sharePopup.classList.remove("hidden");
  });

  sharePopup.querySelector(".share-cancel")?.addEventListener("click", () => {
    sharePopup.classList.remove("show");
    setTimeout(() => sharePopup.classList.add("hidden"), 280);
  });
}

function shareWhatsApp() {
  const link = getInviteLink();
  const msg = encodeURIComponent(`Join me on Jinnie Chat:\n${link}`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}
popupWA?.addEventListener("click", shareWhatsApp);
document.getElementById("invite-wa-btn")?.addEventListener("click", shareWhatsApp);

function shareTelegram() {
  const link = getInviteLink();
  const msg = encodeURIComponent(`Join me on Jinnie Chat:\n${link}`);
  window.open(`https://t.me/share/url?url=${link}&text=${msg}`, '_blank');
}
popupTG?.addEventListener("click", shareTelegram);
document.getElementById("invite-tg-btn")?.addEventListener("click", shareTelegram);

function shareSMS() {
  const link = getInviteLink();
  const msg = encodeURIComponent(`Hey! Join me on Jinnie Chat:\n${link}`);
  window.location.href = `sms:?body=${msg}`;
}
popupSMS?.addEventListener("click", shareSMS);
document.getElementById("invite-sms-btn")?.addEventListener("click", shareSMS);

popupCOPY?.addEventListener("click", () => {
  const link = getInviteLink();
  navigator.clipboard.writeText(link);
  showToast("Link copied to clipboard!");
  sharePopup?.classList.remove("show");
  setTimeout(() => sharePopup?.classList.add("hidden"), 280);
});
