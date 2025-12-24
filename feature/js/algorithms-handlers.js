window.handleSortChange = function() {
    const sortValue = document.getElementById('sort-select').value;
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    let list = getCurrentFilteredList();
    if(sortValue !== 'default') list = mergeSort(list, 'price', sortValue);
    renderGrid(grid, list);
}

window.filterByBinarySearch = function() {
    const min = parseFloat(document.getElementById('min-price').value) || 0;
    const max = parseFloat(document.getElementById('max-price').value) || 999999;
    const grid = document.getElementById('product-grid');
    let list = getCurrentFilteredList();
    let sorted = mergeSort(list, 'price', 'asc');
    let result = binarySearchRange(sorted, min, max);
    renderGrid(grid, result);
}

window.runKMeans = function() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    let list = getCurrentFilteredList();
    if(list.length < 3) { showToast("Not enough items to cluster (need at least 3).", "error"); return; }
    const clusters = kMeansClustering(list, 3);
    const titles = ["🟢 Budget", "🔵 Standard", "🟡 Premium"];
    grid.innerHTML = "";
    clusters.forEach((c, i) => {
        if(!c.length) return;
        grid.insertAdjacentHTML('beforeend', `<div class="col-span-full mt-4"><h3 class="font-bold border-l-4 border-black pl-3">${titles[i]} (${c.length})</h3></div>`);
        c.forEach(p => grid.insertAdjacentHTML('beforeend', createProductCard(p)));
    });
}

window.runBudgetTool = function() {
    const budgetInput = document.getElementById('budget-input');
    const budget = parseFloat(budgetInput.value);
    if(!budget || budget <= 0) { showToast("Please enter a valid budget amount.", "error"); return; }
    let list = getCurrentFilteredList();
    if(list.length === 0) { showToast("No products available to optimize.", "info"); return; }
    const items = budgetShoppingOptimizer(budget, list);
    document.getElementById('budget-result').classList.remove('hidden');
    const itemsDiv = document.getElementById('budget-items');
    const totalSpan = document.getElementById('budget-total');
    if(items.length) {
        itemsDiv.innerHTML = items.map(p => `
            <div class="w-24 bg-white dark:bg-gray-800 border dark:border-gray-700 p-2 rounded-lg text-center shadow-sm shrink-0">
                <a href="product-detail.html?id=${p.id}" class="block mb-1">
                    <img src="${p.image}" class="h-16 w-full object-cover rounded-md" alt="${p.name}">
                </a>
                <p class="text-xs font-bold truncate text-gray-900 dark:text-white" title="${p.name}">${p.name}</p>
                <p class="text-xs font-bold text-green-600 dark:text-green-400">$${p.price}</p>
            </div>`).join('');
        totalSpan.innerHTML = `<span class="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Cost</span>$${items.reduce((a,b)=>a+b.price,0)} <span class="text-sm font-normal text-gray-400">/ $${budget}</span>`;
    } else {
        itemsDiv.innerHTML = '<span class="text-xs text-red-500">Budget too low.</span>';
        totalSpan.innerText = "";
    }
}
