// State
let currentUser = null;
let currentLocation = null;
let currentShop = null;
let currentCheckIn = null;
let shops = [];
let checkIns = [];

// DOM Elements
const authPage = document.getElementById('auth-page');
const mainApp = document.getElementById('main-app');
const homePage = document.getElementById('home-page');
const shopDetailPage = document.getElementById('shop-detail-page');
const historyPage = document.getElementById('history-page');
const navButtons = document.querySelectorAll('nav button');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    // Auth form toggles
    document.getElementById('show-register').addEventListener('click', () => toggleAuthForm('register'));
    document.getElementById('show-login').addEventListener('click', () => toggleAuthForm('login'));

    // Auth form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Back button
    document.getElementById('back-to-home').addEventListener('click', () => navigateTo('home'));

    // Check-in
    document.getElementById('checkin-btn').addEventListener('click', handleCheckIn);

    // Review modal
    document.getElementById('add-review-btn').addEventListener('click', () => openReviewModal());
    document.getElementById('cancel-review').addEventListener('click', closeReviewModal);
    document.getElementById('review-form').addEventListener('submit', handleAddReview);

    // Rating input
    document.querySelectorAll('.rating-input button').forEach(btn => {
        btn.addEventListener('click', () => selectRating(parseInt(btn.dataset.rating)));
    });
}

// Auth Functions
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        currentUser = JSON.parse(user);
        showMainApp();
    } else {
        showAuthPage();
    }
}

function showAuthPage() {
    authPage.classList.add('active');
    mainApp.classList.remove('active');
}

function showMainApp() {
    authPage.classList.remove('active');
    mainApp.classList.add('active');
    document.getElementById('user-name').textContent = currentUser.username;
    requestLocation();
}

function toggleAuthForm(form) {
    const loginForm = document.getElementById('login-section');
    const registerForm = document.getElementById('register-section');

    if (form === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        showMessage('login-message', 'Logging in...', 'success');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ username: data.username, userId: data.userId }));
        currentUser = { username: data.username, userId: data.userId };
        showMainApp();
    } catch (error) {
        showMessage('login-message', error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        showMessage('register-message', 'Creating account...', 'success');
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ username: data.username, userId: data.userId }));
        currentUser = { username: data.username, userId: data.userId };
        showMainApp();
    } catch (error) {
        showMessage('register-message', error.message, 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    currentLocation = null;
    shops = [];
    checkIns = [];
    showAuthPage();
}

// Location Functions
function requestLocation() {
    const locationPrompt = document.getElementById('location-prompt');
    const shopList = document.getElementById('shop-list-container');

    locationPrompt.style.display = 'block';
    shopList.style.display = 'none';

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationPrompt.style.display = 'none';
                shopList.style.display = 'block';
                loadNearbyShops();
            },
            (error) => {
                document.getElementById('location-status').innerHTML = `
                    <p>Unable to get your location. Please enable location services and refresh.</p>
                    <button class="btn btn-primary" onclick="requestLocation()">Try Again</button>
                `;
            }
        );
    } else {
        document.getElementById('location-status').innerHTML = '<p>Geolocation is not supported by your browser.</p>';
    }
}

