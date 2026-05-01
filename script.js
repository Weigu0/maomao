const cartCount = document.querySelector("#cartCount");
const cartButton = document.querySelector(".cart-button");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartSubtotal = document.querySelector("#cartSubtotal");
const toast = document.querySelector(".toast");
const addButtons = document.querySelectorAll(".add-cart");
const closeCartButtons = document.querySelectorAll("[data-close-cart]");
const filterTabs = document.querySelectorAll(".filter-tab");
const products = document.querySelectorAll(".product-card");
const newsletter = document.querySelector(".newsletter");

const cart = new Map();
let toastTimer;

function formatMoney(value) {
  return `$${value.toFixed(0)}`;
}

function getProductData(button) {
  const card = button.closest(".product-card");
  const title = card.querySelector("h3").textContent.trim();
  const priceText = card.querySelector(".product-row strong").textContent.trim();
  const image = card.querySelector("img");

  return {
    id: title.toLowerCase().replaceAll(" ", "-"),
    title,
    price: Number(priceText.replace("$", "")),
    image: image.src,
    alt: image.alt,
  };
}

function renderCart() {
  const items = [...cart.values()];
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalCount;
  cartSubtotal.textContent = formatMoney(subtotal);

  if (items.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Add a few cat essentials to start an order.</p>';
    return;
  }

  cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.alt}" />
          <div class="cart-item-info">
            <div>
              <h3>${item.title}</h3>
              <p>${formatMoney(item.price)}</p>
            </div>
            <div class="quantity-controls">
              <div class="quantity-stepper" aria-label="Quantity for ${item.title}">
                <button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.title}">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Increase ${item.title}">+</button>
              </div>
              <button class="remove-item" type="button" data-cart-action="remove" data-id="${item.id}">Remove</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function openCart() {
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartButton.setAttribute("aria-expanded", "true");
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartButton.setAttribute("aria-expanded", "false");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const product = getProductData(button);
    const currentItem = cart.get(product.id);

    cart.set(product.id, {
      ...product,
      quantity: currentItem ? currentItem.quantity + 1 : 1,
    });

    renderCart();
    showToast("Added to cart. Worldwide shipping calculated at checkout.");
  });
});

cartButton.addEventListener("click", openCart);

closeCartButtons.forEach((button) => {
  button.addEventListener("click", closeCart);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");

  if (!button) {
    return;
  }

  const item = cart.get(button.dataset.id);

  if (!item) {
    return;
  }

  if (button.dataset.cartAction === "increase") {
    item.quantity += 1;
  }

  if (button.dataset.cartAction === "decrease") {
    item.quantity -= 1;
  }

  if (button.dataset.cartAction === "remove" || item.quantity <= 0) {
    cart.delete(item.id);
  }

  renderCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    filterTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    products.forEach((product) => {
      const shouldShow = filter === "all" || product.dataset.category === filter;
      product.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

newsletter.addEventListener("submit", (event) => {
  event.preventDefault();
  newsletter.reset();
  showToast("You are on the launch list.");
});

renderCart();
