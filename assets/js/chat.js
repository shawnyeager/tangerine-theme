/**
 * AI Chat — Go-to-Market Advisor
 *
 * Overlay triggered by header icon or typing "chat".
 * Calls /api/chat with GTM Map context.
 * Rate limited per session via cookie (server) and sessionStorage (client).
 *
 * Mobile: Full-viewport layout, visualViewport API for iOS keyboard,
 * interactive-widget=resizes-content handles Android. Back button
 * closes chat via history.pushState/popstate.
 *
 * Accessibility: Modal dialog with focus trap, aria-modal, aria-live.
 * Replies render in full when they arrive. Reduced motion is handled in CSS.
 *
 * Security: URLs are linkified using safe DOM methods (createElement),
 * not innerHTML with untrusted content. All user input rendered via
 * textContent only.
 */

var SESSION_END_COPY =
  "That's all for this session. The full GTM diagnostic is at https://gtm.shawnyeager.com. It takes 10 minutes.";

export function showChat() {
  if (document.querySelector('.chat-overlay')) return;

  var chatHistory = [];
  var busy = false;
  var isMobile = window.matchMedia('(max-width: 600px)').matches;
  var cleanupVV = null;
  var dismissed = false;
  var savedScrollY = 0;
  var inertTargets = [];
  var sendBtn = null;
  var abortCtl = null;
  var triggerElement = document.activeElement;
  var sessionEnded = sessionStorage.getItem('chat_done') === '1';

  // --- Analytics ---
  if (typeof plausible === 'function') plausible('chat-open');

  // --- Build DOM ---

  var overlay = document.createElement('div');
  overlay.className = 'chat-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  var container = document.createElement('div');
  container.className = 'chat-container';

  var hdr = document.createElement('div');
  hdr.className = 'chat-header';
  var titleEl = document.createElement('span');
  titleEl.className = 'chat-title';
  titleEl.id = 'chat-dialog-title';
  titleEl.textContent = 'Go-to-Market Advisor';
  overlay.setAttribute('aria-labelledby', 'chat-dialog-title');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'chat-close';
  closeBtn.type = 'button';
  closeBtn.textContent = '\u00d7';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.addEventListener('click', function() { dismiss(); });
  hdr.appendChild(titleEl);
  hdr.appendChild(closeBtn);

  var msgArea = document.createElement('div');
  msgArea.className = 'chat-messages';
  msgArea.setAttribute('aria-live', 'polite');
  msgArea.setAttribute('aria-relevant', 'additions');

  var inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';
  var inputEl = document.createElement('input');
  inputEl.className = 'chat-input';
  inputEl.type = 'text';
  inputEl.placeholder = 'Positioning, pricing, pipeline...';
  inputEl.maxLength = 500;
  inputEl.setAttribute('autocomplete', 'off');
  inputEl.setAttribute('spellcheck', 'true');
  inputEl.setAttribute('aria-label', 'Type your message');

  inputRow.appendChild(inputEl);

  // Send button — mobile only
  if (isMobile) {
    sendBtn = document.createElement('button');
    sendBtn.className = 'chat-send';
    sendBtn.type = 'button';
    sendBtn.textContent = '\u2192';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.disabled = true;
    sendBtn.addEventListener('click', function() {
      if (busy) return;
      var text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      sendBtn.disabled = true;
      send(text);
    });
    inputRow.appendChild(sendBtn);

    inputEl.addEventListener('input', function() {
      sendBtn.disabled = !inputEl.value.trim() || busy || inputEl.disabled;
    });
  }

  container.appendChild(hdr);
  container.appendChild(msgArea);
  container.appendChild(inputRow);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // --- Body scroll lock (position:fixed pattern for iOS) ---
  savedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + savedScrollY + 'px';
  document.body.style.width = '100%';

  // --- Mark background content as inert ---
  var bodyChildren = document.body.children;
  for (var ci = 0; ci < bodyChildren.length; ci++) {
    var child = bodyChildren[ci];
    if (child !== overlay && !child.hasAttribute('inert')) {
      child.setAttribute('inert', '');
      inertTargets.push(child);
    }
  }

  // --- History state for back-button dismiss ---
  history.pushState({ chatOpen: true }, '');
  function onPopState() { dismiss(); }
  window.addEventListener('popstate', onPopState);

  // --- Focus trap ---
  container.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var focusable = container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), a[href]'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  if (sessionEnded) {
    addMsg('assistant', SESSION_END_COPY);
    endSession(false);
    requestAnimationFrame(function() { closeBtn.focus(); });
  } else {
    addMsg('assistant', 'Hey. I know go-to-market. What are you working on?');
    requestAnimationFrame(function() { inputEl.focus(); });
    fetch('/api/chat', { method: 'HEAD' }).catch(function() {});
  }

  // --- Mobile: visualViewport keyboard handler ---
  if (isMobile && window.visualViewport) {
    var vv = window.visualViewport;
    var pendingVVUpdate = false;
    var lastVVHeight = vv.height;

    function adjustForKeyboard() {
      if (pendingVVUpdate) return;
      pendingVVUpdate = true;
      requestAnimationFrame(function() {
        pendingVVUpdate = false;
        var visibleHeight = vv.height;
        if (Math.abs(visibleHeight - lastVVHeight) < 2) return;
        lastVVHeight = visibleHeight;
        container.style.height = visibleHeight + 'px';
        if (vv.offsetTop > 0) {
          container.style.top = vv.offsetTop + 'px';
        } else {
          container.style.top = '';
        }
      });
    }

    vv.addEventListener('resize', adjustForKeyboard);
    vv.addEventListener('scroll', adjustForKeyboard);

    cleanupVV = function() {
      vv.removeEventListener('resize', adjustForKeyboard);
      vv.removeEventListener('scroll', adjustForKeyboard);
      container.style.height = '';
      container.style.top = '';
    };
  }

  // --- Mobile: tap messages area to dismiss keyboard ---
  if (isMobile) {
    msgArea.addEventListener('touchstart', function() {
      if (document.activeElement === inputEl) {
        inputEl.blur();
      }
    }, { passive: true });
  }

  // --- Input: Enter to send ---
  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !busy && !inputEl.disabled) {
      var text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      if (sendBtn) sendBtn.disabled = true;
      send(text);
    }
  });

  // --- Dismiss ---
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (abortCtl) abortCtl.abort();
    overlay.remove();
    document.removeEventListener('keydown', onEsc);
    window.removeEventListener('popstate', onPopState);
    if (cleanupVV) cleanupVV();

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);

    for (var i = 0; i < inertTargets.length; i++) {
      inertTargets[i].removeAttribute('inert');
    }

    if (triggerElement && triggerElement.focus) {
      triggerElement.focus();
    }

    if (history.state && history.state.chatOpen) {
      history.replaceState(null, '');
    }
  }

  function onEsc(e) { if (e.key === 'Escape') dismiss(); }
  document.addEventListener('keydown', onEsc);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });

  function endSession(appendCta) {
    sessionEnded = true;
    sessionStorage.setItem('chat_done', '1');
    if (appendCta) addMsg('assistant', SESSION_END_COPY);
    inputEl.disabled = true;
    inputEl.placeholder = '';
    inputRow.hidden = true;
    overlay.removeAttribute('aria-busy');
    if (sendBtn) sendBtn.disabled = true;
  }

  function errorCopy(status) {
    if (status === 400) {
      return 'That message could not be sent. Try shortening it. It is still in the field.';
    }
    if (status === 429) {
      return 'This session is out of messages. The full diagnostic is at https://gtm.shawnyeager.com.';
    }
    if (status === 502 || status === 500) {
      return 'The advisor is unavailable right now. Your message is still in the field. Press Enter to try again.';
    }
    return 'Could not connect. Your message is still in the field. Press Enter to try again.';
  }

  // --- Markdown rendering ---

  function renderMarkdown(el, text) {
    var lines = text.split('\n');
    var inList = false;
    var listEl = null;

    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      var olMatch = line.match(/^\d+\.\s+(.*)/);
      var ulMatch = line.match(/^[-*]\s+(.*)/);

      if (olMatch) {
        if (!inList) { listEl = document.createElement('ol'); inList = true; }
        var item = document.createElement('li');
        renderInline(item, olMatch[1]);
        listEl.appendChild(item);
      } else if (ulMatch) {
        if (!inList) { listEl = document.createElement('ul'); listEl.className = 'chat-list'; inList = true; }
        var item = document.createElement('li');
        renderInline(item, ulMatch[1]);
        listEl.appendChild(item);
      } else {
        if (inList) { el.appendChild(listEl); inList = false; listEl = null; }
        if (line.trim() === '') {
          if (li > 0 && li < lines.length - 1) el.appendChild(document.createElement('br'));
        } else {
          var p = document.createElement('span');
          p.className = 'chat-line';
          renderInline(p, line);
          el.appendChild(p);
        }
      }
    }
    if (inList) el.appendChild(listEl);
  }

  function renderInline(el, text) {
    var re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s)]+)|\*\*(.+?)\*\*|\*(.+?)\*/g;
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1]) {
        var a = document.createElement('a');
        a.href = m[2]; a.textContent = m[1]; a.target = '_blank'; a.rel = 'noopener';
        el.appendChild(a);
      } else if (m[3]) {
        var url = m[3].replace(/[.,;:!?)]+$/, '');
        var trailing = m[3].slice(url.length);
        var a = document.createElement('a');
        a.href = url; a.textContent = url; a.target = '_blank'; a.rel = 'noopener';
        el.appendChild(a);
        if (trailing) { el.appendChild(document.createTextNode(trailing)); }
      } else if (m[4]) {
        var b = document.createElement('strong');
        b.textContent = m[4];
        el.appendChild(b);
      } else if (m[5]) {
        var em = document.createElement('em');
        em.textContent = m[5];
        el.appendChild(em);
      }
      last = re.lastIndex;
    }
    if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  }

  // --- Message display ---

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'chat-msg chat-msg--' + role;
    if (role === 'assistant') { renderMarkdown(el, text); }
    else { el.textContent = text; }
    msgArea.appendChild(el);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  // --- Send message ---

  function send(text) {
    busy = true;
    overlay.setAttribute('aria-busy', 'true');
    addMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    var dots = document.createElement('div');
    dots.className = 'chat-msg chat-msg--thinking';
    dots.textContent = '...';
    dots.setAttribute('role', 'status');
    dots.setAttribute('aria-label', 'Generating response');
    msgArea.appendChild(dots);
    msgArea.scrollTop = msgArea.scrollHeight;

    if (abortCtl) abortCtl.abort();
    abortCtl = new AbortController();

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      signal: abortCtl.signal,
      body: JSON.stringify({ message: text, history: chatHistory.slice(-8) }),
    })
      .then(function(res) {
        if (!res.ok) {
          var err = new Error(String(res.status));
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .then(function(data) {
        if (dismissed) return;
        dots.remove();
        var reply = data.response || 'The advisor sent an empty reply. Press Enter to try again.';
        addMsg('assistant', reply);
        chatHistory.push({ role: 'assistant', content: reply });
        if (data.done) {
          // Remaining is only present after a real turn. Already-limited
          // responses include the CTA in `response` and must not duplicate it.
          endSession(typeof data.remaining === 'number');
        }
        busy = false;
        overlay.removeAttribute('aria-busy');
      })
      .catch(function(err) {
        if (dismissed || (err && err.name === 'AbortError')) return;
        dots.remove();
        addMsg('assistant', errorCopy(err && err.status));
        inputEl.value = text;
        if (sendBtn) sendBtn.disabled = false;
        busy = false;
        overlay.removeAttribute('aria-busy');
      });
  }
}
