// User Authentication State
let currentUser = null;
let isLoggedIn = false;
let isAdmin = false;

// Cart Data
let cart = [];
let consultations = [];
let enrolledCourses = [];

// Simple user database
let users = JSON.parse(localStorage.getItem('ayurveez_users')) || [];

// Product Data Structure
let products = JSON.parse(localStorage.getItem('ayurveez_products'));
if (!products) {
    products = [
        {
            id: 'product-1',
            name: 'Triphala Churna',
            description: 'Traditional herbal formula for digestion, detoxification and overall wellness.',
            price: 450,
            image: 'https://images.unsplash.com/photo-1596047092667-9c78b5fdd1b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            category: 'herbal-powders',
            isListed: true,
            stock: 50
        },
        {
            id: 'product-2',
            name: 'Ashwagandha Capsules',
            description: 'Adaptogenic herb for stress relief, energy boost and immune support.',
            price: 650,
            image: 'https://images.unsplash.com/photo-1594736797933-d0ea3ff8db41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            category: 'capsules',
            isListed: true,
            stock: 30
        },
        {
            id: 'product-3',
            name: 'Brahmi Oil',
            description: 'Herbal hair oil for promoting hair growth, reducing stress and improving memory.',
            price: 350,
            image: 'https://images.unsplash.com/photo-1594736797933-d0ea3ff8db41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            category: 'oils',
            isListed: true,
            stock: 25
        },
        {
            id: 'product-4',
            name: 'Chyawanprash',
            description: 'Traditional herbal jam for immunity, vitality and overall health maintenance.',
            price: 550,
            image: 'https://images.unsplash.com/photo-1596047092667-9c78b5fdd1b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            category: 'herbal-preparations',
            isListed: true,
            stock: 40
        }
    ];
    localStorage.setItem('ayurveez_products', JSON.stringify(products));
}

// Course Data Structure - WITH BUNDLE COURSES
let courses = JSON.parse(localStorage.getItem('ayurveez_courses'));
if (!courses) {
    courses = {
        'first-proff': [
            {
                id: 'bundle-first-proff',
                name: '1st Proff Complete Bundle',
                description: 'Complete package of all 1st Proff subjects including Padartha Vigyan, Sanskrit, and more.',
                duration: '18 Months',
                fee: 3333,
                image: 'Aseets/images/first',
                content: [],
                isBundle: true,
                isListed: true
            },
            {
                id: 'course-1',
                name: 'Padartha Vigyan',
                description: 'Fundamental principles of Ayurveda including philosophy, basic concepts and fundamental theories.',
                duration: '18 Months',
                fee: 599,
                image: 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                content: [],
                isListed: true
            }
        ]
    };
    localStorage.setItem('ayurveez_courses', JSON.stringify(courses));
}

// Order Data Structure
let orders = JSON.parse(localStorage.getItem('ayurveez_orders')) || [];

// Admin credentials
const adminCredentials = {
    email: 'admin@ayurveez.com',
    password: 'admin123'
};

// Cashfree Payment URL
const CASHEFREE_PAYMENT_URL = 'https://payments.cashfree.com/forms/ayurveez_payment';

// Order Confirmation Page Data
let orderData = {
    items: [],
    totalAmount: 0,
    customerInfo: {}
};

// Forgot Password System
let passwordResetStep = 1;
let resetUser = null;
let currentPasswordTimer = null;

// Products ko localStorage mein save karo
function saveProductsToStorage() {
    localStorage.setItem('ayurveez_products', JSON.stringify(products));
}

// Courses ko localStorage mein save karo
function saveCoursesToStorage() {
    localStorage.setItem('ayurveez_courses', JSON.stringify(courses));
}

// Orders ko localStorage mein save karo
function saveOrdersToStorage() {
    localStorage.setItem('ayurveez_orders', JSON.stringify(orders));
}

// Shloka Slider Functionality
function initializeShlokaSlider() {
    let currentShloka = 0;
    const shlokas = document.querySelectorAll('.shloka-slide');
    const totalShlokas = shlokas.length;
    
    function showNextShloka() {
        shlokas[currentShloka].classList.remove('active');
        currentShloka = (currentShloka + 1) % totalShlokas;
        shlokas[currentShloka].classList.add('active');
    }
    
    setInterval(showNextShloka, 5000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Ayurveez App Starting...');
    
    // Load enrolled courses from localStorage
    const savedEnrollments = localStorage.getItem('ayurveez_enrolled_courses');
    if (savedEnrollments) {
        enrolledCourses = JSON.parse(savedEnrollments);
    }
    
    initializeShlokaSlider();
    initializeApp();
    loadCourses();
    loadProducts();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        isAdmin = currentUser.role === 'admin';
        updateNavigation();
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('ayurveez_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });

    // Profile dropdown
    setupProfileDropdown();

    // Modal tabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const formType = e.target.getAttribute('data-form');
            switchModalForm(formType);
        });
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeLoginModal);
    document.getElementById('login-modal').addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') closeLoginModal();
    });

    // Form submissions
    document.getElementById('user-login').addEventListener('submit', handleUserLogin);
    document.getElementById('admin-login').addEventListener('submit', handleAdminLogin);
    document.getElementById('register-form').addEventListener('submit', handleUserRegister);
    
    // Forgot Password functionality
    document.getElementById('forgot-password-link').addEventListener('click', showForgotPassword);
    document.getElementById('back-to-login').addEventListener('click', backToLogin);
    document.getElementById('next-to-security').addEventListener('click', nextToSecurity);
    document.getElementById('verify-security-btn').addEventListener('click', verifySecurityAnswer);
    document.getElementById('reset-password-btn').addEventListener('click', resetPassword);

    // Cart functionality
    document.querySelector('.cart-icon').addEventListener('click', showCart);
    document.querySelector('.close-cart').addEventListener('click', hideCart);
    document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);

    // Add to cart buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(e.target);
        }
    });

    // Course tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            switchCourseTab(tab);
        });
    });

    // Consultation form
    document.getElementById('consultation-form').addEventListener('submit', handleConsultation);
    document.getElementById('whatsapp-consultation').addEventListener('click', handleWhatsAppConsultation);

    // Contact form
    document.getElementById('contact-form').addEventListener('submit', handleContact);

    // Dashboard tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.target.getAttribute('data-tab');
            switchDashboardTab(tabId);
        });
    });

    // Admin functionality
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.target.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });

    // Mobile menu
    document.querySelector('.mobile-menu').addEventListener('click', toggleMobileMenu);

    // Testimonial slider
    setupTestimonialSlider();

    // Back to Cart from Order Confirmation
    document.getElementById('back-to-cart')?.addEventListener('click', () => {
        showPage('products');
        showCart();
    });

    // Order Form Submission
    document.getElementById('order-form')?.addEventListener('submit', handleOrderSubmission);

    // Admin Add Course Button
    document.getElementById('add-course-btn')?.addEventListener('click', handleAddCourse);
    
    // Admin Add Product Button
    document.getElementById('add-product-btn')?.addEventListener('click', handleAddProduct);

    // Proceed to Payment button on order summary page
    document.getElementById('proceed-to-payment-btn')?.addEventListener('click', proceedToPayment);
}

