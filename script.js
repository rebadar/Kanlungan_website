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
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const message = formData.get('message');
    
    // Submit to database
    submitFeedbackToDatabase(name, email, message);
});

// Function to submit feedback to database
async function submitFeedbackToDatabase(name, email, message) {
    try {
        const response = await fetch('api/submit_feedback.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Add the new feedback to the display
            displaySingleFeedback(result.data);
            
            // Reset form
            document.getElementById('feedbackForm').reset();
            
            // Show success message
            alert('Thank you for your feedback! Your voice helps shape our sanctuary.');
        } else {
            alert('Error submitting feedback: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
    }
}

// Function to fetch feedbacks from database
async function fetchFeedbacksFromDatabase() {
    try {
        const response = await fetch('api/get_feedbacks.php?limit=6');
        const result = await response.json();
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        // Return sample data if database fails
        return getSampleFeedbacks();
    }
}

// Sample feedbacks as fallback
function getSampleFeedbacks() {
    return [
        { id: 1, name: "Maria Santos", message: "This app has been a lifesaver for me. The anonymous feature made me feel safe to seek help when I needed it most.", date: "2023-10-15" },
        { id: 2, name: "Juan Dela Cruz", message: "The self-help tools are very useful, especially the calming music when I can't sleep at night. Thank you for this app!", date: "2023-10-10" },
        { id: 3, name: "Anonymous", message: "The community forum is a great place to connect with others who understand what I'm going through.", date: "2023-10-05" },
        { id: 4, name: "Sarah Lim", message: "The progress tracker helped me see my improvement over time. I never realized how far I've come!", date: "2023-09-28" },
        { id: 5, name: "Miguel Torres", message: "Having 24/7 access to the AI chatbot has been incredibly helpful during my lonely nights.", date: "2023-09-22" },
        { id: 6, name: "Anonymous", message: "The anonymous therapy sessions changed my life. No judgment, just pure support.", date: "2023-09-15" }
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
}

// Function to create feedback element
function createFeedbackElement(feedback) {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feature-card';
    feedbackItem.style.textAlign = 'left';
    feedbackItem.style.marginBottom = '1.5rem';
    feedbackItem.innerHTML = `
        <h4>${feedback.name}</h4>
        <p>${feedback.message}</p>
        <small style="color: var(--text-light);">${feedback.date}</small>
    `;
    return feedbackItem;
}

// Function to display all feedbacks
function displayFeedbacks(feedbacks) {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = ''; // Clear existing feedbacks
    
    if (feedbacks.length === 0) {
        feedbackList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No feedbacks yet. Be the first to share your experience!</p>';
        return;
    }
    
    feedbacks.forEach(feedback => {
        const feedbackItem = createFeedbackElement(feedback);
        feedbackList.appendChild(feedbackItem);
    });
    
    // Add refresh indicator
    const refreshIndicator = document.createElement('div');
    refreshIndicator.style.textAlign = 'center';
    refreshIndicator.style.marginTop = '2rem';
    refreshIndicator.style.color = 'var(--text-light)';
    refreshIndicator.style.fontSize = '0.9rem';
    refreshIndicator.innerHTML = '💡 <em>Refresh the page to see latest feedbacks from our community!</em>';
    feedbackList.appendChild(refreshIndicator);
}

// Load feedbacks on page load
window.addEventListener('DOMContentLoaded', async function() {
    const feedbacks = await fetchFeedbacksFromDatabase();
    displayFeedbacks(feedbacks);
});

// Add refresh button for feedbacks
function addRefreshButton() {
    const feedbackDisplay = document.getElementById('feedbackDisplay');
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '🔄 Load Latest Feedbacks';
    refreshButton.className = 'btn btn-secondary';
    refreshButton.style.margin = '1rem auto';
    refreshButton.style.display = 'block';
    refreshButton.addEventListener('click', async function() {
        const feedbacks = await fetchFeedbacksFromDatabase();
        displayFeedbacks(feedbacks);
    });
    
    const feedbackList = document.getElementById('feedbackList');
    feedbackDisplay.insertBefore(refreshButton, feedbackList);
}

// Uncomment to add refresh button
addRefreshButton();