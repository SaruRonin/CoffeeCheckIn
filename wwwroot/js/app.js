// State
let currentUser = null;
let currentLocation = null;
let currentShop = null;
let currentCheckIn = null;
let shops = [];
let seededShops = [];
let checkIns = [];
let feedReviews = [];
let groupedFeed = [];
let map = null;
let markers = [];
let userMarker = null;
let currentRadius = 1000;
let currentFeedSort = 'recent';
let selectedThemeColor = '#6F4E37';

// DOM Elements
const authPage = document.getElementById('auth-page');
const mainApp = document.getElementById('main-app');
const homePage = document.getElementById('home-page');
const shopDetailPage = document.getElementById('shop-detail-page');
const historyPage = document.getElementById('history-page');
const feedPage = document.getElementById('feed-page');
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

    // Search
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // Radius filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRadius = parseInt(btn.dataset.radius);
            if (currentLocation) {
                loadNearbyShops();
            }
        });
    });

    // Panel handle
    setupPanelDrag();

    // Feed dropdown
    const feedSortSelect = document.getElementById('feed-sort-select');
    if (feedSortSelect) {
        feedSortSelect.addEventListener('change', (e) => {
            currentFeedSort = e.target.value;
            loadFeed();
        });
    }

    // Settings modal
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    const cancelSettingsBtn = document.getElementById('cancel-settings');
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', closeSettingsModal);
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSaveSettings);
    }

    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => selectThemeColor(btn.dataset.color));
    });

    // Avatar preview
    const avatarInput = document.getElementById('settings-avatar');
    if (avatarInput) {
        avatarInput.addEventListener('input', updateAvatarPreview);
    }

    // Profile modal
    const closeProfileBtn = document.getElementById('close-profile');
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', closeProfileModal);
    }

    // QR Scanner
    const qrCheckinBtn = document.getElementById('qr-checkin-btn');
    if (qrCheckinBtn) {
        qrCheckinBtn.addEventListener('click', openQrScanner);
    }
    const closeQrBtn = document.getElementById('close-qr');
    if (closeQrBtn) {
        closeQrBtn.addEventListener('click', closeQrScanner);
    }

    // Add Shop
    const addShopBtn = document.getElementById('add-shop-btn');
    if (addShopBtn) {
        addShopBtn.addEventListener('click', openAddShopModal);
    }
    const cancelAddShop = document.getElementById('cancel-add-shop');
    if (cancelAddShop) {
        cancelAddShop.addEventListener('click', closeAddShopModal);
    }
    const addShopForm = document.getElementById('add-shop-form');
    if (addShopForm) {
        addShopForm.addEventListener('submit', handleAddShop);
    }
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
    updateUserAvatar();
    applyThemeColor(currentUser.themeColor || '#6F4E37');
    requestLocation();
    loadSeededShops();
    // Default to feed page
    navigateTo('feed');
}

function updateUserAvatar() {
    const avatarEl = document.getElementById('user-avatar');
    if (!avatarEl) return;

    if (currentUser.profilePictureUrl) {
        avatarEl.innerHTML = `<img src="${escapeHtml(currentUser.profilePictureUrl)}" alt="Avatar" onerror="this.parentElement.textContent='${currentUser.username.charAt(0).toUpperCase()}'">`;
    } else {
        avatarEl.textContent = currentUser.username.charAt(0).toUpperCase();
    }
}

function applyThemeColor(color) {
    if (!color) return;
    const hsl = hexToHSL(color);
    if (!hsl) return;

    // Primary accent colors
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-dark', `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 10)}%)`);
    document.documentElement.style.setProperty('--secondary', `hsl(${hsl.h}, ${Math.max(hsl.s - 10, 20)}%, ${Math.min(hsl.l + 10, 70)}%)`);

    // Background colors - dark versions of the theme
    document.documentElement.style.setProperty('--background', `hsl(${hsl.h}, ${Math.min(hsl.s, 30)}%, 4%)`);
    document.documentElement.style.setProperty('--background-secondary', `hsl(${hsl.h}, ${Math.min(hsl.s, 25)}%, 7%)`);
    document.documentElement.style.setProperty('--background-tertiary', `hsl(${hsl.h}, ${Math.min(hsl.s, 20)}%, 10%)`);
    document.documentElement.style.setProperty('--card-bg', `hsla(${hsl.h}, ${Math.min(hsl.s, 20)}%, 10%, 0.8)`);
    document.documentElement.style.setProperty('--card-border', `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.15)`);
    document.documentElement.style.setProperty('--glow', `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.3)`);
}

