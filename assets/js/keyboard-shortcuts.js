/**
 * Keyboard Shortcuts
 *
 * Shortcuts:
 * - 'd': Toggle light/dark theme
 * - 'a': Auto mode (follow system)
 * - 'j/k': Scroll down/up
 * - 'gg': Go to top
 * - 'G': Go to bottom
 * - '?': Show help modal
 *
 * Note: FOUC prevention script runs earlier in <head> to apply theme before render
 */
(function() {
    // Cache system preference queries
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function getScrollBehavior() {
        return motionQuery.matches ? 'auto' : 'smooth';
    }

    function getSystemPreference() {
        return mediaQuery.matches ? 'dark' : 'light';
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const effective = current || getSystemPreference();
        const next = effective === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', next);

        try {
            localStorage.setItem('tangerine-theme-preference', next);
        } catch (e) {
            // Fail silently - theme still toggles via DOM attribute
        }
    }

    function setAutoMode() {
        // Remove manual preference and apply current system preference
        try {
            localStorage.removeItem('tangerine-theme-preference');
        } catch (e) {
            // Fail silently if localStorage is unavailable
        }

        // Apply current system preference
        const systemPreference = getSystemPreference();
        document.documentElement.setAttribute('data-theme', systemPreference);
    }

    // Keyboard shortcuts help modal
    let helpModal = null;
    let previousFocus = null;

    function createHelpModal() {
        const overlay = document.createElement('div');
        overlay.className = 'keyboard-help-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'keyboard-help-title');

        overlay.innerHTML = `
            <div class="keyboard-help-card">
                <h2 id="keyboard-help-title" class="keyboard-help-heading">Keyboard Shortcuts</h2>
                <dl class="keyboard-help-list">
                    <div class="keyboard-help-item">
                        <dt><kbd>d</kbd></dt>
                        <dd>Toggle light/dark theme</dd>
                    </div>
                    <div class="keyboard-help-item">
                        <dt><kbd>a</kbd></dt>
                        <dd>Switch to auto (system) theme</dd>
                    </div>
                    <div class="keyboard-help-item">
                        <dt><kbd>j</kbd> / <kbd>k</kbd></dt>
                        <dd>Scroll down / up</dd>
                    </div>
                    <div class="keyboard-help-item">
                        <dt><kbd>gg</kbd></dt>
                        <dd>Go to top</dd>
                    </div>
                    <div class="keyboard-help-item">
                        <dt><kbd>G</kbd></dt>
                        <dd>Go to bottom</dd>
                    </div>
                    <div class="keyboard-help-item">
                        <dt><kbd>?</kbd></dt>
                        <dd>Show this help</dd>
                    </div>
                </dl>
                <p class="keyboard-help-dismiss">Press <kbd>Esc</kbd> or click outside to close</p>
            </div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    }

    function openHelpModal() {
        if (!helpModal) {
            helpModal = createHelpModal();

            // Close on overlay click (not card)
            helpModal.addEventListener('click', function(e) {
                if (e.target === helpModal) {
                    closeHelpModal();
                }
            });
        }

        previousFocus = document.activeElement;
        helpModal.setAttribute('data-visible', 'true');

        // Focus the card for screen readers
        const card = helpModal.querySelector('.keyboard-help-card');
        card.setAttribute('tabindex', '-1');
        card.focus();
    }

    function closeHelpModal() {
        if (!helpModal) return;

        helpModal.setAttribute('data-visible', 'false');

        // Restore focus to previous element
        if (previousFocus && typeof previousFocus.focus === 'function') {
            previousFocus.focus();
        }
        previousFocus = null;
    }

    function isHelpModalOpen() {
        return helpModal && helpModal.getAttribute('data-visible') === 'true';
    }

    // Vim-style navigation (respects prefers-reduced-motion)
    function scrollDown() {
        window.scrollBy({ top: 100, behavior: getScrollBehavior() });
    }

    function scrollUp() {
        window.scrollBy({ top: -100, behavior: getScrollBehavior() });
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: getScrollBehavior() });
    }

    function scrollToBottom() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: getScrollBehavior() });
    }

    // Key sequence tracking for multi-key shortcuts (gg, block)
    let keySequence = '';
    let sequenceTimeout = null;

    // Listen for system preference changes
    mediaQuery.addEventListener('change', function(e) {
        try {
            // Only react if user hasn't set manual preference
            const stored = localStorage.getItem('tangerine-theme-preference');
            if (!stored) {
                // No manual preference - follow system
                const newPreference = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newPreference);
            }
        } catch (err) {
            // Fail silently if localStorage is unavailable
        }
    });

    // Initialize mobile trigger for easter egg (lazy-loaded)
    function initMobileTriggerIfNeeded() {
        if (window.innerWidth <= 768 && window.__mempoolJS) {
            import(window.__mempoolJS).then(m => m.initMobileTrigger());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileTriggerIfNeeded);
    } else {
        initMobileTriggerIfNeeded();
    }

    // Keyboard shortcut handler
    document.addEventListener('keydown', function(e) {
        // Don't trigger if user is typing in an input field
        if (e.target.matches('input, textarea, [contenteditable]')) {
            return;
        }

        // Close help modal on Escape
        if (e.key === 'Escape' && isHelpModalOpen()) {
            e.preventDefault();
            closeHelpModal();
            return;
        }

        // Show/toggle help modal
        if (e.key === '?') {
            e.preventDefault();
            if (isHelpModalOpen()) {
                closeHelpModal();
            } else {
                openHelpModal();
            }
            return;
        }

        // Don't process other shortcuts while modal is open
        if (isHelpModalOpen()) {
            return;
        }

        // Track key sequences for multi-key shortcuts
        keySequence += e.key.toLowerCase();
        clearTimeout(sequenceTimeout);
        sequenceTimeout = setTimeout(() => keySequence = '', 1000);

        // Check for 'gg' sequence (scroll to top)
        if (keySequence.endsWith('gg')) {
            e.preventDefault();
            scrollToTop();
            keySequence = '';
            return;
        }

        // Check for 'block' easter egg (lazy-loaded)
        if (keySequence.endsWith('block') && window.__mempoolJS) {
            import(window.__mempoolJS).then(m => m.showMempoolBlock());
            keySequence = '';
            return;
        }

        // Single-key shortcuts
        if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            toggleTheme();
            return;
        }

        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            setAutoMode();
            return;
        }

        if (e.key === 'j') {
            e.preventDefault();
            scrollDown();
            return;
        }

        if (e.key === 'k') {
            e.preventDefault();
            scrollUp();
            return;
        }

        if (e.key === 'G') {
            e.preventDefault();
            scrollToBottom();
            return;
        }
    });
})();
