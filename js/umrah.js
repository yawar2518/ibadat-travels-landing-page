// Renders packages into #packagesGrid and connects with filters (async)
(function(){
  const grid = document.getElementById('packagesGrid');
  const noPackages = document.getElementById('noPackages');

  function formatPrice(val){ if(!val) return ''; return 'PKR ' + Number(val).toLocaleString(); }

  function createCard(pkg){
    const article = document.createElement('article');
    article.className = 'package-card';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'card-image';
    imageDiv.setAttribute('role','img');
    imageDiv.setAttribute('aria-label', pkg.title);

    // Use an <img> with native lazy-loading for better perceived performance
    const img = document.createElement('img');
    img.className = 'card-thumb';
    img.loading = 'lazy';
    img.alt = pkg.title || '';
    img.src = pkg.image || '';
    imageDiv.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = pkg.title;

    const metaRow = document.createElement('div');
    metaRow.className = 'card-meta-row';
    metaRow.innerHTML = `<div class="card-date"><i class="fas fa-calendar"></i> ${formatDateRange(pkg.dateFrom,pkg.dateTo)}</div>
    <div class="card-time"><i class="fas fa-clock"></i> Dep: ${pkg.depTime || ''}</div>
    <div class="card-days"><i class="fas fa-sun"></i> ${pkg.days || ''} Days</div>`;

    const badges = document.createElement('div');
    badges.className = 'card-badges';
    if(pkg.badges && pkg.badges.length) {
      pkg.badges.forEach(b=>{
        const s = document.createElement('span'); s.className='pill'; s.innerHTML = `<i class="fas fa-bed"></i> ${b}`; badges.appendChild(s);
      })
    }

    const meta = document.createElement('div'); meta.className='card-meta'; meta.innerHTML = `<i class="fas fa-plane"></i> ${pkg.meta || ''}`;
    const hotels = document.createElement('div'); hotels.className='card-hotels'; hotels.innerHTML = `<i class="fas fa-building"></i> ${pkg.hotels || ''}`;
    const desc = document.createElement('p'); desc.className='card-desc'; desc.textContent = pkg.desc || '';

    const priceDiv = document.createElement('div'); priceDiv.className = 'card-price';
    const pricesInner = document.createElement('div'); pricesInner.className='prices';

    const mapPrice = (label, val) => `<div class="price-item"><span>${label}</span><strong>${formatPrice(val)}</strong></div>`;
    const p = pkg.prices || {};
    pricesInner.innerHTML = `${mapPrice('Sharing',p.sharing || '')}${mapPrice('Triple',p.triple || '')}${mapPrice('Double',p.double || '')}${mapPrice('Quad',p.quad || '')}`;

    priceDiv.appendChild(pricesInner);

    body.appendChild(h3); body.appendChild(metaRow); body.appendChild(badges); body.appendChild(meta); body.appendChild(hotels); body.appendChild(desc);

    article.appendChild(imageDiv); article.appendChild(body); article.appendChild(priceDiv);

    return article;
  }

  function formatDateRange(from,to){
    if(!from && !to) return '';
    try{ const a = from ? new Date(from).toLocaleDateString() : ''; const b = to ? new Date(to).toLocaleDateString() : ''; return a && b ? `${a} - ${b}` : a || b; }catch(e){ return `${from || ''} ${to || ''}` }
  }

  function render(list){
    grid.innerHTML = '';
    if(!list || !list.length){ noPackages.style.display = ''; return; }
    noPackages.style.display = 'none';
    const frag = document.createDocumentFragment();
    list.forEach((pkg,i)=>{
      const card = createCard(pkg);
      // staggered delay for nicer entrance
      card.style.transitionDelay = `${i * 40}ms`;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    // trigger visibility after append to run CSS transition
    requestAnimationFrame(()=>{
      Array.from(grid.children).forEach(el=> el.classList.add('visible'));
    });
  }

  // Filters removed — simplified UI
  function getFilters(){ return {}; }
  function adjustFiltersVisibility(){ /* no-op; filters removed */ }
  async function applyFilters(){ /* no-op */ }

  // init
  document.addEventListener('DOMContentLoaded', async ()=>{
    const loader = document.getElementById('packagesLoader');
    // show local cached data instantly if available
    let hadLocal = false;
    try{
      if(window.PackageStore && window.PackageStore.getAllLocal){
        const local = window.PackageStore.getAllLocal();
        if(local && local.length){ render(local); hadLocal = true; adjustFiltersVisibility(local); }
      }
    }catch(e){ /* ignore */ }

    // Only show loader if we don't have cached data or if network is slow
    let loaderTimer = null;
    if(!hadLocal) loaderTimer = setTimeout(()=> loader.classList.remove('hidden'), 150);

    try{
      const list = await PackageStore.getAll();
      render(list); adjustFiltersVisibility(list);
    }catch(e){ console.error('Failed to load packages', e); if(!grid.children.length) render([]); }
    finally{ if(loaderTimer) clearTimeout(loaderTimer); loader.classList.add('hidden'); }

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', async ()=>{
      document.getElementById('filter-date-from').value='';
      document.getElementById('filter-date-to').value='';
      document.getElementById('filter-days').value='Any';
      document.getElementById('filter-flight').value='Any';
      document.getElementById('filter-hotel').value='Any';
      document.getElementById('filter-price-min').value='';
      document.getElementById('filter-price-max').value='';
      // show loader only if we have no cached data
      const loader2 = document.getElementById('packagesLoader');
      let lt = null; if(window.PackageStore && !window.PackageStore.getAllLocal) lt = setTimeout(()=> loader2.classList.remove('hidden'), 150);
      try{ const list = await PackageStore.getAll(); render(list); adjustFiltersVisibility(list); }catch(e){ console.error(e); render([]); }
      finally{ if(lt) clearTimeout(lt); loader2.classList.add('hidden'); }
    });

    // live update: listen for storage events so the page reflects admin changes in other tabs
    window.addEventListener('storage', async (e)=>{
      if(e.key === 'umrah_packages_v1'){
        try{ const list = await PackageStore.getAll(); render(list); adjustFiltersVisibility(list); }catch(err){ console.error('storage refresh failed', err); }
      }
    })
  });

})();
