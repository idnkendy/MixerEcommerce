window.productsData = []; 
window.originalProductsData = [];
const productTrie = new Trie(); 
const recentStack = new ProductStack(); 

document.addEventListener('DOMContentLoaded', async function() {
    console.log("App Started...");
    
    window.productsData = await fetchProducts();
    window.originalProductsData = [...window.productsData];
    console.log("Products loaded:", window.productsData.length);

    window.productsData.forEach(p => {
        p.name.split(" ").forEach(w => productTrie.insert(w, p));
        productTrie.insert(p.name, p);
    });
    analyzeKeywords();
    console.log("Trie & Keywords initialized");

    updateCartUI();
    initSearch();
    renderRecentHistory();
    checkAuthState(); 
    console.log("UI initialized");

    if (document.getElementById('featured-grid')) {
        console.log("Rendering featured page...");
        renderFeaturedPage();
        const popularGrid = document.getElementById('popular-grid');
        if (popularGrid) {
            const mostPopular = getMostPopularProducts(window.originalProductsData, 4);
            if (mostPopular.length > 0) {
                popularGrid.innerHTML = mostPopular.map(p => createProductCard(p)).join('');
            } else {
                popularGrid.innerHTML = '<p class="col-span-full text-center text-gray-400 dark:text-gray-500 text-sm py-8">No viewed products yet. Browse products to see most popular!</p>';
            }
        }
    }
    if (document.getElementById('product-grid')) {
        console.log("Rendering products page...");
        renderProductsPage();
    }
    if (document.getElementById('detail-name')) {
        console.log("Rendering detail page...");
        trackProductView(new URLSearchParams(window.location.search).get('id'));
        renderDetailPage();
    }
    if (document.getElementById('cart-items-container')) {
        console.log("Rendering cart page...");
        renderCartPage();
    }
});
