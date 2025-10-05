document.addEventListener('DOMContentLoaded', () => {
  const API = 'https://tech-services-api.onrender.com';
  const ENDPOINTS = {
    productos: `${API}/productos`,
    usuarios: `${API}/usuarios`,
  };

  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const money = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
      .format(n || 0);

  const tbodyProducts = $('#tbody-products');
  const tbodyUsers    = $('#tbody-users');

  const viewProducts  = $('#view-products');
  const viewUsers     = $('#view-users');
  const viewStats     = $('#view-stats');

  const btnAdd        = $('#btn-add');
  const productForm   = $('#productForm');

  const inputId       = $('#prodId');
  const inputNombre   = $('#nombre');
  const inputPrecio   = $('#precio');
  const inputCategoria= $('#categoria');
  const inputActivos  = $('#activos');

  const visitasMesEl  = $('#visitasMes');
  const statProducts  = $('#statProducts');
  const statTotal     = $('#statTotalPrice');

  $('#link-products')?.addEventListener('click', (e)=>{ e.preventDefault(); showView('products'); });
  $('#link-users')?.addEventListener('click', (e)=>{ e.preventDefault(); showView('users'); });
  $('#link-stats')?.addEventListener('click', (e)=>{ e.preventDefault(); showView('stats'); });

  $('#logoutBtn')?.addEventListener('click', (e)=>{
    e.preventDefault();
    try { sessionStorage.removeItem('isAdmin'); } catch {}
    window.location.href = 'login.html';
  });

  function showView(which){
    viewProducts?.classList.add('d-none');
    viewUsers?.classList.add('d-none');
    viewStats?.classList.add('d-none');

    if(which==='products'){
      viewProducts?.classList.remove('d-none');
      loadProducts();
    }else if(which==='users'){
      viewUsers?.classList.remove('d-none');
      loadUsers();
    }else if(which==='stats'){
      viewStats?.classList.remove('d-none');
      updateStatsFromProducts();
      randomVisits();
    }
  }

  async function loadProducts(){
    try{
      const res = await fetch(ENDPOINTS.productos);
      if(!res.ok) throw new Error(`GET productos -> ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Respuesta inesperada (no es array)');

      tbodyProducts.innerHTML = data.map(p => `
        <tr>
          <td>${String(p.id).padStart(3,'0')}</td>
          <td>${p.nombre}</td>
          <td>${money(p.precio)}</td>
          <td>${Number(p.activos||0)}</td>
          <td>
            <button class="btn btn-warning btn-sm btn-edit" data-id="${p.id}">Editar</button>
            <button class="btn btn-danger  btn-sm btn-del"  data-id="${p.id}">Eliminar</button>
          </td>
        </tr>
      `).join('');

      tbodyProducts.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', onEditProduct));
      tbodyProducts.querySelectorAll('.btn-del').forEach(b  => b.addEventListener('click', onDeleteProduct));

      if (statProducts) statProducts.textContent = data.length;
      if (statTotal) {
        const suma = data.reduce((acc,p)=>acc + Number(p.precio||0), 0);
        statTotal.textContent = money(suma);
      }
    }catch(err){
      console.error('[loadProducts] ', err);
      tbodyProducts.innerHTML = '';
      alert('No se pudieron cargar los productos. Ver consola.');
    }
  }

  function openModal(product=null){
    if(product){
      $('#productModalLabel').textContent = 'Editar producto';
      inputId.value        = product.id;
      inputNombre.value    = product.nombre ?? '';
      inputPrecio.value    = product.precio ?? 0;
      inputCategoria.value = product.categoria ?? '';
      inputActivos.value   = product.activos ?? 0;
    }else{
      $('#productModalLabel').textContent = 'Nuevo producto';
      inputId.value        = '';
      inputNombre.value    = '';
      inputPrecio.value    = 0;
      inputCategoria.value = '';
      inputActivos.value   = 0;
    }
    new bootstrap.Modal('#productModal').show();
  }

  async function fetchProductById(anyId) {
    try{
      let res = await fetch(`${ENDPOINTS.productos}/${encodeURIComponent(anyId)}`);
      if (res.ok) return res.json();

      const numId = Number(anyId);
      if (!Number.isNaN(numId)) {
        res = await fetch(`${ENDPOINTS.productos}/${numId}`);
        if (res.ok) return res.json();
      }

      const all = await fetch(ENDPOINTS.productos).then(r => r.json());
      return all.find(p =>
        String(p.id) === String(anyId) ||
        String(p.id) === String(numId) ||
        String(p.id).padStart(3, '0') === String(anyId)
      );
    }catch(err){
      console.error('[fetchProductById] ', err);
      return null;
    }
  }

  async function onEditProduct(e) {
    try{
      const rawId = e.currentTarget.getAttribute('data-id');
      const product = await fetchProductById(rawId);
      if (!product) { alert('No se pudo cargar el producto'); return; }
      openModal(product);
    }catch(err){
      console.error('[onEditProduct] ', err);
      alert('No se pudo cargar el producto');
    }
  }

  async function onDeleteProduct(e){
    const rawId = e.currentTarget.getAttribute('data-id');
    if(!confirm('¿Deseas eliminar este producto?')) return;

    try{
      let res = await fetch(`${ENDPOINTS.productos}/${encodeURIComponent(rawId)}`, { method: 'DELETE' });
      if(!res.ok){
        const numId = Number(rawId);
        if(!Number.isNaN(numId)){
          res = await fetch(`${ENDPOINTS.productos}/${numId}`, { method: 'DELETE' });
        }
      }
      if(!res.ok) throw new Error(`DELETE productos/${rawId}`);

      loadProducts();
    }catch(err){
      console.error('[onDeleteProduct] ', err);
      alert('No se pudo eliminar el producto');
    }
  }

  btnAdd?.addEventListener('click', ()=> openModal(null));

  productForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = {
      id: inputId.value ? Number(inputId.value) : undefined,
      nombre: inputNombre.value.trim(),
      precio: Number(inputPrecio.value || 0),
      categoria: inputCategoria.value.trim(),
      activos: Number(inputActivos.value || 0)
    };

    if(!payload.nombre){
      alert('El nombre es obligatorio'); return;
    }

    try{
      if(!payload.id){
        const resAll = await fetch(ENDPOINTS.productos);
        const list = await resAll.json();
        const maxId = list.reduce((m,p)=> Math.max(m, Number(p.id)), 0);
        payload.id = maxId + 1;

        const res = await fetch(ENDPOINTS.productos, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error('POST productos');
      }else{
        let res = await fetch(`${ENDPOINTS.productos}/${payload.id}`, {
          method:'PUT',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });

        if(!res.ok){
          res = await fetch(`${ENDPOINTS.productos}/${encodeURIComponent(String(payload.id))}`, {
            method:'PUT',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify(payload)
          });
        }
        if(!res.ok) throw new Error('PUT productos');
      }

      bootstrap.Modal.getInstance($('#productModal'))?.hide();
      loadProducts();
    }catch(err){
      console.error('[submit product] ', err);
      alert('No se pudo guardar');
    }
  });

  async function loadUsers(){
    try{
      const res = await fetch(ENDPOINTS.usuarios);
      if(!res.ok) throw new Error(`GET usuarios -> ${res.status}`);
      const data = await res.json();

      tbodyUsers.innerHTML = data.map(u => `
        <tr>
          <td>${u.id}</td>
          <td>${u.nombre}</td>
          <td>${u.correo || ''}</td>
          <td><span class="badge text-bg-secondary">${u.rol || 'usuario'}</span></td>
        </tr>
      `).join('');
    }catch(err){
      console.error('[loadUsers] ', err);
      tbodyUsers.innerHTML = '';
      alert('No se pudieron cargar los usuarios. Ver consola.');
    }
  }

  function randomVisits(){
    const v = Math.floor(5000 + Math.random()*45000); // 5.000 – 50.000
    visitasMesEl && (visitasMesEl.textContent = v.toLocaleString('es-CO'));
  }

  async function updateStatsFromProducts(){
    try{
      const res = await fetch(ENDPOINTS.productos);
      if(!res.ok) throw new Error('GET productos stats');
      const data = await res.json();
      if (statProducts) statProducts.textContent = data.length;
      if (statTotal) {
        const suma = data.reduce((acc,p)=>acc + Number(p.precio||0), 0);
        statTotal.textContent = money(suma);
      }
    }catch(err){
      console.error('[updateStatsFromProducts] ', err);
    }
  }

  $('#btn-random')?.addEventListener('click', randomVisits);

  showView('products');
});