// Profile Dropdown Setup
function setupProfileDropdown() {
    const profileIcon = document.getElementById('profile-icon');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (profileIcon && dropdownMenu) {
        profileIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isLoggedIn) {
                dropdownMenu.classList.toggle('active');
            } else {
                showLoginModal();
            }
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });
        
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// ==================== PRODUCT MANAGEMENT ====================

// Load Products on Products Page
function loadProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    const listedProducts = products.filter(product => product.isListed);
    
    if (listedProducts.length === 0) {
        productGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No products available at the moment.</p>';
        return;
    }

    productGrid.innerHTML = listedProducts.map(product => `
        <div class="product-card">
            <div class="product-img" style="background-image: url('${product.image}')"></div>
            <div class="product-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">
                    <span class="price">₹${product.price}</span>
                    <button class="btn add-to-cart" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-price="${product.price}" 
                            data-type="product">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Admin Product Management
function loadAdminProducts() {
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) return;

    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products available. Add a new product to get started.</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-admin-card';
        productCard.innerHTML = `
            <div class="product-admin-header">
                <div class="product-admin-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-admin-details">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="product-meta">
                        <span>Price: ₹${product.price}</span>
                        <span>Stock: ${product.stock}</span>
                        <span>Category: ${product.category}</span>
                    </div>
                </div>
                <div class="product-admin-actions">
                    <button class="btn-toggle ${product.isListed ? 'listed' : 'unlisted'}" 
                            data-id="${product.id}">
                        ${product.isListed ? 'Listed' : 'Unlisted'}
                    </button>
                    <button class="btn-edit" data-id="${product.id}">Edit</button>
                    <button class="btn-delete" data-id="${product.id}">Delete</button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });
    
    initializeAdminProductButtons();
}

function initializeAdminProductButtons() {
    // Toggle listing buttons
    document.querySelectorAll('.btn-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            toggleProductListing(productId);
        });
    });
    
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

function toggleProductListing(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.isListed = !product.isListed;
        saveProductsToStorage();
        loadAdminProducts();
        loadProducts();
        showSuccessMessage(`Product ${product.isListed ? 'listed' : 'unlisted'} successfully!`);
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const newName = prompt('Enter new product name:', product.name);
        const newDescription = prompt('Enter new product description:', product.description);
        const newPrice = prompt('Enter new product price:', product.price);
        const newStock = prompt('Enter new stock quantity:', product.stock);
        const newImage = prompt('Enter new image URL:', product.image);
        
        if (newName && newDescription && newPrice && newStock) {
            product.name = newName;
            product.description = newDescription;
            product.price = parseInt(newPrice);
            product.stock = parseInt(newStock);
            if (newImage) product.image = newImage;
            
            saveProductsToStorage();
            loadAdminProducts();
            loadProducts();
            showSuccessMessage('Product updated successfully!');
        }
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProductsToStorage();
        loadAdminProducts();
        loadProducts();
        showSuccessMessage('Product deleted successfully!');
    }
}

function handleAddProduct() {
    const name = prompt('Enter product name:');
    const description = prompt('Enter product description:');
    const price = prompt('Enter product price:');
    const stock = prompt('Enter stock quantity:');
    const category = prompt('Enter category (herbal-powders, capsules, oils, herbal-preparations):');
    const image = prompt('Enter image URL:');
    
    if (name && description && price && stock && category) {
        const newProduct = {
            id: 'product-' + Date.now(),
            name: name,
            description: description,
            price: parseInt(price),
            stock: parseInt(stock),
            category: category,
            image: image || 'https://images.unsplash.com/photo-1596047092667-9c78b5fdd1b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            isListed: true
        };
        
        products.push(newProduct);
        saveProductsToStorage();
        loadAdminProducts();
        loadProducts();
        showSuccessMessage('New product added successfully!');
    }
}

// ==================== ORDER MANAGEMENT ====================

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `AYV${timestamp}${random}`.toUpperCase();
}

// Modified Order Submission Handler
function handleOrderSubmission(e) {
    e.preventDefault();
    
    // Collect customer information
    const customerInfo = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        city: document.getElementById('customer-city').value,
        pincode: document.getElementById('customer-pincode').value,
        state: document.getElementById('customer-state').value,
        orderDate: new Date().toISOString()
    };

    // Validate all fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || 
        !customerInfo.address || !customerInfo.city || !customerInfo.pincode || !customerInfo.state) {
        showSuccessMessage('Please fill all required fields!', 'error');
        return;
    }

    // Calculate total amount
    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Create order with unique ID
    const order = {
        id: generateOrderId(),
        customerInfo: customerInfo,
        items: [...cart],
        totalAmount: totalAmount,
        status: 'pending',
        orderDate: new Date().toISOString(),
        paymentStatus: 'pending',
        paymentDate: null
    };

    // Save order to localStorage
    orders.push(order);
    saveOrdersToStorage();

    // Store current order ID for the payment page
    localStorage.setItem('current_order_id', order.id);

    // Show success message and redirect to order summary page
    showSuccessMessage('Address saved successfully! Redirecting to order summary...');
    
    setTimeout(() => {
        showPage('order-summary');
        renderOrderSummary(order);
    }, 1500);
}

