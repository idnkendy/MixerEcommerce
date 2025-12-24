document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Profile page initializing...");
    
    const checkSupabase = setInterval(async () => {
        if (window.supabase && typeof window.supabase.auth !== 'undefined') {
            clearInterval(checkSupabase);
            await loadUserProfile();
        }
    }, 100);
});

async function loadUserProfile() {
    try {
        const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
            console.warn("No session found, redirecting to login...");
            window.location.href = 'login.html';
            return;
        }

        const user = session.user;
        console.log("👤 Auth User loaded:", user);

        document.getElementById('profile-avatar').src = user.user_metadata.avatar_url || 'https://via.placeholder.com/150';
        document.getElementById('profile-email-display').innerText = user.email;

        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error fetching profile table:", profileError);
        }

        // Ưu tiên lấy từ bảng profiles, nếu chưa có thì lấy từ user_metadata
        const fullName = profile?.full_name || user.user_metadata.full_name || '';
        const phone = profile?.phone || user.user_metadata.phone || '';
        const address = profile?.address || user.user_metadata.address || '';

        document.getElementById('profile-name-display').innerText = fullName || 'Người dùng MIXER';
        
        document.getElementById('full_name').value = fullName;
        document.getElementById('phone').value = phone;
        document.getElementById('address').value = address;

    } catch (e) {
        console.error("❌ Error loading profile:", e);
        if (typeof window.showToast === 'function') window.showToast("Lỗi tải thông tin!", "error");
    }
}

const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Đang lưu...";
        submitBtn.disabled = true;

        const formData = new FormData(profileForm);
        const updates = {
            full_name: formData.get('full_name'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };

        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            if (!session) throw new Error("Phiên đăng nhập hết hạn");

            const { error: dbError } = await window.supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    ...updates,
                    updated_at: new Date().toISOString(),
                });

            if (dbError) throw dbError;

            const { error: authError } = await window.supabase.auth.updateUser({
                data: updates
            });

            if (authError) throw authError;

            console.log("Profile & Auth updated");
            if (typeof window.showToast === 'function') {
                window.showToast("Đã cập nhật thông tin thành công!");
            }
            
            document.getElementById('profile-name-display').innerText = updates.full_name;

        } catch (e) {
            console.error("Update error:", e);
            if (typeof window.showToast === 'function') {
                window.showToast("Lỗi: " + e.message, "error");
            }
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}