function hexToHSL(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
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

        const userData = {
            username: data.username,
            userId: data.userId,
            bio: data.bio,
            profilePictureUrl: data.profilePictureUrl,
            themeColor: data.themeColor || '#6F4E37'
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        currentUser = userData;
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

        const userData = {
            username: data.username,
            userId: data.userId,
            bio: data.bio,
            profilePictureUrl: data.profilePictureUrl,
            themeColor: data.themeColor || '#6F4E37'
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        currentUser = userData;
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
    if (map) {
        map.remove();
        map = null;
    }
    showAuthPage();
}

// Location Functions
function requestLocation() {
    const locationPrompt = document.getElementById('location-prompt');
    const exploreContent = document.getElementById('explore-content');

    locationPrompt.style.display = 'block';
    if (exploreContent) exploreContent.style.display = 'none';

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationPrompt.style.display = 'none';
                if (exploreContent) exploreContent.style.display = 'flex';
                initMap();
                loadNearbyShops();
            },
            (error) => {
                document.getElementById('location-status').innerHTML = `
                    <p style="margin-bottom: 16px;">Unable to get your location. Please enable location services.</p>
                    <button class="btn btn-primary btn-small" onclick="requestLocation()">Try Again</button>
                `;
            }
        );
    } else {
        document.getElementById('location-status').innerHTML = '<p>Geolocation is not supported by your browser.</p>';
    }
}

// Search
function handleSearch() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    if (!query) {
        renderShopList();
        addShopMarkers();
        return;
    }

    const filtered = shops.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        (shop.address && shop.address.toLowerCase().includes(query))
    );

    renderFilteredShopList(filtered);
    updateMapMarkers(filtered);
}

