// Scroll Reveal Logic
export function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// Preloader Logic
export function initPreloader() {
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 800);
        }
    });
}

// Hover Parallax effect for Hero (optional but cool)
export function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const background = document.querySelector('.hero-background');

    if (hero && background) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 20;
            const yPos = (clientY / window.innerHeight - 0.5) * 20;

            background.style.transform = `translate(${xPos}px, ${yPos}px) scale(1.1)`;
        });
    }
}
