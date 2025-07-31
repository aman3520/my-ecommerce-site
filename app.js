console.log("E-Commerce Website Loaded");

// === Helpers ===
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function updateCartCount() {
  const badge = document.querySelector(".cart-count");
  const total = getCart().reduce((sum, i) => sum + i.quantity, 0);
  if (badge) badge.textContent = total;
}
function showNotification(msg) {
  const n = document.createElement("div");
  n.className = "notification";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2000);
}
document.addEventListener("DOMContentLoaded", updateCartCount);

// === Hamburger Menu ===
document.addEventListener("DOMContentLoaded", () => {
  const ham = document.querySelector(".hamburger-menu");
  const nav = document.querySelector(".nav-menu");
  if (ham && nav) {
    ham.addEventListener("click", () => {
      nav.classList.toggle("active");
      ham.classList.toggle("active");
    });
    document.addEventListener("click", e => {
      if (!ham.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove("active");
        ham.classList.remove("active");
      }
    });
  }
});

// === Product Grid & Quick Add ===
const API_URL = "https://fakestoreapi.com/products";
const grid = document.getElementById("product-grid");

function showLoading(msg = "Loading products...") {
  grid.innerHTML = `<p class="loading-msg">${msg}</p>`;
}
function showError(msg = "Failed to load products.") {
  grid.innerHTML = `<p class="error-msg">${msg}</p>`;
}

function createProductCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";

  const link = document.createElement("a");
  link.href = `product.html?id=${p.id}`;
  link.style.textDecoration = "none";
  link.style.color = "inherit";

  const img = document.createElement("img");
  img.src = p.image; img.alt = p.title; img.loading = "lazy";

  const title = document.createElement("div");
  title.className = "product-title";
  title.textContent = p.title;

  link.append(img, title);
  card.appendChild(link);

  const price = document.createElement("div");
  price.className = "product-price";
  price.textContent = `₹${Math.round(p.price * 85)}`;
  card.appendChild(price);

  const desc = document.createElement("div");
  desc.className = "product-desc";
  desc.textContent = p.description.slice(0, 70) + "...";
  card.appendChild(desc);

  const btn = document.createElement("button");
  btn.className = "add-cart-btn";
  btn.textContent = "Add to Cart";
  btn.onclick = e => {
    e.preventDefault();
    addToCart({
      id: p.id,
      title: p.title,
      price: Math.round(p.price * 85),
      image: p.image,
      quantity: 1
    });
  };
  card.appendChild(btn);

  return card;
}

function fetchAndDisplayProducts() {
  const cache = sessionStorage.getItem("products");
  if (cache) {
    const list = JSON.parse(cache);
    grid.innerHTML = "";
    list.forEach(i => grid.appendChild(createProductCard(i)));
    return;
  }
  showLoading();
  fetch(API_URL)
    .then(r => r.json())
    .then(data => {
      sessionStorage.setItem("products", JSON.stringify(data));
      grid.innerHTML = "";
      data.forEach(i => grid.appendChild(createProductCard(i)));
    })
    .catch(e => {
      console.error(e);
      showError("Unable to fetch products. Please try again.");
    });
}

function addToCart(item) {
  if (item.quantity < 1) item.quantity = 1;
  const cart = getCart();
  const i = cart.findIndex(x => x.id===item.id && JSON.stringify(x.variations||{})===JSON.stringify(item.variations||{}));
  if (i!==-1) cart[i].quantity += item.quantity;
  else cart.push(item);
  saveCart(cart);
  updateCartCount();
  showNotification("Item added to cart!");
}

document.addEventListener("DOMContentLoaded", fetchAndDisplayProducts);
