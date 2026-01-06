// Call migrateLocalToSupabase() from the browser console after setting up Supabase config
window.migrateLocalToSupabase = async function(){
  if(!window.supabase){ console.error('Supabase client not loaded'); return; }
  const arr = JSON.parse(localStorage.getItem('umrah_packages_v1') || '[]');
  for(const p of arr){
    const row = {
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
    try{
      const { data, error } = await window.supabase.from('packages').insert([row]);
      if(error) console.error('Insert error', error, row);
    }catch(e){ console.error('Migration error', e); }
  }
  console.log('Migration finished');
};
