document.addEventListener("DOMContentLoaded", () => {
  initProductPage();
});

firebase.auth().onAuthStateChanged(u => {
  if (!u) location.href = "auth.html";
});


function initProductPage() {
  updateCartCount();
  setupHamburger();
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return showDetailError("Invalid product ID");
  loadProduct(id);
}

// Helpers
function getCart() { return JSON.parse(localStorage.getItem("cart"))||[]; }
function saveCart(c) { localStorage.setItem("cart",JSON.stringify(c)); }
function updateCartCount() {
  const b=document.querySelector(".cart-count");
  const total=getCart().reduce((s,i)=>s+i.quantity,0);
  if(b) b.textContent=total;
}
function showNotification(m){
  const n=document.createElement("div"); n.className="notification"; n.textContent=m;
  document.body.appendChild(n);
  setTimeout(()=>n.remove(),2000);
}

// Hamburger
function setupHamburger(){
  const h=document.querySelector(".hamburger-menu");
  const nav=document.querySelector(".nav-menu");
  if(h&&nav){
    h.onclick=()=>nav.classList.toggle("active");
    document.addEventListener("click",e=>{
      if(!h.contains(e.target)&&!nav.contains(e.target)){
        nav.classList.remove("active");
      }
    });
  }
}

let currentQty=1, basePrice=0, selVars={}, currentProd=null;

function showDetailError(msg){
  document.getElementById("product-detail").innerHTML=`<p class="error-msg">${msg}</p>`;
}

function loadProduct(id){
  const c=document.getElementById("product-detail");
  c.innerHTML=`<p class="loading-msg">Loading product...</p>`;
  fetch(`https://fakestoreapi.com/products/${id}`)
    .then(r=>r.json())
    .then(p=>{
      currentProd=p; basePrice=Math.round(p.price*85);
      renderDetail(p);
      updateCartCount();
    })
    .catch(e=>{
      console.error(e); showDetailError("Failed to load product.");
    });
}

function renderDetail(p){
  const c=document.getElementById("product-detail"); c.innerHTML="";
  // image
  const d1=document.createElement("div"); d1.className="product-images";
  const img=document.createElement("img");
  img.src=p.image; img.alt=p.title; setupZoom(img);
  d1.appendChild(img);
  // info
  const d2=document.createElement("div"); d2.className="product-info";
  const t=document.createElement("h1"); t.textContent=p.title;
  const pr=document.createElement("div"); pr.className="product-price"; pr.textContent=`₹${basePrice}`;
  const ds=document.createElement("p"); ds.className="product-description"; ds.textContent=p.description;

  // variations
  const vs={ size:["S","M","L"], color:["Red","Blue"] };
  const varSel=createVarSelectors(vs,(k,v)=>{ selVars[k]=v; updatePrice(pr); });

  // quantity
  const qtySel=createQtySelector(1,20,q=>{ currentQty=q; updatePrice(pr); });

  const btn=document.createElement("button");
  btn.className="add-cart-btn"; btn.textContent="Add to Cart";
  btn.onclick=()=>addDetailToCart({
    id:p.id, title:p.title, price:basePrice,
    image:p.image, quantity:currentQty, variations:{...selVars}
  });

  d2.append(t,pr,ds,varSel,qtySel,btn);
  c.append(d1,d2);
}

function updatePrice(elem){
  let tot=basePrice;
  const pm={ size:{S:0,M:50,L:100}, color:{Red:0,Blue:25} };
  Object.entries(selVars).forEach(([k,v])=>{ if(pm[k]?.[v]) tot+=pm[k][v]; });
  tot*=currentQty; elem.textContent=`₹${tot}`;
}

function addDetailToCart(itm){
  if(itm.quantity<1) itm.quantity=1;
  const cart=getCart();
  const i=cart.findIndex(x=>x.id===itm.id&&JSON.stringify(x.variations)===JSON.stringify(itm.variations));
  if(i!==-1) cart[i].quantity+=itm.quantity;
  else cart.push(itm);
  saveCart(cart); updateCartCount(); showNotification("Item added to cart!");
}

function setupZoom(img){
  let z=false;
  img.onclick=()=>{
    z=!z; img.style.transform=z?"scale(2)":"scale(1)";
    img.style.cursor=z?"zoom-out":"zoom-in";
  };
  img.onmousemove=e=>{
    if(!z)return;
    const r=img.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
    img.style.transformOrigin=`${x}% ${y}%`;
  };
  img.onmouseleave=()=>{
    if(z){ img.style.transform="scale(1)"; img.style.cursor="zoom-in";z=false; }
  };
}

function createVarSelectors(vars,onC){
  const c=document.createElement("div");c.className="variation-selectors";
  Object.keys(vars).forEach(k=>{
    const lbl=document.createElement("label");
    lbl.textContent=k.charAt(0).toUpperCase()+k.slice(1)+":";
    const sel=document.createElement("select");
    sel.onchange=()=>onC(k,sel.value);
    vars[k].forEach(o=>{ const opt=document.createElement("option");opt.value=o;opt.textContent=o;sel.appendChild(opt);});
    lbl.append(sel);c.append(lbl);
  });
  return c;
}

function createQtySelector(init,max,onC){
  const c=document.createElement("div");c.className="quantity-selector";
  const mn=document.createElement("button");mn.textContent="−";mn.onclick=()=>{let v=Math.max(1,parseInt(inp.value)-1);inp.value=v;onC(v);};
  const inp=document.createElement("input");inp.type="number";inp.value=init;inp.min=1;inp.max=max;
  inp.oninput=()=>{
    let v=parseInt(inp.value);if(isNaN(v)||v<1)v=1;if(v>max)v=max;inp.value=v;onC(v);
  };
  const pl=document.createElement("button");pl.textContent="+";pl.onclick=()=>{let v=Math.min(max,parseInt(inp.value)+1);inp.value=v;onC(v);};
  c.append(mn,inp,pl);return c;
}
