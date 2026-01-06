// Supabase-backed data store with localStorage fallback
// Configure your Supabase URL and anon key by setting window.SUPABASE_URL and window.SUPABASE_ANON_KEY
(function(window){
  const STORAGE_KEY = 'umrah_packages_v1';
  const SUPABASE_URL = window.SUPABASE_URL || 'https://YOUR-SUPABASE-URL.supabase.co';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

  let supabase = null;
  // UMD script exposes a factory `createClient` on window.supabase (we included the UMD script in pages)
  if(window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith('YOUR_')){
    try{
      // create an actual Supabase client and expose it for other scripts
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      // replace the window reference with the client so other code can call window.supabase.auth
      window.supabase = supabase;
      // also make a clear alias
      window.supabaseClient = supabase;
    }catch(e){ console.warn('Failed to init Supabase client', e); supabase = null; }
  }

  function getAllLocal(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }catch(e){ console.error(e); return []; }
  }
  function saveAllLocal(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

  function rowToPkg(r){
    return {
      id: r.id,
      title: r.title,
      image: r.image,
      dateFrom: r.date_from,
      dateTo: r.date_to,
      depTime: r.dep_time,
      arrTime: r.arr_time,
      days: r.days,
      badges: r.badges,
      meta: r.meta,
      hotels: r.hotels,
      desc: r.description,
      prices: r.prices
    };
  }

  function pkgToRow(p){
    return {
      title: p.title,
      image: p.image,
      date_from: p.dateFrom || null,
      date_to: p.dateTo || null,
      dep_time: p.depTime || null,
      arr_time: p.arrTime || null,
      days: p.days || null,
      badges: p.badges || null,
      meta: p.meta || null,
      hotels: p.hotels || null,
      description: p.desc || null,
      prices: p.prices || null
    };
  }

  async function getAll(){
    if(!supabase) return getAllLocal();
    try{
      const { data, error } = await supabase.from('packages').select('*').order('date_from', { ascending: true });
      if(error) throw error;
      const list = (data || []).map(rowToPkg);
      // cache the latest successful fetch locally for instant subsequent loads
      try{ saveAllLocal(list); }catch(e){ /* ignore */ }
      return list;
    }catch(e){
      console.warn('Supabase read failed, falling back to localStorage', e);
      return getAllLocal();
    }
  }

  function generateId(){ return 'pkg_' + Math.random().toString(36).slice(2,9); }

  window.PackageStore = { getAll, add, update, remove, saveAllLocal };

  async function add(pkg){
    if(!supabase){ pkg.id = pkg.id || generateId(); const all = getAllLocal(); all.push(pkg); saveAllLocal(all); return pkg; }
    try{
      const row = pkgToRow(pkg);
      const { data, error } = await supabase.from('packages').insert([row]).select();
      if(error) throw error;
      return rowToPkg(data[0]);
    }catch(e){
      console.warn('Supabase insert failed, storing locally', e);
      pkg.id = pkg.id || generateId(); const all = getAllLocal(); all.push(pkg); saveAllLocal(all); return pkg;
    }
  }

  async function update(id, data){
    if(!supabase){ let all = getAllLocal(); const idx = all.findIndex(p=>p.id===id); if(idx===-1) return false; all[idx] = Object.assign({}, all[idx], data); saveAllLocal(all); return true; }
    try{
      const payload = pkgToRow(data);
      const { error } = await supabase.from('packages').update(payload).eq('id', id);
      if(error) throw error;
      return true;
    }catch(e){
      console.warn('Supabase update failed, applying local update', e);
      let all = getAllLocal(); const idx = all.findIndex(p=>p.id===id); if(idx===-1) return false; all[idx] = Object.assign({}, all[idx], data); saveAllLocal(all); return true;
    }
  }

  async function remove(id){
    if(!supabase){ let all = getAllLocal(); all = all.filter(p=>p.id!==id); saveAllLocal(all); return; }
    try{
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if(error) throw error;
    }catch(e){ console.warn('Supabase delete failed, applying local delete', e); let all = getAllLocal(); all = all.filter(p=>p.id!==id); saveAllLocal(all); }
  }

  function generateId(){ return 'pkg_' + Math.random().toString(36).slice(2,9); }

  window.PackageStore = { getAll, add, update, remove, saveAllLocal, getAllLocal };
})(window);
