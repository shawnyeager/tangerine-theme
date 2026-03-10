/**
 * Reading Progress Bar
 *
 * On essay and note pages, the 3px brand bar becomes a reading progress
 * indicator. The bar dims to 30% and a progress overlay fills left-to-right
 * as the reader scrolls through the content.
 *
 * Detection: activates when .essay-body or .note-body exists on the page.
 * Performance: uses requestAnimationFrame + passive scroll listener.
 * Accessibility: progress bar is aria-hidden (decorative enhancement).
 */
(function() {
    var article = document.querySelector('.essay-body') || document.querySelector('.note-body');
    if (!article) return;

    // Respect reduced motion — still show progress but skip transitions
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    if (reducedMotion) bar.classList.add('reading-progress--no-motion');
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    // Dim the brand bar on pages with reading progress
    document.body.classList.add('has-reading-progress');

    var ticking = false;

    function updateProgress() {
        var rect = article.getBoundingClientRect();
        var articleTop = rect.top + window.scrollY;
        var articleHeight = rect.height;
        var viewportHeight = window.innerHeight;

        // Progress: 0 at article start, 1 when article bottom reaches viewport bottom
        var scrolled = window.scrollY - articleTop;
        var total = articleHeight - viewportHeight;

        var progress = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
        bar.style.transform = 'scaleX(' + progress + ')';
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }, { passive: true });

    // Initial calculation
    updateProgress();
})();
