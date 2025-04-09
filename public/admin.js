const API_URL = "/api/products";
// const API_URL = "http://www.kalyanifoods.co.in/api/products";

// const API_URL = "http://localhost:5000/api/products";
let editingProductId = null;
const tableBody = document.querySelector("#product-table tbody");
const modal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
let deleteProductId = null;

// Show the confirmation modal
function showConfirmModal(productId) {
  deleteProductId = productId; // Store the ID of the product to be deleted
  modal.style.display = "flex"; // Show the modal
}

// Fetch and display products
async function fetchProducts() {
  const response = await fetch(API_URL);
  const products = await response.json();

  tableBody.innerHTML = "";
  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.description}</td>
            <td>${product.category}</td>
            <td><img src="${product.imageUrl}" alt="${product.name}" width="50"></td>
            <td>
                <button class="edit-btn" onclick="editProduct('${product._id}', '${product.name}', ${product.price}, '${product.description}', '${product.imageUrl}')">Edit</button>
                <button class="delete-btn" onclick="showConfirmModal('${product._id}')">Delete</button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Handle 'Yes' button click
  confirmYes.addEventListener("click", () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId); // Call the delete function
      deleteProductId = null; // Reset the ID
    }
    modal.style.display = "none"; // Hide the modal
  });

  // Handle 'No' button click
  confirmNo.addEventListener("click", () => {
    deleteProductId = null; // Reset the ID
    modal.style.display = "none"; // Hide the modal
  });

  // Hide modal when clicking outside the content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      deleteProductId = null;
    }
  });
  document.getElementById("product-count").textContent = products.length;
}

// Function to confirm and delete a product
function confirmDelete(productId) {
  const isConfirmed = confirm("Are you sure you want to delete this product?");
  if (isConfirmed) {
    deleteProduct(productId); // Call the delete function if confirmed
  }
}

function validateFileInput(inputId, errorMessageId) {
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const fileInput = document.getElementById(inputId);
  const errorMessage = document.getElementById(errorMessageId);

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        errorMessage.style.display = "block";
        this.value = ""; // Clear the input
      } else {
        errorMessage.style.display = "none";
      }
    }
  });
}

// Apply validation to both file inputs
validateFileInput("image", "error-message-image");
validateFileInput("edit-image", "error-message-edit-image");

// Add product
const addProductForm = document.getElementById("add-product-form");
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  const imageFile = document.getElementById("image").files[0];
  const category = document.getElementById("category").value;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("description", description);
  formData.append("image", imageFile);
  formData.append("category", category);

  const response = await fetch(API_URL + "/add", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (response.ok) {
    showPopup("Product added successfully!");
    fetchProducts();
    resetForm();
    setTimeout(() => {
      window.location.href = "/admin";
    }, 2000);
  } else {
    showPopup("Failed to add product.");
  }
});

// Edit product
function editProduct(id, name, price, description, category, imageUrl) {
  // Set the editing product's ID so we can update the correct product
  editingProductId = id;

  // Populate the form with the existing product's data
  document.getElementById("edit-name").value = name;
  document.getElementById("edit-price").value = price;
  document.getElementById("edit-description").value = description;
  document.getElementById("edit-category").value = category;

  // Set the image preview if available
  const imagePreview = document.getElementById("edit-image-preview");
  if (imageUrl) {
    imagePreview.src = imageUrl;
  } else {
    imagePreview.src = "";
  }

  // Show the edit product form and hide the others
  document.getElementById("edit-product-section").style.display = "block";
  document.getElementById("add-product-section").style.display = "none";
  document.getElementById("all-products-section").style.display = "none";
}

// Edit Product Form Submission
const editProductForm = document.getElementById("edit-product-form");
editProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("edit-name").value;
  const price = document.getElementById("edit-price").value;
  const description = document.getElementById("edit-description").value;
  const imageFile = document.getElementById("edit-image").files[0];
  const category = document.getElementById("edit-category").value;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("description", description);
  formData.append("image", imageFile);
  formData.append("category", category);

  // Make PUT request to update the product
  const response = await fetch(`${API_URL}/${editingProductId}`, {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();
  if (response.ok) {
    showPopup("Product updated successfully!");
    fetchProducts(); // Refresh the products list
    setTimeout(() => {
      window.location.href = "/admin";
    }, 2000);

    // resetForm(); // Reset the form
  } else {
    showPopup("Failed to update product.");
  }
});

// Show add product form
function showAddProduct() {
  document.getElementById("add-product-section").style.display = "block";
  document.getElementById("edit-product-section").style.display = "none";
  document.getElementById("all-products-section").style.display = "none";
  resetForm();
}

// Show all products
function showAllProducts() {
  document.getElementById("add-product-section").style.display = "none";
  document.getElementById("edit-product-section").style.display = "none";
  document.getElementById("all-products-section").style.display = "block";
  fetchProducts();
}

// Show edit product form
function editProduct(id, name, price, description, imageUrl, category) {
  editingProductId = id;
  document.getElementById("edit-name").value = name;
  document.getElementById("edit-price").value = price;
  document.getElementById("edit-description").value = description;
  document.getElementById("edit-image-preview").src = imageUrl;
  document.getElementById("edit-category").value = category;
  document.getElementById("edit-product-section").style.display = "block";
  document.getElementById("add-product-section").style.display = "none";
  document.getElementById("all-products-section").style.display = "none";
}

// Delete product
async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  const result = await response.json();
  if (response.ok) {
    showPopup("Product deleted successfully!");
    fetchProducts();
  } else {
    showPopup("Failed to delete product.");
  }
}

// Show success/failure popup
function showPopup(message) {
  document.getElementById("popup-message").textContent = message;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Reset form and edit mode
function resetForm() {
  editingProductId = null;
  addProductForm.reset();
  editProductForm.reset();
}

// On initial load, show all products by default
window.onload = showAllProducts;
