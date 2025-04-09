// Function to get cart length
function getCartLength() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.length;
}


// Update the cart count in all relevant elements
function updateCartCount() {
  const cartLength = getCartLength();

  // Select all elements with id "cartCount" (including inside .mobileCart)
  const cartCountElements = document.querySelectorAll("#cartCount");

  // Update all instances of cart count
  cartCountElements.forEach(element => {
    element.textContent = cartLength;
  });
}


function addToCart(button) {
  let productId = button.getAttribute("data-id");
  let productName = button.getAttribute("data-name");
  let productPrice = parseFloat(button.getAttribute("data-price"));
  let productImageUrl = button.getAttribute("data-image-url");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let product = cart.find((p) => p.id === productId);
  if (product) {
    product.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
      imageUrl: productImageUrl,
    });
  }
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount(); // Ensure the cart count updates immediately

  // Display flash message
  let flashMessage = document.createElement("div");
  flashMessage.className = "flash-message";
  flashMessage.innerText = "Product added to cart";
  document.body.appendChild(flashMessage);

  // Redirect to cart page after short delay
  setTimeout(() => {
    document.body.removeChild(flashMessage);
    // window.location.href = "/cart";
  }, 1500);
}

// Call updateCartCount on page load to ensure cart count is correct
window.onload = function () {
  updateCartCount();
}


