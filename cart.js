// scripts/cart.js
/* helpers */
const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = (c) => localStorage.setItem("cart", JSON.stringify(c));
const badge = () => document.querySelector(".cart-count");
const toast = (m) => {
  const n = document.createElement("div");
  n.className = "notification";
  n.textContent = m;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2000);
};
const updateBadge = () =>
  badge() && (badge().textContent = getCart().reduce((s, i) => s + i.quantity, 0));

/* render */
function renderCart() {
  const wrap = document.getElementById("cart-items");
  const cart = getCart();
  wrap.innerHTML = "";

  cart.forEach((it, idx) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const img = document.createElement("img");
    img.src = it.image;
    img.alt = it.title;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "contain";

    const info = document.createElement("div");
    info.className = "item-info";
    info.innerHTML = `<h2>${it.title}</h2>`;
    if (it.variations)
      info.innerHTML += `<div class="variations">${Object.entries(it.variations)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")}</div>`;

    /* qty controls */
    const ctr = document.createElement("div");
    ctr.className = "quantity-controls";
    const minus = document.createElement("button");
    minus.textContent = "−";
    const plus = document.createElement("button");
    plus.textContent = "+";
    const inp = document.createElement("input");
    inp.type = "number"; inp.min = 1; inp.value = it.quantity;

    minus.onclick = () => change(-1);
    plus.onclick = () => change(+1);
    inp.oninput = () => {
      let v = +inp.value || 1;
      if (v < 1) v = 1;
      it.quantity = v;
      saveCart(cart); refresh();
    };
    ctr.append(minus, inp, plus);

    const price = document.createElement("div");
    price.className = "item-price";
    price.textContent = `₹${it.price * it.quantity}`;

    const rem = document.createElement("button");
    rem.className = "remove-btn";
    rem.textContent = "Remove";
    rem.onclick = () => {
      cart.splice(idx, 1);
      saveCart(cart);
      toast("Item removed");
      refresh();
    };

    row.append(img, info, ctr, price, rem);
    wrap.appendChild(row);

    function change(d) {
      it.quantity = Math.max(1, it.quantity + d);
      inp.value = it.quantity;
      saveCart(cart); refresh();
    }
  });
  calcTotal();

  function refresh() {
    renderCart();
    updateBadge();
  }
}

function calcTotal() {
  const t = getCart().reduce((s, i) => s + i.price * i.quantity, 0);
  document.getElementById("cart-total").textContent = `₹${t}`;
  document.getElementById("checkout-btn").disabled = !t;
}

/* init */
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateBadge();
  document.getElementById("checkout-btn").onclick = () =>
    alert("Proceeding to checkout…");
});
