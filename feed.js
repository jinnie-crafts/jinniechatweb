   const feedbackModal = document.getElementById('feedback-modal');
        const confirmationModal = document.getElementById('confirmation-modal');
        const mainMenu = document.getElementById('main-menu');
        const internalPages = document.querySelectorAll('.internal-page');
        const feedbackTab = document.getElementById('feedback-tab');
        
        // --- FORM SUBMISSION LOGIC ---
        function submitForm(type, event) {
            event.preventDefault(); // Stop the default form submission

            // Close the main feedback modal
            toggleModal(false);

            if (type === 'bug') {
                // Simulate data processing (in a real app, this would be an AJAX call)
                document.getElementById('bug-report').querySelector('form').reset();
                showConfirmation(
                    "Bug Report Received!", 
                    "Thank you for reporting this issue. We are now working on a fix."
                );
            } else if (type === 'suggestion') {
                // Simulate data processing
                document.getElementById('suggestion').querySelector('form').reset();
                showConfirmation(
                    "Idea Logged!", 
                    "Your suggestion has been added to our roadmap for review. Thanks for helping us improve!"
                );
            }
        }
        
        // --- CONFIRMATION MODAL LOGIC (NEW) ---
        function showConfirmation(title, message) {
            if (title && message) {
                document.getElementById('confirmation-title').textContent = title;
                document.getElementById('confirmation-message').textContent = message;
                confirmationModal.classList.add('active');
            } else {
                confirmationModal.classList.remove('active');
            }
        }

        // --- DRAGGABLE LOGIC (UNCHANGED) ---
        let isDragging = false;
        let startX, startY, initialX, initialY;
        const clickThreshold = 5;

        function startDrag(e) {
            if (e.target.closest('.modal-content')) return;
            isDragging = true;
            feedbackTab.style.cursor = 'grabbing';
            feedbackTab.style.left = feedbackTab.offsetLeft + 'px';
            feedbackTab.style.top = feedbackTab.offsetTop + 'px';
            feedbackTab.style.right = 'auto'; 
            startX = e.clientX;
            startY = e.clientY;
            initialX = feedbackTab.offsetLeft;
            initialY = feedbackTab.offsetTop;
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault(); 
        }

        function onDrag(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            feedbackTab.style.left = (initialX + dx) + 'px';
            feedbackTab.style.top = (initialY + dy) + 'px';
            if (Math.abs(dx) > clickThreshold || Math.abs(dy) > clickThreshold) {
                feedbackTab.dataset.moved = 'true';
            }
        }

        function stopDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            feedbackTab.style.cursor = 'grab';
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            const moved = feedbackTab.dataset.moved === 'true';
            if (!moved) {
                toggleModal(true);
            }
            feedbackTab.dataset.moved = 'false';
        }
        
        // --- MAIN MODAL & MENU LOGIC (Slightly modified) ---
        function toggleModal(open) {
            if (open) {
                feedbackModal.classList.add('active');
                showMenu();
            } else {
                feedbackModal.classList.remove('active');
            }
        }

        function showMenu() {
            mainMenu.style.display = 'block';
            internalPages.forEach(page => {
                page.style.display = 'none';
            });
        }

        function showPage(pageId) {
            mainMenu.style.display = 'none';
            internalPages.forEach(page => {
                page.style.display = 'none';
            });
            document.getElementById(pageId).style.display = 'block';
        }

        // Global click handler for closing modals outside content
        window.onclick = function(event) {
            if (event.target === feedbackModal) {
                toggleModal(false);
            }
            if (event.target === confirmationModal) {
                showConfirmation(false);
            }
        }

        //form data handling 
        // Function to handle form submission for both Bug and Suggestion
function submitForm(type, event) {
    event.preventDefault(); // Still needed to stop default, but now we manually submit via Fetch!

    const form = event.target;
    const formData = new FormData(form);

    // Close the main feedback modal immediately
    toggleModal(false); 
    
    // --- Manual Submission via Fetch to Web3Forms ---
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Log the response for debugging (check your browser console)
        console.log('Web3Forms Response:', data); 

        // Check if the submission was successful according to Web3Forms' API response
        if (data.success) {
            form.reset(); // Clear the form fields
            
            if (type === 'bug') {
                showConfirmation(
                    "Bug Report Received!", 
                    "Thank you for reporting this issue. We are now working on a fix."
                );
            } else if (type === 'suggestion') {
                showConfirmation(
                    "Idea Logged!", 
                    "Your suggestion has been added to our roadmap for review. Thanks for helping us improve!"
                );
            }
        } else {
            // Handle error response from the API (e.g., failed access key, etc.)
            showConfirmation(
                "Submission Failed",
                data.message || "There was an error sending the data. Please try again later."
            );
        }
    })
    .catch(error => {
        // Handle network errors (e.g., no internet connection)
        console.error('Network Error:', error);
        showConfirmation(
            "Connection Error", 
            "Could not connect to the submission server. Please check your internet connection."
        );
    });
}
        //form handling ends

        //hCaptcha integration
        // Variable to store the hCaptcha token globally
// let hcaptchaToken = null;

// // New function called by the hCaptcha widget upon successful verification
// function onhCaptchaSuccess(token) {
//     console.log("hCaptcha solved! Token received:", token);
//     hcaptchaToken = token;
// }

// // Function to handle form submission for both Bug and Suggestion
// function submitForm(type, event) {
//     event.preventDefault(); 

//     const form = event.target;
//     const formData = new FormData(form);

//     // 1. Check for hCaptcha Token
//     if (!hcaptchaToken) {
//         showConfirmation(
//             "Verification Required", 
//             "Please complete the hCaptcha challenge before submitting the form."
//         );
//         // Force the hCaptcha widget to display if it's not already visible
//         if (typeof hcaptcha !== 'undefined') {
//              hcaptcha.reset(); // Reset the challenge state
//              hcaptcha.execute(); // Explicitly show the challenge
//         }
//         return; // Stop the submission
//     }
    
//     // 2. Add the hCaptcha token to the form data
//     formData.append('h-captcha-response', hcaptchaToken);

//     // Close the main feedback modal immediately
//     toggleModal(false); 
    
//     // Reset hCaptcha token and visual widget immediately after starting submission
//     hcaptchaToken = null;
//     if (typeof hcaptcha !== 'undefined') {
//         hcaptcha.reset(); 
//     }
    
//     // --- Manual Submission via Fetch to Web3Forms ---
//     fetch('https://api.web3forms.com/submit', {
//         method: 'POST',
//         body: formData
//     })
//     // ... (rest of the fetch and .then/.catch error handling remains the same)
//     .then(response => response.json())
//     .then(data => {
//         // ... (Success/Failure logic)
//         if (data.success) {
//             form.reset(); 
//             if (type === 'bug') {
//                 showConfirmation(
//                     "Bug Report Received!", 
//                     "Thank you for reporting this issue. We are now working on a fix."
//                 );
//             } else if (type === 'suggestion') {
//                 showConfirmation(
//                     "Idea Logged!", 
//                     "Your suggestion has been added to our roadmap for review. Thanks for helping us improve!"
//                 );
//             }
//         } else {
//             // Check for explicit hCaptcha failure
//             const message = data.message || "There was an error sending the data. Please check your hCaptcha key.";
//             showConfirmation("Submission Failed", message);
//         }
//     })
//     .catch(error => {
//         console.error('Network Error:', error);
//         showConfirmation("Connection Error", "Could not connect to the submission server.");
//     });
// }
//         //hCaptcha integration ends