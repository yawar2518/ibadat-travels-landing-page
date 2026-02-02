/*
  js/script.js
  ----------------
  Main JS moved into `js/` to keep structure clean.
  - Small comments added above main blocks to make maintenance easier
*/

// Slider control (auto-rotate)
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(n) {
    // ensure only one slide is active
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(() => showSlide(currentSlide + 1), 5000);

// Menu toggle for mobile
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// Close mobile menu when any nav link is clicked (works for page-to-page and anchors)
const navLinks = document.querySelectorAll('#navMenu a');
if (navLinks.length) {
    navLinks.forEach(link => link.addEventListener('click', () => {
        const nav = document.getElementById('navMenu');
        if (nav) nav.classList.remove('active');
    }));
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only prevent default for anchor links that have a matching target on this page
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('navMenu').classList.remove('active');
        }
    });
});

// WhatsApp form handling
function sendToWhatsApp(number) {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !phone || !message) {
        alert('Please fill Name, Phone & Message');
        return;
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
        alert('Name should contain only letters');
        return;
    }

    if (!/^[0-9+\-\s()]+$/.test(phone)) {
        alert('Phone number should contain only numbers');
        return;
    }

    // Construct the message
    let whatsappMessage = `*New Inquiry from Website*\n\n`;
    whatsappMessage += `*Name:* ${name}\n`;
    whatsappMessage += `*Phone:* ${phone}\n`;
    whatsappMessage += `*Email:* ${email || 'Not provided'}\n\n`;
    whatsappMessage += `*Message:*\n${message}`;

    // Encode the message for URL and open WhatsApp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${number}?text=${encodedMessage}`, '_blank');
}

// Packages page specific small scripts (reset/apply filters)
// Reset essential filter inputs
const resetBtn = document.getElementById('resetFilters');
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        var inputs = ['filter-date-from','filter-date-to','filter-price-min','filter-price-max'];
        inputs.forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
        var selects = ['filter-days','filter-flight','filter-hotel'];
        selects.forEach(function(id){ var s = document.getElementById(id); if (s) s.selectedIndex = 0; });
    });
}

// Basic placeholder: apply filters (no server) - you can hook this to real filter logic
const applyBtn = document.getElementById('applyFilters');
if (applyBtn) {
    applyBtn.addEventListener('click', function() {
        // Placeholder: simply scroll to results
        const list = document.querySelector('.packages-list');
        if (list) list.scrollIntoView({behavior:'smooth'});
    });
}