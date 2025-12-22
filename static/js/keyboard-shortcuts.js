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

    // Block easter egg - shows live mempool.space next block data
    // Triggered by typing 'block' anywhere on page
    const BLOCK = {
        SIZE_FINAL: 240,
        FACE_DEPTH_FINAL: 35,
        FACE_SKEW: 45,  // degrees
        SHADOW_OFFSET_FINAL: 40,
        // Animation durations (ms)
        ANIM_FLY_IN: 600,
        ANIM_FLY_OUT: 400,
        ANIM_CONTENT_IN: 300,
        ANIM_CONTENT_OUT: 100,
        ANIM_PULSE: 1200,
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

        // Load anime.js (required for animation)
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

        // Fetch data async - will update content when ready
        const dataPromise = fetchMempoolData();

        // Read design tokens from CSS
        const styles = getComputedStyle(document.documentElement);
        const brandOrange = styles.getPropertyValue('--brand-orange').trim();
        const fontHeading = styles.getPropertyValue('--font-heading').trim();

        // Get home-square position
        const sq = homeSquare.getBoundingClientRect();

        // Create elements - using SVG for seamless 3D faces (no subpixel gaps)
        mempoolOverlay = document.createElement('div');
        const content = document.createElement('div');

        // SVG dimensions: S = block size, D = depth
        const S = BLOCK.SIZE_FINAL;
        const D = BLOCK.FACE_DEPTH_FINAL;
        // ViewBox must accommodate the skewed faces:
        // - Top face extends D pixels right beyond front face
        // - Left face extends D pixels down beyond front face
        const svgW = S + D + D; // 310
        const svgH = S + D + D; // 310

        // Read face colors from CSS tokens
        const faceTop = styles.getPropertyValue('--block-face-top').trim();
        const faceLeft = styles.getPropertyValue('--block-face-left').trim();

        // Create SVG block with three faces as polygons
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
        svg.style.overflow = 'visible';

        // Front face position in SVG coords
        const fx = D;      // 35
        const fy = D;      // 35
        const fw = S;      // 240
        const fh = S;      // 240

        // Draw entire cube as a single path - no seams
        // Back corner (0,0), then clockwise around the visible surface
        const cubePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // M = back corner, then trace: top-right of top face, front top-right,
        // front bottom-right, front bottom-left, bottom-left of left face, back to start
        const pathD = `M ${fx-D},${fy-D}
                       L ${fx+fw-D},${fy-D}
                       L ${fx+fw},${fy}
                       L ${fx+fw},${fy+fh}
                       L ${fx},${fy+fh}
                       L ${fx-D},${fy+fh-D}
                       Z`;
        cubePath.setAttribute('d', pathD);
        cubePath.setAttribute('fill', brandOrange);

        // Draw faces with gradients to show 3D depth
        const topFull = `${fx},${fy} ${fx+fw},${fy} ${fx+fw-D},${fy-D} ${fx-D},${fy-D}`;
        const leftFull = `${fx},${fy} ${fx},${fy+fh} ${fx-D},${fy+fh-D} ${fx-D},${fy-D}`;

        const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        topFace.setAttribute('points', topFull);
        topFace.setAttribute('fill', faceTop);

        const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        leftFace.setAttribute('points', leftFull);
        leftFace.setAttribute('fill', faceLeft);

        // Front face overlaps slightly to cover any edge artifacts
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

        // Wrapper holds SVG + content so pulse filter affects both
        const blockWrapper = document.createElement('div');
        blockWrapper.appendChild(svg);
        blockWrapper.appendChild(content);

        mempoolOverlay.appendChild(blockWrapper);
        document.body.appendChild(mempoolOverlay);

        // Click target
        set(mempoolOverlay, {
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            cursor: 'pointer'
        });

        // Shadow element
        const shadow = document.createElement('div');
        mempoolOverlay.insertBefore(shadow, blockWrapper);
        set(shadow, {
            position: 'fixed',
            left: sq.left + 'px',
            top: sq.top + 'px',
            width: sq.width + 'px',
            height: sq.height + 'px',
            background: 'rgba(0,0,0,0.4)',
            filter: 'blur(20px)',
            opacity: 0,
            pointerEvents: 'none'
        });

        // Wrapper starts at home-square size/position
        set(blockWrapper, {
            position: 'fixed',
            left: sq.left + 'px',
            top: sq.top + 'px',
            width: sq.width + 'px',
            height: sq.height + 'px'
        });

        // SVG fills wrapper
        set(svg, {
            width: '100%',
            height: '100%'
        });

        // Content - positioned over the front face using percentages to scale with wrapper
        // Front face is at (D, D) in SVG viewBox of (svgW, svgH)
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

        // Update content when data arrives
        dataPromise.then(updateContent);

        // Final positions - SVG includes 3D faces extending beyond front face
        // Position so the front face (at fx,fy in SVG) is centered on screen
        const contentLeft = (window.innerWidth - S) / 2;
        const contentTop = (window.innerHeight - S) / 2;
        // SVG position accounts for the front face offset within the SVG
        const finalLeft = contentLeft - D;
        const finalTop = contentTop - D;

        // Fly wrapper to center
        animate(blockWrapper, {
            left: finalLeft,
            top: finalTop,
            width: svgW,
            height: svgH,
            duration: BLOCK.ANIM_FLY_IN,
            ease: 'inOutCubic'
        });

        // Shadow positioned under front face
        const shadowPad = 20;
        animate(shadow, {
            left: contentLeft - shadowPad,
            top: contentTop + BLOCK.SHADOW_OFFSET_FINAL - shadowPad,
            width: S + shadowPad * 2,
            height: S + shadowPad * 2,
            opacity: 0.75,
            filter: 'blur(35px)',
            duration: BLOCK.ANIM_FLY_IN,
            ease: 'inOutCubic'
        });

        // 3D faces are shown immediately (full shape) - no point animation needed

        // Show content after fly-in completes
        animate(content, { opacity: 1, duration: BLOCK.ANIM_CONTENT_IN, delay: BLOCK.ANIM_FLY_IN, ease: 'outQuad' });

        // Pulse animation on wrapper (affects both SVG and content)
        animate(blockWrapper, {
            filter: ['brightness(1)', 'brightness(0.85)'],
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

            // Hide content immediately
            animate(content, { opacity: 0, duration: BLOCK.ANIM_CONTENT_OUT, ease: 'inQuad' });

            // Fly wrapper back to origin
            animate(blockWrapper, {
                left: sqNow.left,
                top: sqNow.top,
                width: sqNow.width,
                height: sqNow.height,
                duration: BLOCK.ANIM_FLY_OUT,
                ease: 'inOutCubic',
                onComplete: () => {
                    mempoolOverlay.remove();
                    mempoolOverlay = null;
                }
            });

            // Shadow shrinks back and fades out
            animate(shadow, {
                left: sqNow.left,
                top: sqNow.top,
                width: sqNow.width,
                height: sqNow.height,
                opacity: 0,
                filter: 'blur(20px)',
                duration: BLOCK.ANIM_FLY_OUT,
                ease: 'inOutCubic'
            });

            // 3D faces stay visible during fly-out (SVG scales with size animation)
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

    // Mobile easter egg: diagonal swipe on brand square
    // Swipe down-right (45°) to "pull" the block out in the direction it emerges
    function initMobileTrigger() {
        const homeLink = document.querySelector('.home-link');
        if (!homeLink) return;

        let touchStart = null;
        let isValidSwipe = false;

        homeLink.addEventListener('touchstart', (e) => {
            if (window.innerWidth > 768) return;
            const touch = e.touches[0];
            touchStart = { x: touch.clientX, y: touch.clientY };
            isValidSwipe = false;
        }, { passive: true });

        homeLink.addEventListener('touchmove', (e) => {
            if (window.innerWidth > 768 || !touchStart) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStart.x;
            const deltaY = touch.clientY - touchStart.y;
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            // If moving in the right diagonal direction, prevent pull-to-refresh
            if (angle >= 10 && angle <= 80 && deltaY > 10) {
                e.preventDefault();
                isValidSwipe = true;
            }
        }, { passive: false });

        homeLink.addEventListener('touchend', (e) => {
            if (window.innerWidth > 768 || !touchStart) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStart.x;
            const deltaY = touch.clientY - touchStart.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Check if it's a swipe (not a tap)
            if (distance < 30) {
                touchStart = null;
                isValidSwipe = false;
                return; // Let normal tap/click happen
            }

            // Calculate angle (0° = right, 90° = down)
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            // Accept 10°-80° range (down-right diagonal, forgiving)
            if (angle >= 10 && angle <= 80 && distance >= 30) {
                e.preventDefault();
                // Haptic feedback if available
                if (navigator.vibrate) navigator.vibrate(15);
                showMempoolBlock();
            }

            touchStart = null;
            isValidSwipe = false;
        });

        // Reset state if touch is interrupted
        homeLink.addEventListener('touchcancel', () => {
            touchStart = null;
            isValidSwipe = false;
        });
    }

    // Initialize mobile trigger when DOM is ready
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
