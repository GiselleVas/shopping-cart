 <script>
        const API_BASE = 'http://localhost:3000/api';
        
        // Mock data fallback in case the backend is not running
        const MOCK_PRODUCTS = [
            { id: 1, name: "Premium Wireless Headphones", price: 299.99, image: "https://placehold.co/400x300/6366f1/ffffff?text=Headphones", category: "Electronics" },
            { id: 2, name: "Minimalist Smart Watch", price: 199.50, image: "https://placehold.co/400x300/8b5cf6/ffffff?text=Watch", category: "Wearables" },
            { id: 3, name: "Mechanical Gaming Keyboard", price: 129.00, image: "https://placehold.co/400x300/ec4899/ffffff?text=Keyboard", category: "Accessories" },
            { id: 4, name: "Ergonomic Office Chair", price: 450.00, image: "https://placehold.co/400x300/f59e0b/ffffff?text=Chair", category: "Furniture" }
        ];

        let products = [];
        let cart = JSON.parse(localStorage.getItem('swiftcart_data')) || [];

        async function init() {
            await fetchProducts();
            updateUI(); // Now defined below
        }

        async function fetchProducts() {
            try {
                const response = await fetch(`${API_BASE}/products`);
                if (!response.ok) throw new Error('Failed to fetch');
                products = await response.json();
                console.log("Loaded products from Backend");
            } catch (error) {
                console.warn("Backend unavailable, using local mock data.");
                products = MOCK_PRODUCTS;
            }
            renderProducts();
        }

        function updateUI() {
            const cartItemsContainer = document.getElementById('cart-items');
            const cartCount = document.getElementById('cart-count');
            const emptyMsg = document.getElementById('empty-cart-msg');
            
            // Update Cart Badge
            const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.innerText = totalQty;

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400 italic" id="empty-cart-msg">
                        Your cart is empty
                    </div>
                `;
            } else {
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 cart-transition">
                        <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">
                        <div class="flex-1">
                            <h4 class="font-semibold text-sm line-clamp-1">${item.name}</h4>
                            <p class="text-indigo-600 font-bold text-sm">$${item.price.toFixed(2)}</p>
                            <div class="flex items-center gap-3 mt-1">
                                <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-gray-100">-</button>
                                <span class="text-xs font-bold">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-gray-100">+</button>
                            </div>
                        </div>
                        <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                `).join('');
            }

            calculateTotals();
        }

        function calculateTotals() {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.1;
            // Free shipping over $500, otherwise $15
            const shipping = (subtotal > 500 || subtotal === 0) ? 0 : 15;
            const total = subtotal + tax + shipping;

            document.getElementById('subtotal-price').innerText = `$${subtotal.toFixed(2)}`;
            document.getElementById('shipping-price').innerText = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
            document.getElementById('tax-price').innerText = `$${tax.toFixed(2)}`;
            document.getElementById('total-price').innerText = `$${total.toFixed(2)}`;
        }

        function renderProducts() {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = products.map(product => `
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                    <div class="relative overflow-hidden">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-indigo-600">
                            ${product.category}
                        </div>
                    </div>
                    <div class="p-5">
                        <h3 class="font-bold text-lg mb-1">${product.name}</h3>
                        <p class="text-indigo-600 font-bold text-xl mb-4">$${product.price.toFixed(2)}</p>
                        <button onclick="addToCart(${product.id})" class="w-full bg-gray-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            showToast(`${product.name} added to cart!`, "success");
            saveAndRefresh();
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            saveAndRefresh();
        }

        function updateQuantity(productId, delta) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += delta;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    saveAndRefresh();
                }
            }
        }

        function saveAndRefresh() {
            localStorage.setItem('swiftcart_data', JSON.stringify(cart));
            updateUI();
        }

        async function checkout() {
            if (cart.length === 0) {
                showToast("Your cart is empty!", "error");
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        total: parseFloat(document.getElementById('total-price').innerText.replace('$', ''))
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showToast(`Order ${result.orderId} placed successfully!`, "success");
                    cart = [];
                    saveAndRefresh();
                } else {
                    showToast(result.message || "Checkout failed", "error");
                }
            } catch (error) {
                // Fallback for demo if server is offline
                showToast("Server offline. Simulating successful local checkout!", "success");
                cart = [];
                saveAndRefresh();
            }
        }

        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-2xl text-white font-medium z-[100] transform transition-all duration-300 translate-y-10 opacity-0 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
            toast.innerText = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
            }, 100);

            setTimeout(() => {
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        window.onload = init;
    </script>
</html>
   
   
