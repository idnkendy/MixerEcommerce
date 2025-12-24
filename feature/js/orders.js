let allOrders = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Orders page initializing...");
    
    if (typeof fetchProducts === 'function') {
        window.productsData = await fetchProducts();
    }

    const checkSupabase = setInterval(async () => {
        if (window.supabase && typeof window.supabase.auth !== 'undefined') {
            clearInterval(checkSupabase);
            await fetchUserOrders();
        }
    }, 100);
});

async function fetchUserOrders() {
    const container = document.getElementById('orders-container');
    const loading = document.getElementById('orders-loading');
    const emptyState = document.getElementById('orders-empty');
    const countDisplay = document.getElementById('order-count');

    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        const userId = session.user.id;

        const { data: orders, error } = await window.supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        loading.classList.add('hidden');

        if (error) {
            console.error("❌ Error fetching orders:", error);
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                showMockOrders();
            } else {
                throw error;
            }
            return;
        }

        if (!orders || orders.length === 0) {
            emptyState.classList.remove('hidden');
            countDisplay.innerText = "0 đơn hàng";
            return;
        }

        allOrders = orders;
        countDisplay.innerText = `${orders.length} đơn hàng`;
        renderOrders(orders);

    } catch (e) {
        console.error("❌ Exception in fetchUserOrders:", e);
        loading.innerHTML = `<p class="text-red-500 font-bold">Lỗi: ${e.message}</p>`;
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    
    if (orders.length > 0) {
        const headerEl = document.createElement('div');
        headerEl.className = 'hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/30 rounded-t-2xl border-b border-gray-200 dark:border-gray-600 sticky top-0 z-10';
        headerEl.innerHTML = `
            <div class="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Mã đơn</div>
            <div class="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Ngày đặt</div>
            <div class="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sản phẩm</div>
            <div class="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tổng tiền</div>
            <div class="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Trạng thái</div>
            <div class="col-span-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Hành động</div>
        `;
        container.appendChild(headerEl);
    }

    orders.forEach((order, index) => {
        const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500',
            'processing': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500',
            'shipping': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-500',
            'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500',
            'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500',
            'delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'
        };

        const statusText = {
            'pending': 'Chờ xác nhận',
            'processing': 'Đang xử lý',
            'shipping': 'Đang giao hàng',
            'completed': 'Đã hoàn thành',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };

        const statusClass = statusColors[order.status] || 'bg-gray-100 text-gray-700';
        const statusLabel = statusText[order.status] || order.status;
        const isLast = index === orders.length - 1;

        const orderEl = document.createElement('div');
        orderEl.className = `grid md:grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${isLast ? 'md:rounded-b-2xl' : ''}`;
        
        orderEl.innerHTML = `
            <!-- Mã đơn hàng -->
            <div class="col-span-12 md:col-span-2 flex items-center gap-3 md:gap-0">
                <span class="text-xs font-bold text-gray-400 md:hidden uppercase">Mã đơn</span>
                <div class="flex items-center gap-2">
                    <div class="p-2 bg-primary/10 rounded-lg hidden sm:block">
                        <span class="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
            </div>

            <div class="col-span-12 md:col-span-2 flex items-center gap-3 md:gap-0">
                <span class="text-xs font-bold text-gray-400 md:hidden uppercase">Ngày đặt</span>
                <p class="text-sm text-gray-700 dark:text-gray-300">${orderDate}</p>
            </div>

            <div class="col-span-12 md:col-span-2 flex items-center gap-3 md:gap-0">
                <span class="text-xs font-bold text-gray-400 md:hidden uppercase">Sản phẩm</span>
                <p class="text-sm font-medium text-gray-900 dark:text-white">${order.items?.length || 0} <span class="text-gray-500 dark:text-gray-400">món</span></p>
            </div>

            <div class="col-span-12 md:col-span-2 flex items-center gap-3 md:gap-0">
                <span class="text-xs font-bold text-gray-400 md:hidden uppercase">Tổng tiền</span>
                <p class="font-bold text-primary text-lg">$${(order.total_price || order.total_amount || 0).toFixed(2)}</p>
            </div>

            <div class="col-span-12 md:col-span-2 flex items-center gap-3 md:gap-0">
                <span class="text-xs font-bold text-gray-400 md:hidden uppercase">Trạng thái</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-bold ${statusClass} whitespace-nowrap">
                    ${statusLabel}
                </span>
            </div>

            <div class="col-span-12 md:col-span-2 flex items-center justify-start md:justify-end">
                <button onclick="showOrderDetail('${order.id}')" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors">
                    <span class="hidden sm:inline">Chi tiết</span>
                    <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        `;
        container.appendChild(orderEl);
    });
}

