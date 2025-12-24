console.log("Auth.js is loading...");

if (typeof SUPABASE_URL === 'undefined') {
    var SUPABASE_URL = 'https://cetywrkfahvecizidkgz.supabase.co'; 
}
if (typeof SUPABASE_KEY === 'undefined') {
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHl3cmtmYWh2ZWNpemlka2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzg0MTYsImV4cCI6MjA4MDQxNDQxNn0.w1YHXLrtNd4ZkpUhxp5-S5wa0jkQEArh7FsAdIHBsp8'; 
}

let supabaseInstance = null;
window.currentUser = null;

async function signInWithGoogle() {
    try {
        const client = supabaseInstance || window.supabase;
        if (!client || !client.auth) {
            console.error("Supabase client not ready!");
            return;
        }
        console.log("✓ Attempting Google sign-in...");
        const { data, error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/login.html' }
        });
        if (error) throw error;
    } catch (e) {
        console.error("Login Error:", e.message);
        if (typeof window.showToast === 'function') window.showToast("Lỗi: " + e.message, "error");
    }
}

async function handleSignOut() {
    const client = supabaseInstance || window.supabase;
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) {
        if (typeof window.showToast === 'function') window.showToast("Lỗi đăng xuất!", "error");
    } else {
        localStorage.removeItem('mixerCart');
        if (typeof window.showToast === 'function') window.showToast("Đã đăng xuất.");
        updateAuthUI(null);
        window.location.href = 'index.html';
    }
}

window.signInWithGoogle = signInWithGoogle;
window.handleSignOut = handleSignOut;

function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabase = supabaseInstance; 
        console.log("Supabase instance created");
        checkAuthState();
    } else {
        setTimeout(initSupabase, 100);
    }
}
initSupabase();

function updateAuthUI(user) {
    window.currentUser = user;
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');

    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userInfo) {
            userInfo.classList.remove('hidden');
            userInfo.innerHTML = `
                <div class="relative inline-block text-left">
                    <img id="user-avatar" src="${user.user_metadata.avatar_url || 'https://via.placeholder.com/150'}" 
                         class="w-10 h-10 rounded-full border-2 border-primary/50 object-cover cursor-pointer hover:scale-105 transition-transform shadow-sm"
                         onclick="toggleUserDropdown(event)">
                    
                    <div id="user-dropdown" class="hidden absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[100] overflow-hidden transform origin-top-right transition-all duration-200">
                        <div class="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                            <p class="text-sm font-black text-gray-900 dark:text-white truncate">${user.user_metadata.full_name || 'Người dùng MIXER'}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">${user.email}</p>
                        </div>
                        <div class="p-2">
                            <a href="profile.html" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors">
                                <span class="material-symbols-outlined text-[20px]">person</span>
                                Xem hồ sơ
                            </a>
                            <a href="orders.html" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors">
                                <span class="material-symbols-outlined text-[20px]">package_2</span>
                                Đơn hàng đã đặt
                            </a>
                        </div>
                        <div class="p-2 border-t border-gray-100 dark:border-gray-700">
                            <button onclick="handleSignOut()" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold">
                                <span class="material-symbols-outlined text-[20px]">logout</span>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userInfo) {
            userInfo.classList.add('hidden');
            userInfo.innerHTML = '';
        }
    }
}

window.toggleUserDropdown = function(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
};

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('user-dropdown');
    const avatar = document.getElementById('user-avatar');
    if (dropdown && !dropdown.contains(event.target) && event.target !== avatar) {
        dropdown.classList.add('hidden');
    }
});

async function checkAuthState() {
    const client = supabaseInstance || window.supabase;
    if (!client || !client.auth) return;
    try {
        const { data: { session } } = await client.auth.getSession();
        updateAuthUI(session?.user || null);
        
        if (session?.user && typeof window.loadCartFromSupabase === 'function') {
            await window.loadCartFromSupabase();
            if (typeof window.updateCartUI === 'function') {
                window.updateCartUI();
            }
        }
        
        client.auth.onAuthStateChange(async (event, session) => {
            updateAuthUI(session?.user || null);
            if (session?.user && typeof window.loadCartFromSupabase === 'function') {
                await window.loadCartFromSupabase();
                if (typeof window.updateCartUI === 'function') {
                    window.updateCartUI();
                }
            }
        });
    } catch (e) {
        console.error("Error in checkAuthState:", e);
    }
}