// Render Order Summary Page
function renderOrderSummary(order) {
    const orderSummary = document.getElementById('order-summary-details');
    const customerInfo = document.getElementById('customer-info-details');
    
    if (!orderSummary || !customerInfo) return;

    // Render order items
    orderSummary.innerHTML = `
        <div class="order-summary-header">
            <h3>Order #${order.id}</h3>
            <p class="order-date">Order Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div class="order-items-summary">
            ${order.items.map(item => `
                <div class="order-summary-item">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <div class="item-total">₹${item.price * item.quantity}</div>
                </div>
            `).join('')}
        </div>
        <div class="order-summary-total">
            <strong>Total Amount: ₹${order.totalAmount}</strong>
        </div>
    `;

    // Render customer information
    customerInfo.innerHTML = `
        <div class="customer-detail">
            <strong>Name:</strong> ${order.customerInfo.name}
        </div>
        <div class="customer-detail">
            <strong>Email:</strong> ${order.customerInfo.email}
        </div>
        <div class="customer-detail">
            <strong>Phone:</strong> ${order.customerInfo.phone}
        </div>
        <div class="customer-detail">
            <strong>Address:</strong> ${order.customerInfo.address}
        </div>
        <div class="customer-detail">
            <strong>City:</strong> ${order.customerInfo.city}
        </div>
        <div class="customer-detail">
            <strong>Pincode:</strong> ${order.customerInfo.pincode}
        </div>
        <div class="customer-detail">
            <strong>State:</strong> ${order.customerInfo.state}
        </div>
    `;
}

// Proceed to Payment (Cashfree)
function proceedToPayment() {
    const currentOrderId = localStorage.getItem('current_order_id');
    const order = orders.find(o => o.id === currentOrderId);
    
    if (!order) {
        showSuccessMessage('Order not found!', 'error');
        return;
    }

    // Update order status to processing payment
    order.status = 'processing_payment';
    order.paymentDate = new Date().toISOString();
    saveOrdersToStorage();

    // Redirect to Cashfree payment page
    const cashfreeUrl = `https://payments.cashfree.com/forms/ayurveez_payment?order_id=${order.id}&amount=${order.totalAmount}`;
    
    showSuccessMessage('Redirecting to payment gateway...');
    
    // Open in new tab
    setTimeout(() => {
        window.open(cashfreeUrl, '_blank');
    }, 1000);
}

