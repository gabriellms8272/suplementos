const DEFAULT_WHATSAPP = "5500000000000";
const STORAGE_KEY = "pura-forca-catalog-v1";
const INITIAL_PRODUCTS = [
  { name:"Whey Protein", type:"PROTEÍNA · 900 G", price:"R$ 149,90", description:"Um clássico para complementar sua ingestão diária de proteínas.", category:"treino", badge:"MAIS PEDIDO", image:"https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80" },
  { name:"Creatina", type:"CREATINA · 300 G", price:"R$ 89,90", description:"Praticidade para incluir na sua rotina de treinos e cuidados.", category:"treino", badge:"PRÉ-TREINO", image:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80" },
  { name:"Multivitamínico", type:"VITAMINAS · 60 CÁPSULAS", price:"R$ 69,90", description:"Um jeito simples de complementar uma alimentação equilibrada.", category:"bem-estar", badge:"DIA A DIA", image:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80" },
  { name:"Colágeno", type:"COLÁGENO · 300 G", price:"R$ 79,90", description:"Mais uma opção para compor seus hábitos de autocuidado.", category:"bem-estar", badge:"HIDRATAÇÃO", image:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80" }
];

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
}));

let saved = null;
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { saved = null; }
let products = Array.isArray(saved?.products) ? saved.products : structuredClone(INITIAL_PRODUCTS);
let whatsapp = saved?.whatsapp || DEFAULT_WHATSAPP;
const grid = document.querySelector(".product-grid");
const editor = document.querySelector("#editor-dialog");
const editorProducts = document.querySelector("#editor-products");
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function renderProducts() {
  grid.innerHTML = products.map((p, i) => `<article class="product-card reveal" data-category="${p.category === "bem-estar" ? "bem-estar" : "treino"}">
    <div class="product-image" style="background-image:url('${String(p.image).replace(/'/g,"%27")}')"><span class="product-tag ${i ? "tag-muted" : ""}">${esc(p.badge || "PRODUTO")}</span><span class="quick-view" aria-hidden="true">↗</span></div>
    <div class="product-info"><div><p class="product-type">${esc(p.type)}</p><h3>${esc(p.name)}</h3></div><span class="product-price">${esc(p.price)}</span></div>
    <p class="product-desc">${esc(p.description)}</p><a class="product-link" href="#contato" data-product="${esc(p.name)}">Tenho interesse <span>↗</span></a></article>`).join("");
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => observer.observe(el));
  applyFilter();
}
let activeFilter = "todos";
function applyFilter() {
  document.querySelectorAll(".product-card").forEach(card => card.hidden = activeFilter !== "todos" && card.dataset.category !== activeFilter);
  const count = document.querySelector(".filter[data-filter='todos'] span");
  if (count) count.textContent = String(products.length).padStart(2,"0");
}
function bindFilters() {
  document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active"); activeFilter = button.dataset.filter; applyFilter();
  }));
}
function whatsAppUrl(message) { return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`; }
document.addEventListener("click", event => {
  const link = event.target.closest(".product-link");
  if (link) { event.preventDefault(); window.open(whatsAppUrl(`Oi! Tenho interesse em ${link.dataset.product} da Pura Força.`), "_blank", "noopener"); }
});
document.querySelector(".whatsapp-link").addEventListener("click", event => {
  event.preventDefault(); window.open(whatsAppUrl("Oi! Quero saber mais sobre os produtos da Pura Força."), "_blank", "noopener");
});

function editorCard(p, index) {
  return `<section class="edit-product" data-index="${index}"><div class="edit-product-title"><b>Produto ${index + 1}</b><button type="button" class="edit-remove">Remover</button></div>
    <div class="edit-fields"><label>Nome<input data-key="name" value="${esc(p.name)}"></label><label>Preço<input data-key="price" value="${esc(p.price)}" placeholder="R$ 99,90"></label>
    <label>Detalhe do produto<input data-key="type" value="${esc(p.type)}" placeholder="Ex.: CREATINA · 300 G"></label><label>Categoria<select data-key="category"><option value="treino" ${p.category === "treino" ? "selected" : ""}>Treino</option><option value="bem-estar" ${p.category === "bem-estar" ? "selected" : ""}>Bem-estar</option></select></label>
    <label class="edit-wide">Descrição<input data-key="description" value="${esc(p.description)}"></label><label class="edit-wide">Texto da etiqueta<input data-key="badge" value="${esc(p.badge || "PRODUTO")}"></label>
    <label class="edit-wide">Foto do produto<input data-key="image" value="${esc(p.image)}" placeholder="Cole o link da imagem"></label><label class="edit-wide upload-label">Ou escolha uma foto do aparelho<input class="image-upload" type="file" accept="image/*"></label></div></section>`;
}
function openEditor() {
  editorProducts.innerHTML = products.map(editorCard).join("");
  document.querySelector("#editor-whatsapp").value = whatsapp === DEFAULT_WHATSAPP ? "" : whatsapp;
  document.querySelector("#editor-status").textContent = "";
  editor.showModal();
}
function readEditor() {
  return [...editorProducts.querySelectorAll(".edit-product")].map(row => {
    const value = key => row.querySelector(`[data-key="${key}"]`).value.trim();
    return {name:value("name"), price:value("price"), type:value("type"), category:value("category"), description:value("description"), badge:value("badge"), image:value("image")};
  });
}
const editorLaunch = document.querySelector("#editor-launch");
if (new URLSearchParams(window.location.search).get("editar") === "1") {
  editorLaunch.addEventListener("click", openEditor);
} else {
  editorLaunch.remove();
}
document.querySelector("#editor-close").addEventListener("click", () => editor.close());
document.querySelector("#editor-add").addEventListener("click", () => {
  const current = readEditor();
  current.push({name:"Novo produto",price:"R$ 0,00",type:"SUPLEMENTO",category:"treino",description:"Escreva uma descrição para este produto.",badge:"NOVO",image:"https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80"});
  editorProducts.innerHTML = current.map(editorCard).join("");
});
editorProducts.addEventListener("click", event => {
  if (event.target.matches(".edit-remove")) { event.target.closest(".edit-product").remove(); [...editorProducts.children].forEach((row,i) => { row.dataset.index=i; row.querySelector("b").textContent=`Produto ${i+1}`; }); }
});
editorProducts.addEventListener("change", event => {
  if (!event.target.matches(".image-upload") || !event.target.files[0]) return;
  const row = event.target.closest(".edit-product");
  const reader = new FileReader();
  reader.onload = () => { row.querySelector('[data-key="image"]').value = reader.result; };
  reader.readAsDataURL(event.target.files[0]);
});
document.querySelector("#editor-save").addEventListener("click", () => {
  const nextProducts = readEditor();
  if (!nextProducts.length) { document.querySelector("#editor-status").textContent = "Adicione ao menos um produto."; return; }
  if (nextProducts.some(p => !p.name || !p.price || !p.image)) { document.querySelector("#editor-status").textContent = "Preencha nome, preço e foto em todos os produtos."; return; }
  const typedNumber = document.querySelector("#editor-whatsapp").value.replace(/\D/g, "");
  products = nextProducts; whatsapp = typedNumber || DEFAULT_WHATSAPP;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({products, whatsapp}));
  } catch {
    document.querySelector("#editor-status").textContent = "As fotos ficaram grandes para o navegador. Use links de imagem menores."; return;
  }
  renderProducts(); document.querySelector("#editor-status").textContent = "Salvo neste navegador!";
  setTimeout(() => editor.close(), 850);
});
document.querySelector("#editor-reset").addEventListener("click", () => {
  if (!confirm("Restaurar os produtos e preços do modelo inicial?")) return;
  localStorage.removeItem(STORAGE_KEY); products = structuredClone(INITIAL_PRODUCTS); whatsapp = DEFAULT_WHATSAPP; renderProducts(); openEditor();
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
}), {threshold:.12});
document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();
bindFilters(); renderProducts();
