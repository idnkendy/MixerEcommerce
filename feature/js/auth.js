// ======================================================
// AUTHENTICATION (SUPABASE + GOOGLE)
// ======================================================

// Thông tin Project Supabase
const SUPABASE_URL = 'https://cetywrkfahvecizidkgz.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHl3cmtmYWh2ZWNpemlka2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzg0MTYsImV4cCI6MjA4MDQxNDQxNn0.w1YHXLrtNd4ZkpUhxp5-S5wa0jkQEArh7FsAdIHBsp8'; 

// Khởi tạo Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

async function signInWithGoogle() {
    if (!supabase) {
        showToast("Supabase chưa được cấu hình!", "error");
        return;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        console.error("Login Error:", error.message);
        showToast("Lỗi đăng nhập: " + error.message, "error");
    }
}

async function handleSignOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
        showToast("Lỗi đăng xuất!", "error");
    } else {
        showToast("Đã đăng xuất.");
        updateAuthUI(null);
    }
}

function updateAuthUI(user) {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');

    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
        if (userAvatar) {
            userAvatar.src = user.user_metadata.avatar_url || 'https://via.placeholder.com/150';
            userAvatar.title = user.user_metadata.full_name || user.email;
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
    }
}

async function checkAuthState() {
    if (!supabase) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthUI(session?.user || null);

    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user || null);
    });
}
