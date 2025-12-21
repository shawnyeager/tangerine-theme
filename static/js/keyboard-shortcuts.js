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
 * Easter egg:
 * - Type 'mempool': Show next block info from mempool.space
 *
 * Note: FOUC prevention script runs earlier in <head> to apply theme before render
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

    // Vim-style navigation
    function scrollDown() {
        window.scrollBy({ top: 100, behavior: 'smooth' });
    }

    function scrollUp() {
        window.scrollBy({ top: -100, behavior: 'smooth' });
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function scrollToBottom() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    // Mempool easter egg - shows next block from mempool.space
    // Uses FLIP animation from brand square to center
    let mempoolOverlay = null;

    async function showMempoolBlock() {
        if (mempoolOverlay) return; // Already showing

        // FLIP: First - get brand square position
        const homeSquare = document.querySelector('.home-square');
        if (!homeSquare) return;
        const first = homeSquare.getBoundingClientRect();

        // Create overlay with block in final position (centered)
        mempoolOverlay = document.createElement('div');
        mempoolOverlay.className = 'mempool-overlay';
        mempoolOverlay.innerHTML = `
            <div class="mempool-block">
                <div class="mempool-content">
                    <div class="mempool-loading">...</div>
                </div>
            </div>
        `;
        document.body.appendChild(mempoolOverlay);

        const block = mempoolOverlay.querySelector('.mempool-block');

        // FLIP: Last - get final centered position
        const last = block.getBoundingClientRect();

        // FLIP: Invert - calculate deltas (using center points)
        const firstCenterX = first.left + first.width / 2;
        const firstCenterY = first.top + first.height / 2;
        const lastCenterX = last.left + last.width / 2;
        const lastCenterY = last.top + last.height / 2;
        const deltaX = firstCenterX - lastCenterX;
        const deltaY = firstCenterY - lastCenterY;
        const deltaScale = first.width / last.width;

        // Apply inverse transform (makes it appear at brand square)
        block.style.transformOrigin = 'center center';
        block.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaScale})`;

        // Force reflow before enabling transition
        block.offsetHeight;

        // FLIP: Play - animate to final position
        mempoolOverlay.classList.add('visible');
        block.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        block.style.transform = 'translate(0, 0) scale(1)';

        // Close with reverse animation
        const close = () => {
            if (!mempoolOverlay) return;

            // Animate back to brand square
            block.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaScale})`;
            mempoolOverlay.classList.remove('visible');

            setTimeout(() => {
                mempoolOverlay?.remove();
                mempoolOverlay = null;
            }, 800);
        };

        mempoolOverlay.addEventListener('click', close);
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Fetch next block data from mempool
        try {
            const res = await fetch('https://mempool.space/api/v1/fees/mempool-blocks', {
                signal: AbortSignal.timeout(5000)
            });
            const blocks = await res.json();
            const nextBlock = blocks[0]; // Next block to be mined

            const medianFee = Math.round(nextBlock.medianFee);
            const minFee = nextBlock.feeRange[0].toFixed(1);
            const maxFee = nextBlock.feeRange[6].toFixed(1);
            const totalBTC = (nextBlock.totalFees / 100000000).toFixed(3);

            const content = mempoolOverlay?.querySelector('.mempool-content');
            if (content) {
                content.innerHTML = `
                    <div class="mempool-fee">~${medianFee} sat/vB</div>
                    <div class="mempool-range">${minFee} - ${maxFee} sat/vB</div>
                    <div class="mempool-total">${totalBTC} BTC</div>
                    <div class="mempool-txs">${nextBlock.nTx.toLocaleString()} transactions</div>
                    <div class="mempool-eta">In ~10 minutes</div>
                `;
            }
        } catch (e) {
            const content = mempoolOverlay?.querySelector('.mempool-content');
            if (content) {
                content.innerHTML = `
                    <div class="mempool-total">₿</div>
                    <div class="mempool-txs">offline</div>
                `;
            }
        }
    }

    // Key sequence tracking for multi-key shortcuts (gg, mempool)
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

        // Check for 'mempool' easter egg
        if (keySequence.endsWith('mempool')) {
            showMempoolBlock();
            keySequence = '';
            return;
        }

        // Single-key shortcuts
        // Toggle between light and dark (maintains manual preference)
        if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            toggleTheme();
            return;
        }

        // Switch to auto mode (follows system preference)
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            setAutoMode();
            return;
        }

        // Vim-style navigation
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
