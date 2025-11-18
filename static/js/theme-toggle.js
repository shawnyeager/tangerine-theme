/**
 * Theme Toggle Script
 *
 * Provides keyboard shortcuts for toggling between light/dark themes:
 * - 'd' or 'D': Toggle between light and dark (maintains manual preference)
 * - 'a' or 'A': Switch to auto mode (follows system preference)
 *
 * Features:
 * - Respects system preference when no manual override set
 * - Stores preference in localStorage
 * - Listens for system preference changes
 * - Gracefully handles localStorage unavailability
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
        if (e.target.matches('input, textarea, [contenteditable="true"]')) {
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