// API Functions
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function loadNearbyShops() {
    const container = document.getElementById('shop-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Finding coffee shops...</p></div>';

    try {
        const response = await fetch(
            `/api/coffeeshops/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=2000`,
            { headers: getAuthHeaders() }
        );

        if (!response.ok) throw new Error('Failed to load shops');

        shops = await response.json();
        renderShopList();
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Couldn't load shops</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary btn-small" onclick="loadNearbyShops()">Retry</button>
            </div>
        `;
    }
}

async function loadShopReviews(osmId) {
    try {
        const response = await fetch(`/api/coffeeshops/osm/${osmId}/reviews`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

async function loadCheckIns() {
    const container = document.getElementById('history-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading history...</p></div>';

    try {
        const response = await fetch('/api/checkins', { headers: getAuthHeaders() });

        if (!response.ok) throw new Error('Failed to load check-ins');

        checkIns = await response.json();
        renderHistoryList();
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Couldn't load history</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Render Functions
function renderShopList() {
    const container = document.getElementById('shop-list');

    if (shops.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No coffee shops found</h3>
                <p>Try expanding your search radius or moving to a different area.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = shops.map(shop => `
        <div class="shop-card" onclick="viewShopDetail(${shop.osmId})">
            <div class="shop-name">${escapeHtml(shop.name)}</div>
            ${shop.address ? `<div class="shop-address">${escapeHtml(shop.address)}</div>` : ''}
            <span class="shop-distance">${formatDistance(shop.distance)}</span>
        </div>
    `).join('');
}

function renderHistoryList() {
    const container = document.getElementById('history-list');

    if (checkIns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No check-ins yet</h3>
                <p>Visit a coffee shop and check in to start tracking your visits!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = checkIns.map(checkIn => `
        <div class="history-card">
            <div class="history-header">
                <span class="history-shop">${escapeHtml(checkIn.shopName)}</span>
                <span class="history-date">${formatDate(checkIn.checkedInAt)}</span>
            </div>
            ${checkIn.notes ? `<p class="review-notes">${escapeHtml(checkIn.notes)}</p>` : ''}
            ${checkIn.reviews.length > 0 ? `
                <div class="history-reviews">
                    ${checkIn.reviews.map(r => `
                        <div class="history-review">
                            <span>${escapeHtml(r.productName)}</span>
                            <span class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <button class="btn btn-secondary btn-small add-review-btn" onclick="openReviewModalForCheckIn(${checkIn.id})">
                Add Review
            </button>
        </div>
    `).join('');
}

async function renderShopDetail() {
    const detailContainer = document.getElementById('shop-detail-content');
    const reviewsContainer = document.getElementById('shop-reviews');

    detailContainer.innerHTML = `
        <h2>${escapeHtml(currentShop.name)}</h2>
        ${currentShop.address ? `<p class="address">${escapeHtml(currentShop.address)}</p>` : ''}
        <p class="shop-distance">${formatDistance(currentShop.distance)} away</p>
    `;

    // Load reviews
    reviewsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    const reviews = await loadShopReviews(currentShop.osmId);

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review!</p>';
    } else {
        reviewsContainer.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-product">${escapeHtml(r.productName)}</span>
                    <span class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                </div>
                <div class="review-meta">by ${escapeHtml(r.username)} on ${formatDate(r.createdAt)}</div>
                ${r.notes ? `<p class="review-notes">${escapeHtml(r.notes)}</p>` : ''}
            </div>
        `).join('');
    }
}

// Navigation
function navigateTo(page) {
    // Hide all pages
    homePage.classList.remove('active');
    shopDetailPage.classList.remove('active');
    historyPage.classList.remove('active');

    // Update nav
    navButtons.forEach(btn => btn.classList.remove('active'));

    switch (page) {
        case 'home':
            homePage.classList.add('active');
            document.querySelector('[data-page="home"]').classList.add('active');
            if (currentLocation && shops.length === 0) {
                loadNearbyShops();
            }
            break;
        case 'history':
            historyPage.classList.add('active');
            document.querySelector('[data-page="history"]').classList.add('active');
            loadCheckIns();
            break;
        case 'shop-detail':
            shopDetailPage.classList.add('active');
            renderShopDetail();
            break;
    }
}

function viewShopDetail(osmId) {
    currentShop = shops.find(s => s.osmId === osmId);
    if (currentShop) {
        navigateTo('shop-detail');
    }
}

// Check-in
async function handleCheckIn() {
    if (!currentShop) return;

    const btn = document.getElementById('checkin-btn');
    btn.disabled = true;
    btn.textContent = 'Checking in...';

    try {
        const response = await fetch('/api/checkins', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                osmId: currentShop.osmId,
                shopName: currentShop.name,
                latitude: currentShop.latitude,
                longitude: currentShop.longitude,
                address: currentShop.address
            })
        });

        if (!response.ok) throw new Error('Failed to check in');

        currentCheckIn = await response.json();

        btn.textContent = 'Checked In!';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');

        // Show add review button
        document.getElementById('add-review-btn').style.display = 'block';

        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'Check In Again';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }, 2000);

    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Check In';
        alert(error.message);
    }
}

// Reviews
let selectedRating = 0;

function openReviewModal() {
    if (!currentCheckIn) {
        alert('Please check in first before adding a review');
        return;
    }
    document.getElementById('review-modal').classList.add('active');
    document.getElementById('review-checkin-id').value = currentCheckIn.id;
    resetReviewForm();
}

function openReviewModalForCheckIn(checkInId) {
    document.getElementById('review-modal').classList.add('active');
    document.getElementById('review-checkin-id').value = checkInId;
    resetReviewForm();
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.remove('active');
    resetReviewForm();
}

function resetReviewForm() {
    document.getElementById('review-product').value = '';
    document.getElementById('review-notes').value = '';
    selectedRating = 0;
    document.querySelectorAll('.rating-input button').forEach(btn => btn.classList.remove('selected'));
}

function selectRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.rating-input button').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.rating) <= rating);
    });
}

async function handleAddReview(e) {
    e.preventDefault();

    if (selectedRating === 0) {
        alert('Please select a rating');
        return;
    }

    const checkInId = parseInt(document.getElementById('review-checkin-id').value);
    const productName = document.getElementById('review-product').value;
    const notes = document.getElementById('review-notes').value;

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                checkInId,
                productName,
                rating: selectedRating,
                notes: notes || null
            })
        });

        if (!response.ok) throw new Error('Failed to add review');

        closeReviewModal();

        // Refresh views
        if (currentShop) {
            renderShopDetail();
        }
        loadCheckIns();

    } catch (error) {
        alert(error.message);
    }
}

// Utilities
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
