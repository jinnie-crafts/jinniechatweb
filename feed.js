/* ==========================================================================
   FEEDBACK SYSTEM CONTROLLER — MOBILE-OPTIMIZED
   Draggable Tab • Web3Forms Submission • Responsive Dialogs
   ========================================================================== */

const feedbackModal = document.getElementById('feedback-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const mainMenu = document.getElementById('main-menu');
const internalPages = document.querySelectorAll('.internal-page');
const feedbackTab = document.getElementById('feedback-tab');

// --- MODAL & MENU NAVIGATION ---
function toggleModal(open) {
  if (!feedbackModal) return;
  if (open) {
    feedbackModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock body scroll when modal is open
    showMenu();
  } else {
    feedbackModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showMenu() {
  if (mainMenu) mainMenu.style.display = 'block';
  internalPages.forEach(page => {
    page.style.display = 'none';
  });
}

function showPage(pageId) {
  if (mainMenu) mainMenu.style.display = 'none';
  internalPages.forEach(page => {
    page.style.display = 'none';
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.style.display = 'block';
}

function showConfirmation(title, message) {
  if (!confirmationModal) return;
  if (title && message) {
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    confirmationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    confirmationModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Global click handler to dismiss modals when clicking backdrop
window.addEventListener('click', function(event) {
  if (event.target === feedbackModal) {
    toggleModal(false);
  }
  if (event.target === confirmationModal) {
    showConfirmation(false);
  }
});

// Escape key to dismiss modals
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    if (feedbackModal && feedbackModal.classList.contains('active')) {
      toggleModal(false);
    }
    if (confirmationModal && confirmationModal.classList.contains('active')) {
      showConfirmation(false);
    }
  }
});

// --- DRAGGABLE FEEDBACK TAB (Mouse & Touch Ergonomics) ---
let isDragging = false;
let startX, startY, initialX, initialY;
const clickThreshold = 8;
let hasMoved = false;

function startDrag(e) {
  if (!feedbackTab) return;
  if (e.target.closest('.modal-content')) return;

  const rect = feedbackTab.getBoundingClientRect();
  feedbackTab.style.left = rect.left + 'px';
  feedbackTab.style.top = rect.top + 'px';
  feedbackTab.style.right = 'auto';
  feedbackTab.style.bottom = 'auto';

  isDragging = true;
  hasMoved = false;
  feedbackTab.classList.add('is-dragging');

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  startX = clientX;
  startY = clientY;
  initialX = rect.left;
  initialY = rect.top;

  document.addEventListener('mousemove', onDrag, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
  if (!isDragging || !feedbackTab) return;

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  const dx = clientX - startX;
  const dy = clientY - startY;

  if (Math.abs(dx) > clickThreshold || Math.abs(dy) > clickThreshold) {
    hasMoved = true;
    if (e.cancelable) e.preventDefault(); // Stop unwanted page scroll only when actively dragging
  }

  if (hasMoved) {
    let newX = initialX + dx;
    let newY = initialY + dy;

    const rect = feedbackTab.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    feedbackTab.style.left = newX + 'px';
    feedbackTab.style.top = newY + 'px';
  }
}

function stopDrag() {
  if (!isDragging || !feedbackTab) return;
  isDragging = false;
  feedbackTab.classList.remove('is-dragging');

  // Snap back to right edge resting position
  feedbackTab.style.left = 'auto';
  feedbackTab.style.top = '60%';
  feedbackTab.style.right = '1px';
  feedbackTab.style.bottom = 'auto';
  feedbackTab.style.transform = 'translateY(-50%) rotate(90deg)';

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);

  if (!hasMoved) {
    toggleModal(true);
  }
  hasMoved = false;
}

if (feedbackTab) {
  feedbackTab.addEventListener('touchstart', startDrag, { passive: true });
}

// --- FORM SUBMISSION VIA WEB3FORMS ---
function submitForm(type, event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  toggleModal(false);

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }

    if (data.success) {
      form.reset();
      if (type === 'bug') {
        showConfirmation(
          "Bug Report Received!",
          "Thank you for reporting this issue. Our team is now investigating and working on a resolution."
        );
      } else if (type === 'suggestion') {
        showConfirmation(
          "Idea Logged!",
          "Your suggestion has been added to our roadmap for review. Thank you for helping us improve Jinnie Chat!"
        );
      }
    } else {
      showConfirmation(
        "Submission Failed",
        data.message || "There was an error sending the data. Please try again later."
      );
    }
  })
  .catch(error => {
    console.error('Network Error:', error);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
    showConfirmation(
      "Connection Error",
      "Could not connect to the submission server. Please check your internet connection."
    );
  });
}