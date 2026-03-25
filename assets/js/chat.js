/**
 * Console AI Chat Easter Egg
 *
 * TUI-style overlay triggered by typing "chat" on any page.
 * Calls /api/chat edge function (Claude proxy with GTM Map context).
 * Rate limited to 5 messages per session via sessionStorage.
 *
 * Accessibility: Escape to dismiss, focus trapped in overlay.
 * Reduced motion: disables character-by-character streaming.
 *
 * Security: URLs are linkified using safe DOM methods (createElement),
 * not innerHTML with untrusted content. All user input rendered via
 * textContent only.
 */

export function showChat() {
  if (document.querySelector('.chat-overlay')) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chatHistory = [];
  var remaining = 5;
  var busy = false;

  var sessionCount = parseInt(sessionStorage.getItem('chat_count') || '0', 10);
  if (sessionCount >= 5) {
    console.log(
      '%cYou\'ve used your 5 chat messages this session.\n%cTake the full diagnostic: gtm.shawnyeager.com/map',
      'font-size: 14px; font-weight: bold; color: #d63900;',
      'font-size: 12px; color: #888;'
    );
    return;
  }

  var overlay = document.createElement('div');
  overlay.className = 'chat-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'AI Chat');

  var container = document.createElement('div');
  container.className = 'chat-container';

  var hdr = document.createElement('div');
  hdr.className = 'chat-header';
  var titleEl = document.createElement('span');
  titleEl.className = 'chat-title';
  titleEl.textContent = 'gtm.shawnyeager.com';
  var hintEl = document.createElement('span');
  hintEl.className = 'chat-hint';
  hintEl.textContent = 'Esc to close';
  hdr.appendChild(titleEl);
  hdr.appendChild(hintEl);

  var msgArea = document.createElement('div');
  msgArea.className = 'chat-messages';

  var inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';
  var promptEl = document.createElement('span');
  promptEl.className = 'chat-prompt';
  promptEl.textContent = '>';
  var inputEl = document.createElement('input');
  inputEl.className = 'chat-input';
  inputEl.type = 'text';
  inputEl.placeholder = 'Ask about go-to-market strategy...';
  inputEl.maxLength = 500;
  inputEl.setAttribute('autocomplete', 'off');
  inputEl.setAttribute('spellcheck', 'false');

  inputRow.appendChild(promptEl);
  inputRow.appendChild(inputEl);
  container.appendChild(hdr);
  container.appendChild(msgArea);
  container.appendChild(inputRow);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  addMsg('assistant', 'You found the chat. I\'m trained on the GTM Map diagnostic framework. Ask me about go-to-market strategy, or describe what\'s stuck.');
  requestAnimationFrame(function() { inputEl.focus(); });

  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !busy) {
      var text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      send(text);
    }
  });

  function dismiss() {
    overlay.remove();
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) { if (e.key === 'Escape') dismiss(); }
  document.addEventListener('keydown', onEsc);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });

  function linkifyDOM(el, text) {
    var urlRe = /(https?:\/\/[^\s)]+)/g;
    var last = 0;
    var m;
    while ((m = urlRe.exec(text)) !== null) {
      if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = document.createElement('a');
      a.href = m[1];
      a.textContent = m[1];
      a.target = '_blank';
      a.rel = 'noopener';
      el.appendChild(a);
      last = urlRe.lastIndex;
    }
    if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  }

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'chat-msg chat-msg--' + role;
    if (role === 'assistant' && !reducedMotion) {
      el.textContent = '';
      msgArea.appendChild(el);
      msgArea.scrollTop = msgArea.scrollHeight;
      typeOut(el, text, 0);
    } else {
      if (role === 'assistant') { linkifyDOM(el, text); }
      else { el.textContent = text; }
      msgArea.appendChild(el);
      msgArea.scrollTop = msgArea.scrollHeight;
    }
  }

  function typeOut(el, text, i) {
    if (i < text.length) {
      el.textContent += text[i];
      msgArea.scrollTop = msgArea.scrollHeight;
      setTimeout(function() { typeOut(el, text, i + 1); }, 12);
    } else {
      var full = el.textContent;
      el.textContent = '';
      linkifyDOM(el, full);
    }
  }

  function send(text) {
    busy = true;
    addMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    var dots = document.createElement('div');
    dots.className = 'chat-msg chat-msg--thinking';
    dots.textContent = '...';
    msgArea.appendChild(dots);
    msgArea.scrollTop = msgArea.scrollHeight;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ message: text, history: chatHistory.slice(-8) }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        dots.remove();
        var reply = data.response || 'Something went wrong.';
        addMsg('assistant', reply);
        chatHistory.push({ role: 'assistant', content: reply });
        remaining = data.remaining != null ? data.remaining : remaining - 1;
        var c = parseInt(sessionStorage.getItem('chat_count') || '0', 10) + 1;
        sessionStorage.setItem('chat_count', String(c));
        if (data.done) {
          inputEl.disabled = true;
          inputEl.placeholder = '';
          promptEl.textContent = '\u25A0';
        }
        busy = false;
      })
      .catch(function() {
        dots.remove();
        addMsg('assistant', 'Connection failed. Try again.');
        busy = false;
      });
  }
}

/**
 * Mobile trigger: swipe right starting on/near the brand square.
 * Block uses down-right diagonal, chat uses horizontal right.
 */
export function initMobileTrigger() {
  var homeSquare = document.querySelector('.home-square');
  if (!homeSquare) return;

  var touchStart = null;
  var MIN_DISTANCE = 40;
  var ZONE_EXTEND = 60;

  function inHitZone(x, y) {
    var r = homeSquare.getBoundingClientRect();
    return x >= r.left && x <= r.right + ZONE_EXTEND &&
           y >= r.top - ZONE_EXTEND && y <= r.bottom + ZONE_EXTEND;
  }

  function handleTouchMove(e) {
    if (!touchStart) return;
    var t = e.touches[0];
    var dx = t.clientX - touchStart.x;
    if (dx > 5) e.preventDefault();
  }

  function cleanup() {
    document.removeEventListener('touchmove', handleTouchMove);
    touchStart = null;
  }

  document.addEventListener('touchstart', function(e) {
    if (window.innerWidth > 768) return;
    var t = e.touches[0];
    if (inHitZone(t.clientX, t.clientY)) {
      touchStart = { x: t.clientX, y: t.clientY };
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (window.innerWidth > 768 || !touchStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.x;
    var dy = Math.abs(t.clientY - touchStart.y);
    cleanup();
    if (dx < MIN_DISTANCE) return;
    if (dx > dy) {
      e.preventDefault();
      if (navigator.vibrate) navigator.vibrate(15);
      showChat();
    }
  });

  document.addEventListener('touchcancel', cleanup);
}
