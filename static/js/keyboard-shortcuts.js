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

    /**
     * Block Easter Egg
     *
     * Shows live mempool.space next block data in an animated 3D block.
     *
     * Activation:
     * - Desktop: Type "block" anywhere on page
     * - Mobile: Diagonal swipe (down-right) on brand square
     *
     * Dismissal: Click/tap anywhere or press Escape
     */
    const BLOCK = {
        SIZE: 240,
        DEPTH: 35,
        SHADOW_OFFSET: 40,
        FLY_IN: 600,
        FLY_OUT: 400,
        CONTENT_IN: 300,
        CONTENT_OUT: 100,
        PULSE: 1200,
        POLL_INTERVAL: 10000
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
                medianFee: Math.max(1, Math.round(b.medianFee)),
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

        const dataPromise = fetchMempoolData();
        const styles = getComputedStyle(document.documentElement);
        const brandOrange = styles.getPropertyValue('--brand-orange').trim();
        const fontHeading = styles.getPropertyValue('--font-heading').trim();

        const sq = homeSquare.getBoundingClientRect();

        mempoolOverlay = document.createElement('div');
        const content = document.createElement('div');

        const S = BLOCK.SIZE;
        const D = BLOCK.DEPTH;
        const svgW = S + D * 2;
        const svgH = S + D * 2;

        const faceTop = styles.getPropertyValue('--block-face-top').trim();
        const faceLeft = styles.getPropertyValue('--block-face-left').trim();

        // SVG cube with three visible faces
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
        svg.style.overflow = 'visible';

        // Front face position in SVG coords
        const fx = D, fy = D, fw = S, fh = S;

        // Cube silhouette path
        const cubePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathD = `M ${fx-D},${fy-D}
                       L ${fx+fw-D},${fy-D}
                       L ${fx+fw},${fy}
                       L ${fx+fw},${fy+fh}
                       L ${fx},${fy+fh}
                       L ${fx-D},${fy+fh-D}
                       Z`;
        cubePath.setAttribute('d', pathD);
        cubePath.setAttribute('fill', brandOrange);

        // Face polygons for 3D shading
        const topPts = `${fx},${fy} ${fx+fw},${fy} ${fx+fw-D},${fy-D} ${fx-D},${fy-D}`;
        const leftPts = `${fx},${fy} ${fx},${fy+fh} ${fx-D},${fy+fh-D} ${fx-D},${fy-D}`;

        const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        topFace.setAttribute('points', topPts);
        topFace.setAttribute('fill', faceTop);

        const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        leftFace.setAttribute('points', leftPts);
        leftFace.setAttribute('fill', faceLeft);

        // Front face overlaps slightly to cover edge artifacts
        const frontFace = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        frontFace.setAttribute('x', D - 0.5);
        frontFace.setAttribute('y', D - 0.5);
        frontFace.setAttribute('width', S + 1);
        frontFace.setAttribute('height', S + 1);
        frontFace.setAttribute('fill', brandOrange);

        svg.appendChild(cubePath);
        svg.appendChild(topFace);
        svg.appendChild(leftFace);
        svg.appendChild(frontFace);

        const blockWrapper = document.createElement('div');
        blockWrapper.appendChild(svg);
        blockWrapper.appendChild(content);

        mempoolOverlay.appendChild(blockWrapper);
        document.body.appendChild(mempoolOverlay);

        set(mempoolOverlay, { position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer' });

        const shadow = document.createElement('div');
        mempoolOverlay.insertBefore(shadow, blockWrapper);
        set(shadow, {
            position: 'fixed',
            left: sq.left + 'px', top: sq.top + 'px',
            width: sq.width + 'px', height: sq.height + 'px',
            background: 'rgba(0,0,0,0.4)', filter: 'blur(20px)',
            opacity: 0, pointerEvents: 'none'
        });

        set(blockWrapper, {
            position: 'fixed',
            left: sq.left + 'px', top: sq.top + 'px',
            width: sq.width + 'px', height: sq.height + 'px'
        });

        set(svg, { width: '100%', height: '100%' });

        // Content positioned over the front face
        const pctOffset = (D / svgW * 100) + '%';
        const pctSize = (S / svgW * 100) + '%';
        set(content, {
            position: 'absolute',
            left: pctOffset,
            top: pctOffset,
            width: pctSize,
            height: pctSize,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#fff',
            fontFamily: fontHeading,
            zIndex: 1,
            opacity: 0,
            pointerEvents: 'none'
        });

        let lastData = null;
        function updateContent(d) {
            if (!d) return;

            const setContent = () => {
                content.innerHTML = `<div class="mempool-block-fee">~${d.medianFee} sat/vB</div>
                   <div class="mempool-block-range">${d.minFee} - ${d.maxFee} sat/vB</div>
                   <div class="mempool-block-total">${d.totalBTC} BTC</div>
                   <div class="mempool-block-count">${d.txCount} transactions</div>
                   <div class="mempool-block-time">~10 min</div>`;
            };

            // Heartbeat on data update
            if (lastData && (d.txCount !== lastData.txCount || d.medianFee !== lastData.medianFee)) {
                animate([blockWrapper, shadow], {
                    scale: [1, 1.05, 1, 1.03, 1],
                    duration: 1200,
                    ease: 'inOutQuad',
                    onComplete: setContent
                });
            } else {
                setContent();
            }
            lastData = d;
        }

        dataPromise.then(updateContent);

        // Center the front face on screen (accounting for 3D face offset)
        const centerX = (window.innerWidth - S) / 2;
        const centerY = (window.innerHeight - S) / 2;

        animate(blockWrapper, {
            left: centerX - D,
            top: centerY - D,
            width: svgW,
            height: svgH,
            duration: BLOCK.FLY_IN,
            ease: 'inOutCubic'
        });

        const shadowPad = 20;
        animate(shadow, {
            left: centerX - shadowPad,
            top: centerY + BLOCK.SHADOW_OFFSET - shadowPad,
            width: S + shadowPad * 2,
            height: S + shadowPad * 2,
            opacity: 0.75,
            filter: 'blur(35px)',
            duration: BLOCK.FLY_IN,
            ease: 'inOutCubic'
        });

        animate(content, { opacity: 1, duration: BLOCK.CONTENT_IN, delay: BLOCK.FLY_IN, ease: 'outQuad' });

        animate(blockWrapper, {
            filter: ['brightness(1)', 'brightness(0.85)'],
            duration: BLOCK.PULSE,
            loop: true,
            alternate: true,
            ease: 'inOutSine'
        });

        pollInterval = setInterval(async () => {
            const newData = await fetchMempoolData();
            if (newData) updateContent(newData);
        }, BLOCK.POLL_INTERVAL);

        const close = () => {
            if (!mempoolOverlay) return;
            clearInterval(pollInterval);

            const sqNow = homeSquare.getBoundingClientRect();

            animate(content, { opacity: 0, duration: BLOCK.CONTENT_OUT, ease: 'inQuad' });

            animate(blockWrapper, {
                left: sqNow.left,
                top: sqNow.top,
                width: sqNow.width,
                height: sqNow.height,
                duration: BLOCK.FLY_OUT,
                ease: 'inOutCubic',
                onComplete: () => {
                    mempoolOverlay.remove();
                    mempoolOverlay = null;
                }
            });

            animate(shadow, {
                left: sqNow.left,
                top: sqNow.top,
                width: sqNow.width,
                height: sqNow.height,
                opacity: 0,
                filter: 'blur(20px)',
                duration: BLOCK.FLY_OUT,
                ease: 'inOutCubic'
            });
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

    function initMobileTrigger() {
        const homeLink = document.querySelector('.home-link');
        if (!homeLink) return;

        let touchStart = null;
        const MIN_DISTANCE = 30;
        const ANGLE_MIN = 10, ANGLE_MAX = 80;

        homeLink.addEventListener('touchstart', (e) => {
            if (window.innerWidth > 768) return;
            const t = e.touches[0];
            touchStart = { x: t.clientX, y: t.clientY };
        }, { passive: true });

        homeLink.addEventListener('touchmove', (e) => {
            if (window.innerWidth > 768 || !touchStart) return;
            const t = e.touches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            // Prevent pull-to-refresh during diagonal swipe
            if (angle >= ANGLE_MIN && angle <= ANGLE_MAX && dy > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        homeLink.addEventListener('touchend', (e) => {
            if (window.innerWidth > 768 || !touchStart) return;

            const t = e.changedTouches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            touchStart = null;

            if (dist < MIN_DISTANCE) return; // Tap, not swipe

            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= ANGLE_MIN && angle <= ANGLE_MAX) {
                e.preventDefault();
                if (navigator.vibrate) navigator.vibrate(15);
                showMempoolBlock();
            }
        });

        homeLink.addEventListener('touchcancel', () => { touchStart = null; });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileTrigger);
    } else {
        initMobileTrigger();
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
