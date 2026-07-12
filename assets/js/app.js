/* قریشی پراپرٹی ڈیلرز — مرکزی ایپلیکیشن منطق */

let STATE = loadState();
let UI = {
  screen: 'dashboard',
  regTab: 'rent',
  toolTab: 'measure',
  propSearch: '',
  propType: 'all',
  propDeal: 'all',
  compareIds: [],
  showPropForm: false,
  showClientForm: false,
  showTxnForm: false,
  showEmpForm: false,
  showDocForm: false,
};

/* ── لیبلز و رنگ ── */
const PTL = { house: 'گھر', flat: 'فلیٹ', shop: 'دکان', land: 'زمین', room: 'کمرہ' };
const PTI = { house: '🏠', flat: '🏢', shop: '🏪', land: '🌍', room: '🚪' };
const DEALL = { rent: 'کرایہ', sale: 'فروخت', mortgage: 'گروی' };
const DEALC = { rent: '#2980b9', sale: '#27ae60', mortgage: '#e67e22' };
const SL = { active: 'فعال', available: 'خالی', sold: 'فروخت شدہ', released: 'ختم شدہ' };
const SC = { active: '#27ae60', available: '#2980b9', sold: '#8e44ad', released: '#7f8c8d' };
const CODE_PREFIX = { rent: 'ADR', sale: 'ADS', mortgage: 'ADG' };

const COMMISSION_RULES = {
  'sale-house': { label: 'گھر کی فروخت', pct: 1.5, split: [50, 50] },
  'sale-flat': { label: 'فلیٹ کی فروخت', pct: 1.5, split: [50, 50] },
  'sale-shop': { label: 'دکان کی فروخت', pct: 1.5, split: [50, 50] },
  'sale-land': { label: 'زمین کی فروخت', pct: 1.25, split: [55, 45] },
  'rent': { label: 'کرایہ (1 ماہ کرایہ)', pct: 100, split: [60, 40] },
};

/* ── مددگار فنکشنز ── */
const fmt = n => Math.round(n || 0).toLocaleString('en');
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = p => p + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function badge(label, color) {
  return `<span style="background:${color}22;color:${color};border-radius:6px;padding:2px 9px;font-size:11px;font-weight:700;white-space:nowrap;">${escapeHtml(label)}</span>`;
}
function nextCode(deal) {
  const prefix = CODE_PREFIX[deal];
  const count = STATE.properties.filter(p => p.deal === deal).length;
  return prefix + '-' + String(count + 1).padStart(2, '0');
}
function persist() { saveState(STATE); }

/* ── نیویگیشن ── */
const NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', label: 'ڈیش بورڈ' },
  { key: 'registration', icon: '📝', label: 'نئی انٹری' },
  { key: 'properties', icon: '🏘️', label: 'جائیدادیں' },
  { key: 'clients', icon: '👥', label: 'کلائنٹس' },
  { key: 'finance', icon: '💰', label: 'مالیات' },
  { key: 'tools', icon: '🧰', label: 'ٹولز' },
  { key: 'documents', icon: '📋', label: 'دستاویزات' },
  { key: 'hr', icon: '🧑‍💼', label: 'عملہ' },
];

const TITLES = {
  dashboard: { t: 'ڈیش بورڈ', s: 'قریشی پراپرٹی ڈیلرز — مکمل جائزہ' },
  registration: { t: 'نئی انٹری', s: 'جائیداد کا باقاعدہ اندراج · ADR (کرایہ) · ADS (فروخت) · ADG (گروی)' },
  properties: { t: 'تمام جائیدادیں', s: STATE.properties.length + ' درج شدہ جائیدادوں کی فہرست' },
  clients: { t: 'کلائنٹس اور مالکان', s: 'گاہکوں کی معلومات، کال اور واٹس ایپ' },
  finance: { t: 'مالیاتی حساب', s: 'آمدنی، اخراجات، کمیشن اور خالص منافع' },
  tools: { t: 'پراپرٹی ٹولز', s: 'ماپ، کرایہ، قسط اور موازنہ کیلکولیٹرز' },
  documents: { t: 'دستاویزات', s: 'ہر جائیداد کی دستاویزات کا ریکارڈ' },
  hr: { t: 'عملہ (HR)', s: 'ملازمین، حاضری اور تنخواہ' },
};

function setScreen(key) {
  UI.screen = key;
  UI.showPropForm = UI.showClientForm = UI.showTxnForm = UI.showEmpForm = UI.showDocForm = false;
  render();
}

