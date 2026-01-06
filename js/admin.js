// Enhanced admin page logic: Supabase Auth + async CRUD (replaces local-only auth)
(function(){
  const MAX_IMG_SIZE = 1024 * 1024; // 1MB recommended

  const loginForm = document.getElementById('loginForm');
  const loginBox = document.getElementById('loginBox');
  const dashboard = document.getElementById('dashboard');
  const listEl = document.getElementById('list');
  const addBtn = document.getElementById('addBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const formWrap = document.getElementById('formWrap');
  const pkgForm = document.getElementById('pkgForm');
  const formTitle = document.getElementById('formTitle');
  const cancelEdit = document.getElementById('cancelEdit');
  const imageFile = document.getElementById('imageFile');
  const imgPreview = document.getElementById('imgPreview');

  let lastImageDataUrl = null;

  function isAuthed(){ return sessionStorage.getItem('ibadat_admin_authed') === '1'; }
  function setAuthed(v){ if(v) sessionStorage.setItem('ibadat_admin_authed','1'); else sessionStorage.removeItem('ibadat_admin_authed'); }

  async function showDashboard(){ loginBox.classList.add('hidden'); dashboard.classList.remove('hidden'); await renderList(); }
  function showLogin(){ loginBox.classList.remove('hidden'); dashboard.classList.add('hidden'); }

  async function renderList(){
    const all = await PackageStore.getAll();
    listEl.innerHTML = '';
    if(!all || !all.length){ listEl.innerHTML = '<p class="muted">No packages yet.</p>'; return; }
    all.forEach(p=>{
      const row = document.createElement('div'); row.className='admin-row';
      const t = document.createElement('div'); t.className='title';
      const thumb = document.createElement('div'); thumb.style.marginRight='12px';
      if(p.image){
        const im = document.createElement('img'); im.src = p.image; im.style.width='80px'; im.style.height='50px'; im.style.objectFit='cover'; im.style.borderRadius='6px'; thumb.appendChild(im);
      }
      t.appendChild(thumb);
      const tx = document.createElement('div'); tx.textContent = p.title; tx.style.marginTop='8px';
      t.appendChild(tx);

      const edit = document.createElement('button'); edit.className='btn btn-outline'; edit.textContent='Edit';
      edit.addEventListener('click', ()=>openEdit(p));
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='Delete';
      del.addEventListener('click', async ()=>{
        if(!isAuthed()){ alert('Please sign in to perform this action'); return; }
        if(confirm('Delete this package?')){ await PackageStore.remove(p.id); await renderList(); }
      });
      row.appendChild(t); row.appendChild(edit); row.appendChild(del);
      listEl.appendChild(row);
    })
  }

  function setPreview(src){
    imgPreview.innerHTML = '';
    if(!src) return;
    const img = document.createElement('img'); img.src = src; img.alt = 'Preview'; img.onload = ()=>{}; imgPreview.appendChild(img);
  }

  function openEdit(pkg){
    formTitle.textContent = 'Edit Package';
    formWrap.classList.remove('hidden');
    pkgForm.id.value = pkg.id;
    pkgForm.title.value = pkg.title;
    pkgForm.image.value = pkg.image;
    lastImageDataUrl = pkg.image || null;
    setPreview(pkg.image);
    pkgForm.dateFrom.value = pkg.dateFrom || '';
    pkgForm.dateTo.value = pkg.dateTo || '';
    pkgForm.depTime.value = pkg.depTime || '';
    pkgForm.days.value = pkg.days || '';
    pkgForm.badges.value = (pkg.badges || []).join(',');
    pkgForm.meta.value = pkg.meta || '';
    pkgForm.hotels.value = pkg.hotels || '';
    pkgForm.desc.value = pkg.desc || '';
    pkgForm.sharing.value = pkg.prices?.sharing || '';
    pkgForm.triple.value = pkg.prices?.triple || '';
    pkgForm.double.value = pkg.prices?.double || '';
    pkgForm.quad.value = pkg.prices?.quad || '';
  }

  function openAdd(){
    formTitle.textContent = 'Add Package';
    formWrap.classList.remove('hidden');
    pkgForm.reset();
    pkgForm.id.value = '';
    imgPreview.innerHTML = '';
    lastImageDataUrl = null;
  }

  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const user = loginForm.user.value?.trim();
    const pwd = loginForm.pwd.value;
    // Assume user provides an email as username. Create admin user in Supabase dashboard beforehand.
    if(!window.supabase || !window.supabase.auth){ alert('Supabase client not initialized. Make sure config is set.'); return; }
    try{
      const email = user;
      const res = await window.supabase.auth.signInWithPassword({ email, password: pwd });
      console.log('signInWithPassword result', res);
      const { data, error } = res;
      if(error || !data || !data.user){
        const msg = error?.message || (data && !data.user ? 'No user returned' : 'Unknown error');
        alert('Login failed: ' + msg);
        return;
      }
      setAuthed(true);
      await showDashboard();
    }catch(err){ console.error('Login exception', err); alert('Login failed: ' + (err.message || err)); }
  });

  // Auto logout when leaving the page/tab (hide dashboard and clear session immediately)
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden){ setAuthed(false); showLogin(); }});
  window.addEventListener('pagehide', ()=>{ setAuthed(false); });
  window.addEventListener('beforeunload', ()=>{ setAuthed(false); });

  addBtn.addEventListener('click', ()=>{ if(!isAuthed()){ alert('Please sign in to add packages'); return; } openAdd(); });
  logoutBtn.addEventListener('click', async ()=>{ await window.supabase.auth.signOut(); setAuthed(false); showLogin(); });
  cancelEdit.addEventListener('click', ()=>{ formWrap.classList.add('hidden'); });

  imageFile.addEventListener('change', (ev)=>{
    const f = ev.target.files && ev.target.files[0];
    if(!f) return;
    if(f.size > MAX_IMG_SIZE){ if(!confirm('The selected image is larger than 1MB. Continue?')) return; }
    const fr = new FileReader();
    fr.onload = ()=>{
      const dataUrl = fr.result;
      lastImageDataUrl = dataUrl;
      pkgForm.image.value = dataUrl; // store data URL
      setPreview(dataUrl);
    };
    fr.readAsDataURL(f);
  });

  // live preview when URL pasted into image field
  pkgForm.image.addEventListener('input', ()=>{
    const v = pkgForm.image.value.trim();
    if(!v) { setPreview(lastImageDataUrl); return; }
    // if starts with data: or http, show it
    if(v.startsWith('data:') || v.startsWith('http')) setPreview(v);
  });

  function validateForm(){
    const title = pkgForm.title.value.trim();
    if(!title) { alert('Title is required'); return false; }
    if(pkgForm.days.value && Number(pkgForm.days.value) < 1){ alert('Days must be at least 1'); return false; }
    if(pkgForm.sharing.value && isNaN(Number(pkgForm.sharing.value))) { alert('Sharing price must be numeric'); return false; }
    if(pkgForm.desc.value && pkgForm.desc.value.length > 1000) { if(!confirm('Description is long (>1000 chars). Continue?')) return false; }
    return true;
  }

  pkgForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!isAuthed()){ alert('Please sign in to perform this action'); return; }
    if(!validateForm()) return;
    const data = {
      title: pkgForm.title.value.trim(),
      image: pkgForm.image.value.trim() || lastImageDataUrl || '',
      dateFrom: pkgForm.dateFrom.value || '',
      dateTo: pkgForm.dateTo.value || '',
      depTime: pkgForm.depTime.value || '',
      days: Number(pkgForm.days.value) || 0,
      badges: pkgForm.badges.value ? pkgForm.badges.value.split(',').map(s=>s.trim()).filter(Boolean) : [],
      meta: pkgForm.meta.value || '',
      hotels: pkgForm.hotels.value || '',
      desc: pkgForm.desc.value || '',
      prices: { sharing: pkgForm.sharing.value || '', triple: pkgForm.triple.value || '', double: pkgForm.double.value || '', quad: pkgForm.quad.value || '' }
    };
    const id = pkgForm.id.value;
    if(id){ await PackageStore.update(id, data); } else { await PackageStore.add(data); }
    formWrap.classList.add('hidden');
    await renderList();
    // notify other tabs (storage event is triggered automatically by PackageStore saves)
  });

  // on load
  document.addEventListener('DOMContentLoaded', async ()=>{
    try{
      const { data } = await window.supabase.auth.getUser();
      if(data && data.user){ setAuthed(true); await showDashboard(); } else { setAuthed(false); showLogin(); }
    }catch(e){ setAuthed(false); showLogin(); }
  });
})();
