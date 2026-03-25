/**
 * AI Chat — GTM advisor powered by Claude
 *
 * TUI-style overlay triggered by header icon, typing "chat", or mobile swipe.
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
  var busy = false;

  if (sessionStorage.getItem('chat_done') === '1') {
    console.log(
      '%cChat session limit reached.\n%cTake the full assessment: gtm.shawnyeager.com',
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
  var isMobile = window.matchMedia('(max-width: 600px)').matches;
  var hintEl = document.createElement('span');
  hintEl.className = 'chat-hint';
  if (isMobile) {
    var closeBtn = document.createElement('button');
    closeBtn.className = 'chat-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.addEventListener('click', function() { dismiss(); });
    hintEl.appendChild(closeBtn);
  } else {
    hintEl.textContent = 'Esc to close';
  }
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
  inputEl.placeholder = 'Pipeline, positioning, pricing...';
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

  addMsg('assistant', 'I\'m trained on the GTM Map framework. Ask me anything.');
  requestAnimationFrame(function() { inputEl.focus(); });

  // Warm up edge function so first real message is fast
  fetch('/api/chat', { method: 'HEAD' }).catch(function() {});

  // Keep input visible when mobile keyboard opens
  if (isMobile && window.visualViewport) {
    var onResize = function() {
      container.style.height = Math.min(window.visualViewport.height * 0.85, window.innerHeight * 0.55) + 'px';
      msgArea.scrollTop = msgArea.scrollHeight;
    };
    window.visualViewport.addEventListener('resize', onResize);
  }

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
    if (isMobile && window.visualViewport && onResize) {
      window.visualViewport.removeEventListener('resize', onResize);
    }
  }
  function onEsc(e) { if (e.key === 'Escape') dismiss(); }
  document.addEventListener('keydown', onEsc);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });

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

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'chat-msg chat-msg--' + role;
    if (role === 'assistant' && !reducedMotion) {
      el.textContent = '';
      msgArea.appendChild(el);
      msgArea.scrollTop = msgArea.scrollHeight;
      typeOut(el, text, 0);
    } else {
      if (role === 'assistant') { renderMarkdown(el, text); }
      else { el.textContent = text; }
      msgArea.appendChild(el);
      msgArea.scrollTop = msgArea.scrollHeight;
    }
  }

  function typeOut(el, text, i) {
    if (i < text.length) {
      el.textContent = '';
      while (el.firstChild) el.removeChild(el.firstChild);
      renderMarkdown(el, text.slice(0, i + 1));
      msgArea.scrollTop = msgArea.scrollHeight;
      setTimeout(function() { typeOut(el, text, i + 1); }, 12);
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
        if (data.done) {
          sessionStorage.setItem('chat_done', '1');
          addMsg('assistant', 'That\'s my limit for this session. For a full diagnostic, take the GTM Map assessment: https://gtm.shawnyeager.com');
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