/* ══════════════════════ رینڈر ══════════════════════ */
function render() {
  TITLES.properties.s = STATE.properties.length + ' درج شدہ جائیدادوں کی فہرست';
  const cur = TITLES[UI.screen] || TITLES.dashboard;
  document.getElementById('app').innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-title">🏘️ قریشی پراپرٹی</div>
          <div class="brand-sub">پراپرٹی مینجمنٹ سسٹم</div>
        </div>
        <nav class="nav">
          ${NAV_ITEMS.map(n => `
            <div class="nav-item ${UI.screen === n.key ? 'active' : ''}" onclick="setScreen('${n.key}')">
              <span class="nav-icon">${n.icon}</span><span class="nav-label">${n.label}</span>
            </div>`).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="agent-avatar">👤</div>
          <div>
            <div class="agent-name">عادل قریشی</div>
            <div class="agent-office">قریشی پراپرٹی دفتر</div>
          </div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div>
            <h1>${cur.t}</h1>
            <p>${cur.s}</p>
          </div>
          <div class="topbar-actions">
            <button class="btn btn-ghost" onclick="setScreen('registration')">+ نئی انٹری</button>
            <button class="btn btn-primary" onclick="setScreen('finance')">📊 رپورٹ</button>
          </div>
        </header>
        <div class="content">
          ${screenContent()}
        </div>
      </div>
    </div>
  `;
  afterRender();
}

function screenContent() {
  switch (UI.screen) {
    case 'dashboard': return screenDashboard();
    case 'registration': return screenRegistration();
    case 'properties': return screenProperties();
    case 'clients': return screenClients();
    case 'finance': return screenFinance();
    case 'tools': return screenTools();
    case 'documents': return screenDocuments();
    case 'hr': return screenHR();
    default: return '';
  }
}

/* runs after every full render() to wire up things that need direct DOM access (live calculators, focus) */
function afterRender() {
  if (UI.screen === 'tools') wireToolsCalculators();
  if (UI.screen === 'finance') wireCommissionCalculator();
}

/* ══════════════════════ ڈیش بورڈ ══════════════════════ */
function screenDashboard() {
  const P = STATE.properties, T = STATE.transactions;
  const rent = P.filter(p => p.deal === 'rent');
  const sale = P.filter(p => p.deal === 'sale');
  const mort = P.filter(p => p.deal === 'mortgage');
  const income = T.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const expense = T.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);

  const statCard = (title, code, count, sub1, sub2, barPct, color, gradient) => `
    <div class="stat-card" style="${gradient ? `background:${gradient};` : `border-top:4px solid ${color};`}">
      <div class="stat-top">
        <span class="stat-title" style="color:${gradient ? 'rgba(255,255,255,.65)' : '#8899aa'}">${title}</span>
        ${code ? `<span class="stat-code" style="background:${gradient ? 'rgba(200,160,85,.25)' : color + '22'};color:${gradient ? '#c8a055' : color};">${code}</span>` : ''}
      </div>
      <div class="stat-count" style="color:${gradient ? '#e8c07a' : '#1b3d6e'}">${count}</div>
      <div class="stat-sub" style="color:${gradient ? 'rgba(255,255,255,.55)' : '#8899aa'}">${sub1} · ${sub2}</div>
      <div class="stat-bar-track" style="background:${gradient ? 'rgba(255,255,255,.12)' : color + '20'}">
        <div class="stat-bar-fill" style="width:${barPct}%;background:${gradient ? '#c8a055' : color};"></div>
      </div>
    </div>`;

  const typeDist = ['house', 'flat', 'shop', 'land', 'room'].map(k => {
    const count = P.filter(p => p.ptype === k).length;
    if (!count) return '';
    const colors = { house: '#2980b9', flat: '#8e44ad', shop: '#e67e22', land: '#27ae60', room: '#7f8c8d' };
    return `<div class="type-row">
      <span class="type-icon">${PTI[k]}</span>
      <div class="type-label">${PTL[k]}</div>
      <div class="type-count" style="background:${colors[k]}22;color:${colors[k]}">${count} جائیداد</div>
    </div>`;
  }).join('');

  const dealDist = ['rent', 'sale', 'mortgage'].map(k => {
    const list = P.filter(p => p.deal === k);
    if (!list.length) return '';
    return `<div class="type-row">
      <span class="type-icon">${k === 'rent' ? '🔑' : k === 'sale' ? '💵' : '🏦'}</span>
      <div class="type-label">${DEALL[k]}</div>
      <div class="type-count" style="background:${DEALC[k]}22;color:${DEALC[k]}">${list.length} جائیداد</div>
    </div>`;
  }).join('');

  const recentRows = [...P].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(p => `
    <tr>
      <td class="mono strong navy">${p.id}</td>
      <td>${badge(DEALL[p.deal], DEALC[p.deal])}</td>
      <td>${PTI[p.ptype]} ${PTL[p.ptype]}${p.rooms > 0 ? ' · ' + p.rooms + ' کمرے' : ''}</td>
      <td class="muted small">${escapeHtml(p.loc)}</td>
      <td>${escapeHtml(p.owner)}</td>
      <td class="mono strong navy">${fmt(p.price)} روپے</td>
      <td>${badge(SL[p.status], SC[p.status])}</td>
    </tr>`).join('');

  return `
    <div class="stat-grid">
      ${statCard('کرایہ کی جائیدادیں', 'ADR', rent.length, rent.filter(p => p.status === 'available').length + ' خالی', rent.filter(p => p.status === 'active').length + ' کرایہ پر', pct(rent.filter(p => p.status === 'active').length, rent.length || 1), '#2980b9')}
      ${statCard('فروخت کی جائیدادیں', 'ADS', sale.length, sale.filter(p => p.status === 'sold').length + ' فروخت', sale.filter(p => p.status === 'active').length + ' باقی', pct(sale.filter(p => p.status === 'sold').length, sale.length || 1), '#27ae60')}
      ${statCard('گروی جائیدادیں', 'ADG', mort.length, mort.filter(p => p.status === 'active').length + ' فعال', mort.filter(p => p.status === 'released').length + ' ختم', pct(mort.filter(p => p.status === 'active').length, mort.length || 1), '#e67e22')}
      ${statCard('اس ماہ کا خلاصہ', null, fmt(income - expense) + ' روپے', 'آمدنی: ' + fmt(income), 'اخراجات: ' + fmt(expense), pct(income - expense, income || 1), '#c8a055', 'linear-gradient(135deg,#1b3d6e,#264f8c)')}
    </div>
    <div class="mid-grid">
      <div class="card span2">
        <div class="card-title">📊 جائیداد کی قسم کے مطابق تقسیم</div>
        ${typeDist || '<p class="muted small">کوئی ڈیٹا موجود نہیں</p>'}
      </div>
      <div class="card">
        <div class="card-title">🏘️ سودے کی نوعیت</div>
        ${dealDist || '<p class="muted small">کوئی ڈیٹا موجود نہیں</p>'}
      </div>
    </div>
    <div class="card">
      <div class="card-title">📋 حال ہی میں درج شدہ جائیدادیں</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>کوڈ</th><th>نوعیت</th><th>جائیداد</th><th>مقام</th><th>مالک</th><th>قیمت</th><th>حالت</th></tr></thead>
          <tbody>${recentRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* ══════════════════════ نئی انٹری / رجسٹریشن ══════════════════════ */
function screenRegistration() {
  const regProps = STATE.properties.filter(p => p.deal === UI.regTab);
  const code = nextCode(UI.regTab);
  const priceLabel = UI.regTab === 'rent' ? 'کرایہ/ماہ' : UI.regTab === 'sale' ? 'فروخت قیمت' : 'گروی رقم';

  const rows = regProps.map(p => `
    <tr>
      <td class="mono strong navy">${p.id}</td>
      <td>${PTI[p.ptype]} ${PTL[p.ptype]}</td>
      <td class="muted small">${escapeHtml(p.loc)}</td>
      <td class="mono small">${p.area} مرلہ</td>
      <td class="small">${p.rooms > 0 ? p.rooms + ' کمرے' : '—'}</td>
      <td>${escapeHtml(p.owner)}</td>
      <td class="mono small ltr">${p.ownerPhone}</td>
      <td class="mono strong navy">${fmt(p.price)} روپے</td>
      <td class="muted small">${p.duration || p.date}</td>
      <td>${badge(SL[p.status], SC[p.status])}</td>
    </tr>`).join('');

  return `
    <div class="tab-row">
      <div class="tab ${UI.regTab === 'rent' ? 'active' : ''}" onclick="setRegTab('rent')">🔑 کرایہ کا اندراج (ADR)</div>
      <div class="tab ${UI.regTab === 'sale' ? 'active' : ''}" onclick="setRegTab('sale')">💰 فروخت کا اندراج (ADS)</div>
      <div class="tab ${UI.regTab === 'mortgage' ? 'active' : ''}" onclick="setRegTab('mortgage')">🏦 گروی کا اندراج (ADG)</div>
    </div>
    <div class="card">
      <div class="row-between wrap" style="margin-bottom:16px;">
        <div><span class="muted small">${regProps.length} جائیداد درج شدہ</span> · <span class="mono gold small strong">اگلا کوڈ: ${code}</span></div>
        <button class="btn btn-primary" onclick="toggleForm('showPropForm')">${UI.showPropForm ? '✕ بند کریں' : '+ نئی جائیداد'}</button>
      </div>
      ${UI.showPropForm ? propertyForm(code) : ''}
      <div class="table-wrap">
        <table>
          <thead><tr><th>کوڈ</th><th>جائیداد</th><th>مقام</th><th>رقبہ</th><th>کمرے</th><th>مالک</th><th>ٹیلیفون</th><th>${priceLabel}</th><th>تاریخ/مدت</th><th>حالت</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="10" class="muted small" style="text-align:center;padding:20px;">کوئی اندراج نہیں</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  `;
}

function propertyForm(code) {
  return `
    <form class="form-panel" onsubmit="submitPropertyForm(event, '${code}')">
      <div class="form-grid">
        <div class="field"><label>نوعیت</label>
          <select name="ptype" required>
            <option value="house">گھر</option><option value="flat">فلیٹ</option><option value="shop">دکان</option><option value="land">زمین</option><option value="room">کمرہ</option>
          </select>
        </div>
        <div class="field"><label>مقام</label><input name="loc" required placeholder="مثلاً DHA فیز 5، لاہور" /></div>
        <div class="field"><label>رقبہ (مرلہ)</label><input name="area" type="number" step="0.1" required placeholder="10" /></div>
        <div class="field"><label>کمرے</label><input name="rooms" type="number" min="0" placeholder="3" /></div>
        <div class="field"><label>منزلیں</label><input name="floors" type="number" min="0" placeholder="2" /></div>
        <div class="field"><label>${UI.regTab === 'rent' ? 'کرایہ/ماہ (روپے)' : UI.regTab === 'sale' ? 'فروخت قیمت (روپے)' : 'گروی رقم (روپے)'}</label><input name="price" type="number" required placeholder="0" /></div>
        <div class="field"><label>مالک کا نام</label><input name="owner" required placeholder="نام" /></div>
        <div class="field"><label>مالک کا فون</label><input name="ownerPhone" required placeholder="0300-0000000" /></div>
        ${UI.regTab === 'mortgage' ? `<div class="field"><label>گروی کی مدت</label><input name="duration" placeholder="1 سال" /></div>` : ''}
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:6px;">✅ محفوظ کریں (${code})</button>
    </form>`;
}

function submitPropertyForm(e, code) {
  e.preventDefault();
  const f = new FormData(e.target);
  const prop = {
    id: code,
    deal: UI.regTab,
    ptype: f.get('ptype'),
    rooms: +f.get('rooms') || 0,
    floors: +f.get('floors') || 0,
    area: +f.get('area') || 0,
    loc: f.get('loc'),
    price: +f.get('price') || 0,
    owner: f.get('owner'),
    ownerPhone: f.get('ownerPhone'),
    tenant: '',
    date: todayISO(),
    status: 'available',
  };
  if (UI.regTab === 'mortgage') prop.duration = f.get('duration') || '';
  STATE.properties.push(prop);
  persist();
  UI.showPropForm = false;
  render();
}

function setRegTab(tab) { UI.regTab = tab; UI.showPropForm = false; render(); }

/* ══════════════════════ جائیدادیں (گرڈ) ══════════════════════ */
function screenProperties() {
  return `
    <div class="card row-search">
      <span>🔍</span>
      <input id="propSearchInput" placeholder="جائیداد کا نام، مقام یا کوڈ تلاش کریں..." value="${escapeHtml(UI.propSearch)}" oninput="onPropSearch(this.value)" />
      <select onchange="onPropTypeFilter(this.value)">
        <option value="all" ${UI.propType === 'all' ? 'selected' : ''}>تمام اقسام</option>
        <option value="house" ${UI.propType === 'house' ? 'selected' : ''}>گھر</option>
        <option value="flat" ${UI.propType === 'flat' ? 'selected' : ''}>فلیٹ</option>
        <option value="shop" ${UI.propType === 'shop' ? 'selected' : ''}>دکان</option>
        <option value="land" ${UI.propType === 'land' ? 'selected' : ''}>زمین</option>
        <option value="room" ${UI.propType === 'room' ? 'selected' : ''}>کمرہ</option>
      </select>
      <select onchange="onPropDealFilter(this.value)">
        <option value="all" ${UI.propDeal === 'all' ? 'selected' : ''}>تمام سودے</option>
        <option value="rent" ${UI.propDeal === 'rent' ? 'selected' : ''}>کرایہ (ADR)</option>
        <option value="sale" ${UI.propDeal === 'sale' ? 'selected' : ''}>فروخت (ADS)</option>
        <option value="mortgage" ${UI.propDeal === 'mortgage' ? 'selected' : ''}>گروی (ADG)</option>
      </select>
    </div>
    <div id="propertiesGrid">${propertiesGridHtml()}</div>
  `;
}

function filteredProperties() {
  const q = UI.propSearch.trim().toLowerCase();
  return STATE.properties.filter(p => {
    if (UI.propType !== 'all' && p.ptype !== UI.propType) return false;
    if (UI.propDeal !== 'all' && p.deal !== UI.propDeal) return false;
    if (q && !(p.id.toLowerCase().includes(q) || p.loc.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q))) return false;
    return true;
  });
}

function propertiesGridHtml() {
  const list = filteredProperties();
  if (!list.length) return `<p class="muted small" style="padding:20px;text-align:center;">کوئی جائیداد نہیں ملی</p>`;
  return `<div class="prop-grid">
    ${list.map(p => `
      <div class="prop-card">
        <div class="prop-thumb" style="background:linear-gradient(135deg,${DEALC[p.deal]}22,${DEALC[p.deal]}0d);">
          <div class="prop-thumb-icon">${PTI[p.ptype]}</div>
          <div class="prop-thumb-note">— تصویر یہاں —</div>
          <div class="prop-code" style="background:${DEALC[p.deal]};">${p.id}</div>
          <div class="prop-status" style="background:${SC[p.status]};">${SL[p.status]}</div>
        </div>
        <div class="prop-body">
          <div class="prop-title">${PTL[p.ptype]}${p.rooms > 0 ? ' · ' + p.rooms + ' کمرے' : ''}${p.floors > 0 ? ' · ' + p.floors + ' منزلہ' : ''}</div>
          <div class="prop-loc">📍 ${escapeHtml(p.loc)}</div>
          <div class="row-between">
            <div class="prop-price">${fmt(p.price)} روپے</div>
            ${badge(DEALL[p.deal], DEALC[p.deal])}
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

function onPropSearch(v) { UI.propSearch = v; document.getElementById('propertiesGrid').innerHTML = propertiesGridHtml(); }
function onPropTypeFilter(v) { UI.propType = v; document.getElementById('propertiesGrid').innerHTML = propertiesGridHtml(); }
function onPropDealFilter(v) { UI.propDeal = v; document.getElementById('propertiesGrid').innerHTML = propertiesGridHtml(); }

/* ══════════════════════ کلائنٹس ══════════════════════ */
function screenClients() {
  const C = STATE.clients;
  const typeLabel = { owner: 'مالک', buyer: 'خریدار', tenant: 'کرایہ دار' };
  const typeColor = { owner: '#27ae60', buyer: '#2980b9', tenant: '#e67e22' };
  const rows = C.map(c => `
    <tr>
      <td class="mono strong navy small">${c.id}</td>
      <td class="strong">${escapeHtml(c.name)}</td>
      <td class="mono small ltr">${c.phone}</td>
      <td>${badge(typeLabel[c.type] || c.type, typeColor[c.type] || '#7f8c8d')}</td>
      <td class="small">${c.props.length} جائیداد</td>
      <td class="muted small">${c.date}</td>
      <td>
        <div class="row-actions">
          <a href="tel:${c.phone.replace(/-/g, '')}" class="pill pill-call">📞 کال</a>
          <a href="https://wa.me/92${c.phone.replace(/-/g, '').slice(1)}" target="_blank" rel="noopener" class="pill pill-wa">WhatsApp</a>
        </div>
      </td>
    </tr>`).join('');

  return `
    <div class="card">
      <div class="row-between" style="margin-bottom:16px;">
        <div class="card-title" style="margin:0;">👥 ${C.length} کلائنٹس</div>
        <button class="btn btn-primary" onclick="toggleForm('showClientForm')">${UI.showClientForm ? '✕ بند کریں' : '+ نیا کلائنٹ'}</button>
      </div>
      ${UI.showClientForm ? clientForm() : ''}
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>نام</th><th>فون</th><th>نوعیت</th><th>جائیدادیں</th><th>تاریخ</th><th>رابطہ</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="7" class="muted small" style="text-align:center;padding:20px;">کوئی کلائنٹ نہیں</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  `;
}

function clientForm() {
  return `
    <form class="form-panel" onsubmit="submitClientForm(event)">
      <div class="form-grid">
        <div class="field"><label>نام</label><input name="name" required placeholder="پورا نام" /></div>
        <div class="field"><label>فون</label><input name="phone" required placeholder="0300-0000000" /></div>
        <div class="field"><label>نوعیت</label>
          <select name="type"><option value="owner">مالک</option><option value="buyer">خریدار</option><option value="tenant">کرایہ دار</option></select>
        </div>
        <div class="field"><label>نوٹس</label><input name="notes" placeholder="اختیاری" /></div>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:6px;">✅ محفوظ کریں</button>
    </form>`;
}

function submitClientForm(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  STATE.clients.push({
    id: uid('CL'), name: f.get('name'), phone: f.get('phone'), type: f.get('type'),
    props: [], date: todayISO(), notes: f.get('notes') || '',
  });
  persist();
  UI.showClientForm = false;
  render();
}

/* ══════════════════════ مالیات ══════════════════════ */
function screenFinance() {
  const T = STATE.transactions;
  const income = T.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const expense = T.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  const rows = [...T].sort((a, b) => b.date.localeCompare(a.date)).map(t => `
    <tr>
      <td class="mono strong navy small">${t.id}</td>
      <td class="muted small">${t.date}</td>
      <td class="small">${escapeHtml(t.desc)}</td>
      <td><span class="tag">${escapeHtml(t.cat)}</span></td>
      <td class="mono strong ltr" style="text-align:left;color:${t.type === 'income' ? '#27ae60' : '#e74c3c'}">${t.type === 'income' ? '+' : '−'}${fmt(t.amt)} روپے</td>
      <td>${badge(t.type === 'income' ? '↑ آمدنی' : '↓ اخراجات', t.type === 'income' ? '#27ae60' : '#e74c3c')}</td>
    </tr>`).join('');

  return `
    <div class="stat-grid-3">
      <div class="fin-card fin-green"><div class="fin-label">↑ کل آمدنی</div><div class="fin-value" style="color:#1e8449">${fmt(income)} روپے</div></div>
      <div class="fin-card fin-red"><div class="fin-label">↓ کل اخراجات</div><div class="fin-value" style="color:#c0392b">${fmt(expense)} روپے</div></div>
      <div class="fin-card fin-navy"><div class="fin-label" style="color:rgba(255,255,255,.65)">💰 خالص منافع</div><div class="fin-value" style="color:#e8c07a">${fmt(income - expense)} روپے</div></div>
    </div>

    <div class="card">
      <div class="card-title">🧮 کمیشن کیلکولیٹر</div>
      ${commissionCalculatorHtml()}
    </div>

    <div class="card">
      <div class="row-between" style="margin-bottom:16px;">
        <div class="card-title" style="margin:0;">📊 لین دین کی فہرست</div>
        <button class="btn btn-primary" onclick="toggleForm('showTxnForm')">${UI.showTxnForm ? '✕ بند کریں' : '+ نیا اندراج'}</button>
      </div>
      ${UI.showTxnForm ? txnForm() : ''}
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>تاریخ</th><th>تفصیل</th><th>کیٹیگری</th><th>رقم</th><th>نوعیت</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="6" class="muted small" style="text-align:center;padding:20px;">کوئی اندراج نہیں</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  `;
}

function commissionCalculatorHtml() {
  return `
    <div class="form-grid" style="margin-bottom:14px;">
      <div class="field"><label>سودے کی نوعیت</label>
        <select id="commDealType">
          ${Object.entries(COMMISSION_RULES).map(([k, v]) => `<option value="${k}">${v.label} (${v.pct}%)</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>قیمت / کرایہ (روپے)</label><input id="commPrice" type="number" placeholder="5000000" /></div>
      <div class="field"><label>کمیشن فیصد (%)</label><input id="commPct" type="number" step="0.1" /></div>
    </div>
    <div class="comm-result-grid">
      <div class="comm-box"><div class="comm-label">کل کمیشن</div><div id="commTotal" class="comm-value gold">0 روپے</div></div>
      <div class="comm-box"><div class="comm-label">کمپنی کا حصہ</div><div id="commCompany" class="comm-value navy">0 روپے</div></div>
      <div class="comm-box"><div class="comm-label">ایجنٹ کا حصہ</div><div id="commAgent" class="comm-value" style="color:#27ae60">0 روپے</div></div>
    </div>
    <button class="btn btn-primary" style="margin-top:14px;" onclick="recordCommissionIncome()">💾 آمدنی کے طور پر ریکارڈ کریں</button>
  `;
}

function updateCommission(resetPct) {
  const key = document.getElementById('commDealType').value;
  const rule = COMMISSION_RULES[key];
  const priceEl = document.getElementById('commPrice');
  const pctEl = document.getElementById('commPct');
  if (resetPct || !pctEl.dataset.touched) pctEl.value = rule.pct;
  const price = +priceEl.value || 0;
  const commPct = +pctEl.value || 0;
  const total = price * (commPct / 100);
  const [companySplit, agentSplit] = rule.split;
  const company = total * (companySplit / 100);
  const agent = total * (agentSplit / 100);
  document.getElementById('commTotal').textContent = fmt(total) + ' روپے';
  document.getElementById('commCompany').textContent = fmt(company) + ' روپے (' + companySplit + '%)';
  document.getElementById('commAgent').textContent = fmt(agent) + ' روپے (' + agentSplit + '%)';
}

function wireCommissionCalculator() {
  const dealTypeEl = document.getElementById('commDealType');
  const pctEl = document.getElementById('commPct');
  if (!dealTypeEl) return;
  dealTypeEl.addEventListener('change', () => updateCommission(true));
  pctEl.addEventListener('input', () => { pctEl.dataset.touched = '1'; updateCommission(false); });
  document.getElementById('commPrice').addEventListener('input', () => updateCommission(false));
  updateCommission(true);
}

function recordCommissionIncome() {
  const key = document.getElementById('commDealType').value;
  const rule = COMMISSION_RULES[key];
  const price = +document.getElementById('commPrice').value || 0;
  const commPct = +document.getElementById('commPct').value || rule.pct;
  const total = price * (commPct / 100);
  if (total <= 0) { alert('براہ کرم درست رقم درج کریں'); return; }
  STATE.transactions.push({
    id: uid('TXN'), date: todayISO(), type: 'income', cat: 'کمیشن',
    amt: Math.round(total), desc: rule.label + ' — کمیشن (کمپنی حصہ ' + rule.split[0] + '%)',
  });
  persist();
  render();
}

function txnForm() {
  return `
    <form class="form-panel" onsubmit="submitTxnForm(event)">
      <div class="form-grid">
        <div class="field"><label>نوعیت</label><select name="type"><option value="income">آمدنی</option><option value="expense">اخراجات</option></select></div>
        <div class="field"><label>کیٹیگری</label><input name="cat" required placeholder="مثلاً کمیشن، دفتر، تنخواہ" /></div>
        <div class="field"><label>رقم (روپے)</label><input name="amt" type="number" required placeholder="0" /></div>
        <div class="field"><label>تفصیل</label><input name="desc" required placeholder="مختصر تفصیل" /></div>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:6px;">✅ محفوظ کریں</button>
    </form>`;
}

function submitTxnForm(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  STATE.transactions.push({
    id: uid('TXN'), date: todayISO(), type: f.get('type'), cat: f.get('cat'),
    amt: +f.get('amt') || 0, desc: f.get('desc'),
  });
  persist();
  UI.showTxnForm = false;
  render();
}

/* ══════════════════════ ٹولز ══════════════════════ */
const TOOLS = [
  { key: 'measure', icon: '📐', label: 'گھر کی پیمائش' },
  { key: 'rent', icon: '💰', label: 'کرایہ کیلکولیٹر' },
  { key: 'installment', icon: '📊', label: 'قسط کیلکولیٹر' },
  { key: 'compare', icon: '⚖️', label: 'موازنہ' },
];

function screenTools() {
  return `
    <div class="tab-row">
      ${TOOLS.map(t => `<div class="tab ${UI.toolTab === t.key ? 'active' : ''}" onclick="setToolTab('${t.key}')">${t.icon} ${t.label}</div>`).join('')}
    </div>
    <div class="card" style="max-width:900px;">
      ${UI.toolTab === 'measure' ? toolMeasure() : ''}
      ${UI.toolTab === 'rent' ? toolRent() : ''}
      ${UI.toolTab === 'installment' ? toolInstallment() : ''}
      ${UI.toolTab === 'compare' ? toolCompare() : ''}
    </div>
  `;
}

function setToolTab(key) { UI.toolTab = key; render(); }

function toolMeasure() {
  return `
    <div class="card-title">📐 گھر کی پیمائش (مرلہ کیلکولیٹر)</div>
    <div class="form-grid">
      <div class="field"><label>لمبائی (فٹ)</label><input id="measLen" type="number" placeholder="45" /></div>
      <div class="field"><label>چوڑائی (فٹ)</label><input id="measWid" type="number" placeholder="90" /></div>
    </div>
    <button class="btn btn-primary" id="measBtn">🧮 حساب کریں</button>
    <div id="measResult" class="calc-result" style="display:none;"></div>
  `;
}

function toolRent() {
  return `
    <div class="card-title">💰 کرایہ کیلکولیٹر</div>
    <div class="form-grid">
      <div class="field"><label>رقبہ (مرلہ)</label><input id="rentArea" type="number" placeholder="10" /></div>
      <div class="field"><label>نرخ فی مرلہ (روپے)</label><input id="rentRate" type="number" placeholder="6000" /></div>
      <div class="field"><label>مہینے</label><input id="rentMonths" type="number" placeholder="12" /></div>
      <div class="field"><label>رعایت (%)</label><input id="rentDiscount" type="number" placeholder="0" /></div>
    </div>
    <div class="comm-result-grid">
      <div class="comm-box"><div class="comm-label">ماہانہ کرایہ</div><div id="rentMonthly" class="comm-value" style="color:#2980b9">0 روپے</div></div>
      <div class="comm-box"><div class="comm-label">کل رقم</div><div id="rentTotal" class="comm-value" style="color:#27ae60">0 روپے</div></div>
    </div>
  `;
}

function toolInstallment() {
  return `
    <div class="card-title">📊 قسط کیلکولیٹر</div>
    <div class="form-grid">
      <div class="field"><label>کل رقم (روپے)</label><input id="instTotal" type="number" placeholder="5000000" /></div>
      <div class="field"><label>مہینے</label><input id="instMonths" type="number" placeholder="60" /></div>
      <div class="field" style="grid-column:span 2;"><label>سود کی شرح (%)</label><input id="instRate" type="number" step="0.5" placeholder="8" /></div>
    </div>
    <div class="comm-result-grid">
      <div class="comm-box"><div class="comm-label">ماہانہ قسط</div><div id="instMonthly" class="comm-value" style="color:#27ae60">0 روپے</div></div>
      <div class="comm-box"><div class="comm-label">سود سمیت کل</div><div id="instWithInt" class="comm-value" style="color:#c0392b">0 روپے</div></div>
    </div>
  `;
}

function toolCompare() {
  const list = STATE.properties;
  const checks = list.map(p => `
    <label class="compare-row">
      <input type="checkbox" class="compare-check" value="${p.id}" ${UI.compareIds.includes(p.id) ? 'checked' : ''} />
      <span>${PTI[p.ptype]} ${PTL[p.ptype]} — ${escapeHtml(p.loc)} (${p.rooms > 0 ? p.rooms + ' کمرے، ' : ''}${p.area} مرلہ، ${fmt(p.price)} روپے)</span>
    </label>`).join('');
  return `
    <div class="card-title">⚖️ جائیداد کا موازنہ</div>
    <div style="margin-bottom:16px;">
      <h3 style="font-size:14px;font-weight:700;color:#1b3d6e;margin-bottom:10px;">📌 کم از کم 2 جائیدادیں منتخب کریں</h3>
      ${checks}
    </div>
    <div id="compareOut">${compareTableHtml()}</div>
  `;
}

function compareTableHtml() {
  const list = STATE.properties.filter(p => UI.compareIds.includes(p.id));
  if (list.length < 2) return `<div class="muted small" style="text-align:center;padding:20px;">کم از کم 2 جائیدادیں منتخب کریں</div>`;
  const rowsDef = [
    ['نوعیت', p => PTL[p.ptype]],
    ['کمرے', p => p.rooms || '—'],
    ['رقبہ', p => p.area + ' مرلہ'],
    ['قیمت', p => fmt(p.price) + ' روپے'],
    ['مقام', p => p.loc],
  ];
  return `<div class="table-wrap"><table>
    <thead><tr><th>خصوصیات</th>${list.map(p => `<th>${p.id}</th>`).join('')}</tr></thead>
    <tbody>${rowsDef.map(([label, get]) => `<tr><td class="strong small">${label}</td>${list.map(p => `<td class="small navy strong">${escapeHtml(String(get(p)))}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function wireToolsCalculators() {
  const measBtn = document.getElementById('measBtn');
  if (measBtn) measBtn.addEventListener('click', () => {
    const len = parseFloat(document.getElementById('measLen').value) || 0;
    const wid = parseFloat(document.getElementById('measWid').value) || 0;
    const sqft = len * wid;
    const marla = sqft / 272.25;
    const out = document.getElementById('measResult');
    out.style.display = 'block';
    out.textContent = `✅ رقبہ: ${fmt(sqft)} مربع فٹ ≈ ${marla.toFixed(2)} مرلہ`;
  });

  const rentIds = ['rentArea', 'rentRate', 'rentMonths', 'rentDiscount'];
  const updateRent = () => {
    const area = parseFloat(document.getElementById('rentArea')?.value) || 0;
    const rate = parseFloat(document.getElementById('rentRate')?.value) || 0;
    const months = parseFloat(document.getElementById('rentMonths')?.value) || 1;
    const discount = parseFloat(document.getElementById('rentDiscount')?.value) || 0;
    const monthly = area * rate * (1 - discount / 100);
    const total = monthly * months;
    const m = document.getElementById('rentMonthly'), t = document.getElementById('rentTotal');
    if (m) m.textContent = fmt(monthly) + ' روپے';
    if (t) t.textContent = fmt(total) + ' روپے';
  };
  rentIds.forEach(id => document.getElementById(id)?.addEventListener('input', updateRent));
  updateRent();

  const instIds = ['instTotal', 'instMonths', 'instRate'];
  const updateInst = () => {
    const total = parseFloat(document.getElementById('instTotal')?.value) || 0;
    const months = parseFloat(document.getElementById('instMonths')?.value) || 1;
    const rate = parseFloat(document.getElementById('instRate')?.value) || 0;
    const monthly = total / months;
    const withInt = monthly * months * (1 + rate / 100);
    const m = document.getElementById('instMonthly'), w = document.getElementById('instWithInt');
    if (m) m.textContent = fmt(monthly) + ' روپے';
    if (w) w.textContent = fmt(withInt) + ' روپے';
  };
  instIds.forEach(id => document.getElementById(id)?.addEventListener('input', updateInst));
  updateInst();

  document.querySelectorAll('.compare-check').forEach(chk => {
    chk.addEventListener('change', () => {
      UI.compareIds = Array.from(document.querySelectorAll('.compare-check:checked')).map(c => c.value);
      document.getElementById('compareOut').innerHTML = compareTableHtml();
    });
  });
}

/* ══════════════════════ دستاویزات ══════════════════════ */
function screenDocuments() {
  const D = STATE.documents;
  const statusLabel = { verified: 'تصدیق شدہ', pending: 'زیرِ التوا' };
  const statusColor = { verified: '#27ae60', pending: '#e67e22' };
  const rows = D.map(d => {
    const prop = STATE.properties.find(p => p.id === d.propertyId);
    return `<tr>
      <td class="small">${escapeHtml(d.name)}</td>
      <td class="mono small navy">${d.propertyId}${prop ? ' · ' + escapeHtml(prop.loc) : ''}</td>
      <td class="small">${escapeHtml(d.type)}</td>
      <td class="muted small">${d.date}</td>
      <td>${badge(statusLabel[d.status] || d.status, statusColor[d.status] || '#7f8c8d')}</td>
    </tr>`;
  }).join('');

  const propOptions = STATE.properties.map(p => `<option value="${p.id}">${p.id} — ${escapeHtml(p.loc)}</option>`).join('');

  return `
    <div class="card">
      <div class="row-between" style="margin-bottom:16px;">
        <div class="card-title" style="margin:0;">📋 دستاویزات کا ریکارڈ</div>
        <button class="btn btn-primary" onclick="toggleForm('showDocForm')">${UI.showDocForm ? '✕ بند کریں' : '+ نئی دستاویز'}</button>
      </div>
      ${UI.showDocForm ? `
        <form class="form-panel" onsubmit="submitDocForm(event)">
          <div class="form-grid">
            <div class="field"><label>جائیداد</label><select name="propertyId" required>${propOptions}</select></div>
            <div class="field"><label>دستاویز کا نام</label><input name="name" required placeholder="مثلاً کرایہ نامہ" /></div>
            <div class="field"><label>قسم</label><input name="type" required placeholder="مثلاً قانونی سند" /></div>
            <div class="field"><label>حالت</label><select name="status"><option value="pending">زیرِ التوا</option><option value="verified">تصدیق شدہ</option></select></div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:6px;">✅ محفوظ کریں</button>
        </form>` : ''}
      <div class="table-wrap">
        <table>
          <thead><tr><th>نام</th><th>جائیداد</th><th>قسم</th><th>تاریخ</th><th>حالت</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5" class="muted small" style="text-align:center;padding:20px;">کوئی دستاویز نہیں</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  `;
}

function submitDocForm(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  STATE.documents.push({
    id: uid('DOC'), propertyId: f.get('propertyId'), name: f.get('name'),
    type: f.get('type'), date: todayISO(), status: f.get('status'),
  });
  persist();
  UI.showDocForm = false;
  render();
}

/* ══════════════════════ عملہ / HR ══════════════════════ */
function screenHR() {
  const E = STATE.employees;
  const today = todayISO();
  const rows = E.map(emp => {
    const monthAttendance = STATE.attendance.filter(a => a.employeeId === emp.id && a.date.slice(0, 7) === today.slice(0, 7));
    const present = monthAttendance.filter(a => a.status === 'present').length;
    const absent = monthAttendance.filter(a => a.status === 'absent').length;
    const todayRec = STATE.attendance.find(a => a.employeeId === emp.id && a.date === today);
    const deduction = absent * (emp.baseSalary / 30);
    const salary = Math.max(0, emp.baseSalary - deduction);
    return `<tr>
      <td class="mono strong navy small">${emp.id}</td>
      <td class="strong small">${escapeHtml(emp.name)}</td>
      <td class="small">${escapeHtml(emp.role)}</td>
      <td class="mono small ltr">${emp.phone}</td>
      <td class="mono small">${fmt(emp.baseSalary)} روپے</td>
      <td class="small">${emp.commissionPct}%</td>
      <td class="small">${present} حاضر / ${absent} غیر حاضر</td>
      <td class="mono strong navy small">${fmt(salary)} روپے</td>
      <td>
        <div class="row-actions">
          <button class="pill pill-call" style="border:none;cursor:pointer;" onclick="markAttendance('${emp.id}','present')" ${todayRec?.status === 'present' ? 'disabled' : ''}>✔ حاضر</button>
          <button class="pill" style="background:#e74c3c;color:#fff;border:none;cursor:pointer;" onclick="markAttendance('${emp.id}','absent')" ${todayRec?.status === 'absent' ? 'disabled' : ''}>✘ غیر حاضر</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="row-between" style="margin-bottom:16px;">
        <div class="card-title" style="margin:0;">🧑‍💼 عملہ (${E.length}) — آج کی تاریخ: ${today}</div>
        <button class="btn btn-primary" onclick="toggleForm('showEmpForm')">${UI.showEmpForm ? '✕ بند کریں' : '+ نیا ملازم'}</button>
      </div>
      ${UI.showEmpForm ? empForm() : ''}
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>نام</th><th>عہدہ</th><th>فون</th><th>بنیادی تنخواہ</th><th>کمیشن %</th><th>اس ماہ حاضری</th><th>تخمینی تنخواہ</th><th>آج کی حاضری</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="9" class="muted small" style="text-align:center;padding:20px;">کوئی ملازم نہیں</td></tr>`}</tbody>
        </table>
      </div>
      <p class="muted small" style="margin-top:12px;">نوٹ: تخمینی تنخواہ = بنیادی تنخواہ − (غیر حاضر دن × روزانہ اجرت)۔ کمیشن کی رقم مالیات کے صفحے سے الگ شمار ہوتی ہے۔</p>
    </div>
  `;
}

function empForm() {
  return `
    <form class="form-panel" onsubmit="submitEmpForm(event)">
      <div class="form-grid">
        <div class="field"><label>نام</label><input name="name" required placeholder="پورا نام" /></div>
        <div class="field"><label>عہدہ</label><input name="role" required placeholder="مثلاً سیلز ایجنٹ" /></div>
        <div class="field"><label>فون</label><input name="phone" required placeholder="0300-0000000" /></div>
        <div class="field"><label>بنیادی تنخواہ (روپے)</label><input name="baseSalary" type="number" required placeholder="40000" /></div>
        <div class="field"><label>کمیشن حصہ (%)</label><input name="commissionPct" type="number" placeholder="45" /></div>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:6px;">✅ محفوظ کریں</button>
    </form>`;
}

function submitEmpForm(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  STATE.employees.push({
    id: uid('EMP'), name: f.get('name'), role: f.get('role'), phone: f.get('phone'),
    baseSalary: +f.get('baseSalary') || 0, commissionPct: +f.get('commissionPct') || 0, joinDate: todayISO(),
  });
  persist();
  UI.showEmpForm = false;
  render();
}

function markAttendance(employeeId, status) {
  const today = todayISO();
  const existing = STATE.attendance.find(a => a.employeeId === employeeId && a.date === today);
  if (existing) existing.status = status;
  else STATE.attendance.push({ id: uid('ATT'), employeeId, date: today, status });
  persist();
  render();
}

/* ══════════════════════ عمومی مددگار ══════════════════════ */
function toggleForm(key) {
  UI[key] = !UI[key];
  render();
}

/* ══════════════════════ آغاز ══════════════════════ */
document.addEventListener('DOMContentLoaded', render);
