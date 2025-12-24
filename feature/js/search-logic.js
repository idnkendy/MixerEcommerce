function initSearch() {
    const inputs = document.querySelectorAll('#search-input, #search-input-trie, .search-input-standard');
    const trieRes = document.getElementById('autocomplete-results');

    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                const params = new URLSearchParams(window.location.search);
                params.set('search', input.value.trim());
                window.location.href = `products.html?${params.toString()}`;
            }
        });

        if(input.id === 'search-input-trie' && trieRes) {
            input.addEventListener('input', (e) => {
                const key = e.target.value.trim();
                if(key.length < 2) { trieRes.classList.add('hidden'); return; }
                
                const results = productTrie.search(key);
                const unique = [...new Map(results.map(item => [item.id, item])).values()].slice(0, 5);

                trieRes.classList.remove('hidden');
                trieRes.innerHTML = unique.length ? unique.map(p => `
                    <a href="product-detail.html?id=${p.id}" class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700 transition">
                        <img src="${p.image}" class="w-10 h-10 object-cover rounded">
                        <div><p class="text-sm font-bold text-gray-900 dark:text-white">${p.name}</p><p class="text-xs text-gray-600 dark:text-gray-400">$${p.price}</p></div>
                    </a>`).join('') : '<p class="p-3 text-sm text-gray-500 dark:text-gray-400">No suggestions.</p>';
            });
            document.addEventListener('click', (e) => {
                if(!input.contains(e.target) && !trieRes.contains(e.target)) trieRes.classList.add('hidden');
            });
        }
    });
}

window.initSearch = initSearch;

