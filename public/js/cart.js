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
let selectedWeights = {}; // Default quantity for each product

function selectWeight(button, weight, productId) {
  // Deselect all weight buttons for this product
  const buttons = document.querySelectorAll(
    `.weight-btn[data-id="${productId}"]`
  );
  buttons.forEach((btn) => btn.classList.remove("selected"));

  // Select the clicked button
  button.classList.add("selected");

  // Update the selected weight for this product
  if (!selectedWeights[productId]) {
    selectedWeights[productId] = 0;
  }
  selectedWeights[productId] += weight; // Increment the selected weight

  // Update the product weight in your cart
  updateCartWeight(productId, selectedWeights[productId]);
}

function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.querySelector(".cart-container");
  cartContainer.innerHTML = "";
  let totalPrice = 0;

  if (cart.length > 0) {
    cart.forEach((product) => {
      if (!product || product.quantity <= 0) return;

      const productElement = document.createElement("div");
      productElement.classList.add("cart-item");
      productElement.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div>
                    <h2>${product.name || "No name"}</h2>
                    <div class="weight-options">
                      <button class="weight-btn selected" onclick="selectWeight(this, 1, '${
                        product.id
                      }')">1 piece</button>
                      <button class="weight-btn" onclick="selectWeight(this, 10, '${
                        product.id
                      }')">10 pieces</button>
                      <button class="weight-btn" onclick="selectWeight(this, 50, '${
                        product.id
                      }')">50 pieces</button>
                    </div>
                    <p>Price: ₹${(product.price || 0).toLocaleString(
                      "en-IN"
                    )}</p>
                    <p>Quantity: <button class="quantity-btn" onclick="updateQuantity('${
                      product.id
                    }', -1)">-</button>
                    ${product.quantity || selectedWeight}
                    <button class="quantity-btn" onclick="updateQuantity('${
                      product.id
                    }', 1)">+</button></p>
                    <p>Total: ₹${(
                      (product.price || 0) *
                      (product.quantity || selectedWeight)
                    ).toLocaleString("en-IN")}</p>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${
                  product.id
                }')">&times;</button>
            `;
      cartContainer.appendChild(productElement);
      totalPrice += (product.price || 0) * (product.quantity || selectedWeight);
    });

    const totalContainer = document.createElement("div");
    totalContainer.classList.add("cart-total-container");
    totalContainer.innerHTML = `
            <div> <div class="cart-total">Total Price: ₹${totalPrice.toLocaleString(
              "en-IN"
            )} 
            </div>
            <div>  <p>(Free shipping for order above ₹ 2000)</p></div>
            <div class="cart-page-btns" >
            <a href="/"><button class="order-now-btn" id="">Add Items</button></a>
            <button class="order-now-btn" id="orderNowBtn">Order Now</button>
            </div>
        `;
    cartContainer.appendChild(totalContainer);

    // Attach event listener to "Order Now" button
    document
      .getElementById("orderNowBtn")
      .addEventListener("click", openOrderForm);
  } else {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
  }
  updateCartCount(); // Update cart count whenever the cart is loaded
}

function updateCartWeight(productId, weight) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let product = cart.find((p) => p.id === productId);
  if (product) {
    product.quantity = weight;
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }
}

// Update quantity
function updateQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let product = cart.find((p) => p.id === productId);
  if (product) {
    product.quantity = (product.quantity || selectedWeight) + change;
    if (product.quantity <= 0) {
      cart = cart.filter((p) => p.id !== productId);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }
}

// Remove from cart
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((p) => p.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Order now form open close functionality
function openOrderForm() {
  const modal = document.getElementById("orderFormModal");
  modal.style.display = "flex"; // Use flex for centering
}

function closeOrderForm() {
  const modal = document.getElementById("orderFormModal");
  modal.style.display = "none";
}

// Optional: Close modal on clicking outside the content
window.onclick = function (event) {
  const modal = document.getElementById("orderFormModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// On page load
window.onload = loadCart;
updateCartCount(); // Update cart count whenever the cart is loaded

document
  .getElementById("orderForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const contact = document.getElementById("contact").value;
    const address = document.getElementById("address").value;
    const cart = JSON.parse(localStorage.getItem("cart")) || []; // Get cart data from localStorage

    // Send form data and cart to backend
    if (!cart.length) {
      alert(
        "Your cart is empty. Add items to your cart before placing an order."
      );
      return;
    }

    try {
      const orderData = {
        name,
        contact,
        address,
        cart,
      };

      // Only add email if it's provided
      if (email) {
        orderData.email = email;
      }

      const response = await fetch("/send-order-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          Swal.fire({
            title: "Order Confirmed!",
            text: "Thank You! We will contact you soon",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            // Clear cart and close the form
            localStorage.removeItem("cart");
            document.getElementById("orderFormModal").style.display = "none";
            loadCart(); // Refresh cart UI
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to send the order mail. Please try again.",
            icon: "error",
            confirmButtonText: "Retry",
          });
        }
      } else {
        throw new Error(
          "Failed to send the order mail. Server returned non-200 status."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  });