// Load Admin Orders
function loadAdminOrders() {
    const ordersList = document.getElementById('admin-orders-list');
    if (!ordersList) return;

    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    sortedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-admin-card';
        orderCard.innerHTML = `
            <div class="order-admin-header">
                <div class="order-info">
                    <h4>Order #${order.id}</h4>
                    <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
                    <p><strong>Payment:</strong> <span class="payment-${order.paymentStatus}">${order.paymentStatus}</span></p>
                    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
                </div>
                <div class="order-customer">
                    <h5>Customer Details</h5>
                    <p><strong>${order.customerInfo.name}</strong></p>
                    <p>📧 ${order.customerInfo.email}</p>
                    <p>📞 ${order.customerInfo.phone}</p>
                    <p>📍 ${order.customerInfo.address}, ${order.customerInfo.city}</p>
                    <p>📮 ${order.customerInfo.pincode}, ${order.customerInfo.state}</p>
                </div>
            </div>
            <div class="order-items-list">
                <h5>Order Items (${order.items.length})</h5>
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <span>${item.name}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>₹${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-actions">
                <button class="btn-status ${order.status === 'completed' ? 'completed' : 'pending'}" 
                        onclick="updateOrderStatus('${order.id}')">
                    ${order.status === 'completed' ? 'Completed' : 'Mark Complete'}
                </button>
                <button class="btn-delete" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Update Order Status
function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        if (order.status === 'completed') {
            order.status = 'pending';
        } else {
            order.status = 'completed';
        }
        saveOrdersToStorage();
        loadAdminOrders();
        showSuccessMessage(`Order ${order.status === 'completed' ? 'marked as completed' : 'set to pending'}!`);
    }
}

// Delete Order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage();
        loadAdminOrders();
        showSuccessMessage('Order deleted successfully!');
    }
}

// ==================== ADMIN DASHBOARD ENHANCEMENTS ====================

function loadAdminDashboard() {
    loadAdminCourses();
    loadAdminProducts();
    loadAdminOrders();
    loadContentUploadForm();
    loadAdminContentList();
    initializeUserManagement();
}

// Update Admin Tabs to include Products and Orders
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // Load specific tab data
    if (tabId === 'manage-products') {
        loadAdminProducts();
    } else if (tabId === 'order-management') {
        loadAdminOrders();
    } else if (tabId === 'manage-courses') {
        loadAdminCourses();
    }
}

// ==================== PAGE NAVIGATION ====================

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Update active nav link
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Close mobile menu if open
    document.querySelector('.nav-links').classList.remove('active');
    
    // Load specific page data
    if (pageId === 'courses') {
        loadCourses();
    } else if (pageId === 'products') {
        loadProducts();
    } else if (pageId === 'user-dashboard') {
        loadUserDashboard();
    } else if (pageId === 'admin-dashboard') {
        loadAdminDashboard();
    }
    
    // Close profile dropdown
    document.getElementById('dropdown-menu')?.classList.remove('active');
}

// ==================== LOGIN MODAL FUNCTIONS ====================

// Login Modal Functions
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
    switchModalForm('user-login');
    hideDropdown();
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
    resetForgotPasswordForm();
}

function switchModalForm(formType) {
    // Hide all forms
    document.querySelectorAll('.modal-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected form
    document.getElementById(formType).classList.add('active');
    
    // Update active tab
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`[data-form="${formType}"]`).classList.add('active');
}

// ==================== USER REGISTRATION & LOGIN ====================

// User Registration
function handleUserRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const securityQuestion = document.getElementById('security-question').value;
    const securityAnswer = document.getElementById('security-answer').value;

    // Validation
    if (password !== confirmPassword) {
        showSuccessMessage('Passwords do not match!', 'error');
        return;
    }

    // Check if user already exists
    if (users.find(user => user.email === email)) {
        showSuccessMessage('User already exists with this email!', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: generateId(),
        name,
        email,
        phone,
        password,
        securityQuestion,
        securityAnswer,
        role: 'user',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('ayurveez_users', JSON.stringify(users));
    
    showSuccessMessage('Registration successful! Please login.');
    switchModalForm('user-login');
    e.target.reset();
}

// User Login
function handleUserLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('user-login-email').value;
    const password = document.getElementById('user-login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        isLoggedIn = true;
        isAdmin = false;
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateNavigation();
        closeLoginModal();
        showSuccessMessage('Login successful!');
        showPage('user-dashboard');
    } else {
        showSuccessMessage('Invalid email or password!', 'error');
    }
}

// Admin Login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;

    if (email === adminCredentials.email && password === adminCredentials.password) {
        currentUser = {
            id: 'admin',
            name: 'Admin User',
            email: 'admin@ayurveez.com',
            role: 'admin'
        };
        isLoggedIn = true;
        isAdmin = true;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateNavigation();
        closeLoginModal();
        showSuccessMessage('Admin login successful!');
        showPage('admin-dashboard');
    } else {
        showSuccessMessage('Invalid admin credentials!', 'error');
    }
}

// ==================== FORGOT PASSWORD FUNCTIONS ====================

// Forgot Password Functions
function showForgotPassword(e) {
    e.preventDefault();
    switchModalForm('forgot-password-form');
    resetForgotPasswordForm();
}

function backToLogin() {
    switchModalForm('user-login');
    resetForgotPasswordForm();
}

function resetForgotPasswordForm() {
    // Reset to step 1
    document.getElementById('phone-group').style.display = 'block';
    document.getElementById('security-question-group').style.display = 'none';
    document.getElementById('password-display').style.display = 'none';
    document.getElementById('new-password-reset').style.display = 'none';
    
    // Reset buttons
    document.getElementById('next-to-security').style.display = 'inline-block';
    document.getElementById('verify-security-btn').style.display = 'none';
    document.getElementById('reset-password-btn').style.display = 'none';
    
    // Reset steps
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    // Clear inputs
    document.getElementById('reset-phone').value = '';
    document.getElementById('security-question-answer').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    
    // Clear any existing timer
    if (currentPasswordTimer) {
        clearInterval(currentPasswordTimer);
        currentPasswordTimer = null;
    }
    
    passwordResetStep = 1;
    resetUser = null;
}

function nextToSecurity() {
    const phone = document.getElementById('reset-phone').value.trim();
    
    if (!phone) {
        showSuccessMessage('Please enter your phone number', 'error');
        return;
    }

    // Find user by phone
    const user = users.find(u => u.phone === phone);
    if (!user) {
        showSuccessMessage('No user found with this phone number', 'error');
        return;
    }

    // Store the user for this session
    resetUser = user;

    // Show security question
    document.getElementById('security-question-text').textContent = getSecurityQuestionText(user.securityQuestion);
    document.getElementById('phone-group').style.display = 'none';
    document.getElementById('security-question-group').style.display = 'block';
    
    // Update buttons
    document.getElementById('next-to-security').style.display = 'none';
    document.getElementById('verify-security-btn').style.display = 'inline-block';
    
    // Update steps
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-1').classList.add('completed');
    document.getElementById('step-2').classList.add('active');
    
    passwordResetStep = 2;
}

function verifySecurityAnswer() {
    const answer = document.getElementById('security-question-answer').value.trim();
    
    if (!answer) {
        showSuccessMessage('Please enter your security answer', 'error');
        return;
    }

    if (!resetUser) {
        showSuccessMessage('Session expired. Please start again.', 'error');
        resetForgotPasswordForm();
        return;
    }

    if (resetUser.securityAnswer.toLowerCase() !== answer.toLowerCase()) {
        showSuccessMessage('Incorrect security answer', 'error');
        return;
    }

    // Show current password with timer
    showCurrentPassword(resetUser.password);
}

function showCurrentPassword(password) {
    document.getElementById('security-question-group').style.display = 'none';
    document.getElementById('password-display').style.display = 'block';
    
    document.getElementById('current-password-show').textContent = password;
    
    // Update steps
    document.getElementById('step-2').classList.remove('active');
    document.getElementById('step-2').classList.add('completed');
    document.getElementById('step-3').classList.add('active');
    
    // Start countdown timer
    let countdown = 10;
    document.getElementById('countdown').textContent = countdown;
    
    currentPasswordTimer = setInterval(() => {
        countdown--;
        document.getElementById('countdown').textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(currentPasswordTimer);
            document.getElementById('password-display').style.display = 'none';
            document.getElementById('new-password-reset').style.display = 'block';
            document.getElementById('reset-password-btn').style.display = 'inline-block';
            document.getElementById('verify-security-btn').style.display = 'none';
        }
    }, 1000);
    
    passwordResetStep = 3;
}

function resetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    if (!newPassword || !confirmPassword) {
        showSuccessMessage('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showSuccessMessage('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showSuccessMessage('Password must be at least 6 characters', 'error');
        return;
    }

    if (!resetUser) {
        showSuccessMessage('Session expired. Please start again.', 'error');
        resetForgotPasswordForm();
        return;
    }

    // Update user password
    const userIndex = users.findIndex(u => u.id === resetUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('ayurveez_users', JSON.stringify(users));
        
        showSuccessMessage('Password reset successfully!');
        setTimeout(() => {
            switchModalForm('user-login');
            resetForgotPasswordForm();
        }, 2000);
    }
}

function getSecurityQuestionText(questionKey) {
    const questions = {
        'first_school': 'What was the name of your first school?',
        'first_college': 'What was the name of your first college/university?',
        'pet_name': 'What was your first pet\'s name?',
        'favorite_book': 'What is your favorite book?',
        'birth_city': 'In which city were you born?'
    };
    return questions[questionKey] || 'Security question not found';
}

// ==================== NAVIGATION ====================

// Navigation
function updateNavigation() {
    console.log('Updating navigation - isLoggedIn:', isLoggedIn, 'isAdmin:', isAdmin);
    updateProfileDropdown();
    updateCartCount();
}

function updateProfileDropdown() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (!dropdownMenu) return;
    
    if (isLoggedIn) {
        if (isAdmin) {
            dropdownMenu.innerHTML = `
                <div class="dropdown-header">Welcome, Admin!</div>
                <a href="#" class="dropdown-item" data-page="admin-dashboard">
                    <i class="fas fa-tachometer-alt"></i> Admin Dashboard
                </a>
                <a href="#" class="dropdown-item" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
        } else {
            dropdownMenu.innerHTML = `
                <div class="dropdown-header">Welcome, ${currentUser?.name || 'User'}!</div>
                <a href="#" class="dropdown-item" data-page="user-dashboard">
                    <i class="fas fa-tachometer-alt"></i> My Dashboard
                </a>
                <a href="#" class="dropdown-item" data-page="courses">
                    <i class="fas fa-book"></i> My Courses
                </a>
                <a href="#" class="dropdown-item" data-page="consultation">
                    <i class="fas fa-calendar-check"></i> My Consultations
                </a>
                <a href="#" class="dropdown-item" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
        }
    } else {
        dropdownMenu.innerHTML = `
            <a href="#" class="dropdown-item" id="dropdown-login">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
            <a href="#" class="dropdown-item" id="dropdown-register">
                <i class="fas fa-user-plus"></i> Register
            </a>
        `;
    }
    
    // Re-attach event listeners
    attachDropdownEventListeners();
}

function attachDropdownEventListeners() {
    // Dropdown login
    document.getElementById('dropdown-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideDropdown();
        showLoginModal();
    });
    
    // Dropdown register
    document.getElementById('dropdown-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideDropdown();
        showLoginModal();
        setTimeout(() => switchModalForm('register-form'), 100);
    });
    
    // Dropdown navigation links
    document.querySelectorAll('.dropdown-menu [data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            hideDropdown();
            showPage(page);
        });
    });
}

function hideDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

// ==================== CART FUNCTIONS ====================

// Cart Functions
function addToCart(button) {
    if (!isLoggedIn) {
        showSuccessMessage('Please login to add items to cart', 'error');
        showLoginModal();
        return;
    }
    
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));
    const type = button.getAttribute('data-type');

    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            type,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCart();
    showSuccessMessage(`${name} added to cart!`);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

function showCart() {
    if (!isLoggedIn) {
        showSuccessMessage('Please login to view cart', 'error');
        showLoginModal();
        return;
    }
    
    document.getElementById('cart-modal').classList.add('active');
    renderCartItems();
}

function hideCart() {
    document.getElementById('cart-modal').classList.remove('active');
}

function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('cart-total-amount');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        totalAmount.textContent = '₹0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
            </div>
        `;
    }).join('');
    
    totalAmount.textContent = `₹${total}`;
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartCount();
            saveCart();
            renderCartItems();
        }
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartCount();
    saveCart();
    renderCartItems();
    showSuccessMessage('Item removed from cart');
}

