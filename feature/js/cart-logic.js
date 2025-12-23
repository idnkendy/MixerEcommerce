// ======================================================
// CART LOGIC & CHECKOUT
// ======================================================

let currentSelectedSize = null;

window.selectSize = function(size) {
    currentSelectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
        if(btn.dataset.size === size) {
            btn.classList.remove('border-gray-200', 'hover:border-black', 'hover:bg-black', 'hover:text-white');
            btn.classList.add('border-black', 'bg-black', 'text-white', 'shadow-md');
        } else {
            btn.classList.add('border-gray-200', 'hover:border-black', 'hover:bg-black', 'hover:text-white');
            btn.classList.remove('border-black', 'bg-black', 'text-white', 'shadow-md');
        }
    });
    const err = document.getElementById('size-error');
    if(err) err.classList.add('hidden');
}

window.addToCart = function(id = null) {
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
    updateCartUI();

    const product = productsData.find(p => p.id === id);
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
    renderCartPage();
    updateCartUI();
    showToast(`Updated size to ${newSize}`, "info");
}

window.openCheckout = () => {
    if(JSON.parse(localStorage.getItem('mixerCart')||'[]').length === 0) { showToast("Your cart is empty!", "error"); return; }
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
    const total = parseFloat(document.getElementById('cart-total').innerText.replace('$',''));

    const items = cart.map(i => {
        const p = productsData.find(x => x.id === i.id);
        return { product_id: i.id, product_name: p?p.name:"Unknown", quantity: i.quantity, price: p?p.price:0 };
    });

    try {
        if(supabase) {
            const { error } = await supabase.from('orders').insert({
                customer_name: name, phone, address, payment_method: payment, total_price: total, items
            });
            if(error) throw error;
            showToast(`Order Confirmed! Thank you ${name}.`, "success");
        } else {
            showToast(`Order Confirmed (Simulation)! Thank you ${name}.`, "success");
        }
        localStorage.removeItem('mixerCart');
        setTimeout(() => window.location.reload(), 2000);
    } catch(err) {
        console.error(err);
        showToast("Error: " + err.message, "error");
        btn.innerHTML = originalText; btn.disabled = false;
    }
}
