// --- 1. MERGE SORT (Sắp xếp giá) ---
function mergeSort(arr, key, order = 'asc') {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    return merge(mergeSort(arr.slice(0, mid), key, order), mergeSort(arr.slice(mid), key, order), key, order);
}

function merge(left, right, key, order) {
    let result = [], l = 0, r = 0;
    while (l < left.length && r < right.length) {
        const condition = order === 'asc' ? left[l][key] < right[r][key] : left[l][key] > right[r][key];
        if (condition) result.push(left[l++]); else result.push(right[r++]);
    }
    return result.concat(left.slice(l)).concat(right.slice(r));
}

// --- 2. LEVENSHTEIN DISTANCE (Fuzzy Search) ---
function fuzzySearch(products, keyword) {
    const threshold = 3; 
    return products.filter(p => {
        const name = p.name.toLowerCase(), key = keyword.toLowerCase();
        if (name.includes(key)) return true;
        const matrix = Array(key.length + 1).fill(null).map(() => Array(name.length + 1).fill(null));
        for (let i = 0; i <= key.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= name.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= key.length; i++) {
            for (let j = 1; j <= name.length; j++) {
                const cost = key[i - 1] === name[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
        }
        return key.length > 3 && matrix[key.length][name.length] <= threshold;
    });
}

// --- 3. JACCARD SIMILARITY (Gợi ý sản phẩm) ---
function getRecommendedProducts(current, all) {
    function getJaccard(s1, s2) {
        const set1 = new Set(s1.toLowerCase().split(' ')), set2 = new Set(s2.toLowerCase().split(' '));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        return intersection.size / new Set([...set1, ...set2]).size;
    }
    let scored = all.filter(p => p.id !== current.id).map(p => ({
        ...p, score: getJaccard(`${current.name} ${current.category}`, `${p.name} ${p.category}`)
    }));
    return mergeSort(scored, 'score', 'desc').slice(0, 4);
}

// --- 4. KNAPSACK PROBLEM (Tối ưu ngân sách) ---
function budgetShoppingOptimizer(budget, products) {
    const n = products.length, W = Math.floor(budget), prices = products.map(p => Math.floor(p.price));
    let dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
            if (prices[i - 1] <= w) dp[i][w] = Math.max(prices[i - 1] + dp[i - 1][w - prices[i - 1]], dp[i - 1][w]);
            else dp[i][w] = dp[i - 1][w];
        }
    }
    let res = dp[n][W], w = W, selected = [];
    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== dp[i - 1][w]) { selected.push(products[i - 1]); res -= prices[i - 1]; w -= prices[i - 1]; }
    }
    return selected;
}

// --- 5. TRIE (Autocomplete) ---
class TrieNode { constructor() { this.children = {}; this.isEnd = false; this.data = null; } }
class Trie {
    constructor() { this.root = new TrieNode(); }
    insert(word, data) {
        let node = this.root;
        for (let char of word.toLowerCase()) {
            if (!node.children[char]) node.children[char] = new TrieNode();
            node = node.children[char];
        }
        node.isEnd = true; node.data = data;
    }
    search(prefix) {
        let node = this.root;
        for (let char of prefix.toLowerCase()) {
            if (!node.children[char]) return [];
            node = node.children[char];
        }
        return this._collect(node);
    }
    _collect(node, res = []) {
        if (node.isEnd) res.push(node.data);
        for (let key in node.children) this._collect(node.children[key], res);
        return res;
    }
}

// --- 6. STACK (Lịch sử xem) ---
class ProductStack {
    constructor(limit = 5) { 
        this.items = JSON.parse(localStorage.getItem('recentStack') || '[]'); 
        this.limit = limit; 
    }
    push(item) {
        this.items = this.items.filter(p => p.id !== item.id);
        this.items.push(item);
        if (this.items.length > this.limit) this.items.shift();
        localStorage.setItem('recentStack', JSON.stringify(this.items));
    }
    get() { return [...this.items].reverse(); }
}

// --- 7. GRAPH & DIJKSTRA (Phí Ship) ---
class Graph {
    constructor() { this.edges = {}; }
    addEdge(u, v, w) { 
        if (!this.edges[u]) this.edges[u] = {}; if (!this.edges[v]) this.edges[v] = {};
        this.edges[u][v] = w; this.edges[v][u] = w;
    }
    dijkstra(start, end) {
        let dist = {}, pq = new Set(Object.keys(this.edges));
        for (let node in this.edges) dist[node] = Infinity;
        dist[start] = 0;
        while (pq.size) {
            let minNode = null;
            for (let node of pq) if (!minNode || dist[node] < dist[minNode]) minNode = node;
            if (minNode === end) return dist[end];
            pq.delete(minNode);
            for (let neighbor in this.edges[minNode]) {
                let alt = dist[minNode] + this.edges[minNode][neighbor];
                if (alt < dist[neighbor]) dist[neighbor] = alt;
            }
        }
        return Infinity;
    }
}
const shipGraph = new Graph();
['Warehouse', 'Hanoi', 'Danang', 'Hue', 'HCM', 'Cantho'].forEach(c => { if(!shipGraph.edges[c]) shipGraph.edges[c]={} });
shipGraph.addEdge('Warehouse', 'Hanoi', 10); shipGraph.addEdge('Hanoi', 'Danang', 800);
shipGraph.addEdge('Hanoi', 'Hue', 700); shipGraph.addEdge('Hue', 'Danang', 100);
shipGraph.addEdge('Danang', 'HCM', 900); shipGraph.addEdge('HCM', 'Cantho', 150);
shipGraph.addEdge('Warehouse', 'HCM', 1700);

// --- 8. BINARY SEARCH (Lọc giá) ---
function binarySearchRange(sortedArr, min, max) {
    function findBound(arr, val, type) {
        let l = 0, h = arr.length;
        while (l < h) {
            let mid = Math.floor((l + h) / 2);
            if (type === 'lower' ? arr[mid].price < val : arr[mid].price <= val) l = mid + 1; else h = mid;
        }
        return l;
    }
    return sortedArr.slice(findBound(sortedArr, min, 'lower'), findBound(sortedArr, max, 'upper'));
}

// --- 9. K-MEANS CLUSTERING (Phân cụm) ---
function kMeansClustering(products, k = 3) {
    if (products.length < k) return [products];
    let centroids = products.slice(0, k).map(p => p.price);
    let clusters = [];
    for (let i = 0; i < 10; i++) {
        clusters = Array.from({ length: k }, () => []);
        products.forEach(p => {
            let idx = 0, min = Infinity;
            centroids.forEach((c, j) => { let d = Math.abs(p.price - c); if (d < min) { min = d; idx = j; } });
            clusters[idx].push(p);
        });
        centroids = clusters.map((c, j) => c.length ? c.reduce((a, b) => a + b.price, 0) / c.length : centroids[j]);
    }
    return clusters.sort((a, b) => (a[0]?.price || 0) - (b[0]?.price || 0));
}

// --- 10. HASH TABLE (Từ khóa) ---
class HashTable {
    constructor() { this.table = {}; }
    set(key) { this.table[key] = (this.table[key] || 0) + 1; }
    getAll() { return Object.entries(this.table).map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value); }
}