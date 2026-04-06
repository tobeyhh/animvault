let db = { categories: [] };
let activeCatId = null;

// ── DATA ──────────────────────────────────────────────────

async function loadData() {
  try {
    const res = await fetch('data.json');
    db = await res.json();
    if (!activeCatId && db.categories.length) {
      activeCatId = db.categories[0].id;
    }
    render();
  } catch (e) {
    showToast('Could not load data.json');
    console.error(e);
  }
}

// ── UTILS ─────────────────────────────────────────────────

function getActiveCat() {
  return db.categories.find(c => c.id === activeCatId) || null;
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── RENDER ────────────────────────────────────────────────

function render() {
  renderSidebar();
  renderMain();
}

function renderSidebar() {
  const list = document.getElementById('cat-list');
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  list.innerHTML = '';

  db.categories.forEach(cat => {
    const matchCount = query
      ? cat.anims.filter(a =>
          a.name.toLowerCase().includes(query) ||
          a.cmd.toLowerCase().includes(query)
        ).length
      : cat.anims.length;

    if (query && matchCount === 0) return;

    const el = document.createElement('div');
    el.className = 'cat-item' + (cat.id === activeCatId ? ' active' : '');
    el.innerHTML = `
      <span class="cat-dot"></span>
      <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${cat.name}</span>
      <span class="cat-count">${matchCount}</span>
    `;
    el.onclick = () => {
      activeCatId = cat.id;
      renderSidebar();
      renderMain();
    };
    list.appendChild(el);
  });
}

function renderMain() {
  const cat = getActiveCat();
  const grid = document.getElementById('anim-grid');
  const title = document.getElementById('main-title');
  const sub = document.getElementById('main-header-sub');
  const query = document.getElementById('search-input').value.trim().toLowerCase();

  if (!cat) {
    title.textContent = 'Anim Vault';
    sub.textContent = 'select a category';
    grid.innerHTML = '<p class="empty-state">← pick a category to get started</p>';
    return;
  }

  title.textContent = cat.name;

  const filtered = query
    ? cat.anims.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.cmd.toLowerCase().includes(query) ||
        (a.notes && a.notes.toLowerCase().includes(query))
      )
    : cat.anims;

  sub.textContent = `${filtered.length} animation${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty-state">${query ? 'no results for "' + query + '"' : 'no animations in this category yet'}</p>`;
    return;
  }

  grid.innerHTML = '';
  filtered.forEach(anim => {
    const isCustom = anim.cmd.startsWith('/customanim');
    const card = document.createElement('div');
    card.className = 'anim-card';

    card.innerHTML = `
      <div class="anim-card-header" onclick="toggleSpoiler('${anim.id}')">
        <span class="anim-type-badge ${isCustom ? 'badge-custom' : 'badge-anim'}">${isCustom ? 'custom' : 'anim'}</span>
        <span class="anim-name">${anim.name}</span>
        <span class="anim-cmd">${anim.cmd}</span>
        <button class="spoiler-btn" id="sbtn-${anim.id}" onclick="event.stopPropagation();toggleSpoiler('${anim.id}')">preview</button>
      </div>
      <div class="anim-spoiler" id="spoiler-${anim.id}">
        <p class="spoiler-preview-label">Preview</p>
        ${anim.img
          ? `<img class="spoiler-img" src="${anim.img}" alt="preview">`
          : `<p class="spoiler-no-img">no preview image set</p>`
        }
        ${anim.notes ? `<p class="spoiler-notes">${anim.notes}</p>` : ''}
        <div class="spoiler-cmd-block">
          <span>${anim.cmd}</span>
        </div>
        <div class="spoiler-actions">
          <button class="action-btn copy" onclick="copyCmd('${anim.cmd}')">Copy command</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ── INTERACTIONS ──────────────────────────────────────────

function toggleSpoiler(id) {
  const spoiler = document.getElementById('spoiler-' + id);
  const btn = document.getElementById('sbtn-' + id);
  const isOpen = spoiler.classList.contains('open');
  spoiler.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.textContent = isOpen ? 'preview' : 'hide';
}

function copyCmd(cmd) {
  navigator.clipboard.writeText(cmd).then(() => showToast('Copied: ' + cmd));
}

// ── INIT ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search-input').oninput = () => render();

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
  });

  loadData();
});
