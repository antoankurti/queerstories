const indicator = document.getElementById('scroll-indicator');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    indicator.style.backgroundPosition = `${progress}% 0`;
});