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
 * - Type 'block': Show next block info from mempool.space
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

    // Block easter egg - shows live mempool.space next block data
    // Triggered by typing 'block' anywhere on page
    const BLOCK = {
        SIZE_FINAL: 240,
        FACE_DEPTH_FINAL: 40,
        FACE_RATIO: 0.15,
        SHADOW_OFFSET_FINAL: 40,
        // Animation durations (ms)
        ANIM_FLY_IN: 600,
        ANIM_FLY_OUT: 400,
        ANIM_CONTENT_IN: 300,
        ANIM_CONTENT_OUT: 100,
        ANIM_PULSE: 1200,
        POLL_INTERVAL: 10000,
        // 3D face colors (decorative, not tokenized)
        FACE_TOP: '#2d2824',
        FACE_LEFT: '#1f1b18'
    };

    let mempoolOverlay = null;
    let pollInterval = null;

    async function fetchMempoolData() {
        try {
            const res = await fetch('https://mempool.space/api/v1/fees/mempool-blocks', {
                signal: AbortSignal.timeout(5000)
            });
            const blocks = await res.json();
            const b = blocks[0];
            return {
                medianFee: Math.round(b.medianFee),
                minFee: b.feeRange[0].toFixed(1),
                maxFee: b.feeRange[6].toFixed(1),
                totalBTC: (b.totalFees / 100000000).toFixed(3),
                txCount: b.nTx.toLocaleString(),
                fullness: Math.min(100, Math.round((b.blockVSize / 1000000) * 100))
            };
        } catch {
            return null;
        }
    }

    async function showMempoolBlock() {
        if (mempoolOverlay) return;

        const homeSquare = document.querySelector('.home-square');
        if (!homeSquare) return;

        // Load anime.js
        if (!window.anime) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/animejs';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        const { animate, set } = anime;
        const data = await fetchMempoolData();

        // Read design tokens from CSS
        const styles = getComputedStyle(document.documentElement);
        const brandOrange = styles.getPropertyValue('--brand-orange').trim();
        const fontHeading = styles.getPropertyValue('--font-heading').trim();

        // Get home-square position
        const sq = homeSquare.getBoundingClientRect();
        const startFaceDepth = Math.round(sq.width * BLOCK.FACE_RATIO);

        // Create elements
        mempoolOverlay = document.createElement('div');
        const block = document.createElement('div');
        const topFace = document.createElement('div');
        const leftFace = document.createElement('div');
        const content = document.createElement('div');

        mempoolOverlay.appendChild(block);
        block.appendChild(topFace);
        block.appendChild(leftFace);
        block.appendChild(content);
        document.body.appendChild(mempoolOverlay);

        // Click target with radial shadow that darkens the page
        set(mempoolOverlay, {
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            cursor: 'pointer'
        });

        // Shadow element - offset down-left to match 3D lighting (light from top-right)
        const shadow = document.createElement('div');
        mempoolOverlay.insertBefore(shadow, block);
        const shadowOffset = Math.round(sq.width * BLOCK.FACE_RATIO);
        set(shadow, {
            position: 'fixed',
            left: (sq.left - shadowOffset) + 'px',
            top: (sq.top + shadowOffset) + 'px',
            width: sq.width + 'px',
            height: sq.height + 'px',
            background: 'rgba(0,0,0,0.4)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
        });

        // Block - starts at home-square size/position
        set(block, {
            position: 'fixed',
            left: sq.left + 'px',
            top: sq.top + 'px',
            width: sq.width + 'px',
            height: sq.height + 'px',
            background: brandOrange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
        });

        // Top face (3D lighting - lighter charcoal)
        set(topFace, {
            position: 'absolute',
            width: '100%',
            height: startFaceDepth + 'px',
            bottom: '100%',
            right: '0',
            background: BLOCK.FACE_TOP,
            transform: 'skewX(45deg)',
            transformOrigin: 'bottom right'
        });

        // Left face (3D lighting - darker charcoal)
        set(leftFace, {
            position: 'absolute',
            width: startFaceDepth + 'px',
            height: '100%',
            top: '0',
            right: '100%',
            background: BLOCK.FACE_LEFT,
            transform: 'skewY(45deg)',
            transformOrigin: 'top right'
        });

        // Content
        set(content, {
            position: 'relative',
            textAlign: 'center',
            color: '#fff',
            fontFamily: fontHeading,
            zIndex: 1,
            opacity: 0
        });

        function updateContent(d) {
            content.innerHTML = d
                ? `<div class="mempool-block-fee">~${d.medianFee} sat/vB</div>
                   <div class="mempool-block-range">${d.minFee} - ${d.maxFee} sat/vB</div>
                   <div class="mempool-block-total">${d.totalBTC} BTC</div>
                   <div class="mempool-block-count">${d.txCount} transactions</div>
                   <div class="mempool-block-time">In ~10 minutes</div>`
                : '<div class="mempool-block-total">₿</div>';
        }
        updateContent(data);

        // Final positions (centered on screen)
        const finalSize = BLOCK.SIZE_FINAL;
        const finalLeft = (window.innerWidth - finalSize) / 2;
        const finalTop = (window.innerHeight - finalSize) / 2;

        // Fly block to center
        animate(block, {
            left: finalLeft,
            top: finalTop,
            width: finalSize,
            height: finalSize,
            duration: BLOCK.ANIM_FLY_IN,
            ease: 'outBack'
        });

        // Shadow follows block
        animate(shadow, {
            left: finalLeft - BLOCK.SHADOW_OFFSET_FINAL,
            top: finalTop + BLOCK.SHADOW_OFFSET_FINAL,
            width: finalSize,
            height: finalSize,
            filter: 'blur(30px)',
            duration: BLOCK.ANIM_FLY_IN,
            ease: 'outBack'
        });

        // Animate 3D faces to final depth
        animate(topFace, { height: BLOCK.FACE_DEPTH_FINAL, duration: BLOCK.ANIM_FLY_IN, ease: 'outBack' });
        animate(leftFace, { width: BLOCK.FACE_DEPTH_FINAL, duration: BLOCK.ANIM_FLY_IN, ease: 'outBack' });

        // Show content after fly-in completes
        animate(content, { opacity: 1, duration: BLOCK.ANIM_CONTENT_IN, delay: 500, ease: 'outQuad' });

        // Subtle pulse animation
        animate(block, {
            filter: ['brightness(1)', 'brightness(1.15)'],
            duration: BLOCK.ANIM_PULSE,
            loop: true,
            alternate: true,
            ease: 'inOutSine'
        });

        // Poll for updated data
        pollInterval = setInterval(async () => {
            const newData = await fetchMempoolData();
            if (newData) updateContent(newData);
        }, BLOCK.POLL_INTERVAL);

        // Close handler - fly block back to home-square
        const close = () => {
            if (!mempoolOverlay) return;
            clearInterval(pollInterval);

            const sqNow = homeSquare.getBoundingClientRect();
            const endFaceDepth = Math.round(sqNow.width * BLOCK.FACE_RATIO);
            const endShadowOffset = Math.round(sqNow.width * BLOCK.FACE_RATIO);

            // Hide content immediately
            animate(content, { opacity: 0, duration: BLOCK.ANIM_CONTENT_OUT, ease: 'inQuad' });

            // Fly block back to origin
            animate(block, {
                left: sqNow.left,
                top: sqNow.top,
                width: sqNow.width,
                height: sqNow.height,
                duration: BLOCK.ANIM_FLY_OUT,
                ease: 'inQuad',
                onComplete: () => {
                    mempoolOverlay.remove();
                    mempoolOverlay = null;
                }
            });

            // Shadow follows block back
            animate(shadow, {
                left: sqNow.left - endShadowOffset,
                top: sqNow.top + endShadowOffset,
                width: sqNow.width,
                height: sqNow.height,
                filter: 'blur(20px)',
                duration: BLOCK.ANIM_FLY_OUT,
                ease: 'inQuad'
            });

            // Animate 3D faces back to proportional size
            animate(topFace, { height: endFaceDepth, duration: BLOCK.ANIM_FLY_OUT, ease: 'inQuad' });
            animate(leftFace, { width: endFaceDepth, duration: BLOCK.ANIM_FLY_OUT, ease: 'inQuad' });
        };

        mempoolOverlay.addEventListener('click', close);
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handler);
            }
        });
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

        // Check for 'block' easter egg
        if (keySequence.endsWith('block')) {
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
