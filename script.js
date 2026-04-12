// Interactive Theme & Cursor Variables
const cursor = document.querySelector('.cursor-dot');
const bgEffects = document.querySelector('.background-effects');
const magneticElements = document.querySelectorAll('.magnetic');
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');

// Canvas Particles
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function setCanvasSize() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseSize = this.size;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
        // Mouse interaction
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            this.x -= dx / 30;
            this.y -= dy / 30;
            // Particles zoom out
            this.size = this.baseSize + (150 - distance) * 0.03;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
            // Return to normal size smoothly
            if (this.size > this.baseSize) {
                this.size -= 0.1;
            }
        }

        // Screen bounds wrap
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = `hsla(${window.themeHue || 16}, 100%, 50%, 0.4)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    if (canvas) {
        for (let i = 0; i < 60; i++) {
            particlesArray.push(new Particle());
        }
    }
}
initParticles();

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

// Cursor trailing interpolation function
function animate() {
    // easing the cursor
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    }

    // Draw Particles
    if (ctx && !window.isModalActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
    }

    requestAnimationFrame(animate);
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Hardware-accelerated background gradients
    if (orb1 && orb2 && !window.isModalActive) {
        orb1.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        orb2.style.transform = `translate3d(${window.innerWidth - e.clientX}px, ${window.innerHeight - e.clientY}px, 0) translate(-50%, -50%)`;
    }
});

// Optimize Spotlight text to ONLY compute static bounding data exactly once per interaction cycle
document.querySelectorAll('.spotlight-text').forEach(el => {
    let cachedRect = null;

    el.addEventListener('mouseenter', () => {
        cachedRect = el.getBoundingClientRect(); // Execute math ONLY on arrival
    });

    el.addEventListener('mousemove', (e) => {
        if (!cachedRect) return;
        const x = ((e.clientX - cachedRect.left) / cachedRect.width) * 100;
        const y = ((e.clientY - cachedRect.top) / cachedRect.height) * 100;

        requestAnimationFrame(() => {
            el.style.setProperty('--t-x', `${x}%`);
            el.style.setProperty('--t-y', `${y}%`);
        });
    });

    el.addEventListener('mouseleave', () => {
        cachedRect = null; // Clear cached matrix
        el.style.setProperty('--t-x', `-100%`);
        el.style.setProperty('--t-y', `-100%`);
    });
});

// Execute Hue Scroll Updates strictly based on native scrolling events via throttled rAF
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
            const scrollPercent = window.scrollY / maxScroll;
            window.themeHue = 16 + (scrollPercent * 240);

            if (bgEffects) {
                bgEffects.style.setProperty('--bg-orb-1', `hsla(${window.themeHue}, 100%, 50%, 0.15)`);
                bgEffects.style.setProperty('--bg-orb-2', `hsla(${window.themeHue + 60}, 100%, 50%, 0.1)`);
            }
            scrollTicking = false;
        });
        scrollTicking = true;
    }
});

animate(); // start smooth loop

// Cursor expand on clickable items
const clickables = document.querySelectorAll('a, button, .video-card');
clickables.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursor.style.width = '80px';
        cursor.style.height = '80px';
    });
    item.addEventListener('mouseleave', () => {
        cursor.style.width = '15px';
        cursor.style.height = '15px';
    });
});

// Magnetic interaction
magneticElements.forEach((el) => {
    let cachedPos = null;
    el.addEventListener('mouseenter', () => {
        cachedPos = el.getBoundingClientRect();
    });
    el.addEventListener('mousemove', function (e) {
        if (!cachedPos) return;
        const x = e.clientX - cachedPos.left - cachedPos.width / 2;
        const y = e.clientY - cachedPos.top - cachedPos.height / 2;
        // Native GPU hardware layer bypass translation
        requestAnimationFrame(() => {
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
    });
    el.addEventListener('mouseleave', function () {
        cachedPos = null;
        el.style.transform = `translate(0px, 0px) scale(1)`;
    });
});

// Text Splitting for Professional Reveals
const textReveals = document.querySelectorAll('.reveal-text');

textReveals.forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    const words = text.split(' ');

    let charIndex = 0;
    words.forEach(word => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');

        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.innerText = char;
            charSpan.style.transitionDelay = `${charIndex * 0.03}s`;
            wordSpan.appendChild(charSpan);
            charIndex++;
        });
        el.appendChild(wordSpan);
    });
});

// Scroll Reveal Animation via IntersectionObserver
const revealElements = document.querySelectorAll('.reveal, .reveal-text');

const rvOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, rvOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

// No video observer needed — hover previews are now static images

// Video Modal Logic & Click Handling
window.isModalActive = false;
const modal = document.getElementById('video-modal');
const modalContentWrapper = document.getElementById('modal-content-wrapper');
const closeModalBtn = document.querySelector('.close-modal');

// Use Event Delegation to handle clicks on any .video-card (robust)
document.addEventListener('click', (e) => {
    const card = e.target.closest('.video-card');
    if (!card) return;

    const ytId = card.getAttribute('data-yt-id');
    if (ytId && modal && modalContentWrapper) {
        window.isModalActive = true;
        
        // Build iframe using Privacy Enhanced Mode (most lenient for local files)
        const iframe = document.createElement('iframe');
        iframe.id = 'yt-modal-iframe';
        
        // Use youtube-nocookie.com and remove origin/api params to avoid triggering strict referer checks
        iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
        
        // Detect if the video should be vertical based on the card's class
        const isVertical = card.classList.contains('vertical-card');
        iframe.className = isVertical ? 'in-modal-iframe vertical-iframe' : 'in-modal-iframe';
        
        // Basic allow list
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        modalContentWrapper.innerHTML = ''; 
        modalContentWrapper.appendChild(iframe);
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
});

// Setup Hover/3D effects for existing cards
const videoCards = document.querySelectorAll('.video-card');
videoCards.forEach(card => {
    // Cache DOM bounding layout on entry
    let cachedRect = null;

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none'; 
        cachedRect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (e) => {
        if (!cachedRect || window.isModalActive) return;

        requestAnimationFrame(() => {
            const x = e.clientX - cachedRect.left;
            const y = e.clientY - cachedRect.top;
            const centerX = cachedRect.width / 2;
            const centerY = cachedRect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6; 
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
    });

    card.addEventListener('mouseleave', () => {
        cachedRect = null;
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});

// Close modal function
function closeCustomModal() {
    if (!modal) return;
    window.isModalActive = false;
    
    const iframe = document.getElementById('yt-modal-iframe');
    if (iframe) iframe.remove();
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', closeCustomModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === modalContentWrapper) {
            closeCustomModal();
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCustomModal();
});


// Smooth Scroll for Anchor Links (Nav)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
