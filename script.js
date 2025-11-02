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

// Course Data Structure - LocalStorage se load karo
let courses = JSON.parse(localStorage.getItem('ayurveez_courses')) || {
    'first-proff': [
        {
            id: 'course-1',
            name: 'Padartha Vigyan',
            description: 'Fundamental principles of Ayurveda including philosophy, basic concepts and fundamental theories.',
            duration: '6 Months',
            fee: 15000,
            image: 'Assets/images/sanskrit.jpg',
            content: []
        },
        {
            id: 'course-2', 
            name: 'Sanskrit',
            description: 'Basic Sanskrit language for Ayurvedic studies and scriptures.',
            duration: '6 Months',
            fee: 12000,
            image: 'Assets/images/courses/sanskrit.jpg',
            content: []
        }
    ],
    'second-proff': [
        {
            id: 'course-3',
            name: 'Dravya Guna Vigyan',
            description: 'Study of medicinal substances, their properties, actions and therapeutic uses in Ayurveda.',
            duration: '6 Months',
            fee: 18000,
            image: 'Assets/images/courses/dravya_guna.jpg',
            content: []
        },
        {
            id: 'course-4',
            name: 'Rachana Sharir',
            description: 'Anatomy according to Ayurvedic principles and modern medicine.',
            duration: '6 Months', 
            fee: 16000,
            image: 'Assets/images/courses/rachana_sharir.jpg',
            content: []
        }
    ],
    'final-proff': [
        {
            id: 'course-5',
            name: 'Kayachikitsa',
            description: 'General medicine and therapeutic approaches in Ayurveda.',
            duration: '12 Months',
            fee: 25000,
            image: 'Assets/images/courses/kayachikitsa.jpg',
            content: []
        }
    ]
};

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

// Courses ko localStorage mein save karo
function saveCoursesToStorage() {
    localStorage.setItem('ayurveez_courses', JSON.stringify(courses));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadCourses();
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

    // Login/Register Modal
    document.getElementById('login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });

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
    
    // Forgot Password functionality - FIXED VERSION
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
    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleOrderSubmission();
    });
}

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
    } else if (pageId === 'user-dashboard') {
        loadUserDashboard();
    } else if (pageId === 'admin-dashboard') {
        loadAdminDashboard();
    }
}

// Login Modal Functions
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
    switchModalForm('user-login');
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

// Forgot Password Functions - UPDATED AND WORKING
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

// Navigation
function updateNavigation() {
    const loginBtn = document.getElementById('login-btn');
    if (currentUser) {
        if (currentUser.role === 'admin') {
            loginBtn.textContent = 'Admin Dashboard';
            loginBtn.setAttribute('data-page', 'admin-dashboard');
        } else {
            loginBtn.textContent = 'My Dashboard';
            loginBtn.setAttribute('data-page', 'user-dashboard');
        }
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.removeAttribute('data-page');
    }
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

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
                <div class="cart-item-img" style="background-image: url('https://images.unsplash.com/photo-1596047092667-9c78b5fdd1b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')"></div>
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
    const item = cart.find(item => item.id === itemId);
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

function handleOrderSubmission() {
    showSuccessMessage('Order placed successfully! You will receive confirmation shortly.');
    
    // Clear cart
    cart = [];
    updateCartCount();
    saveCart();
    
    showPage('home');
}

// Course Functions
function loadCourses() {
    console.log('Loading courses...', courses);
    
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
    
    // Add to cart buttons ko re-initialize karo
    initializeAddToCartButtons();
    // Enroll buttons ko bhi initialize karo
    initializeEnrollButtons();
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
        <div class="course-img" style="background-image: url('${course.image}')"></div>
        <div class="course-content">
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <p><strong>Duration:</strong> ${course.duration}</p>
            <p><strong>Fee:</strong> ₹${course.fee}</p>
            <button class="btn enroll-now" data-id="${course.id}" data-name="${course.name}" data-price="${course.fee}">Enroll Now</button>
            <button class="btn btn-outline add-to-cart" data-id="${course.id}" data-name="${course.name}" data-price="${course.fee}" data-type="course" style="margin-top: 10px;">Add to Cart</button>
        </div>
    `;
    return card;
}

function initializeAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            addToCart(this);
        });
    });
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
            
            // Redirect to Cashfree payment
            const paymentUrl = `${CASHEFREE_PAYMENT_URL}?amount=${coursePrice}&courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`;
            window.open(paymentUrl, '_blank');
            
            showSuccessMessage("Redirecting to payment gateway...");
        });
    });
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

function updateEnrolledCourses() {
    const enrolledCoursesList = document.getElementById('enrolled-courses-list');
    enrolledCoursesList.innerHTML = '';
    
    if (enrolledCourses.length === 0) {
        enrolledCoursesList.innerHTML = '<p>You have not enrolled in any courses yet.</p>';
        return;
    }
    
    enrolledCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'enrolled-course';
        courseCard.innerHTML = `
            <div class="enrolled-course-img" style="background-image: url('${course.image}')"></div>
            <div class="enrolled-course-content">
                <h3>${course.name}</h3>
                <p>Access all course materials and start learning.</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${course.progress || 0}%"></div>
                </div>
                <p>Progress: ${course.progress || 0}%</p>
                <button class="btn continue-course" data-course="${course.id}">Continue Learning</button>
            </div>
        `;
        enrolledCoursesList.appendChild(courseCard);
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

function loadAdminDashboard() {
    loadAdminCourses();
    loadContentUploadForm();
    loadAdminContentList();
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

// Add Course Button
document.getElementById('add-course-btn').addEventListener('click', function() {
    const courseName = prompt('Enter course name:');
    const courseDescription = prompt('Enter course description:');
    const courseFee = prompt('Enter course fee:');
    const courseDuration = prompt('Enter course duration (e.g., 6 Months):');
    const courseCategory = prompt('Enter course category (first-proff, second-proff, final-proff):');
    
    if (courseName && courseDescription && courseFee && courseDuration && courseCategory) {
        const newCourse = {
            id: 'course-' + Date.now(),
            name: courseName,
            description: courseDescription,
            duration: courseDuration,
            fee: parseInt(courseFee),
            image: 'Assets/images/courses/default.jpg',
            content: []
        };
        
        if (courses[courseCategory]) {
            courses[courseCategory].push(newCourse);
            saveCoursesToStorage();
            loadAdminCourses();
            loadCourses();
            showSuccessMessage('New course added!');
        } else {
            alert('Invalid course category! Use: first-proff, second-proff, or final-proff');
        }
    }
});

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
    currentUser = null;
    isLoggedIn = false;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    updateNavigation();
    showSuccessMessage('Logged out successfully!');
    showPage('home');
}

// Initialize with sample data for demo
document.addEventListener('DOMContentLoaded', function() {
    // Add sample enrolled course
    enrolledCourses.push({
        id: 'course-1',
        name: 'Padartha Vigyan',
        progress: 30,
        image: 'Assets/images/courses/padartha_vijnana.jpg'
    });
    
    consultations.push({
        id: 'consult-1',
        doctor: 'dr-sharma',
        date: '2023-11-15',
        concerns: 'Digestive issues and low energy',
        status: 'confirmed'
    });
});