function renderFilteredShopList(filteredShops) {
    const container = document.getElementById('shop-list');

    if (filteredShops.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No matches found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredShops.map((shop, index) => `
        <div class="shop-card" onclick="viewShopDetail(${shop.osmId})" data-index="${index}">
            <div class="shop-name">${escapeHtml(shop.name)}</div>
            ${shop.address ? `<div class="shop-address">${escapeHtml(shop.address)}</div>` : ''}
            <span class="shop-distance">${formatDistance(shop.distance)}</span>
        </div>
    `).join('');

    document.getElementById('shop-count-num').textContent = filteredShops.length;
}

function updateMapMarkers(filteredShops) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    filteredShops.forEach((shop, index) => {
        const markerIcon = L.divIcon({
            className: 'coffee-marker-container',
            html: `<div class="coffee-marker" data-index="${index}">&#9749;</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([shop.latitude, shop.longitude], { icon: markerIcon })
            .addTo(map);

        const popupContent = `
            <div class="popup-content">
                <h4>${escapeHtml(shop.name)}</h4>
                ${shop.address ? `<p>${escapeHtml(shop.address)}</p>` : ''}
                <p>${formatDistance(shop.distance)} away</p>
                <button class="btn btn-primary" onclick="viewShopDetail(${shop.osmId})">View Details</button>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
    });

    document.getElementById('shop-count-num').textContent = filteredShops.length;
}

// Map Functions
function initMap() {
    if (map) {
        map.remove();
    }

    map = L.map('map', {
        zoomControl: true,
        attributionControl: false
    }).setView([currentLocation.lat, currentLocation.lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    const userIcon = L.divIcon({
        className: 'user-marker-container',
        html: '<div class="user-marker"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    userMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="popup-content"><h4>You are here</h4></div>');
}

function addShopMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    shops.forEach((shop, index) => {
        const markerIcon = L.divIcon({
            className: 'coffee-marker-container',
            html: `<div class="coffee-marker" data-index="${index}">&#9749;</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([shop.latitude, shop.longitude], { icon: markerIcon })
            .addTo(map);

        const popupContent = `
            <div class="popup-content">
                <h4>${escapeHtml(shop.name)}</h4>
                ${shop.address ? `<p>${escapeHtml(shop.address)}</p>` : ''}
                <p>${formatDistance(shop.distance)} away</p>
                <button class="btn btn-primary" onclick="viewShopDetail(${shop.osmId})">View Details</button>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => highlightShopInList(index));
        markers.push(marker);
    });

    document.getElementById('shop-count-num').textContent = shops.length;

    if (shops.length > 0) {
        const bounds = L.latLngBounds([
            [currentLocation.lat, currentLocation.lng],
            ...shops.slice(0, 10).map(s => [s.latitude, s.longitude])
        ]);
        map.fitBounds(bounds, { padding: [30, 30] });
    }
}

function highlightShopInList(index) {
    const shopCards = document.querySelectorAll('.shop-card');
    shopCards.forEach((card, i) => {
        card.classList.toggle('highlighted', i === index);
    });

    const card = shopCards[index];
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function setupPanelDrag() {
    const handle = document.getElementById('panel-handle');
    if (!handle) return;

    handle.addEventListener('click', () => {
        const panel = document.getElementById('shop-panel');
        if (panel) panel.classList.toggle('collapsed');
    });
}

// API Functions
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function loadNearbyShops() {
    const shopList = document.getElementById('shop-list');
    shopList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Finding coffee shops...</p></div>';

    try {
        const response = await fetch(
            `/api/coffeeshops/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=${currentRadius}`,
            { headers: getAuthHeaders() }
        );

        let nearbyShops = [];
        if (response.ok) {
            nearbyShops = await response.json();
        }

        // Merge with seeded shops, adding distance calculation
        const seededWithDistance = seededShops.map(shop => ({
            ...shop,
            distance: calculateDistance(currentLocation.lat, currentLocation.lng, shop.latitude, shop.longitude)
        }));

        // Combine and dedupe by osmId
        const allShops = [...nearbyShops];
        const existingOsmIds = new Set(nearbyShops.map(s => s.osmId));

        seededWithDistance.forEach(shop => {
            if (!existingOsmIds.has(shop.osmId)) {
                allShops.push(shop);
            }
        });

        // Sort by distance
        shops = allShops.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        renderShopList();
        addShopMarkers();

        // Clear search
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
    } catch (error) {
        // Fall back to seeded shops only
        if (seededShops.length > 0) {
            shops = seededShops.map(shop => ({
                ...shop,
                distance: calculateDistance(currentLocation.lat, currentLocation.lng, shop.latitude, shop.longitude)
            })).sort((a, b) => a.distance - b.distance);

            renderShopList();
            addShopMarkers();
        } else {
            shopList.innerHTML = `
                <div class="empty-state">
                    <h3>Couldn't load shops</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary btn-small" onclick="loadNearbyShops()">Retry</button>
                </div>
            `;
        }
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

async function loadFeed() {
    const feedList = document.getElementById('feed-list');
    const feedGrouped = document.getElementById('feed-grouped');
    const feedStats = document.getElementById('feed-stats');

    if (currentFeedSort === 'grouped') {
        feedList.style.display = 'none';
        feedGrouped.style.display = 'flex';
        feedGrouped.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading feed...</p></div>';
    } else {
        feedList.style.display = 'flex';
        feedGrouped.style.display = 'none';
        feedList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading feed...</p></div>';
    }

    try {
        const sortParam = currentFeedSort === 'grouped' ? 'place' : currentFeedSort;

        const requests = [
            fetch(`/api/reviews/feed?sort=${sortParam}&limit=50`, { headers: getAuthHeaders() }),
            fetch('/api/reviews/feed/stats', { headers: getAuthHeaders() })
        ];

        if (currentFeedSort === 'grouped') {
            requests.push(fetch('/api/reviews/feed/grouped', { headers: getAuthHeaders() }));
        }

        const responses = await Promise.all(requests);

        if (!responses[0].ok) throw new Error('Failed to load feed');

        feedReviews = await responses[0].json();
        const stats = responses[1].ok ? await responses[1].json() : null;

        if (currentFeedSort === 'grouped' && responses[2]) {
            groupedFeed = responses[2].ok ? await responses[2].json() : [];
        }

        renderFeedStats(stats);

        if (currentFeedSort === 'grouped') {
            renderGroupedFeed();
        } else {
            renderFeed();
        }
    } catch (error) {
        const container = currentFeedSort === 'grouped' ? feedGrouped : feedList;
        container.innerHTML = `
            <div class="empty-state">
                <h3>Couldn't load feed</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderFeedStats(stats) {
    const container = document.getElementById('feed-stats');
    if (!stats) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.totalReviews}</div>
            <div class="stat-label">Reviews</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgRating}</div>
            <div class="stat-label">Avg Rating</div>
        </div>
    `;
}

function renderFeed() {
    const container = document.getElementById('feed-list');

    if (feedReviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No reviews yet</h3>
                <p>Be the first to share your coffee experience!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = feedReviews.map(review => `
        <div class="feed-card">
            <div class="feed-header">
                <span class="feed-user-link" onclick="viewUserProfile(${review.userId})">
                    <span class="feed-user-avatar">${review.userProfilePicture
                        ? `<img src="${escapeHtml(review.userProfilePicture)}" alt="" onerror="this.parentElement.textContent='${review.username.charAt(0).toUpperCase()}'">`
                        : review.username.charAt(0).toUpperCase()}</span>
                    <span class="feed-user">@${escapeHtml(review.username)}</span>
                </span>
                <span class="feed-time">${formatTimeAgo(review.createdAt)}</span>
            </div>
            <div class="feed-shop">at ${escapeHtml(review.shopName)}</div>
            <div class="feed-product">
                <span class="feed-product-name">${escapeHtml(review.productName)}</span>
                <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            ${review.notes ? `<p class="feed-notes">"${escapeHtml(review.notes)}"</p>` : ''}
        </div>
    `).join('');
}

function renderGroupedFeed() {
    const container = document.getElementById('feed-grouped');

    if (groupedFeed.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No reviews yet</h3>
                <p>Be the first to share your coffee experience!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = groupedFeed.map((group, index) => `
        <div class="shop-group" id="shop-group-${index}">
            <div class="shop-group-header" onclick="toggleShopGroup(${index})">
                <div class="shop-group-info">
                    <h4>${escapeHtml(group.shopName)}</h4>
                    <div class="shop-group-meta">
                        ${group.reviewCount} reviews · <span>${'★'.repeat(Math.round(group.averageRating))}</span> ${group.averageRating}
                    </div>
                </div>
                <span class="shop-group-toggle">▼</span>
            </div>
            <div class="shop-group-reviews">
                ${group.reviews.map(review => `
                    <div class="feed-card">
                        <div class="feed-header">
                            <span class="feed-user-link" onclick="event.stopPropagation(); viewUserProfile(${review.userId})">
                                <span class="feed-user-avatar">${review.userProfilePicture
                                    ? `<img src="${escapeHtml(review.userProfilePicture)}" alt="" onerror="this.parentElement.textContent='${review.username.charAt(0).toUpperCase()}'">`
                                    : review.username.charAt(0).toUpperCase()}</span>
                                <span class="feed-user">@${escapeHtml(review.username)}</span>
                            </span>
                            <span class="feed-time">${formatTimeAgo(review.createdAt)}</span>
                        </div>
                        <div class="feed-product">
                            <span class="feed-product-name">${escapeHtml(review.productName)}</span>
                            <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                        </div>
                        ${review.notes ? `<p class="feed-notes">"${escapeHtml(review.notes)}"</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function toggleShopGroup(index) {
    const group = document.getElementById(`shop-group-${index}`);
    if (group) {
        group.classList.toggle('expanded');
    }
}

// Render Functions
function renderShopList() {
    const container = document.getElementById('shop-list');

    if (shops.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No coffee shops found</h3>
                <p>Try expanding your search radius</p>
            </div>
        `;
        return;
    }

    container.innerHTML = shops.map((shop, index) => `
        <div class="shop-card" onclick="viewShopDetail(${shop.osmId})" data-index="${index}">
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
                <p>Visit a coffee shop and check in to start tracking!</p>
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
    const menuContainer = document.getElementById('shop-menu');

    detailContainer.innerHTML = `
        <h2>${escapeHtml(currentShop.name)}</h2>
        ${currentShop.address ? `<p class="address">${escapeHtml(currentShop.address)}</p>` : ''}
        <p class="shop-distance">${formatDistance(currentShop.distance || 0)} away</p>
    `;

    // Load menu and reviews in parallel
    menuContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    reviewsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    const [menu, reviews] = await Promise.all([
        loadShopMenu(currentShop.osmId),
        loadShopReviews(currentShop.osmId)
    ]);

    renderMenu(menu);
    renderReviews(reviews);
}

async function loadShopMenu(osmId) {
    try {
        const response = await fetch(`/api/menu/shop/osm/${osmId}`, { headers: getAuthHeaders() });
        if (!response.ok) return [];
        return await response.json();
    } catch { return []; }
}

function renderMenu(menu) {
    const container = document.getElementById('shop-menu');
    if (!menu || menu.length === 0) {
        container.innerHTML = '<p class="no-menu">No menu available</p>';
        return;
    }

    // Group by category
    const grouped = menu.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    container.innerHTML = Object.entries(grouped).map(([category, items]) => `
        <div class="menu-category">
            <h4>${escapeHtml(category)}</h4>
            ${items.map(item => `
                <div class="menu-item">
                    <div class="menu-item-info">
                        <div class="menu-item-name">${escapeHtml(item.name)}</div>
                        ${item.description ? `<div class="menu-item-desc">${escapeHtml(item.description)}</div>` : ''}
                    </div>
                    <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function renderReviews(reviews) {
    const container = document.getElementById('shop-reviews');
    if (reviews.length === 0) {
        container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review!</p>';
    } else {
        container.innerHTML = reviews.map(r => `
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
const learnPage = document.getElementById('learn-page');

function navigateTo(page) {
    homePage.classList.remove('active');
    shopDetailPage.classList.remove('active');
    historyPage.classList.remove('active');
    if (feedPage) feedPage.classList.remove('active');
    if (learnPage) learnPage.classList.remove('active');

    navButtons.forEach(btn => btn.classList.remove('active'));

    switch (page) {
        case 'home':
            homePage.classList.add('active');
            document.querySelector('[data-page="home"]').classList.add('active');
            if (currentLocation && map) {
                setTimeout(() => map.invalidateSize(), 100);
            }
            break;
        case 'feed':
            if (feedPage) {
                feedPage.classList.add('active');
                document.querySelector('[data-page="feed"]').classList.add('active');
                loadFeed();
            }
            break;
        case 'learn':
            if (learnPage) {
                learnPage.classList.add('active');
                document.querySelector('[data-page="learn"]').classList.add('active');
                loadLearnContent();
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
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
}

// Seeded Shops
async function loadSeededShops() {
    try {
        const response = await fetch('/api/coffeeshops/seeded', { headers: getAuthHeaders() });
        if (response.ok) {
            seededShops = await response.json();
        }
    } catch (error) {
        console.error('Failed to load seeded shops:', error);
    }
}

// Settings Modal
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    // Populate current values
    document.getElementById('settings-bio').value = currentUser.bio || '';
    document.getElementById('settings-avatar').value = currentUser.profilePictureUrl || '';
    document.getElementById('settings-instagram').value = currentUser.instagramHandle || '';
    selectedThemeColor = currentUser.themeColor || '#6F4E37';
    document.getElementById('settings-theme-color').value = selectedThemeColor;

    // Highlight selected color
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === selectedThemeColor);
    });

    updateAvatarPreview();
    modal.classList.add('active');
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
}

function selectThemeColor(color) {
    selectedThemeColor = color;
    document.getElementById('settings-theme-color').value = color;
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === color);
    });
}

function updateAvatarPreview() {
    const url = document.getElementById('settings-avatar').value;
    const preview = document.getElementById('avatar-preview');

    if (url) {
        preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Preview" onerror="this.parentElement.classList.remove('visible')">`;
        preview.classList.add('visible');
    } else {
        preview.classList.remove('visible');
        preview.innerHTML = '';
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();

    const bio = document.getElementById('settings-bio').value;
    const profilePictureUrl = document.getElementById('settings-avatar').value;
    const themeColor = document.getElementById('settings-theme-color').value;
    const instagramHandle = document.getElementById('settings-instagram').value.replace('@', '');

    try {
        const response = await fetch('/api/users/me', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ bio, profilePictureUrl, themeColor, instagramHandle })
        });

        if (!response.ok) throw new Error('Failed to save settings');

        const updatedProfile = await response.json();

        // Update local user data
        currentUser.bio = updatedProfile.bio;
        currentUser.profilePictureUrl = updatedProfile.profilePictureUrl;
        currentUser.themeColor = updatedProfile.themeColor;
        currentUser.instagramHandle = updatedProfile.instagramHandle;
        localStorage.setItem('user', JSON.stringify(currentUser));

        // Apply changes
        updateUserAvatar();
        applyThemeColor(currentUser.themeColor);

        closeSettingsModal();
    } catch (error) {
        alert(error.message);
    }
}

// User Profile Modal
async function viewUserProfile(userId) {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.getElementById('profile-content').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const response = await fetch(`/api/users/${userId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to load profile');

        const profile = await response.json();
        renderUserProfile(profile);
    } catch (error) {
        document.getElementById('profile-content').innerHTML = `
            <div class="empty-state">
                <h3>Couldn't load profile</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderUserProfile(profile) {
    const avatarContent = profile.profilePictureUrl
        ? `<img src="${escapeHtml(profile.profilePictureUrl)}" alt="${escapeHtml(profile.username)}" onerror="this.parentElement.textContent='${profile.username.charAt(0).toUpperCase()}'">`
        : profile.username.charAt(0).toUpperCase();

    document.getElementById('profile-avatar').innerHTML = avatarContent;
    document.getElementById('profile-username').textContent = profile.username;
    document.getElementById('profile-bio').textContent = profile.bio || 'No bio yet';
    document.getElementById('profile-checkins').textContent = profile.totalCheckIns;
    document.getElementById('profile-reviews').textContent = profile.totalReviews;
    document.getElementById('profile-joined').textContent = `Member since ${formatDate(profile.createdAt)}`;

    const igLink = document.getElementById('profile-instagram');
    if (profile.instagramHandle) {
        igLink.href = `https://instagram.com/${profile.instagramHandle}`;
        igLink.textContent = `@${profile.instagramHandle}`;
        igLink.style.display = 'block';
    } else {
        igLink.style.display = 'none';
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
}

// Learn Page
async function loadLearnContent() {
    const roastsContainer = document.getElementById('roasts-content');
    const originsContainer = document.getElementById('origins-content');

    if (!roastsContainer) return;
    roastsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const [roastsRes, originsRes] = await Promise.all([
            fetch('/api/coffeeinfo/roasts', { headers: getAuthHeaders() }),
            fetch('/api/coffeeinfo/origins', { headers: getAuthHeaders() })
        ]);

        const roasts = roastsRes.ok ? await roastsRes.json() : {};
        const origins = originsRes.ok ? await originsRes.json() : {};

        renderRoasts(roasts);
        renderOrigins(origins);
    } catch (error) {
        roastsContainer.innerHTML = '<p class="empty-state">Failed to load content</p>';
    }
}

function renderRoasts(roasts) {
    const container = document.getElementById('roasts-content');
    container.innerHTML = Object.entries(roasts).map(([key, r]) => `
        <div class="info-card">
            <h4><span class="color-dot" style="background:${r.color}"></span> ${escapeHtml(r.name)}</h4>
            <p>${escapeHtml(r.description)}</p>
            <p><strong>Flavor:</strong> ${escapeHtml(r.flavor)}</p>
            <div class="meta">
                <span class="tag">Body: ${r.body}</span>
                <span class="tag">Caffeine: ${r.caffeine}</span>
                <span class="tag">Best for: ${r.bestFor}</span>
            </div>
        </div>
    `).join('');
}

function renderOrigins(origins) {
    const container = document.getElementById('origins-content');
    container.innerHTML = Object.entries(origins).map(([key, o]) => `
        <div class="info-card">
            <h4><span class="flag">${o.flag}</span> ${escapeHtml(o.country)}</h4>
            <p>${escapeHtml(o.description)}</p>
            <p><strong>Flavor:</strong> ${escapeHtml(o.flavor)}</p>
            <div class="meta">
                <span class="tag">${o.region}</span>
                <span class="tag">${o.altitude}</span>
                <span class="tag">${o.process}</span>
            </div>
        </div>
    `).join('');
}

// Learn tabs event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.learn-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.learn-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.getElementById('roasts-content').style.display = tabName === 'roasts' ? 'flex' : 'none';
            document.getElementById('origins-content').style.display = tabName === 'origins' ? 'flex' : 'none';
        });
    });
});

// QR Code Scanner
let html5QrCode = null;

function openQrScanner() {
    const modal = document.getElementById('qr-modal');
    const resultDiv = document.getElementById('qr-result');
    if (!modal) return;

    modal.classList.add('active');
    resultDiv.textContent = '';
    resultDiv.className = 'qr-result';

    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onQrCodeSuccess,
        onQrCodeError
    ).catch(err => {
        resultDiv.textContent = 'Camera access denied';
        resultDiv.className = 'qr-result error';
    });
}

function closeQrScanner() {
    const modal = document.getElementById('qr-modal');
    if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
        html5QrCode = null;
    }
    if (modal) modal.classList.remove('active');
}

async function onQrCodeSuccess(decodedText) {
    const resultDiv = document.getElementById('qr-result');

    // Expected format: coffeecheckin://shop/{osmId}
    const match = decodedText.match(/coffeecheckin:\/\/shop\/(\d+)/);
    if (!match) {
        resultDiv.textContent = 'Invalid QR code';
        resultDiv.className = 'qr-result error';
        return;
    }

    const osmId = parseInt(match[1]);
    resultDiv.textContent = 'QR code detected! Checking in...';

    // Find shop in loaded shops or seeded shops
    let shop = shops.find(s => s.osmId === osmId) || seededShops.find(s => s.osmId === osmId);

    if (!shop) {
        resultDiv.textContent = 'Shop not found';
        resultDiv.className = 'qr-result error';
        return;
    }

    try {
        const response = await fetch('/api/checkins', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                osmId: shop.osmId,
                shopName: shop.name,
                latitude: shop.latitude,
                longitude: shop.longitude,
                address: shop.address
            })
        });

        if (!response.ok) throw new Error('Check-in failed');

        currentCheckIn = await response.json();
        resultDiv.textContent = `Checked in to ${shop.name}!`;
        resultDiv.className = 'qr-result';

        setTimeout(() => {
            closeQrScanner();
            currentShop = shop;
            navigateTo('shop-detail');
        }, 1500);

    } catch (error) {
        resultDiv.textContent = error.message;
        resultDiv.className = 'qr-result error';
    }
}

