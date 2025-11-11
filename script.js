// Mobile menu toggle
document.querySelector('.mobile-menu').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission handling
document.getElementById('feedbackForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name') || 'Anonymous';
    const email = formData.get('email') || '';
    const message = formData.get('message');
    
    // Create feedback object
    const feedback = {
        name: name,
        email: email,
        message: message
    };
    
    // Submit to database via API
    submitFeedbackToDatabase(feedback);
});

// Function to submit feedback to database (NOW USES PHP)
async function submitFeedbackToDatabase(feedback) {
    try {
        // This is the API call to your backend
        const response = await fetch('api/submit_feedback.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedback) // Send the feedback object
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            // Backend was successful.
            // We use the data returned from the PHP script.
            
            // Re-format the 'created_at' (e.g., "2023-10-10 15:00:00")
            // to just 'date' (e.g., "2023-10-10") for display.
            const newFeedbackForDisplay = {
                ...result.data,
                date: result.data.created_at.split(' ')[0] 
            };

            // Add the new feedback to the display
            displaySingleFeedback(newFeedbackForDisplay);
            
            // Update feedback count
            updateFeedbackCount();
            
            // Reset form
            document.getElementById('feedbackForm').reset();
            
            // Show success message
            showNotification('Thank you for your feedback! Your voice helps shape our sanctuary.', 'success');
        
        } else {
            // Handle API-level errors (e.g., "Message is required")
            console.error('Error from API:', result.message);
            showNotification(result.message || 'Error submitting feedback.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error submitting feedback. Please try again.', 'error');
    }
}

// Function to fetch feedbacks from database (NOW USES PHP)
async function fetchFeedbacksFromDatabase() {
    try {
        // This is the API call to get_feedbacks.php
        // We'll ask for 6, as per your PHP script's default
        const response = await fetch('api/get_feedbacks.php?limit=6');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return result.data; // This will be an array (empty or with data)
        } else {
            console.error('Error from API:', result.message);
            return []; // Return empty on API error
        }
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        // Return empty array if fetch fails
        return [];
    }
}

// [REMOVED] The mock data function getSampleFeedbacks() is gone.

// Function to display a single feedback
function displaySingleFeedback(feedback) {
    const feedbackList = document.getElementById('feedbackList');
    const feedbackItem = createFeedbackElement(feedback);
    
    // Add to the top of the list
    if (feedbackList.firstChild) {
        feedbackList.insertBefore(feedbackItem, feedbackList.firstChild);
    } else {
        feedbackList.appendChild(feedbackItem);
    }
    
    // If this is the first feedback, remove the empty state message
    const emptyState = feedbackList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

// Function to create feedback element
function createFeedbackElement(feedback) {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.innerHTML = `
        <h4>${feedback.name}</h4>
        <p>${feedback.message}</p>
        <div class="feedback-date">${formatDate(feedback.date)}</div>
    `;
    return feedbackItem;
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Create date object, ensuring it doesn't shift timezones
    const date = new Date(dateString.replace(/-/g, '\/').replace(/ /g, 'T'));
    return date.toLocaleDateString('en-US', options);
}

// Function to display all feedbacks
function displayFeedbacks(feedbacks) {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = ''; // Clear existing feedbacks
    
    if (feedbacks.length === 0) {
        feedbackList.innerHTML = '<div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-light);"><p>No feedbacks yet. Be the first to share your experience!</p></div>';
        // Make sure count is 0 if list is empty
        updateFeedbackCount(0); 
        return;
    }
    
    feedbacks.forEach(feedback => {
        const feedbackItem = createFeedbackElement(feedback);
        feedbackList.appendChild(feedbackItem);
    });
    
    // Update feedback count
    updateFeedbackCount(feedbacks.length);
}

// Function to update feedback count
function updateFeedbackCount(count = null) {
    let feedbackCount;
    if (count !== null) {
        feedbackCount = count;
    } else {
        const feedbackList = document.getElementById('feedbackList');
        feedbackCount = feedbackList.querySelectorAll('.feedback-item').length;
    }
    document.getElementById('totalFeedback').textContent = feedbackCount;
}

// Load feedbacks on page load
window.addEventListener('DOMContentLoaded', async function() {
    // [REMOVED] The logic to add mock data to localStorage is gone.
    
    // Fetch real data from the database
    const feedbacks = await fetchFeedbacksFromDatabase();
    displayFeedbacks(feedbacks);
    
    // Add refresh button functionality
    document.getElementById('refreshFeedback').addEventListener('click', async function() {
        showNotification('Refreshing feedbacks...', 'info');
        const feedbacks = await fetchFeedbacksFromDatabase();
        displayFeedbacks(feedbacks);
        showNotification('Feedbacks updated!', 'success');
    });
    
    // Initialize scroll animations
    initScrollAnimations();
});

// Notification system
function showNotification(message, type = 'info') {
    // ... (This function is unchanged, it's perfect)
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--surface);
            color: var(--text-dark);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow-lg);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        }
        .notification-success { border-left: 4px solid var(--success); }
        .notification-error { border-left: 4px solid var(--error); }
        .notification-info { border-left: 4px solid var(--accent); }
        .notification-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: var(--text-light);
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = notificationStyles;
        document.head.appendChild(styleSheet);
    }
    document.body.appendChild(notification);
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add animation on scroll
function initScrollAnimations() {
    // ... (This function is unchanged)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.feature-card, .stat-card, .team-member, .tech-item').forEach(el => {
        observer.observe(el);
    });
}

// Download button functionality
document.querySelectorAll('.btn-accent').forEach(button => {
    // ... (This function is unchanged)
    button.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Thank you for your interest! The download will begin shortly.', 'info');
    });
});

// iOS notify button
document.querySelector('.coming-soon .btn').addEventListener('click', function(e) {
    // ... (This function is unchanged)
    e.preventDefault();
    showNotification('We\'ll notify you when the iOS version is available!', 'info');
});