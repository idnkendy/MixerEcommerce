// ======================================================
// UI HELPERS & GLOBAL UI LOGIC
// ======================================================

// 1. THEME TOGGLE LOGIC
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.innerText = isDark ? 'dark_mode' : 'light_mode';
    }
}

(function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemDark);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    document.addEventListener('DOMContentLoaded', () => updateThemeIcon(isDark));
})();

// 2. TOAST NOTIFICATION SYSTEM
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check_circle';
    let title = 'Success';
    
    if (type === 'error') { icon = 'error'; title = 'Error'; }
    if (type === 'info') { icon = 'info'; title = 'Info'; }

    toast.innerHTML = `
        <div class="toast-icon"><span class="material-symbols-outlined text-[18px]">${icon}</span></div>
        <div class="toast-content">
            <p class="toast-title">${title}</p>
            <p class="toast-message">${message}</p>
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">
            <span class="material-symbols-outlined text-[16px]">close</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 3. CART UI UPDATE
function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('mixerCart') || '[]');
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    const el = document.getElementById('cart-count');
    if(el) { 
        el.innerText = total; 
        el.classList.toggle('hidden', total === 0);
        if(total > 0) el.style.display = 'flex';
    }
}

// 4. KEYWORDS ANALYSIS (HASH TABLE)
function analyzeKeywords() {
    const ht = new HashTable();
    productsData.forEach(p => {
        (p.name + " " + (p.description||"")).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,'').split(/\s+/).forEach(w => {
            if(w.length > 3 && !['with','for','and','the','this','nhung','trong'].includes(w)) ht.set(w);
        });
    });
    const el = document.getElementById('trending-tags');
    if(el) el.innerHTML = ht.getAll().slice(0, 6).map(t => `<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 px-2 py-1 rounded text-xs font-medium">#${t.key}</span>`).join(' ');
}

// 5. RECENTLY VIEWED HISTORY
function renderRecentHistory() {
    const el = document.getElementById('recent-stack-container');
    if(el) {
        const items = JSON.parse(localStorage.getItem('recentStack')||'[]').reverse().slice(0, 4);
        el.className = "grid grid-cols-2 md:grid-cols-4 gap-6";
        el.innerHTML = items.length ? items.map(p => createProductCard(p)).join('') 
            : '<p class="col-span-full text-center text-gray-400 dark:text-gray-500 text-sm py-4">No recently viewed products.</p>';
    }
}
