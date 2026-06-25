const API = '/api/v1/admin';
const STORAGE_KEY = 'peppa_admin_tokens';

let tokens = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
let currentPage = 'dashboard';
let categoriesCache = [];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;

  let res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401 && tokens?.refreshToken && !options._retry) {
    const refreshed = await refreshTokens();
    if (refreshed) return api(path, { ...options, _retry: true });
    logout();
    throw new Error('Session expired');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

async function refreshTokens() {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    });
    const json = await res.json();
    if (!res.ok) return false;
    tokens = { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    return true;
  } catch {
    return false;
  }
}

function logout() {
  tokens = null;
  localStorage.removeItem(STORAGE_KEY);
  $('#login-view').classList.remove('hidden');
  $('#app-view').classList.add('hidden');
}

function showApp(admin) {
  $('#login-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  $('#admin-name').textContent = admin.full_name;
  $('#admin-email').textContent = admin.email;
  loadPage(currentPage);
}

function setPage(page) {
  currentPage = page;
  $$('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.page === page));
  const titles = {
    dashboard: 'Dashboard',
    users: 'Users',
    households: 'Households',
    catalog: 'Grocery Catalog',
    cuisines: 'Cuisines',
    gemini: 'Gemini Config',
    activity: 'Activity Logs',
  };
  $('#page-title').textContent = titles[page] || page;
  loadPage(page);
}

async function loadPage(page) {
  const el = $('#page-content');
  el.innerHTML = '<p style="color:var(--text-soft)">Loading…</p>';
  try {
    switch (page) {
      case 'dashboard': return renderDashboard(el);
      case 'users': return renderUsers(el);
      case 'households': return renderHouseholds(el);
      case 'catalog': return renderCatalog(el);
      case 'cuisines': return renderCuisines(el);
      case 'gemini': return renderGemini(el);
      case 'activity': return renderActivity(el);
    }
  } catch (err) {
    el.innerHTML = `<div class="error-msg">${esc(err.message)}</div>`;
  }
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function badge(status) {
  const cls = status === 'active' ? 'badge-active' : 'badge-suspended';
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

async function renderDashboard(el) {
  const { data } = await api('/dashboard/stats');
  const t = data.totals;
  const g = data.gemini;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent"><div class="label">Users</div><div class="value">${t.users}</div></div>
      <div class="stat-card"><div class="label">Active Users</div><div class="value">${t.active_users}</div></div>
      <div class="stat-card"><div class="label">Households</div><div class="value">${t.households}</div></div>
      <div class="stat-card"><div class="label">Pantry Items</div><div class="value">${t.pantry_items}</div></div>
      <div class="stat-card"><div class="label">Recipes</div><div class="value">${t.recipes}</div></div>
      <div class="stat-card"><div class="label">AI Chats</div><div class="value">${t.chat_sessions}</div></div>
      <div class="stat-card"><div class="label">Gemini Today</div><div class="value">${g.requests_today}</div></div>
      <div class="stat-card"><div class="label">Gemini / Week</div><div class="value">${g.requests_week}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>Recent Signups</h3></div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr></thead>
        <tbody>
          ${(data.recent_users || []).map((u) => `
            <tr>
              <td>${esc(u.full_name)}</td>
              <td>${esc(u.email)}</td>
              <td>${badge(u.status)}</td>
              <td>${fmtDate(u.created_at)}</td>
            </tr>`).join('') || '<tr><td colspan="4" class="empty">No users yet</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

async function renderUsers(el) {
  const search = el.dataset.search || '';
  const { data, pagination } = await api(`/users?search=${encodeURIComponent(search)}`);
  el.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h3>Mobile Users (${pagination.total})</h3>
        <div class="toolbar">
          <input type="search" placeholder="Search email or name…" value="${esc(search)}"
            onkeydown="if(event.key==='Enter'){document.getElementById('page-content').dataset.search=this.value;loadPage('users')}" />
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('page-content').dataset.search='';loadPage('users')">Clear</button>
        </div>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.map((u) => `
            <tr>
              <td>${esc(u.full_name)}</td>
              <td>${esc(u.email)}</td>
              <td>${badge(u.status)}</td>
              <td>${fmtDate(u.last_login_at)}</td>
              <td>
                ${u.status === 'active'
                  ? `<button class="btn btn-sm btn-ghost" onclick="setUserStatus('${u.id}','suspended')">Suspend</button>`
                  : `<button class="btn btn-sm btn-sage" onclick="setUserStatus('${u.id}','active')">Activate</button>`}
              </td>
            </tr>`).join('') || '<tr><td colspan="5" class="empty">No users</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

window.setUserStatus = async (id, status) => {
  if (!confirm(`Set user status to ${status}?`)) return;
  await api(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  loadPage('users');
};

async function renderHouseholds(el) {
  const { data, pagination } = await api('/households');
  el.innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>Households (${pagination.total})</h3></div>
      <table>
        <thead><tr><th>Name</th><th>Owner</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.map((h) => `
            <tr>
              <td>${esc(h.name)}</td>
              <td>${esc(h.owner?.email || '—')}</td>
              <td>${h.member_count}</td>
              <td>${badge(h.status)}</td>
              <td>
                ${h.status === 'active'
                  ? `<button class="btn btn-sm btn-ghost" onclick="setHouseholdStatus('${h.id}','deactivated')">Deactivate</button>`
                  : `<button class="btn btn-sm btn-sage" onclick="setHouseholdStatus('${h.id}','active')">Activate</button>`}
              </td>
            </tr>`).join('') || '<tr><td colspan="5" class="empty">No households</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

window.setHouseholdStatus = async (id, status) => {
  if (!confirm(`Set household status to ${status}?`)) return;
  await api(`/households/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  loadPage('households');
};

async function renderCatalog(el) {
  const { data: categories } = await api('/categories');
  categoriesCache = categories;
  const { data, pagination } = await api('/catalog?limit=50');

  el.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h3>Grocery Catalog (${pagination.total})</h3>
        <button class="btn btn-peach btn-sm" onclick="openCatalogModal()">+ Add Item</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Unit</th><th>Shelf Life</th><th>Active</th><th></th></tr></thead>
        <tbody>
          ${data.map((item) => `
            <tr>
              <td>${esc(item.name)}</td>
              <td>${esc(item.category?.emoji || '')} ${esc(item.category?.name || '—')}</td>
              <td>${esc(item.default_unit)}</td>
              <td>${item.shelf_life_days ? item.shelf_life_days + 'd' : '—'}</td>
              <td>${item.is_active ? '✅' : '—'}</td>
              <td><button class="btn btn-sm btn-ghost" onclick="deleteCatalogItem('${item.id}')">Remove</button></td>
            </tr>`).join('') || '<tr><td colspan="6" class="empty">No catalog items</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

window.openCatalogModal = () => {
  const catOptions = categoriesCache.map((c) => `<option value="${c.id}">${esc(c.emoji)} ${esc(c.name)}</option>`).join('');
  showModal(`
    <h3>Add Catalog Item</h3>
    <label>Name</label><input id="m-name" />
    <label>Category</label><select id="m-cat">${catOptions}</select>
    <label>Default Unit</label>
    <select id="m-unit"><option>g</option><option>kg</option><option>ml</option><option>l</option><option>pcs</option></select>
    <label>Shelf Life (days)</label><input id="m-shelf" type="number" />
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-peach" onclick="saveCatalogItem()">Save</button>
    </div>`);
};

window.saveCatalogItem = async () => {
  await api('/catalog', {
    method: 'POST',
    body: JSON.stringify({
      name: $('#m-name').value,
      category_id: $('#m-cat').value,
      default_unit: $('#m-unit').value,
      shelf_life_days: parseInt($('#m-shelf').value, 10) || undefined,
    }),
  });
  closeModal();
  loadPage('catalog');
};

window.deleteCatalogItem = async (id) => {
  if (!confirm('Remove this catalog item?')) return;
  await api(`/catalog/${id}`, { method: 'DELETE' });
  loadPage('catalog');
};

async function renderCuisines(el) {
  const { data } = await api('/cuisines');
  el.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h3>Cuisine Types (${data.length})</h3>
        <button class="btn btn-peach btn-sm" onclick="openCuisineModal()">+ Add Cuisine</button>
      </div>
      <table>
        <thead><tr><th>Emoji</th><th>Name</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.map((c) => `
            <tr>
              <td>${esc(c.emoji)}</td>
              <td>${esc(c.name)}</td>
              <td>${c.is_active ? '✅' : '—'}</td>
              <td>
                <button class="btn btn-sm btn-ghost" onclick="toggleCuisine('${c.id}',${!c.is_active})">
                  ${c.is_active ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

window.openCuisineModal = () => {
  showModal(`
    <h3>Add Cuisine</h3>
    <label>Emoji</label><input id="m-emoji" value="🍛" />
    <label>Name</label><input id="m-cname" />
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-peach" onclick="saveCuisine()">Save</button>
    </div>`);
};

window.saveCuisine = async () => {
  await api('/cuisines', {
    method: 'POST',
    body: JSON.stringify({ emoji: $('#m-emoji').value, name: $('#m-cname').value }),
  });
  closeModal();
  loadPage('cuisines');
};

window.toggleCuisine = async (id, is_active) => {
  await api(`/cuisines/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) });
  loadPage('cuisines');
};

async function renderGemini(el) {
  const [{ data: prompts }, { data: keywords }] = await Promise.all([
    api('/gemini/prompts'),
    api('/gemini/keywords'),
  ]);

  el.innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>Prompt Templates</h3></div>
      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Model</th><th>Version</th><th>Active</th></tr></thead>
        <tbody>
          ${prompts.map((p) => `
            <tr>
              <td>${esc(p.name)}</td>
              <td>${esc(p.template_type)}</td>
              <td>${esc(p.model)}</td>
              <td>v${p.version}</td>
              <td>${p.is_active ? '✅' : '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="panel">
      <div class="panel-header">
        <h3>Keywords (${keywords.length})</h3>
        <button class="btn btn-peach btn-sm" onclick="openKeywordModal()">+ Add Keyword</button>
      </div>
      <table>
        <thead><tr><th>Keyword</th><th>Category</th><th>Weight</th><th>Enabled</th><th></th></tr></thead>
        <tbody>
          ${keywords.map((k) => `
            <tr>
              <td>${esc(k.keyword)}</td>
              <td>${esc(k.category)}</td>
              <td>${k.weight}</td>
              <td>${k.is_enabled ? '✅' : '—'}</td>
              <td><button class="btn btn-sm btn-ghost" onclick="deleteKeyword('${k.id}')">Remove</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

window.openKeywordModal = () => {
  showModal(`
    <h3>Add Gemini Keyword</h3>
    <label>Keyword</label><input id="m-kw" />
    <label>Category</label>
    <select id="m-kcat">
      <option>nutrition</option><option>diet</option><option>ingredient</option>
      <option>cuisine</option><option>health_goal</option><option>restriction</option>
    </select>
    <label>Weight</label><input id="m-kweight" type="number" step="0.1" value="1" />
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-peach" onclick="saveKeyword()">Save</button>
    </div>`);
};

window.saveKeyword = async () => {
  await api('/gemini/keywords', {
    method: 'POST',
    body: JSON.stringify({
      keyword: $('#m-kw').value,
      category: $('#m-kcat').value,
      weight: parseFloat($('#m-kweight').value) || 1,
    }),
  });
  closeModal();
  loadPage('gemini');
};

window.deleteKeyword = async (id) => {
  if (!confirm('Remove keyword?')) return;
  await api(`/gemini/keywords/${id}`, { method: 'DELETE' });
  loadPage('gemini');
};

async function renderActivity(el) {
  const { data, pagination } = await api('/activity-logs?limit=50');
  el.innerHTML = `
    <div class="panel">
      <div class="panel-header"><h3>Activity Logs (${pagination.total})</h3></div>
      <table>
        <thead><tr><th>Action</th><th>User</th><th>IP</th><th>Time</th></tr></thead>
        <tbody>
          ${data.map((a) => `
            <tr>
              <td><code>${esc(a.action)}</code></td>
              <td>${esc(a.user_id || '—')}</td>
              <td>${esc(a.ip_address || '—')}</td>
              <td>${fmtDate(a.created_at)}</td>
            </tr>`).join('') || '<tr><td colspan="4" class="empty">No activity yet</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

function showModal(html) {
  const root = $('#modal-root');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`;
}

window.closeModal = () => {
  $('#modal-root').classList.add('hidden');
  $('#modal-root').innerHTML = '';
};

window.loadPage = loadPage;

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = $('#login-error');
  errEl.classList.add('hidden');
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: $('#email').value, password: $('#password').value }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    tokens = { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    showApp(json.data.admin);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

$('#logout-btn').addEventListener('click', async () => {
  try {
    await api('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: tokens?.refreshToken }) });
  } catch (_) { /* ignore */ }
  logout();
});

$$('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => setPage(btn.dataset.page));
});

async function init() {
  if (!tokens?.accessToken) return;
  try {
    const { data } = await api('/auth/profile');
    showApp(data);
  } catch {
    logout();
  }
}

init();
