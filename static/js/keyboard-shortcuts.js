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
    // Uses GSAP Flip for smooth animation from brand square
    let mempoolOverlay = null;
    let gsapLoaded = false;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function loadGSAP() {
        if (gsapLoaded) return;
        await loadScript('https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/gsap@3/dist/Flip.min.js');
        gsapLoaded = true;
    }

    async function showMempoolBlock() {
        if (mempoolOverlay) return;

        const homeSquare = document.querySelector('.home-square');
        if (!homeSquare) return;

        // Load GSAP and fetch data in parallel
        const [, blockData] = await Promise.all([
            loadGSAP(),
            fetch('https://mempool.space/api/v1/fees/mempool-blocks', {
                signal: AbortSignal.timeout(5000)
            }).then(r => r.json()).then(blocks => {
                const b = blocks[0];
                // Block fullness: blockVSize / max (4M weight units = 1M vBytes)
                const fullness = Math.min(100, Math.round((b.blockVSize / 1000000) * 100));
                return {
                    medianFee: Math.round(b.medianFee),
                    minFee: b.feeRange[0].toFixed(1),
                    maxFee: b.feeRange[6].toFixed(1),
                    totalBTC: (b.totalFees / 100000000).toFixed(3),
                    txCount: b.nTx.toLocaleString(),
                    fullness: fullness
                };
            }).catch(() => null)
        ]);

        // Build content HTML
        const contentHTML = blockData
            ? `<div class="mempool-fee">~${blockData.medianFee} sat/vB</div>
               <div class="mempool-range">${blockData.minFee} - ${blockData.maxFee} sat/vB</div>
               <div class="mempool-total">${blockData.totalBTC} BTC</div>
               <div class="mempool-txs">${blockData.txCount} transactions</div>
               <div class="mempool-eta">In ~10 minutes</div>`
            : `<div class="mempool-total">₿</div>
               <div class="mempool-txs">offline</div>`;

        // Get brand square position
        const sq = homeSquare.getBoundingClientRect();

        // Create overlay and block with content already painted
        // Fullness gradient: dark at top (empty), bright at bottom (filled), highlight edge
        const fullness = blockData?.fullness ?? 100;
        const emptyStop = 100 - fullness;

        // Gradient: dark (left/empty) → filled → highlight (right edge)
        const fillStart = 100 - fullness;
        const gradient = `linear-gradient(to right,
            #4a1500 0%,
            #4a1500 ${fillStart}%,
            #6b1c00 ${fillStart}%,
            #8a2a00 ${Math.max(fillStart + 5, 92)}%,
            #c44000 100%)`;

        mempoolOverlay = document.createElement('div');
        mempoolOverlay.className = 'mempool-overlay';
        mempoolOverlay.innerHTML = `
            <div class="mempool-block" style="background: ${gradient};">
                <div class="mempool-content">${contentHTML}</div>
            </div>
        `;
        document.body.appendChild(mempoolOverlay);

        const block = mempoolOverlay.querySelector('.mempool-block');

        // Block is 220x220, positioned at top:0 left:0 via CSS
        const blockSize = 220;
        const centerX = (window.innerWidth - blockSize) / 2;
        const centerY = (window.innerHeight - blockSize) / 2;
        const startScale = sq.width / blockSize;

        // Set initial position BEFORE showing (prevents flash at 0,0)
        gsap.set(block, { x: sq.left, y: sq.top, scale: startScale });
        mempoolOverlay.classList.add('visible');

        // Animate from brand square to center
        gsap.to(block, { x: centerX, y: centerY, scale: 1, duration: 0.8, ease: 'back.out(1.4)' });

        // Close handler
        const close = () => {
            if (!mempoolOverlay) return;

            // Get current brand square position
            const sqNow = homeSquare.getBoundingClientRect();

            // Animate back to brand square
            gsap.to(block, {
                x: sqNow.left,
                y: sqNow.top,
                scale: startScale,
                duration: 0.6,
                ease: 'power2.in',
                onComplete: () => {
                    mempoolOverlay.classList.remove('visible');
                    setTimeout(() => {
                        mempoolOverlay?.remove();
                        mempoolOverlay = null;
                    }, 300);
                }
            });
        };

        mempoolOverlay.addEventListener('click', close);
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
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
