/**
 * Mempool Block Easter Egg
 * 
 * Shows live mempool.space next block data in an animated 3D block.
 * 
 * Activation:
 * - Desktop: Type "block" anywhere on page
 * - Mobile: Diagonal swipe (down-right) on brand square
 * 
 * Dismissal: Click/tap anywhere or press Escape
 * 
 * This module is lazy-loaded to reduce initial JS bundle size.
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

export async function showMempoolBlock() {
    if (mempoolOverlay) return;

    const homeSquare = document.querySelector('.home-square');
    if (!homeSquare) return;

    const content = document.createElement('div');
    let firstPaint = true;
    let celebrating = false;
    let lastData = null;
    let lastSeenHeight = null;

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
            const children = Array.from(content.children);
            void content.offsetHeight;
            const targetOpacities = children.map(el =>
                parseFloat(getComputedStyle(el).opacity) || 1
            );
            animate(content.children, {
                opacity: (_, i) => [0, targetOpacities[i]],
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
            if (msg.blocks && msg.blocks.length > 0) {
                lastSeenHeight = msg.blocks[0].height;
            }
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

    let celebrateNewBlock = () => {};

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

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.style.overflow = 'visible';

    const fx = D, fy = D, fw = S, fh = S;

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

    const topPts = `${fx},${fy} ${fx+fw},${fy} ${fx+fw-D},${fy-D} ${fx-D},${fy-D}`;
    const leftPts = `${fx},${fy} ${fx},${fy+fh} ${fx-D},${fy+fh-D} ${fx-D},${fy-D}`;

    const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    topFace.setAttribute('points', topPts);
    topFace.setAttribute('fill', faceTop);

    const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    leftFace.setAttribute('points', leftPts);
    leftFace.setAttribute('fill', faceLeft);

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

    const block = document.createElement('div');

    const shadow = document.createElement('div');
    const shadowPad = 20;
    const shadowOffsetX = D - shadowPad;
    const shadowOffsetY = BLOCK.SHADOW_OFFSET;

    block.appendChild(shadow);
    block.appendChild(svg);
    block.appendChild(content);

    const startScale = sq.width / svgW;

    celebrateNewBlock = (height) => {
        celebrating = true;
        if (pulseAnim) pulseAnim.pause();
        const centerX = (window.innerWidth - S) / 2 - D;
        const offRight = window.innerWidth + 100;
        const offLeft = -svgW - 100;

        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);

        const heightEl = document.createElement('div');
        heightEl.className = 'mempool-block-height';
        heightEl.textContent = height.toLocaleString();

        createTimeline()
            .add(content, { opacity: 0, duration: 100, ease: 'outQuad' })
            .call(() => {
                content.innerHTML = '';
                content.appendChild(heightEl);
                content.style.display = 'flex';
                set(content, { opacity: 1 });
            })
            .add(heightEl, { scale: [0, 1], opacity: [0, 1], duration: 800, ease: 'outBack(2)' })
            .add(block, { left: centerX - 20, duration: 150, ease: 'inQuad' }, '+=600')
            .add(block, { left: offRight, duration: 400, ease: 'inCubic' })
            .add(shadow, { opacity: 0, duration: 400, ease: 'inCubic' }, '<')
            .call(() => { content.style.display = 'none'; }, '+=250')
            .call(() => { set(shadow, { opacity: 0.75 }); })
            .add(block, { left: [offLeft, centerX], duration: 500, ease: 'outQuad' })
            .call(() => {
                celebrating = false;
                firstPaint = true;
                set(content, { opacity: 1 });
                content.style.display = 'flex';
                if (lastData) updateContent(lastData);
                if (pulseAnim) pulseAnim.play();
            });
    };

    mempoolOverlay.appendChild(block);
    document.body.appendChild(mempoolOverlay);

    set(mempoolOverlay, { position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer' });

    set(block, {
        position: 'fixed',
        left: sq.left + 'px', top: sq.top + 'px',
        width: svgW + 'px', height: svgH + 'px',
        transformOrigin: '0 0',
        scale: startScale,
        overflow: 'visible'
    });

    set(shadow, {
        position: 'absolute',
        left: shadowOffsetX + 'px', top: shadowOffsetY + 'px',
        width: (S + shadowPad * 2) + 'px', height: (S + shadowPad * 2) + 'px',
        background: 'rgba(0,0,0,0.4)', filter: 'blur(35px)',
        opacity: 0, pointerEvents: 'none'
    });

    set(svg, {
        position: 'absolute',
        left: 0, top: 0,
        width: '100%', height: '100%'
    });

    Object.assign(content.style, {
        position: 'absolute',
        left: D + 'px', top: D + 'px',
        width: S + 'px', height: S + 'px',
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

    fetch('https://mempool.space/api/v1/fees/mempool-blocks')
        .then(r => r.json())
        .then(blocks => {
            if (blocks && blocks[0] && !lastData) {
                updateContent(parseBlockData(blocks[0]));
            }
        })
        .catch(() => {});

    connectWs();

    const centerX = (window.innerWidth - S) / 2;
    const centerY = (window.innerHeight - S) / 2;

    const blockEndLeft = centerX - D;
    const blockEndTop = centerY - D;

    createTimeline({ defaults: { duration: BLOCK.FLY_IN }})
        .add(shadow, { opacity: 0.75, ease: 'inOutQuad' }, 0)
        .add(block, {
            left: blockEndLeft,
            top: blockEndTop,
            scale: 1,
            ease: 'outQuad'
        }, 0);

    pulseAnim = animate(block, {
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

        const sqNow = homeSquare.getBoundingClientRect();
        const endScale = sqNow.width / svgW;

        createTimeline({ defaults: { duration: BLOCK.FLY_OUT }})
            .add(block, {
                left: sqNow.left,
                top: sqNow.top,
                scale: endScale,
                ease: 'inQuad'
            }, 0)
            .add(shadow, { opacity: 0, ease: 'inQuad' }, 0)
            .call(() => { mempoolOverlay.remove(); mempoolOverlay = null; });
    };

    eventController = new AbortController();
    const { signal } = eventController;

    mempoolOverlay.addEventListener('click', close, { signal });
    document.addEventListener('keydown', e => e.key === 'Escape' && close(), { signal });
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

export function initMobileTrigger() {
    const homeSquare = document.querySelector('.home-square');
    if (!homeSquare) return;

    let touchStart = null;
    const MIN_DISTANCE = 30;
    const ANGLE_MIN = 10, ANGLE_MAX = 80;
    const ZONE_EXTEND = 60;

    function inHitZone(x, y) {
        const r = homeSquare.getBoundingClientRect();
        return x >= r.left && x <= r.right + ZONE_EXTEND &&
               y >= r.top && y <= r.bottom + ZONE_EXTEND;
    }

    function handleTouchMove(e) {
        const t = e.touches[0];
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= ANGLE_MIN && angle <= ANGLE_MAX && dy > 5) {
            e.preventDefault();
        }
    }

    function cleanupTouchMove() {
        document.removeEventListener('touchmove', handleTouchMove);
        touchStart = null;
    }

    document.addEventListener('touchstart', (e) => {
        if (window.innerWidth > 768) return;
        const t = e.touches[0];
        if (inHitZone(t.clientX, t.clientY)) {
            touchStart = { x: t.clientX, y: t.clientY };
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (window.innerWidth > 768 || !touchStart) return;

        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        cleanupTouchMove();

        if (dist < MIN_DISTANCE) return;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= ANGLE_MIN && angle <= ANGLE_MAX) {
            e.preventDefault();
            if (navigator.vibrate) navigator.vibrate(15);
            showMempoolBlock();
        }
    });

    document.addEventListener('touchcancel', cleanupTouchMove);
}
