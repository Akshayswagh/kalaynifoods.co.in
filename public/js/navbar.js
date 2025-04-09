document.addEventListener("DOMContentLoaded", function () {
  const navbarToggle = document.getElementById("navbarToggle");
  const navbarMenu = document.getElementById("navbarMenu");
  const closeIcon = document.getElementById("closeIcon");

  navbarToggle.addEventListener("click", function () {
    navbarMenu.classList.toggle("show");
    closeIcon.classList.toggle("show");
    navbarToggle.classList.toggle("hide-toggle");
  });

  closeIcon.addEventListener("click", function () {
    navbarMenu.classList.remove("show");
    closeIcon.classList.remove("show");
    navbarToggle.classList.remove("hide-toggle");
  });

  document.addEventListener("click", function (event) {
    if (
      !navbarToggle.contains(event.target) &&
      !navbarMenu.contains(event.target) &&
      !closeIcon.contains(event.target)
    ) {
      navbarMenu.classList.remove("show");
      closeIcon.classList.remove("show");
      navbarToggle.classList.remove("hide-toggle");
    }
  });
});


//cart count .....................
// Function to get cart length
function getCartLength() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.length;
}

// Update the cart count in multiple elements
function updateCartCount() {
  const cartLength = getCartLength();

  // Update the navbar cart count
  const cartCountElement = document.getElementById("cartCount");
  if (cartCountElement) {
    cartCountElement.textContent = cartLength;
  }

  // Update all elements with class "mobileCart"
  const mobileCartElements = document.querySelectorAll(".mobileCart");
  mobileCartElements.forEach(element => {
    let spanElement = element.querySelector("span#cartCount");
    if (spanElement) {
      spanElement.textContent = cartLength;
    }
  });
}

// Ensure the function runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", updateCartCount);




// .............................................
document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.querySelector(".navbar-search-input");

  searchForm.addEventListener("submit", function (event) {
    const searchQuery = searchInput.value.trim();

    if (!searchQuery) {
      event.preventDefault(); // Stop form submission if search is empty
      alert("Please enter a search query!"); // Optional alert for user
    }
  });

  // ✅ Ensure Enter key triggers search in mobile browsers
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default Enter behavior
      if (searchInput.value.trim()) {
        searchForm.submit(); // Submit form if input is not empty
      }
    }
  });
});
