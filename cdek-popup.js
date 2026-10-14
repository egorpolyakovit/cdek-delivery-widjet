(function () {
  'use strict';
  const root = document.getElementById('mainRegions');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const dialog = $('.cdekPopup');
  const country = $('#cdekCountry');
  const search = $('#cdekCitySearch');
  const cityList = $('#cdekCities');
  const officeList = $('#cdekOffices');
  const status = $('#cdekStatus');
  const selectedText = $('#cdekSelected');
  const confirm = $('#cdekConfirm');
  const consult = $('#cdekConsult');
  const title = $('#cdekCityTitle');
  let directory = [], cities = [], offices = [], selected = null;
  let currentCity = '', loaded = false, loading = null, timer = null, previousFocus = null;
  const normalize = value => String(value || '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
  function el(tag, value, cls) { const n = document.createElement(tag); if (value !== undefined) n.textContent = value; if (cls) n.className = cls; return n; }
  function saved() { try { return JSON.parse(localStorage.getItem('demoCdekOffice') || 'null'); } catch (_) { return null; } }
  function clearSelection() { selected = null; confirm.disabled = true; consult.disabled = true; selectedText.textContent = 'Пункт выдачи не выбран.'; }
  function choose(office) { selected = office; confirm.disabled = consult.disabled = false; selectedText.textContent = office.city + ', ' + office.address + ' · ' + office.code; renderOffices(); }
  function selectedCountry() { return directory.filter(o => o.country_code === country.value); }
  function renderCities() {
    cityList.replaceChildren();
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    const matched = new Set(offices.map(o => o.city));
    const visible = cities.filter(c => !words.length || words.every(w => normalize(c.name).includes(w)) || matched.has(c.name));
    visible.forEach(c => { const li = el('li'); const btn = el('button', c.name + ' (' + c.count + ')', c.name === currentCity ? 'active' : ''); btn.type='button'; btn.setAttribute('aria-pressed', String(c.name === currentCity)); btn.addEventListener('click', () => loadOffices(c.name)); li.append(btn); cityList.append(li); });
    if (!visible.length) cityList.append(el('li', 'Города не найдены.'));
  }
  function renderOffices() {
    officeList.replaceChildren();
    status.textContent = offices.length ? 'Найдено пунктов: ' + offices.length : 'Пункты по вашему запросу не найдены.';
    offices.forEach(o => {
      const active = !!selected && selected.code === o.code && selected.country_code === o.country_code;
      const li = el('li', undefined, 'cdekOffice' + (active ? ' active' : ''));
      li.append(el('h4', o.city + ', ' + o.address), el('p', 'Код ПВЗ: ' + o.code));
      if (o.work_time) li.append(el('p', o.work_time));
      if (o.metro) li.append(el('p', 'Метро: ' + o.metro));
      const btn = el('button', active ? 'Выбран' : 'Выбрать этот пункт'); btn.type='button'; btn.setAttribute('aria-pressed', String(active)); btn.addEventListener('click', () => choose(o)); li.append(btn); officeList.append(li);
    });
  }
  function loadOffices(city) { clearTimeout(timer); currentCity = city; search.value = ''; clearSelection(); offices = selectedCountry().filter(o => o.city === city); title.textContent = city; renderCities(); const s = saved(); if (s) { const match=offices.find(o => o.code===s.code && o.country_code===s.country_code); if (match) { choose(match); return; } } renderOffices(); }
  function loadCities(preferred) {
    const groups = new Map();
    selectedCountry().forEach(o => groups.set(o.city, (groups.get(o.city) || 0) + 1));
    cities = Array.from(groups, ([name, count]) => ({name, count})).sort((a,b) => a.name.localeCompare(b.name, 'ru'));
    offices = []; currentCity = ''; search.value = ''; title.textContent='Выберите город'; clearSelection(); officeList.replaceChildren(); renderCities(); status.textContent='Выберите город или воспользуйтесь поиском.';
    if (preferred && cities.some(c => c.name === preferred)) loadOffices(preferred);
  }
  function searchOffices() {
    clearTimeout(timer); const q=normalize(search.value); currentCity=''; offices=[]; clearSelection(); officeList.replaceChildren();
    if (!q) { renderCities(); title.textContent='Выберите город'; status.textContent='Выберите город или воспользуйтесь поиском.'; return; }
    title.textContent='Результаты поиска'; status.textContent='Поиск пунктов…';
    timer=setTimeout(() => { const words=q.split(/\s+/).filter(Boolean); offices=selectedCountry().filter(o => words.every(w => normalize([o.city,o.address,o.code].join(' ')).includes(w))); renderCities(); renderOffices(); }, 200);
  }
  async function init() {
    if (loaded || loading) return loading;
    loading=(async () => {
      try {
        const response=await fetch('data/cdek-offices.json', {cache:'no-store'});
        if (!response.ok) throw new Error('Не удалось загрузить справочник.');
        const data=await response.json(); directory=data.offices || [];
        const groups = new Map(); directory.forEach(o => { const v=groups.get(o.country_code) || {name:o.country, count:0}; v.count++; groups.set(o.country_code,v); });
        country.replaceChildren(); groups.forEach((info,code) => { const option=el('option',info.name+' ('+info.count+')'); option.value=code; country.append(option); });
        if (groups.has('RU')) country.value='RU'; const previous=saved(); if (previous && groups.has(previous.country_code)) country.value=previous.country_code;
        loaded=true; country.disabled=false; search.disabled=false; loadCities(previous ? previous.city : '');
      } catch (err) { status.textContent=err.message; } finally { loading=null; }
    })(); return loading;
  }
  function open() { if (!root.hidden) return; previousFocus=document.activeElement; root.hidden=false; root.style.display='flex'; root.classList.add('visible'); root.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; dialog.focus(); init(); }
  function close() { root.hidden=true; root.style.display='none'; root.classList.remove('visible'); root.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if (previousFocus && previousFocus.isConnected) previousFocus.focus(); }
  document.addEventListener('click', e => { const trigger=e.target.closest('.chooseRegion'); if (!trigger) return; e.preventDefault(); open(); });
  window.openCdekPopup=open;
  $('.closeRegions').addEventListener('click',close);
  root.addEventListener('click',e => { if (e.target === root) close(); });
  root.addEventListener('keydown', e => {
    if (e.key==='Escape') { close(); return; }
    if (e.key!=='Tab') return;
    const focusable=Array.from(root.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')).filter(n => n.getClientRects().length);
    if (!focusable.length) return;
    const first=focusable[0], last=focusable[focusable.length-1];
    if (e.shiftKey && (document.activeElement===first || document.activeElement===dialog)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement===last || document.activeElement===dialog)) { e.preventDefault(); first.focus(); }
  });
  country.addEventListener('change', () => loadCities(''));
  search.addEventListener('input', searchOffices);
  confirm.addEventListener('click', () => {
    if (!selected) return;
    try {localStorage.setItem('demoCdekOffice',JSON.stringify(selected));} catch (_) {}
    document.querySelectorAll('.chooseRegion').forEach(b => b.textContent='ПВЗ: '+selected.city);
    document.getElementById('currentSelection').textContent='Выбрано: '+selected.city+', '+selected.address+' · '+selected.code;
    document.dispatchEvent(new CustomEvent('mv:cdek-selected',{detail:selected})); close();
  });
  consult.addEventListener('click', () => {
    if (!selected) return;
    const msg='Прошу согласовать доставку оборудования и комплектующих.\nСтрана: '+selected.country+'\nГород: '+selected.city+'\nПредпочтительный ПВЗ СДЭК: '+selected.code+'\nАдрес: '+selected.address;
    window.location.href='mailto:sales@example.com?subject='+encodeURIComponent('Доставка в ПВЗ СДЭК — '+selected.city)+'&body='+encodeURIComponent(msg);
  });
  const previous=saved(); if (previous && previous.city) document.querySelectorAll('.chooseRegion').forEach(b => b.textContent='ПВЗ: '+previous.city);
})();