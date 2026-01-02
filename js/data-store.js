// Simple client-side data store for Umrah packages
// NOTE: This is client-side only and not secure for production.
(function(window){
  const STORAGE_KEY = 'umrah_packages_v1';

  function getAll(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw){
        // initialize sample data
        const sample = [
          {
            id: generateId(),
            title: 'Ramadan Umrah Package 3.4',
            image: 'https://app.aantourism.com/assets/uploads/media/3fda7380071e2b6b32b7a7ad1835ae29.jpg',
            dateFrom: '2026-02-28',
            dateTo: '2026-03-20',
            depTime: '02:30',
            days: 21,
            badges: ['7 Nights Makkah','8 Nights Madinah','5 Nights Makkah'],
            meta: 'LHE to JED | JED to LHE',
            hotels: 'MELLA HOTEL, HAMOUDA AL MASI',
            desc: 'A blessed journey through Makkah and Madinah. Experience the spiritual journey of a lifetime in the holiest cities of Islam...',
            prices: { sharing: '300000', triple: '320000', double: '340000', quad: '352294' }
          },
          {
            id: generateId(),
            title: 'Ramadan Umrah Package 3.1',
            image: 'https://images.unsplash.com/photo-1542144612-1b3897b1b65b?w=1200',
            dateFrom: '2026-02-28',
            dateTo: '2026-03-20',
            depTime: '03:15',
            days: 21,
            badges: ['7 Nights Makkah','8 Nights Madinah'],
            meta: 'LHE to JED | JED to LHE',
            hotels: 'Fakhir Al Azizia (Makkah), Hala Taiba (Madinah)',
            desc: 'A blessed journey through Makkah and Madinah. Experience the spiritual journey of a lifetime in the holiest cities of Islam...',
            prices: { sharing: '260000', triple: '280000', double: '299400', quad: '320000' }
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
        return sample;
      }
      return JSON.parse(raw);
    }catch(e){
      console.error('Failed to parse packages', e);
      return [];
    }
  }

  function saveAll(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function add(pkg){
    const all = getAll();
    pkg.id = generateId();
    all.push(pkg);
    saveAll(all);
    return pkg;
  }

  function update(id, data){
    const all = getAll();
    const idx = all.findIndex(p=>p.id===id);
    if(idx===-1) return false;
    all[idx] = Object.assign({}, all[idx], data);
    saveAll(all);
    return true;
  }

  function remove(id){
    let all = getAll();
    all = all.filter(p=>p.id!==id);
    saveAll(all);
  }

  function generateId(){
    return 'pkg_' + Math.random().toString(36).slice(2,9);
  }

  window.PackageStore = {
    getAll, saveAll, add, update, remove
  };
})(window);
