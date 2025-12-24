async function trackProductView(productId) {
    try {
        const client = window.supabase;
        if (client && typeof client.from === 'function') {
            const { data, error: fetchError } = await client
                .from('products')
                .select('view_count')
                .eq('id', productId)
                .single();
            
            if (!fetchError && data) {
                const newCount = (data.view_count || 0) + 1;
                await client
                    .from('products')
                    .update({ view_count: newCount })
                    .eq('id', productId);
                console.log(`View count updated: ${productId} -> ${newCount}`);
            }
        }
    } catch (e) {
        console.warn("Failed to track view in Supabase:", e.message);
    }
    
    let viewCounts = JSON.parse(localStorage.getItem('productViews') || '{}');
    viewCounts[productId] = (viewCounts[productId] || 0) + 1;
    localStorage.setItem('productViews', JSON.stringify(viewCounts));
}

function getProductViewCount(productId) {
    const product = window.productsData?.find(p => p.id == productId);
    if (product && product.view_count) {
        return product.view_count;
    }
    
    const viewCounts = JSON.parse(localStorage.getItem('productViews') || '{}');
    return viewCounts[productId] || 0;
}

function createProductCard(p) {
    const viewCount = getProductViewCount(p.id);
    return `
    <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
        <div onclick="trackProductView(${p.id}); window.location.href='product-detail.html?id=${p.id}'" 
             class="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer">
            <img src="${p.image}" alt="${p.name}" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110">
            <div class="absolute top-3 left-3 flex flex-col gap-2 z-10">
                ${p.is_sale ? '<span class="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">SALE</span>' : ''}
                ${p.is_new ? '<span class="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">NEW</span>' : ''}
            </div>
            <div class="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 z-20 bg-gradient-to-t from-black/50 to-transparent pt-10">
                 <button onclick="addToCart(${p.id}); event.stopPropagation();" class="w-full bg-white text-black font-bold py-3 rounded-xl shadow-lg hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 active:scale-95 transform">
                    <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
                    Add to Cart
                </button>
            </div>
        </div>
        <div class="flex flex-col p-4 gap-1">
            <div class="flex justify-between items-start">
                <a href="product-detail.html?id=${p.id}" class="text-gray-800 dark:text-gray-200 font-bold text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1" title="${p.name}">
                    ${p.name}
                </a>
            </div>
            <div class="flex items-center justify-between mt-1">
                <p class="text-lg font-black text-gray-900 dark:text-white">$${p.price}</p>
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider bg-gray-50 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600">${p.category}</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span>${viewCount} views</span>
            </div>
        </div>
    </div>`;
}

function getCurrentFilteredList() {
    const params = new URLSearchParams(window.location.search);
    let list = [...window.productsData];
    const type = params.get('type');
    if(type === 'men') list = list.filter(p => p.category === 'men');
    else if(type === 'women') list = list.filter(p => p.category === 'women');
    else if(type === 'new') list = list.filter(p => p.is_new);
    else if(type === 'sale') list = list.filter(p => p.is_sale);

    const search = params.get('search');
    if(search) {
        list = typeof fuzzySearch === 'function' ? fuzzySearch(list, search) : list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
}

function getMostPopularProducts(products, limit = 4) {
    const sorted = [...products]
        .filter(p => p.view_count >= 0)
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, limit);
    
    console.log("Most Popular (unsorted):", products.map(p => ({ id: p.id, name: p.name, view_count: p.view_count })));
    console.log("Most Popular (sorted):", sorted.map(p => ({ id: p.id, name: p.name, view_count: p.view_count })));
    
    return sorted;
}

function renderGrid(container, items) {
    if(!container) return;
    if(!items || items.length === 0) { 
        container.innerHTML = '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">No products found matching your criteria.</p>'; 
        return; 
    }
    container.innerHTML = items.map(p => createProductCard(p)).join('');
}

function renderFeaturedPage() {
    const featuredGrid = document.getElementById('featured-grid');
    if(featuredGrid) {
        let list = window.productsData.filter(p => p.is_new).slice(0, 4);
        if(list.length < 4) list = window.productsData.slice(0, 4); 
        renderGrid(featuredGrid, list);
    }
    const popularGrid = document.getElementById('popular-grid');
    if(popularGrid) {
        let list = [...window.productsData].reverse().slice(0, 4); 
        renderGrid(popularGrid, list);
    }
}

function renderProductsPage() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    let list = getCurrentFilteredList();
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    let title = params.get('type') ? params.get('type').toUpperCase() + " COLLECTION" : "SHOP ALL";
    if(search) title = `SEARCH RESULTS: "${search}"`;
    if(document.getElementById('page-title')) document.getElementById('page-title').innerText = title;

    const sortSelect = document.getElementById('sort-select');
    if(sortSelect && sortSelect.value !== 'default') {
        list = mergeSort(list, 'price', sortSelect.value);
    }
    renderGrid(grid, list);
}

