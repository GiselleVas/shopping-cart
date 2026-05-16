const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the frontend can talk to the backend even if hosted differently
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
// This allows you to host 'index.html' locally
app.use(express.static(path.join(__dirname)));

const products = [
    { id: 1, name: "Premium Wireless Headphones", price: 299.99, image: "https://placehold.co/400x300/6366f1/ffffff?text=Headphones", category: "Electronics", stock: 15 },
    { id: 2, name: "Minimalist Smart Watch", price: 199.50, image: "https://placehold.co/400x300/8b5cf6/ffffff?text=Watch", category: "Wearables", stock: 8 },
    { id: 3, name: "Mechanical Gaming Keyboard", price: 129.00, image: "https://placehold.co/400x300/ec4899/ffffff?text=Keyboard", category: "Accessories", stock: 22 },
    { id: 4, name: "Ergonomic Office Chair", price: 450.00, image: "https://placehold.co/400x300/f59e0b/ffffff?text=Chair", category: "Furniture", stock: 5 }
];

// Route to serve the main HTML file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * GET /api/products
 */
app.get('/api/products', (req, res) => {
    try {
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
});

/**
 * POST /api/checkout
 */
app.post('/api/checkout', (req, res) => {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let calculatedTotal = 0;
    items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            calculatedTotal += product.price * item.quantity;
        }
    });

    const tax = calculatedTotal * 0.1;
    const shipping = calculatedTotal > 500 ? 0 : 15;
    const finalTotal = calculatedTotal + tax + shipping;

    console.log(`Processing order for total: $${finalTotal.toFixed(2)}`);

    res.status(200).json({
        success: true,
        orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        message: "Order placed successfully!",
        receipt: {
            subtotal: calculatedTotal.toFixed(2),
            tax: tax.toFixed(2),
            shipping: shipping.toFixed(2),
            total: finalTotal.toFixed(2)
        }
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 SwiftCart is live!`);
    console.log(`👉 Main Site:    http://localhost:${PORT}`);
    console.log(`👉 API Products: http://localhost:${PORT}/api/products`);
    console.log(`----------------------------------------\n`);
});