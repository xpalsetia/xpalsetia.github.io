

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Don't animate hero section
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'none';

// Page tab functionality
const pageTabs = document.querySelectorAll('.page-tab');
pageTabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        pageTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Get the page type
        const pageType = this.getAttribute('data-page');
        
        // For now, just show an alert (you can implement actual page switching later)
        if (pageType !== 'portfolio') {
            alert(`${pageType.charAt(0).toUpperCase() + pageType.slice(1)} page coming soon!`);
            
            // Reset to portfolio tab after alert
            setTimeout(() => {
                pageTabs.forEach(t => t.classList.remove('active'));
                document.querySelector('[data-page="portfolio"]').classList.add('active');
            }, 100);
        }
    });
});