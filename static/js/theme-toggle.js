/**
 * Theme Toggle Script
 *
 * Provides keyboard shortcuts for toggling between light/dark themes:
 * - 'd' or 'D': Toggle between light and dark (maintains manual preference)
 * - 'a' or 'A': Switch to auto mode (follows system preference)
 * - '?': Show keyboard shortcuts help
 *
 * Features:
 * - Respects system preference when no manual override set
 * - Stores preference in localStorage
 * - Listens for system preference changes
 * - Gracefully handles localStorage unavailability
 * - Accessible help modal with focus management
 *
 * Note: FOUC prevention script runs earlier in <head> to apply theme before page render
 */
(function() {
    // Cache system preference query
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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

        // Toggle between light and dark (maintains manual preference)
        if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            toggleTheme();
        }

        // Switch to auto mode (follows system preference)
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            setAutoMode();
        }
    });
})();
