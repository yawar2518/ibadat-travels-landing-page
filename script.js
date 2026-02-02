// MAIN FILE INDEX JS 
// Slider, menu, smooth scroll ... (keep as before)
        // Slider
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        function showSlide(n) { slides.forEach(s => s.classList.remove('active')); currentSlide = (n + slides.length) % slides.length; slides[currentSlide].classList.add('active'); }
        setInterval(() => showSlide(currentSlide + 1), 5000);

        // Menu toggle
        function toggleMenu() { document.getElementById('navMenu').classList.toggle('active'); }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('navMenu').classList.remove('active'); }
            });
        });
        // --- Form input restrictions ---
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

            // Encode the message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);

            // Open WhatsApp chat with pre-filled message
            window.open(`https://wa.me/${number}?text=${encodedMessage}`, '_blank');
        }





        // UMRAH-PACKAGES FILE 




         // Reset essential filter inputs
      document.getElementById('resetFilters').addEventListener('click', function() {
        var inputs = ['filter-date-from','filter-date-to','filter-price-min','filter-price-max'];
        inputs.forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
        var selects = ['filter-days','filter-flight','filter-hotel'];
        selects.forEach(function(id){ var s = document.getElementById(id); if (s) s.selectedIndex = 0; });
      });
      // Basic placeholder: apply filters (no server) - you can hook this to real filter logic
      document.getElementById('applyFilters').addEventListener('click', function() {
        // Placeholder: simply scroll to results
        document.querySelector('.packages-list').scrollIntoView({behavior:'smooth'});
      });


      // Interactive info items: toggle pressed state on click/keyboard
      document.querySelectorAll('.info-item').forEach(item => {
        item.addEventListener('click', () => {
          const pressed = item.getAttribute('aria-pressed') === 'true';
          item.setAttribute('aria-pressed', String(!pressed));
          item.classList.toggle('selected', !pressed);
        });
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            const next = item.nextElementSibling;
            if (next && next.classList.contains('info-item')) next.focus();
          }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            const prev = item.previousElementSibling;
            if (prev && prev.classList.contains('info-item')) prev.focus();
          }
        });
      });

      // Keyboard activation for service cards
      document.querySelectorAll('.service-card[role="button"]').forEach(card => {
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
      