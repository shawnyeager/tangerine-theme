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
        FLY_IN: 650,
        FLY_OUT: 400,
        PULSE: 1200
    };

    let mempoolOverlay = null;
    let mempoolWs = null;
    let pulseAnim = null;
    let eventController = null;

    function parseBlockData(b) {
        const formatFee = (f) => f >= 100 ? Math.round(f) : f >= 10 ? f.toFixed(1) : f.toFixed(2);
        return {
            medianFee: Math.round(b.medianFee),
            minFee: formatFee(b.feeRange[0]),
            maxFee: formatFee(b.feeRange[6]),
            totalBTC: parseFloat((b.totalFees / 100000000).toFixed(3)),
            txCount: b.nTx.toLocaleString()
        };
    }

    async function showMempoolBlock() {
        if (mempoolOverlay) return;

        const homeSquare = document.querySelector('.home-square');
        if (!homeSquare) return;

        const content = document.createElement('div');
        let firstPaint = true;
        let celebrating = false;
        let lastData = null;
        let lastSeenHeight = null; // null until we receive blocks array
        function updateContent(d) {
            lastData = d;
            if (!d) return;
            content.style.display = 'flex';
            content.innerHTML = `<div class="mempool-block-fee">~${d.medianFee} sat/vB</div>
               <div class="mempool-block-range">${d.minFee} - ${d.maxFee} sat/vB</div>
               <div class="mempool-block-total">${d.totalBTC} BTC</div>
               <div class="mempool-block-count">${d.txCount} transactions</div>
               <div class="mempool-block-time">~10 min</div>`;
            if (firstPaint && window.anime) {
                firstPaint = false;
                const { animate, stagger } = window.anime;
                animate(content.children, {
                    opacity: [0, 1],
                    translateY: [10, 0],
                    delay: stagger(50),
                    duration: 200,
                    ease: 'outQuad'
                });
            }
        }
        function connectWs() {
            if (mempoolWs) return;
            mempoolWs = new WebSocket('wss://mempool.space/api/v1/ws');
            mempoolWs.onopen = () => {
                mempoolWs.send(JSON.stringify({ action: 'want', data: ['blocks', 'mempool-blocks'] }));
            };
            mempoolWs.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                // Track initial block height from blocks array
                if (msg.blocks && msg.blocks.length > 0) {
                    lastSeenHeight = msg.blocks[0].height;
                }
                // Only celebrate if we have baseline AND this is a NEW block
                if (msg.block && lastSeenHeight !== null && msg.block.height > lastSeenHeight) {
                    lastSeenHeight = msg.block.height;
                    celebrateNewBlock(msg.block.height);
                }
                if (msg['mempool-blocks'] && !celebrating) {
                    updateContent(parseBlockData(msg['mempool-blocks'][0]));
                }
            };
            mempoolWs.onerror = (e) => console.error('WebSocket error:', e);
        }

        let celebrateNewBlock = () => {}; // Placeholder until blockWrapper exists

        if (!window.anime) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/animejs';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        const { animate, set, stagger, createTimeline } = anime;

        const styles = getComputedStyle(document.documentElement);
        const brandOrange = styles.getPropertyValue('--brand-orange').trim();
        const fontHeading = styles.getPropertyValue('--font-heading').trim();

        const sq = homeSquare.getBoundingClientRect();

        mempoolOverlay = document.createElement('div');

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

        // Shadow inside blockWrapper - moves as one unit
        const shadow = document.createElement('div');
        const shadowPad = 20;
        const shadowOffsetX = D - shadowPad; // 15px right of block origin
        const shadowOffsetY = BLOCK.SHADOW_OFFSET; // 40px below block origin

        // Container for block + shadow (animate this for position)
        const blockGroup = document.createElement('div');
        blockGroup.appendChild(shadow);
        blockGroup.appendChild(blockWrapper);

        // Now that blockGroup exists, wire up new block celebration
        celebrateNewBlock = (height) => {
            celebrating = true;
            if (pulseAnim) pulseAnim.pause();
            const centerX = (window.innerWidth - S) / 2 - D;
            const offRight = window.innerWidth + 100;
            const offLeft = -svgW - 100;

            // Haptic feedback on mobile
            if (navigator.vibrate) navigator.vibrate([50, 30, 100]);

            createTimeline()
                .add(content, { opacity: 0, duration: 100, ease: 'outQuad' })
                .call(() => {
                    content.innerHTML = `<div class="mempool-block-height">${height.toLocaleString()}</div>`;
                    content.style.display = 'flex';
                })
                // Elastic stamp - impactful arrival
                .add(content.firstChild, { scale: [0, 1.2, 1], opacity: [0, 1], duration: 400, ease: 'outElastic(1, 0.6)' })
                // Wind-up before exit - animate container (block+shadow move as one)
                .add(blockGroup, { left: centerX - 20, duration: 150, ease: 'inQuad' }, '+=500')
                // Fly off right - container moves, shadow fades
                .add(blockGroup, { left: offRight, duration: 400, ease: 'inCubic' })
                .add(shadow, { opacity: 0, duration: 400, ease: 'inCubic' }, '<')
                .call(() => { content.style.display = 'none'; }, '+=250')
                // Fly in from left - shadow visible from start
                .call(() => { set(shadow, { opacity: 0.75 }); })
                .add(blockGroup, { left: [offLeft, centerX], duration: 500, ease: 'outBack(1.1)' })
                .call(() => {
                    celebrating = false;
                    firstPaint = true;
                    set(content, { opacity: 1 });
                    content.style.display = 'flex';
                    if (lastData) updateContent(lastData);
                    if (pulseAnim) pulseAnim.play();
                });
        };

        mempoolOverlay.appendChild(blockGroup);
        document.body.appendChild(mempoolOverlay);

        set(mempoolOverlay, { position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer' });

        // blockGroup is the animated container
        set(blockGroup, {
            position: 'fixed',
            left: sq.left + 'px', top: sq.top + 'px',
            width: svgW + 'px', height: svgH + 'px',
            overflow: 'visible'
        });

        // Shadow positioned relative to blockGroup
        set(shadow, {
            position: 'absolute',
            left: shadowOffsetX + 'px', top: shadowOffsetY + 'px',
            width: sq.width + 'px', height: sq.height + 'px',
            background: 'rgba(0,0,0,0.4)', filter: 'blur(20px)',
            opacity: 0, pointerEvents: 'none'
        });

        // blockWrapper at origin of blockGroup
        set(blockWrapper, {
            position: 'absolute',
            left: 0, top: 0,
            width: sq.width + 'px', height: sq.height + 'px'
        });

        set(svg, { width: '100%', height: '100%' });

        // Position content over front face
        const pctOffset = (D / svgW * 100) + '%';
        const pctSize = (S / svgW * 100) + '%';
        Object.assign(content.style, {
            position: 'absolute',
            left: pctOffset,
            top: pctOffset,
            width: pctSize,
            height: pctSize,
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#fff',
            fontFamily: fontHeading,
            zIndex: 10,
            pointerEvents: 'none'
        });

        // Prefetch data via HTTP (faster than waiting for WS)
        fetch('https://mempool.space/api/v1/fees/mempool-blocks')
            .then(r => r.json())
            .then(blocks => {
                if (blocks && blocks[0] && !lastData) {
                    updateContent(parseBlockData(blocks[0]));
                }
            })
            .catch(() => {}); // Silently fail, WS will provide data

        // Start WS for live updates
        connectWs();

        // Center front face on screen (accounting for 3D offset)
        const centerX = (window.innerWidth - S) / 2;
        const centerY = (window.innerHeight - S) / 2;

        // Fly-in: animate blockGroup as single unit
        const blockEndLeft = centerX - D;
        const blockEndTop = centerY - D;

        createTimeline({ defaults: { duration: BLOCK.FLY_IN }})
            // Shadow fades in and grows (position relative to blockGroup)
            .add(shadow, {
                width: S + shadowPad * 2,
                height: S + shadowPad * 2,
                opacity: 0.75,
                filter: 'blur(35px)',
                ease: 'inOutQuad'
            }, 0)
            // blockGroup moves and grows (carries both block and shadow)
            .add(blockGroup, {
                left: blockEndLeft,
                top: blockEndTop,
                ease: 'inOutBack(1.3)'
            }, 30)
            .add(blockGroup, {
                width: svgW,
                height: svgH,
                ease: 'outBack(1.2)'
            }, 80)
            // blockWrapper fills the blockGroup
            .add(blockWrapper, {
                width: svgW,
                height: svgH,
                ease: 'outBack(1.2)'
            }, 80);

        // Pulse animation (stored for pause/resume on visibility change)
        pulseAnim = animate(blockWrapper, {
            filter: ['brightness(1)', 'brightness(0.88)'],
            duration: BLOCK.PULSE,
            loop: true,
            alternate: true,
            ease: 'inOutSine'
        });

        const close = () => {
            if (!mempoolOverlay) return;
            if (mempoolWs) { mempoolWs.close(); mempoolWs = null; }
            if (pulseAnim) { pulseAnim.pause(); pulseAnim = null; }
            if (eventController) { eventController.abort(); eventController = null; }

            content.style.display = 'none';
            const sqNow = homeSquare.getBoundingClientRect();

            createTimeline({ defaults: { duration: BLOCK.FLY_OUT }})
                // Size shrinks first (both blockGroup and blockWrapper)
                .add(blockGroup, {
                    width: sqNow.width,
                    height: sqNow.height,
                    ease: 'inBack(1.2)'
                }, 0)
                .add(blockWrapper, {
                    width: sqNow.width,
                    height: sqNow.height,
                    ease: 'inBack(1.2)'
                }, 0)
                // Position follows (blockGroup carries everything)
                .add(blockGroup, {
                    left: sqNow.left,
                    top: sqNow.top,
                    ease: 'inOutBack(1.3)'
                }, 30)
                // Shadow shrinks and fades (position is relative, just animate size/opacity)
                .add(shadow, {
                    width: sqNow.width,
                    height: sqNow.height,
                    opacity: 0,
                    filter: 'blur(20px)',
                    ease: 'inOutQuad'
                }, 60)
                .call(() => { mempoolOverlay.remove(); mempoolOverlay = null; });
        };

        // Event listeners with AbortController for clean teardown
        eventController = new AbortController();
        const { signal } = eventController;

        mempoolOverlay.addEventListener('click', close, { signal });
        document.addEventListener('keydown', e => e.key === 'Escape' && close(), { signal });
        // Debug: 'n' triggers fake new block celebration
        document.addEventListener('keydown', e => {
            if (e.key === 'n' && mempoolOverlay && !celebrating) {
                celebrateNewBlock((lastSeenHeight || 876000) + 1);
            }
        }, { signal });
        document.addEventListener('visibilitychange', () => {
            if (!mempoolOverlay) return;
            if (document.hidden) {
                if (mempoolWs) { mempoolWs.close(); mempoolWs = null; }
                if (pulseAnim) pulseAnim.pause();
            } else {
                connectWs();
                if (pulseAnim) pulseAnim.play();
            }
        }, { signal });
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
        const homeSquare = document.querySelector('.home-square');
        if (!homeSquare) return;

        let touchStart = null;
        const MIN_DISTANCE = 30;
        const ANGLE_MIN = 10, ANGLE_MAX = 80;
        const ZONE_EXTEND = 60; // px to extend hit zone down and right

        function inHitZone(x, y) {
            const r = homeSquare.getBoundingClientRect();
            // Include the square itself plus extended zone below and to the right
            return x >= r.left && x <= r.right + ZONE_EXTEND &&
                   y >= r.top && y <= r.bottom + ZONE_EXTEND;
        }

        document.addEventListener('touchstart', (e) => {
            if (window.innerWidth > 768) return;
            const t = e.touches[0];
            if (inHitZone(t.clientX, t.clientY)) {
                touchStart = { x: t.clientX, y: t.clientY };
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (window.innerWidth > 768 || !touchStart) return;
            const t = e.touches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= ANGLE_MIN && angle <= ANGLE_MAX && dy > 5) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (window.innerWidth > 768 || !touchStart) return;

            const t = e.changedTouches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            touchStart = null;

            if (dist < MIN_DISTANCE) return;

            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= ANGLE_MIN && angle <= ANGLE_MAX) {
                e.preventDefault();
                if (navigator.vibrate) navigator.vibrate(15);
                showMempoolBlock();
            }
        });

        document.addEventListener('touchcancel', () => { touchStart = null; });
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