function renderDetailPage() {
    const elName = document.getElementById('detail-name');
    if(!elName) return;
    const id = parseInt(new URLSearchParams(window.location.search).get('id'));
    const p = window.productsData.find(x => x.id === id);
    if(p) {
        document.getElementById('detail-img').src = p.image;
        elName.innerText = p.name;
        document.getElementById('detail-price').innerText = `$${p.price}`;
        if(document.getElementById('detail-desc')) document.getElementById('detail-desc').innerText = p.description || "No description available.";
        if(document.getElementById('detail-category')) document.getElementById('detail-category').innerText = p.category;
        if(document.getElementById('breadcrumb-name')) document.getElementById('breadcrumb-name').innerText = p.name;
        if(p.is_new) document.getElementById('badge-new').classList.remove('hidden');
        if(p.is_sale) document.getElementById('badge-sale').classList.remove('hidden');
        recentStack.push(p);
        const relatedGrid = document.getElementById('related-products-grid');
        if(relatedGrid) {
            const related = getRecommendedProducts(p, window.productsData);
            relatedGrid.innerHTML = related.map(rp => createProductCard(rp)).join('');
        }
        const q = document.getElementById('qty-input');
        if(q) {
            document.getElementById('qty-minus').onclick = () => { if(q.value>1) q.value--; };
            document.getElementById('qty-plus').onclick = () => q.value++;
        }
    } else {
        document.querySelector('main').innerHTML = '<div class="text-center py-20 text-xl">Product not found.</div>';
    }
}

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    if(!container) return;
    const cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    if(!cart.length) { 
        container.innerHTML = '<tr><td colspan="4" class="text-center py-10 text-gray-500 dark:text-gray-400">Your cart is empty.</td></tr>'; 
        if(document.getElementById('cart-total')) document.getElementById('cart-total').innerText = "$0.00";
        if(document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').innerText = "$0.00";
        return; 
    }
    let total = 0;
    let totalItems = 0;
    container.innerHTML = cart.map(i => {
        const p = window.productsData.find(x => x.id === i.id);
        if(!p) return ''; 
        const lineTotal = p.price * i.quantity;
        total += lineTotal;
        totalItems += i.quantity;
        return `
        <tr class="border-b border-gray-100 dark:border-gray-700">
            <td class="py-4 flex gap-4 items-center">
                <img src="${p.image}" class="w-16 h-16 rounded object-cover border dark:border-gray-600">
                <div>
                    <p class="font-bold text-gray-800 dark:text-white">${p.name}</p>
                    <div class="flex items-center gap-1 mt-1">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Size:</span>
                        <select onchange="updateCartSize(${p.id}, '${i.size || 'M'}', this.value)" class="text-xs border rounded p-1 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-black cursor-pointer">
                            ${['S','M','L','XL','XXL'].map(s => `<option value="${s}" ${s === (i.size || 'M') ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </td>
            <td class="py-4 text-gray-600 dark:text-gray-300">$${p.price}</td>
            <td class="py-4">
                <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg w-fit">
                    <button onclick="updateCartQuantity(${p.id}, '${i.size || 'M'}', -1)" class="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">-</button>
                    <span class="px-2 font-bold text-sm min-w-[20px] text-center dark:text-white">${i.quantity}</span>
                    <button onclick="updateCartQuantity(${p.id}, '${i.size || 'M'}', 1)" class="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">+</button>
                </div>
            </td>
            <td class="py-4 text-right font-bold text-gray-900 dark:text-white">
                $${lineTotal.toFixed(2)} 
                <button onclick="removeFromCart(${p.id}, '${i.size || 'M'}')" class="text-red-500 ml-3 hover:text-red-700"><span class="material-symbols-outlined text-sm">delete</span></button>
            </td>
        </tr>`;
    }).join('');
    if(document.getElementById('cart-total')) document.getElementById('cart-total').innerText = `$${total.toFixed(2)} + shipping`;
    if(document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').innerText = `$${total.toFixed(2)}`;
    const summaryTitle = document.querySelector('.lg\\:col-span-2 h3') || document.querySelector('h1');
    if(summaryTitle && summaryTitle.tagName === 'H1') {
        summaryTitle.innerHTML = `<span class="material-symbols-outlined text-3xl">shopping_cart</span> Your Cart (${totalItems} items)`;
    }
}
window.createProductCard = createProductCard;
window.getCurrentFilteredList = getCurrentFilteredList;
window.getMostPopularProducts = getMostPopularProducts;
window.trackProductView = trackProductView;
window.getProductViewCount = getProductViewCount;
window.renderGrid = renderGrid;
window.renderFeaturedPage = renderFeaturedPage;
window.renderProductsPage = renderProductsPage;
window.renderDetailPage = renderDetailPage;
window.renderCartPage = renderCartPage;

