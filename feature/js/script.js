// ======================================================
// MAIN ENTRY POINT & ROUTER
// ======================================================

// Biến toàn cục
let productsData = []; 
const productTrie = new Trie(); 
const recentStack = new ProductStack(); 

document.addEventListener('DOMContentLoaded', async function() {
    console.log("App Started...");
    
    // 1. Tải dữ liệu
    productsData = await fetchProducts();

    // 2. Xây dựng cấu trúc dữ liệu (Trie & Hash Table)
    productsData.forEach(p => {
        p.name.split(" ").forEach(w => productTrie.insert(w, p));
        productTrie.insert(p.name, p);
    });
    analyzeKeywords();

    // 3. Khởi tạo giao diện chung
    updateCartUI();
    initSearch();
    renderRecentHistory();
    checkAuthState(); 

    // 4. Router đơn giản: Kiểm tra ID để chạy hàm render tương ứng
    if (document.getElementById('featured-grid')) renderFeaturedPage();
    if (document.getElementById('product-grid')) renderProductsPage();
    if (document.getElementById('detail-name')) renderDetailPage();
    if (document.getElementById('cart-items-container')) renderCartPage();
});