function showMockOrders() {
    console.log("ℹ️ Hiển thị dữ liệu mẫu (Bảng 'orders' chưa tồn tại trên Supabase)");
    const mockOrders = [
        {
            id: "ORD9720B88F",
            created_at: new Date().toISOString(),
            total_price: 645.00,
            status: 'pending',
            customer_name: "Trương Võ Hải Âu",
            phone: "0901040678",
            address: "Đại học Quốc Tế, Đống Đa, HN",
            payment_method: "COD",
            items: [
                { product_id: 9, product_name: "Urban Street Hoodie", product_image: "https://img.freepik.com/free-photo/man-wearing-brown-hoodie-studio-shot_53876-102066.jpg", quantity: 1, price: 95.00 },
                { product_id: 1, product_name: "Mixer Shirt", product_image: "https://cdn.hstatic.net/products/200000881795/img_6244_f9e3f4027f66420e9324d02da7426604_1024x1024.jpg", quantity: 1, price: 220.00 },
                { product_id: 2, product_name: "Premium Mixer Shirt", product_image: "https://cdn.hstatic.net/products/200000881795/img_6148_7e000342d1064663817239df097e963c_1024x1024.jpg", quantity: 1, price: 150.00 },
                { product_id: 3, product_name: "Mixer Sweater", product_image: "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgkvzklfqw3t31.webp", quantity: 1, price: 180.00 }
            ]
        },
        {
            id: "ORD87654321",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            total_price: 150.00,
            status: 'processing',
            customer_name: "Trương Võ Hải Âu",
            phone: "0901040678",
            address: "Đại học Quốc Tế, Đống Đa, HN",
            payment_method: "BANK",
            items: [
                { product_id: 2, product_name: "Premium Mixer Shirt", product_image: "https://cdn.hstatic.net/products/200000881795/img_6148_7e000342d1064663817239df097e963c_1024x1024.jpg", quantity: 1, price: 150.00 }
            ]
        }
    ];
    
    document.getElementById('order-count').innerText = "2 đơn hàng (Dữ liệu mẫu)";
    allOrders = mockOrders;
    renderOrders(mockOrders);
}


window.showOrderDetail = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('order-detail-content');
    
    const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Thông tin khách hàng</p>
                <p class="font-bold text-gray-900 dark:text-white">${order.customer_name || 'N/A'}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${order.phone || 'N/A'}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${order.address || 'N/A'}</p>
            </div>
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Thông tin đơn hàng</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Ngày đặt: <span class="font-medium text-gray-900 dark:text-white">${orderDate}</span></p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Thanh toán: <span class="font-medium text-gray-900 dark:text-white">${order.payment_method || 'COD'}</span></p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Trạng thái: <span class="font-bold text-primary uppercase">${order.status}</span></p>
            </div>
        </div>

        <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Danh sách sản phẩm</p>
            <div class="space-y-4">
                ${(order.items || []).map(item => {
                    let displayImage = item.product_image;
                    if (!displayImage && window.productsData) {
                        const p = window.productsData.find(x => x.id === item.product_id || x.name === item.product_name);
                        if (p) displayImage = p.image;
                    }

                    return `
                    <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border dark:border-gray-600">
                                ${displayImage ? 
                                    `<img src="${displayImage}" class="w-full h-full object-cover" alt="${item.product_name}">` : 
                                    `<span class="material-symbols-outlined text-gray-400">image</span>`
                                }
                            </div>
                            <div>
                                <p class="font-bold text-gray-900 dark:text-white">${item.product_name || 'Sản phẩm'}</p>
                                <p class="text-xs text-gray-500">Số lượng: ${item.quantity}</p>
                            </div>
                        </div>
                        <p class="font-bold text-gray-900 dark:text-white">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `;}).join('')}
            </div>
        </div>

        <div class="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <p class="text-lg font-bold text-gray-900 dark:text-white">Tổng cộng</p>
            <p class="text-2xl font-black text-primary">$${(order.total_price || order.total_amount || 0).toFixed(2)}</p>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.closeOrderDetail = function() {
    document.getElementById('order-detail-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}
document.addEventListener('click', (e) => {
    const modal = document.getElementById('order-detail-modal');
    if (e.target === modal) closeOrderDetail();
});
