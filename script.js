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
        id: Date.now(),
        name: name,
        email: email,
        message: message,
        date: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
    };
    
    // Submit to database
    submitFeedbackToDatabase(feedback);
});

// Function to submit feedback to database
async function submitFeedbackToDatabase(feedback) {
    try {
        // In a real application, this would be an API call to your backend
        // For demo purposes, we'll use localStorage
        const existingFeedbacks = JSON.parse(localStorage.getItem('kanlungan-feedbacks') || '[]');
        existingFeedbacks.unshift(feedback); // Add new feedback to the beginning
        localStorage.setItem('kanlungan-feedbacks', JSON.stringify(existingFeedbacks));
        
        // Add the new feedback to the display
        displaySingleFeedback(feedback);
        
        // Update feedback count
        updateFeedbackCount();
        
        // Reset form
        document.getElementById('feedbackForm').reset();
        
        // Show success message
        showNotification('Thank you for your feedback! Your voice helps shape our sanctuary.', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error submitting feedback. Please try again.', 'error');
    }
}

// Function to fetch feedbacks from database
async function fetchFeedbacksFromDatabase() {
    try {
        // In a real application, this would be an API call to your backend
        // For demo purposes, we'll use localStorage
        const storedFeedbacks = JSON.parse(localStorage.getItem('kanlungan-feedbacks') || '[]');
        
        // If no stored feedbacks, use sample data
        if (storedFeedbacks.length === 0) {
            return getSampleFeedbacks();
        }
        
        return storedFeedbacks;
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        // Return sample data if storage fails
        return getSampleFeedbacks();
    }
}

// Sample feedbacks as fallback
function getSampleFeedbacks() {
    return [
        { 
            id: 1, 
            name: "Maria Santos", 
            message: "This app has been a lifesaver for me. The anonymous feature made me feel safe to seek help when I needed it most. The AI chatbot is surprisingly helpful during late nights when I can't sleep.", 
            date: "2023-10-15" 
        },
        { 
            id: 2, 
            name: "Juan Dela Cruz", 
            message: "The self-help tools are very useful, especially the calming music when I can't sleep at night. The progress tracker helped me see my improvement over time. Thank you for this app!", 
            date: "2023-10-10" 
        },
        { 
            id: 3, 
            name: "Anonymous", 
            message: "The community forum is a great place to connect with others who understand what I'm going through. It's comforting to know I'm not alone in my struggles.", 
            date: "2023-10-05" 
        },
        { 
            id: 4, 
            name: "Sarah Lim", 
            message: "The progress tracker helped me see my improvement over time. I never realized how far I've come! The journaling feature is particularly helpful for organizing my thoughts.", 
            date: "2023-09-28" 
        },
        { 
            id: 5, 
            name: "Miguel Torres", 
            message: "Having 24/7 access to the AI chatbot has been incredibly helpful during my lonely nights. The responses are thoughtful and actually helpful, not just generic advice.", 
            date: "2023-09-22" 
        },
        { 
            id: 6, 
            name: "Anonymous", 
            message: "The anonymous therapy sessions changed my life. No judgment, just pure support. My therapist was understanding and provided practical strategies that actually work.", 
            date: "2023-09-15" 
        },
        { 
            id: 7, 
            name: "Andrea Gomez", 
            message: "As a college student, the financial barrier was always an issue. Kanlungan's free resources and affordable paid sessions made professional help accessible for me.", 
            date: "2023-09-10" 
        },
        { 
            id: 8, 
            name: "Robert Tan", 
            message: "The emergency button feature gave me peace of mind. Knowing there's immediate help available during a crisis is incredibly reassuring for someone with anxiety.", 
            date: "2023-09-05" 
        }
    ];
}

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
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to display all feedbacks
function displayFeedbacks(feedbacks) {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = ''; // Clear existing feedbacks
    
    if (feedbacks.length === 0) {
        feedbackList.innerHTML = '<div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-light);"><p>No feedbacks yet. Be the first to share your experience!</p></div>';
        return;
    }
    
    feedbacks.forEach(feedback => {
        const feedbackItem = createFeedbackElement(feedback);
        feedbackList.appendChild(feedbackItem);
    });
    
    // Update feedback count
    updateFeedbackCount();
}

// Function to update feedback count
function updateFeedbackCount() {
    const feedbackList = document.getElementById('feedbackList');
    const feedbackCount = feedbackList.querySelectorAll('.feedback-item').length;
    document.getElementById('totalFeedback').textContent = feedbackCount;
}

// Load feedbacks on page load
window.addEventListener('DOMContentLoaded', async function() {
    // Initialize with sample data if no data exists
    const existingFeedbacks = JSON.parse(localStorage.getItem('kanlungan-feedbacks') || '[]');
    if (existingFeedbacks.length === 0) {
        const sampleFeedbacks = getSampleFeedbacks();
        localStorage.setItem('kanlungan-feedbacks', JSON.stringify(sampleFeedbacks));
    }
    
    const feedbacks = await fetchFeedbacksFromDatabase();
    displayFeedbacks(feedbacks);
    
    // Add refresh button functionality
    document.getElementById('refreshFeedback').addEventListener('click', async function() {
        const feedbacks = await fetchFeedbacksFromDatabase();
        displayFeedbacks(feedbacks);
        showNotification('Feedbacks updated!', 'success');
    });
    
    // Initialize scroll animations
    initScrollAnimations();
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles for notification
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
        
        .notification-success {
            border-left: 4px solid var(--success);
        }
        
        .notification-error {
            border-left: 4px solid var(--error);
        }
        
        .notification-info {
            border-left: 4px solid var(--accent);
        }
        
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
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = notificationStyles;
        document.head.appendChild(styleSheet);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add animation on scroll
function initScrollAnimations() {
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
    
    // Observe elements to animate
    document.querySelectorAll('.feature-card, .stat-card, .team-member, .tech-item').forEach(el => {
        observer.observe(el);
    });
}

// Download button functionality
document.querySelectorAll('.btn-accent').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Thank you for your interest! The download will begin shortly.', 'info');
        // In a real application, this would trigger the actual download
        // For demo purposes, we'll just show a notification
    });
});

// iOS notify button
document.querySelector('.coming-soon .btn').addEventListener('click', function(e) {
    e.preventDefault();
    showNotification('We\'ll notify you when the iOS version is available!', 'info');
});