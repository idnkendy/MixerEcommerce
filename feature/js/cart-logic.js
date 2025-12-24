let currentSelectedSize = null;

window.selectSize = function(size) {
    currentSelectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
        if(btn.dataset.size === size) {
            btn.classList.remove('border-gray-200', 'dark:border-gray-600', 'hover:border-black', 'dark:hover:border-white', 'hover:bg-black', 'dark:hover:bg-white', 'hover:text-white', 'dark:hover:text-black');
            btn.classList.add('border-black', 'dark:border-white', 'bg-black', 'dark:bg-white', 'text-white', 'dark:text-black', 'shadow-md');
        } else {
            btn.classList.add('border-gray-200', 'dark:border-gray-600', 'hover:border-black', 'dark:hover:border-white', 'hover:bg-black', 'dark:hover:bg-white', 'hover:text-white', 'dark:hover:text-black');
            btn.classList.remove('border-black', 'dark:border-white', 'bg-black', 'dark:bg-white', 'text-white', 'dark:text-black', 'shadow-md');
        }
    });
    const err = document.getElementById('size-error');
    if(err) err.classList.add('hidden');
}

async function saveCartToSupabase(cartData) {
    const client = window.supabase;
    if (!client || !window.currentUser) return;
    
    try {
        const { data, error } = await client
            .from('user_carts')
            .upsert({
                user_id: window.currentUser.id,
                cart_data: JSON.stringify(cartData),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        
        if (error) console.warn("Failed to save cart to Supabase:", error.message);
    } catch (e) {
        console.warn("Supabase cart save failed:", e.message);
    }
}

async function loadCartFromSupabase() {
    const client = window.supabase;
    if (!client || !window.currentUser) return null;
    
    try {
        const { data, error } = await client
            .from('user_carts')
            .select('cart_data')
            .eq('user_id', window.currentUser.id)
            .single();
        
        if (!error && data && data.cart_data) {
            const cartData = JSON.parse(data.cart_data);
            localStorage.setItem('mixerCart', JSON.stringify(cartData));
            return cartData;
        }
    } catch (e) {
        console.warn("Supabase cart load failed:", e.message);
    }
    return null;
}

window.addToCart = function(id = null) {
    if (!window.currentUser) {
        showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "error");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    if (!id) id = parseInt(new URLSearchParams(window.location.search).get('id'));
    const size = currentSelectedSize || 'M';
    const qtyInput = document.getElementById('qty-input');
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;
    
    let cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    let item = cart.find(i => i.id === id && (i.size || 'M') === size);
    
    if(item) {
        item.quantity += qty; 
    } else {
        cart.push({ id, quantity: qty, size: size });
    }
    
    localStorage.setItem('mixerCart', JSON.stringify(cart));
    saveCartToSupabase(cart);
    updateCartUI();

    const product = window.productsData.find(p => p.id === id);
    const name = product ? product.name : "Product";
    showToast(`Added <b>${qty}</b> x <b>${name}</b> (Size: ${size}) to cart!`, "success");
}

window.removeFromCart = function(id, size = null) {
    let cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    if(size) {
        cart = cart.filter(i => !(i.id === id && (i.size || 'Standard') === size));
    } else {
        cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem('mixerCart', JSON.stringify(cart));
    saveCartToSupabase(cart); 
    updateCartUI();
    renderCartPage();
}

window.updateCartQuantity = function(id, size, change) {
    let cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    let item = cart.find(i => i.id === id && (i.size || 'M') === size);
    if(item) {
        item.quantity += change;
        if(item.quantity < 1) item.quantity = 1;
        localStorage.setItem('mixerCart', JSON.stringify(cart));
        saveCartToSupabase(cart);
        updateCartUI();
        renderCartPage();
    }
}

window.updateCartSize = function(id, oldSize, newSize) {
    let cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    let itemIndex = cart.findIndex(i => i.id === id && (i.size || 'M') === oldSize);
    if (itemIndex === -1) return;

    let existingItemIndex = cart.findIndex(i => i.id === id && (i.size || 'M') === newSize);
    if (existingItemIndex !== -1 && existingItemIndex !== itemIndex) {
        cart[existingItemIndex].quantity += cart[itemIndex].quantity;
        cart.splice(itemIndex, 1);
    } else {
        cart[itemIndex].size = newSize;
    }
    
    localStorage.setItem('mixerCart', JSON.stringify(cart));
    saveCartToSupabase(cart);
    renderCartPage();
    updateCartUI();
    showToast(`Updated size to ${newSize}`, "info");
}

window.openCheckout = () => {
    const cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    if (cart.length === 0) { 
        showToast("Giỏ hàng của bạn đang trống!", "error"); 
        return; 
    }

    if (window.currentUser) {
        const meta = window.currentUser.user_metadata || {};
        const nameInput = document.getElementById('checkout-name');
        const phoneInput = document.getElementById('checkout-phone');
        const addressInput = document.getElementById('checkout-address');

        if (nameInput) nameInput.value = meta.full_name || meta.name || "";
        if (phoneInput) phoneInput.value = meta.phone || "";
        if (addressInput) addressInput.value = meta.address || "";
    }

    document.getElementById('checkout-modal').classList.remove('hidden');
}
window.closeCheckout = () => document.getElementById('checkout-modal').classList.add('hidden');

window.processCheckout = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-confirm-order');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Processing..."; btn.disabled = true;

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const payment = document.getElementById('checkout-payment').value;
    const cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');    
    if (!window.productsData || window.productsData.length === 0) {
        if (typeof fetchProducts === 'function') {
            window.productsData = await fetchProducts();
        }
    }
    const total = parseFloat(document.getElementById('cart-total').innerText.replace('$',''));

    const items = cart.map(i => {
        const p = window.productsData.find(x => x.id === i.id);
        return { 
            product_id: i.id, 
            product_name: p ? p.name : "Unknown", 
            product_image: p ? p.image : "", 
            quantity: i.quantity, 
            price: p ? p.price : 0 
        };
    });

    try {
        const client = window.supabase;
        if(client && typeof client.from === 'function') {
            const { data: { session } } = await client.auth.getSession();
            const userId = session?.user?.id || null;

            const { error } = await client.from('orders').insert({
                user_id: userId,
                customer_name: name, 
                phone, 
                address, 
                payment_method: payment, 
                total_price: total, 
                items,
                status: 'pending'
            });
            if(error) throw error;
            showToast(`Order Confirmed! Thank you ${name}.`, "success");
        } else {
            showToast(`Order Confirmed (Simulation)! Thank you ${name}.`, "success");
        }
        
        localStorage.removeItem('mixerCart');
        
        if (window.currentUser && window.supabase) {
            try {
                await window.supabase
                    .from('user_carts')
                    .update({ cart_data: '[]' })
                    .eq('user_id', window.currentUser.id);
            } catch (e) {
                console.warn("Failed to clear cart from Supabase:", e.message);
            }
        }
        
        if (typeof updateCartUI === 'function') {
            updateCartUI();
        }
        setTimeout(() => window.location.reload(), 2000);
    } catch(err) {
        console.error(err);
        showToast("Error: " + err.message, "error");
        btn.innerHTML = originalText; btn.disabled = false;
    }
}
window.saveCartToSupabase = saveCartToSupabase;
window.loadCartFromSupabase = loadCartFromSupabase;