function saveCart() {
    localStorage.setItem('ayurveez_cart', JSON.stringify(cart));
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showSuccessMessage('Your cart is empty!', 'error');
        return;
    }
    
    hideCart();
    showPage('order-confirmation');
    renderOrderSummary();
}

function renderOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total-amount');
    
    let total = 0;
    orderItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="order-item">
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="order-item-total">₹${itemTotal}</div>
            </div>
        `;
    }).join('');
    
    orderTotal.textContent = `₹${total}`;
}

// ==================== COURSE FUNCTIONS ====================

// Course Functions
function createCourseCard(course) {
    const card = document.createElement('div');
    const isBundle = course.isBundle;
    
    card.className = `course-card ${isBundle ? 'bundle-course' : ''}`;
    card.innerHTML = `
        <div class="course-img" style="background-image: url('${course.image}')"></div>
        <div class="course-content">
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <p><strong>Duration:</strong> ${course.duration}</p>
            <div class="${isBundle ? 'bundle-price' : ''}">
                <strong>Fee:</strong> ₹${course.fee}
                ${isBundle ? '<div class="bundle-savings">Save 20% with bundle!</div>' : ''}
            </div>
            <button class="btn enroll-now" data-id="${course.id}" data-name="${course.name}" data-price="${course.fee}">
                ${isBundle ? '🚀 Enroll Bundle' : 'Enroll Now'}
            </button>
        </div>
    `;
    return card;
}

function loadCourses() {
    console.log('📚 Loading courses with bundles...', courses);
    
    // Load first proff courses
    const firstProffContainer = document.getElementById('first-proff-courses');
    firstProffContainer.innerHTML = '';
    
    if (courses['first-proff'] && courses['first-proff'].length > 0) {
        courses['first-proff'].forEach(course => {
            const courseCard = createCourseCard(course);
            firstProffContainer.appendChild(courseCard);
        });
    } else {
        firstProffContainer.innerHTML = '<p>No courses available in this category.</p>';
    }
    
    // Load second proff courses
    const secondProffContainer = document.getElementById('second-proff-courses');
    secondProffContainer.innerHTML = '';
    
    if (courses['second-proff'] && courses['second-proff'].length > 0) {
        courses['second-proff'].forEach(course => {
            const courseCard = createCourseCard(course);
            secondProffContainer.appendChild(courseCard);
        });
    } else {
        secondProffContainer.innerHTML = '<p>No courses available in this category.</p>';
    }
    
    // Load final proff courses
    const finalProffContainer = document.getElementById('final-proff-courses');
    finalProffContainer.innerHTML = '';
    
    if (courses['final-proff'] && courses['final-proff'].length > 0) {
        courses['final-proff'].forEach(course => {
            const courseCard = createCourseCard(course);
            finalProffContainer.appendChild(courseCard);
        });
    } else {
        finalProffContainer.innerHTML = '<p>No courses available in this category.</p>';
    }
    
    // Enroll buttons ko initialize karo
    initializeEnrollButtons();
}

function initializeEnrollButtons() {
    document.querySelectorAll('.enroll-now').forEach(button => {
        button.addEventListener('click', function() {
            if (!isLoggedIn) {
                showSuccessMessage('Please login to enroll in courses', 'error');
                showLoginModal();
                return;
            }
            
            const courseId = this.getAttribute('data-id');
            const courseName = this.getAttribute('data-name');
            const coursePrice = this.getAttribute('data-price');
            
            // Actually enroll the user
            enrollUserInCourse(courseId, courseName, coursePrice);
            
            // Redirect to Cashfree payment
            const paymentUrl = `${CASHEFREE_PAYMENT_URL}?amount=${coursePrice}&courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`;
            window.open(paymentUrl, '_blank');
            
            showSuccessMessage("Redirecting to payment gateway...");
        });
    });
}

// Enroll user in course function
function enrollUserInCourse(courseId, courseName, coursePrice) {
    // Check if already enrolled
    const alreadyEnrolled = enrolledCourses.find(course => course.id === courseId);
    if (alreadyEnrolled) {
        showSuccessMessage('You are already enrolled in this course!');
        return;
    }
    
    // Find course details
    let courseDetails = null;
    Object.keys(courses).forEach(category => {
        courses[category].forEach(course => {
            if (course.id === courseId) {
                courseDetails = course;
            }
        });
    });
    
    // Add to enrolled courses
    const newEnrollment = {
        id: courseId,
        name: courseName,
        description: courseDetails?.description || 'Ayurvedic course',
        duration: courseDetails?.duration || '18 Months',
        price: parseInt(coursePrice),
        enrolledDate: new Date().toISOString(),
        progress: 0,
        image: courseDetails?.image || 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        isBundle: courseDetails?.isBundle || false
    };
    
    enrolledCourses.push(newEnrollment);
    
    // Save to localStorage
    localStorage.setItem('ayurveez_enrolled_courses', JSON.stringify(enrolledCourses));
    
    showSuccessMessage(`Successfully enrolled in ${courseName}!`);
    console.log('✅ New enrollment:', newEnrollment);
}

function switchCourseTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// ==================== CONSULTATION FUNCTIONS ====================

// Consultation Functions
function handleConsultation(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        showSuccessMessage('Please login to book consultation', 'error');
        showLoginModal();
        return;
    }
    
    showSuccessMessage('Consultation booked successfully! Our team will contact you soon.');
    e.target.reset();
}

function handleWhatsAppConsultation() {
    const phone = '+918271890090';
    const message = 'Hello, I would like to book an Ayurvedic consultation.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Contact Form
function handleContact(e) {
    e.preventDefault();
    showSuccessMessage('Message sent successfully! We will get back to you soon.');
    e.target.reset();
}

// ==================== DASHBOARD FUNCTIONS ====================

// Dashboard Functions
function switchDashboardTab(tabId) {
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.dashboard-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

function loadUserDashboard() {
    updateEnrolledCourses();
    loadConsultationHistory();
}

// Enrolled Courses Function
function updateEnrolledCourses() {
    const enrolledCoursesList = document.getElementById('enrolled-courses-list');
    if (!enrolledCoursesList) return;
    
    enrolledCoursesList.innerHTML = '';
    
    if (enrolledCourses.length === 0) {
        enrolledCoursesList.innerHTML = `
            <div class="no-courses" style="text-align: center; padding: 40px; color: #666;">
                <h3>No courses enrolled yet</h3>
                <p>Browse our courses and start your Ayurvedic journey!</p>
                <button class="btn" onclick="showPage('courses')" style="margin-top: 15px;">Browse Courses</button>
            </div>
        `;
        return;
    }
    
    enrolledCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'enrolled-course';
        courseCard.innerHTML = `
            <div class="enrolled-course-img" style="background-image: url('${course.image}')"></div>
            <div class="enrolled-course-content">
                <h3>${course.name}</h3>
                <p>${course.description || 'Access all course materials and start learning.'}</p>
                <p><strong>Duration:</strong> ${course.duration}</p>
                <p><strong>Enrolled on:</strong> ${new Date(course.enrolledDate).toLocaleDateString()}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${course.progress || 0}%"></div>
                </div>
                <p>Progress: ${course.progress || 0}%</p>
                <button class="btn continue-course" data-course="${course.id}">Continue Learning</button>
            </div>
        `;
        enrolledCoursesList.appendChild(courseCard);
    });
    
    // Add event listeners for continue buttons
    document.querySelectorAll('.continue-course').forEach(btn => {
        btn.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course');
            const course = enrolledCourses.find(c => c.id === courseId);
            showSuccessMessage(`Continuing with: ${course.name}`);
            // Add your course continuation logic here
        });
    });
}

function loadConsultationHistory() {
    const consultationList = document.getElementById('consultation-list');
    consultationList.innerHTML = '';
    
    if (consultations.length === 0) {
        consultationList.innerHTML = '<p>No consultation bookings found.</p>';
        return;
    }
    
    consultations.forEach(consultation => {
        const consultationItem = document.createElement('div');
        consultationItem.className = 'consultation-item';
        consultationItem.innerHTML = `
            <div class="consultation-info">
                <h4>Dr. ${getDoctorName(consultation.doctor)}</h4>
                <p>Date: ${consultation.date}</p>
                <p>Concerns: ${consultation.concerns}</p>
            </div>
            <div class="consultation-status status-${consultation.status}">
                ${consultation.status}
            </div>
        `;
        consultationList.appendChild(consultationItem);
    });
}

function getDoctorName(doctorId) {
    const doctors = {
        'dr-sharma': 'Sharma (General Ayurveda)',
        'dr-patel': 'Patel (Panchakarma Specialist)',
        'dr-verma': 'Verma (Women\'s Health)'
    };
    return doctors[doctorId] || 'Unknown Doctor';
}

// ==================== ADMIN FUNCTIONS ====================

// Admin Functions
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// Admin Dashboard Function
function loadAdminDashboard() {
    loadAdminCourses();
    loadAdminProducts();
    loadAdminOrders();
    loadContentUploadForm();
    loadAdminContentList();
    initializeUserManagement();
}

function loadAdminCourses() {
    const coursesList = document.getElementById('admin-courses-list');
    coursesList.innerHTML = '';
    
    // Combine all courses
    const allCourses = [
        ...courses['first-proff'],
        ...courses['second-proff'], 
        ...courses['final-proff']
    ];
    
    if (allCourses.length === 0) {
        coursesList.innerHTML = '<p>No courses available. Add a new course to get started.</p>';
        return;
    }
    
    allCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-admin-card';
        courseCard.innerHTML = `
            <div class="course-admin-header">
                <div class="course-admin-title">
                    <h4>${course.name}</h4>
                    <p>Fee: ₹${course.fee} | Duration: ${course.duration}</p>
                </div>
                <div class="course-admin-actions">
                    <button class="btn-edit" data-id="${course.id}">Edit</button>
                    <button class="btn-delete" data-id="${course.id}">Delete</button>
                </div>
            </div>
            <p>${course.description}</p>
            <div class="course-stats">
                <div class="stat">
                    <i class="fas fa-play-circle"></i>
                    <span>${course.content ? course.content.length : 0} Contents</span>
                </div>
            </div>
        `;
        coursesList.appendChild(courseCard);
    });
    
    // Edit and Delete buttons ko initialize karo
    initializeAdminCourseButtons();
}

function initializeAdminCourseButtons() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-id');
            editCourse(courseId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-id');
            deleteCourse(courseId);
        });
    });
}

function editCourse(courseId) {
    // Find course
    let courseToEdit = null;
    let courseCategory = null;
    
    Object.keys(courses).forEach(category => {
        courses[category].forEach(course => {
            if (course.id === courseId) {
                courseToEdit = course;
                courseCategory = category;
            }
        });
    });
    
    if (courseToEdit) {
        const newName = prompt('Enter new course name:', courseToEdit.name);
        const newFee = prompt('Enter new course fee:', courseToEdit.fee);
        
        if (newName && newFee) {
            courseToEdit.name = newName;
            courseToEdit.fee = parseInt(newFee);
            
            saveCoursesToStorage();
            loadAdminCourses();
            loadCourses();
            showSuccessMessage('Course updated successfully!');
        }
    }
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        Object.keys(courses).forEach(category => {
            courses[category] = courses[category].filter(course => course.id !== courseId);
        });
        
        saveCoursesToStorage();
        loadAdminCourses();
        loadCourses();
        showSuccessMessage('Course deleted successfully!');
    }
}

function loadContentUploadForm() {
    const courseSelect = document.getElementById('content-course');
    courseSelect.innerHTML = '<option value="">Select a course</option>';
    
    // Combine all courses for the dropdown
    const allCourses = [
        ...courses['first-proff'],
        ...courses['second-proff'],
        ...courses['final-proff']
    ];
    
    allCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseSelect.appendChild(option);
    });
    
    // Content type change handler
    document.getElementById('content-type').addEventListener('change', function() {
        const type = this.value;
        document.getElementById('video-url-group').style.display = 'none';
        document.getElementById('pdf-upload-group').style.display = 'none';
        document.getElementById('text-content-group').style.display = 'none';
        
        if (type === 'video') {
            document.getElementById('video-url-group').style.display = 'block';
        } else if (type === 'pdf') {
            document.getElementById('pdf-upload-group').style.display = 'block';
        } else if (type === 'text') {
            document.getElementById('text-content-group').style.display = 'block';
        }
    });
    
    // Upload content handler
    document.getElementById('upload-content-btn').addEventListener('click', function() {
        const courseId = document.getElementById('content-course').value;
        const title = document.getElementById('content-title').value;
        const type = document.getElementById('content-type').value;
        
        if (!courseId || !title || !type) {
            alert('Please fill all required fields');
            return;
        }
        
        let contentData = {
            id: 'content-' + Date.now(),
            title: title,
            type: type,
            date: new Date().toISOString()
        };
        
        if (type === 'video') {
            const videoUrl = document.getElementById('video-url').value;
            if (!videoUrl) {
                alert('Please enter YouTube URL');
                return;
            }
            contentData.url = videoUrl;
        } else if (type === 'pdf') {
            contentData.fileName = 'document.pdf';
        } else if (type === 'text') {
            const textContent = document.getElementById('text-content').value;
            if (!textContent) {
                alert('Please enter text content');
                return;
            }
            contentData.content = textContent;
        }
        
        // Find course and add content
        let courseFound = false;
        Object.keys(courses).forEach(proff => {
            courses[proff].forEach(course => {
                if (course.id === courseId) {
                    if (!course.content) {
                        course.content = [];
                    }
                    course.content.push(contentData);
                    courseFound = true;
                }
            });
        });
        
        if (courseFound) {
            saveCoursesToStorage();
            showSuccessMessage('Content uploaded successfully!');
            
            // Clear form
            document.getElementById('content-title').value = '';
            document.getElementById('video-url').value = '';
            document.getElementById('text-content').value = '';
            
            // Reload content list
            loadAdminContentList();
        } else {
            alert('Course not found!');
        }
    });
}

function loadAdminContentList() {
    const contentList = document.getElementById('admin-content-list');
    contentList.innerHTML = '<h4>Uploaded Content</h4>';
    
    // Combine all courses and their content
    const allCourses = [
        ...courses['first-proff'],
        ...courses['second-proff'],
        ...courses['final-proff']
    ];
    
    let hasContent = false;
    
    allCourses.forEach(course => {
        if (course.content && course.content.length > 0) {
            hasContent = true;
            course.content.forEach(content => {
                const contentItem = document.createElement('div');
                contentItem.className = 'content-item';
                contentItem.innerHTML = `
                    <div class="content-info">
                        <h5>${content.title}</h5>
                        <div class="content-meta">
                            <span>Course: ${course.name}</span>
                            <span>Type: ${content.type}</span>
                            <span>Added: ${new Date(content.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="content-type">${content.type.toUpperCase()}</div>
                `;
                contentList.appendChild(contentItem);
            });
        }
    });
    
    if (!hasContent) {
        contentList.innerHTML += '<p>No content uploaded yet.</p>';
    }
}

// Add Course Function for Admin
function handleAddCourse() {
    const courseName = prompt('Enter course name:');
    const courseDescription = prompt('Enter course description:');
    const courseFee = prompt('Enter course fee:');
    const courseDuration = prompt('Enter course duration (e.g., 6 Months):');
    const courseCategory = prompt('Enter course category (first-proff, second-proff, final-proff):');
    const isBundle = confirm('Is this a bundle course?');
    
    if (courseName && courseDescription && courseFee && courseDuration && courseCategory) {
        const newCourse = {
            id: isBundle ? `bundle-${courseCategory}-${Date.now()}` : 'course-' + Date.now(),
            name: courseName,
            description: courseDescription,
            duration: courseDuration,
            fee: parseInt(courseFee),
            image: isBundle ? 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            content: [],
            isBundle: isBundle
        };
        
        if (courses[courseCategory]) {
            courses[courseCategory].push(newCourse);
            saveCoursesToStorage();
            loadAdminCourses();
            loadCourses();
            showSuccessMessage(`New ${isBundle ? 'bundle ' : ''}course added!`);
        } else {
            alert('Invalid course category! Use: first-proff, second-proff, or final-proff');
        }
    }
}

// ==================== TESTIMONIAL SLIDER ====================

// Testimonial Slider
function setupTestimonialSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.slider-dot');
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[n].classList.add('active');
        dots[n].classList.add('active');
        currentSlide = n;
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // Auto slide every 5 seconds
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}

// ==================== UTILITY FUNCTIONS ====================

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showSuccessMessage(message, type = 'success') {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    successText.textContent = message;
    successMessage.className = 'success-message show';
    if (type === 'error') {
        successMessage.style.background = '#f44336';
    } else {
        successMessage.style.background = '#4CAF50';
    }
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        isLoggedIn = false;
        isAdmin = false;
        localStorage.removeItem('currentUser');
        updateNavigation();
        hideDropdown();
        showSuccessMessage('Logged out successfully!');
        showPage('home');
    }
}

// ==================== USER MANAGEMENT FUNCTIONS ====================

let userCurrentPage = 1;
const usersPerPage = 10;

// Load users from localStorage
function loadUsers(page = 1) {
    const allUsers = getAllRegisteredUsers();
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = allUsers.slice(startIndex, endIndex);
    
    displayUsers(usersToShow);
    updatePagination(allUsers.length, page);
    updateUserStats(allUsers);
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No registered users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'Not provided'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td><span class="status ${user.status || 'active'}">${user.status || 'active'}</span></td>
            <td class="actions">
                <button class="view-btn" onclick="viewUser('${user.id}')">View</button>
                <button class="edit-btn" onclick="editUser('${user.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// View user details
function viewUser(userId) {
    const users = getAllRegisteredUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const details = `
User Details:
-------------
ID: ${user.id}
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Registration: ${new Date(user.createdAt).toLocaleDateString()}
Status: ${user.status || 'active'}
Role: ${user.role || 'user'}
Security Question: ${getSecurityQuestionText(user.securityQuestion)}
        `;
        alert(details);
    }
}

// Edit user status
function editUser(userId) {
    const users = getAllRegisteredUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const newStatus = prompt('Enter new status (active/inactive):', user.status || 'active');
        if (newStatus && ['active', 'inactive'].includes(newStatus)) {
            user.status = newStatus;
            localStorage.setItem('ayurveez_users', JSON.stringify(users));
            loadUsers(userCurrentPage);
            showSuccessMessage('User status updated!');
        }
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = getAllRegisteredUsers();
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('ayurveez_users', JSON.stringify(updatedUsers));
        loadUsers(userCurrentPage);
        showSuccessMessage('User deleted!');
    }
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const allUsers = getAllRegisteredUsers();
    
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        user.id.toLowerCase().includes(searchTerm)
    );
    
    displayUsers(filteredUsers);
    updateUserStats(filteredUsers);
}

// Update pagination
function updatePagination(totalUsers, currentPage) {
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Update user statistics
function updateUserStats(users) {
    const total = users.length;
    const active = users.filter(user => (user.status || 'active') === 'active').length;
    const inactive = users.filter(user => user.status === 'inactive').length;
    
    document.getElementById('total-users').textContent = total;
    document.getElementById('active-users').textContent = active;
    document.getElementById('inactive-users').textContent = inactive;
}

// Get all registered users
function getAllRegisteredUsers() {
    return JSON.parse(localStorage.getItem('ayurveez_users')) || [];
}

// Initialize user management
function initializeUserManagement() {
    if (document.getElementById('user-management')) {
        loadUsers();
        
        // Add event listeners
        document.getElementById('prev-page').addEventListener('click', () => {
            if (userCurrentPage > 1) {
                userCurrentPage--;
                loadUsers(userCurrentPage);
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            const allUsers = getAllRegisteredUsers();
            const totalPages = Math.ceil(allUsers.length / usersPerPage);
            if (userCurrentPage < totalPages) {
                userCurrentPage++;
                loadUsers(userCurrentPage);
            }
        });
        
        document.getElementById('search-users').addEventListener('click', searchUsers);
        
        document.getElementById('user-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchUsers();
            }
        });
    }
}

// Initialize with sample data for demo
document.addEventListener('DOMContentLoaded', function() {
    // Add sample enrolled courses for testing
    if (enrolledCourses.length === 0) {
        enrolledCourses.push({
            id: 'course-1',
            name: 'Padartha Vigyan',
            description: 'Fundamental principles of Ayurveda including philosophy, basic concepts and fundamental theories.',
            progress: 30,
            duration: '6 Months',
            image: 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            enrolledDate: new Date().toISOString()
        });
        
        enrolledCourses.push({
            id: 'bundle-first-proff',
            name: '1st Proff Complete Bundle',
            description: 'Complete package of all 1st Proff subjects including Padartha Vigyan, Sanskrit, and more.',
            progress: 65,
            duration: '12 Months',
            image: 'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            enrolledDate: new Date().toISOString(),
            isBundle: true
        });
        
        // Save to localStorage
        localStorage.setItem('ayurveez_enrolled_courses', JSON.stringify(enrolledCourses));
    }
    
    consultations.push({
        id: 'consult-1',
        doctor: 'dr-sharma',
        date: '2023-11-15',
        concerns: 'Digestive issues and low energy',
        status: 'confirmed'
    });
});