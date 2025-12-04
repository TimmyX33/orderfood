// เปลี่ยนตรงนี้เป็นลิงก์ Ngrok ของคุณ
const PHP_API_URL = "https://integumentary-shaunta-unobscurely.ngrok-free.dev/food-api"; 

const menuItems = [
    { id: 1, name: "ข้าวกะเพราหมูสับ", price: 50, category: "อาหารจานเดียว", recommended: false, image: "https://placehold.co/150x150?text=Kaprao" },
    { id: 2, name: "ข้าวผัดกุ้ง", price: 60, category: "อาหารจานเดียว", recommended: false, image: "https://placehold.co/150x150?text=FriedRice" },
    { id: 3, name: "ต้มยำกุ้งน้ำข้น", price: 120, category: "อาหารจานเดียว", recommended: false, image: "https://placehold.co/150x150?text=TomYum" },
    { id: 4, name: "เฟรนช์ฟรายส์", price: 40, category: "ของทานเล่น", recommended: false, image: "https://placehold.co/150x150?text=Fries" },
    { id: 5, name: "นักเก็ตไก่", price: 45, category: "ของทานเล่น", recommended: false, image: "https://placehold.co/150x150?text=Nugget" },
    { id: 6, name: "ชามะนาว", price: 30, category: "เครื่องดื่ม", recommended: false, image: "https://placehold.co/150x150?text=LemonTea" },
    { id: 7, name: "น้ำเปล่า", price: 10, category: "เครื่องดื่ม", recommended: false, image: "https://placehold.co/150x150?text=Water" },
];

let cart = [];
let tempItem = null;
let tempQty = 1;

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('table')) {
        document.getElementById('tableNumber').value = urlParams.get('table');
        document.getElementById('tableNumber').disabled = true;
    }
    await updateRecommendations();
    renderRecommended();
    renderMenu(menuItems);
    
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        renderMenu(menuItems.filter(i => i.name.toLowerCase().includes(e.target.value.toLowerCase())));
    });
});

async function updateRecommendations() {
    try {
        const res = await fetch(`${PHP_API_URL}/get_best_sellers.php`);
        const bestSellerIds = await res.json();
        if (Array.isArray(bestSellerIds) && bestSellerIds.length > 0) {
            menuItems.forEach(i => i.recommended = false);
            bestSellerIds.forEach(id => {
                const item = menuItems.find(i => i.id === id);
                if (item) item.recommended = true;
            });
        }
    } catch (e) { console.warn("PHP Connect Error (Best Sellers):", e); }
}

function renderRecommended() {
    const list = document.getElementById('recommendedList');
    const rec = menuItems.filter(i => i.recommended);
    list.innerHTML = rec.length ? rec.map(i => cardHTML(i, 'card-recommend')).join('') : '<p style="padding:10px; color:#999;">ยังไม่มีเมนูแนะนำ</p>';
}

function renderMenu(items) {
    document.getElementById('menuList').innerHTML = items.length ? items.map(i => cardHTML(i, 'menu-item')).join('') : '<p>ไม่พบรายการ</p>';
}

function cardHTML(item, type) {
    // ใช้ onclick="openItemModal" แทนการ addToCart ตรงๆ
    if(type === 'card-recommend') {
        return `<div class="card-recommend" onclick="openItemModal(${item.id})"><img src="${item.image}"><div class="card-details"><div>${item.name}</div><div style="color:red;">฿${item.price}</div></div></div>`;
    }
    return `<div class="menu-item" onclick="openItemModal(${item.id})"><img src="${item.image}"><div class="menu-info"><div style="font-weight:bold;">${item.name}</div><div style="font-size:0.8rem; color:#777;">${item.category}</div><div style="color:red; font-weight:bold;">฿${item.price}</div></div><button class="add-btn"><i class="fas fa-plus"></i></button></div>`;
}

// --- Popup Logic ---
function openItemModal(id) {
    tempItem = menuItems.find(i => i.id === id);
    tempQty = 1;
    document.getElementById('modalItemName').innerText = tempItem.name;
    document.getElementById('modalItemImage').src = tempItem.image;
    document.getElementById('modalQty').innerText = tempQty;
    document.getElementById('modalItemPrice').innerText = tempItem.price * tempQty;
    document.getElementById('modalNote').value = '';
    document.getElementById('itemModal').style.display = 'block';
}

function closeItemModal() {
    document.getElementById('itemModal').style.display = 'none';
}

function adjustQty(change) {
    tempQty += change;
    if (tempQty < 1) tempQty = 1;
    document.getElementById('modalQty').innerText = tempQty;
    document.getElementById('modalItemPrice').innerText = tempItem.price * tempQty;
}

function confirmAddToCart() {
    const note = document.getElementById('modalNote').value.trim();
    const existing = cart.find(i => i.id === tempItem.id && i.note === note);
    if (existing) {
        existing.qty += tempQty;
    } else {
        cart.push({ ...tempItem, qty: tempQty, note: note });
    }
    updateCartUI();
    closeItemModal();
}

// --- Cart Logic ---
function updateCartUI() {
    const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    document.getElementById('cartCount').innerText = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cartTotal').innerText = total;
    document.getElementById('modalTotal').innerText = total;
    
    document.getElementById('cartItems').innerHTML = cart.map((item, index) => `
        <div class="cart-item-row">
            <div style="flex:1;">
                <b>${item.name}</b> x${item.qty}
                ${item.note ? `<div class="item-note">📝 ${item.note}</div>` : ''}
            </div>
            <div>
                ฿${item.price * item.qty} 
                <i class="fas fa-trash" style="color:red; cursor:pointer; margin-left:10px;" onclick="removeCartItem(${index})"></i>
            </div>
        </div>
    `).join('');
}

function removeCartItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    const m = document.getElementById('cartModal');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderMenu(cat === 'all' ? menuItems : menuItems.filter(i => i.category === cat));
}

async function sendToTelegram() {
    const table = document.getElementById('tableNumber').value;
    if(!cart.length || !table) return alert('ข้อมูลไม่ครบ');
    const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    
    document.querySelector('.btn-confirm').innerText = 'กำลังส่ง...';
    try {
        // 1. ส่งเข้า Telegram (Vercel)
        const res = await fetch('/api/order', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({table, items:cart, total}) });
        
        // 2. ส่งเข้า Local DB (PHP)
        fetch(`${PHP_API_URL}/save_order.php`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({table, items:cart, total}) }).catch(e=>console.log("DB Error:", e));
        
        if(res.ok) { alert('✅ ส่งออเดอร์เรียบร้อย!'); cart=[]; updateCartUI(); toggleCart(); }
    } catch(e) { alert('เกิดข้อผิดพลาดในการเชื่อมต่อ'); }
    document.querySelector('.btn-confirm').innerText = 'ยืนยันสั่งออเดอร์';
}