function onQrCodeError(error) {
    // Ignore scan errors (no QR in frame)
}

// Add Shop
function openAddShopModal() {
    const modal = document.getElementById('add-shop-modal');
    if (modal) {
        document.getElementById('new-shop-name').value = '';
        document.getElementById('new-shop-address').value = '';
        modal.classList.add('active');
    }
}

function closeAddShopModal() {
    const modal = document.getElementById('add-shop-modal');
    if (modal) modal.classList.remove('active');
}

async function handleAddShop(e) {
    e.preventDefault();

    if (!currentLocation) {
        alert('Location required to add a shop');
        return;
    }

    const name = document.getElementById('new-shop-name').value.trim();
    const address = document.getElementById('new-shop-address').value.trim();

    try {
        const response = await fetch('/api/coffeeshops/add', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name,
                address: address || null,
                latitude: currentLocation.lat,
                longitude: currentLocation.lng
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to add shop');
        }

        const newShop = await response.json();
        closeAddShopModal();

        // Add to shops list and refresh
        shops.unshift({ ...newShop, distance: 0 });
        renderShopList();
        addShopMarkers();

        alert(`${name} added successfully! You are now the owner.`);
    } catch (error) {
        alert(error.message);
    }
}

// Claim Shop
async function claimShop(osmId) {
    if (!confirm('Claim this shop as yours? You\'ll be able to manage its menu.')) return;

    try {
        const response = await fetch(`/api/coffeeshops/osm/${osmId}/claim`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to claim shop');
        }

        alert('Shop claimed successfully! You can now manage its menu.');
        renderShopDetail();
    } catch (error) {
        alert(error.message);
    }
}
