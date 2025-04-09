const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const multer = require("multer");
const nodemailer = require("nodemailer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Initialize app
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set the default layout file (optional)
app.set("layout", "./ layouts/boilerplate");

app.use(cors());
app.use(cors({
    origin: "*",  // Allows all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// app.use(ejsLayouts);
app.use(express.static(path.join(__dirname, "public")));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Kalyani_Icecream", // Folder name where images will be stored in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
  },
});

const upload = multer({ storage });

// MongoDB Connection
mongoose
  .connect(process.env.db)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL of the uploaded image from Cloudinary
  category: { type: String, required: true }, // field for product category
});

const Product = mongoose.model("Product", productSchema);

// Routes
// Fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

// Add product
app.post("/api/products/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    // Cloudinary URL of the uploaded image
    const imageUrl = req.file.path;

    // Create new product with the Cloudinary image URL
    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl,
      category,
    });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
});

// DELETE route to remove a product
app.delete("/api/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const productId = req.params.id;

    // Check if all required fields are provided
    if (!name || !price || !description || !category) {
      return res.status(400).json({
        message: "All fields (name, price, description, category) are required",
      });
    }

    // If an image is uploaded, update imageUrl to the new image path, else keep the old image URL
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    // Find the product and update it
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        description,
        imageUrl,
        category,
      },
      { new: true }
    ); // `{ new: true }` ensures the updated document is returned

    // If product is not found, return a 404 error
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send back the updated product
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ message: "Server error, unable to update product" });
  }
});

app.post("/send-order-mail", async (req, res) => {
  const { name, email, contact, address, cart } = req.body;

  if (!name || !contact || !address || !cart.length) {
    return res.status(400).send("Invalid request data");
  }

  // Read the HTML template
  const templatePath = path.join(
    __dirname,
    "public",
    "templates/orderTemplate.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Generate cart items HTML
  const cartItems = cart
    .map(
      (item) =>
        `<tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price.toLocaleString("en-IN")}</td>
          <td>₹${(item.quantity * item.price).toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("");

  // Replace placeholders in the template
  htmlTemplate = htmlTemplate
    .replace("{{name}}", name)
    .replace("{{email}}", email || "Email not provided")
    .replace("{{contact}}", contact)
    .replace("{{dial}}", contact)
    .replace("{{address}}", address)
    .replace("{{cartItems}}", cartItems)
    .replace(
      "{{totalPrice}}",
      cart
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toLocaleString("en-IN")
    );

  // Create a transporter
  const transporter = nodemailer.createTransport({
   
    host: "mail.kalyanifoods.co.in",
    port: 465, // or 587 for TLS
    secure: true, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  // Prepare the email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    // to: process.env.EMAIL_P_OWNER, 
    to: `${process.env.EMAIL_P_OWNER}, ${process.env.EMAIL_SECOND_OWNER}`, 
    subject: "New Order Received",
    html: htmlTemplate, // Use the HTML template
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending mail:", error);
   
    res.status(500).json({ success: false,error:error,message:error.message });
  }
});

// Serve admin.html
app.get("/kalyaniadmin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Route to search products based on name, description, or category
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q; // Get search query from URL
    const regex = new RegExp(query, "i"); // Case-insensitive search

    const products = await Product.find({
      $or: [
        { name: regex }, // Search by name
        { category: regex }, // Search by category
        { description: regex }, // Search by description (optional)
      ],
    });

    res.render("searchResults", { products, query })
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Home route
app.get("/", async (req, res) => {
  try {
    const Water_based_Ice_lolly = await Product.find({
      category: "Water_based_Ice_lolly",
    });
    const Milk_based_Ice_lolly = await Product.find({
      category: "Milk_based_Ice_lolly",
    });
    const Milk_Products = await Product.find({ category: "Milk_Products" });

    res.render("home", {
      Water_based_Ice_lolly,
      Milk_based_Ice_lolly,
      Milk_Products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/celebrations", async (req, res) => {
  const celebrations = await Product.find({ category: "Celebrations" });
  res.render("celebrations", { celebrations });
});

// about us
app.get("/aboutUs", (req, res) => {
  res.render("aboutUs");
});

app.get("/contactUs", (req, res) => {
  res.render("contactUs");
});


app.get("/availability", (req, res) => {
  res.render("availability");
});

app.get("/OTHERP", async (req, res) => {
  try {
    // const category = req.params.category;
    const products = await Product.find({ category: "Others" });
    res.render("otherProducts", { products });
    // res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

app.get("/gallery", (req, res) => {
  res.render("gallery");
});

app.get("/cart", (req, res) => {
  const products = []; // Fetch or retrieve your products array from your data source
  res.render("cart", { products: products });
});

app.get("*", (_, res) => {
  res.render("404");
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
