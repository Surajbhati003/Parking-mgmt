// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// Global data storage
let customers = [];
let vehicles = [];
let vehicleTypes = [];
let parkingLots = [];
let parkingSpaces = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    updateAuthStatus();
    setupEventListeners();
    
    if (authToken) {
        await loadInitialData();
        showSection('dashboard');
    } else {
        showLoginModal();
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomer);
    document.getElementById('addVehicleForm').addEventListener('submit', handleAddVehicle);
    document.getElementById('entryForm').addEventListener('submit', handleVehicleEntry);

    // Search
    document.getElementById('customerSearch').addEventListener('input', filterCustomers);
    document.getElementById('vehicleSearch').addEventListener('input', filterVehicles);

    // Parking filters
    document.getElementById('lotFilter').addEventListener('change', filterSpaces);
    document.getElementById('typeFilter').addEventListener('change', filterSpaces);

    // Entry form dependencies
    document.getElementById('entryLot').addEventListener('change', loadAvailableSpaces);

    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Authentication Functions
function updateAuthStatus() {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const loginBtn = document.getElementById('loginBtn');
    const navLinks = document.querySelectorAll('.nav-link');

    if (authToken && currentUser.email) {
        userInfo.style.display = 'flex';
        userName.textContent = `${currentUser.email} (${currentUser.role})`;
        loginBtn.style.display = 'none';
        
        // Show navigation
        navLinks.forEach(link => link.style.display = 'flex');
    } else {
        userInfo.style.display = 'none';
        loginBtn.style.display = 'flex';
        
        // Hide navigation
        navLinks.forEach(link => link.style.display = 'none');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success && result.token) {
            authToken = result.token;
            currentUser = result.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateAuthStatus();
            closeLoginModal();
            await loadInitialData();
            showSection('dashboard');
            showToast('Login successful!', 'success');
        } else {
            showToast(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, role })
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Registration successful! Please login.', 'success');
            showLoginForm();
            document.getElementById('registerForm').reset();
        } else {
            showToast(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function logout() {
    authToken = null;
    currentUser = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthStatus();
    showLoginModal();
    showToast('Logged out successfully', 'info');
}

// API Helper Functions
async function makeApiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    // Add user headers for analytics endpoints
    if (currentUser.role) {
        options.headers['user-role'] = currentUser.role;
    }
    if (currentUser.id) {
        options.headers['user-id'] = currentUser.id.toString();
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || result.message || 'API call failed');
    }

    return result;
}

// Data Loading Functions
async function loadInitialData() {
    try {
        showLoading(true);
        
        // Load all necessary data
        await Promise.all([
            loadCustomers(),
            loadVehicles(),
            loadVehicleTypes(),
            loadParkingLots(),
            loadDashboardData()
        ]);
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Error loading data', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadCustomers() {
    try {
        const result = await makeApiCall('/customers');
        customers = result.data || [];
        renderCustomersTable();
        populateCustomerDropdowns();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function loadVehicles() {
    try {
        const result = await makeApiCall('/vehicles');
        vehicles = result.data || [];
        renderVehiclesTable();
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

async function loadVehicleTypes() {
    try {
        const result = await makeApiCall('/parking/vehicle-types');
        vehicleTypes = result.data || [];
        populateVehicleTypeDropdowns();
    } catch (error) {
        console.error('Error loading vehicle types:', error);
    }
}

async function loadParkingLots() {
    try {
        const result = await makeApiCall('/parking/lots');
        parkingLots = result.data || [];
        renderParkingLots();
        populateLotDropdowns();
    } catch (error) {
        console.error('Error loading parking lots:', error);
    }
}

async function loadDashboardData() {
    try {
        // Load dashboard overview
        const dashboardResult = await makeApiCall('/analytics/dashboard');
        if (dashboardResult.success) {
            updateDashboardStats(dashboardResult.data.overview);
        }

        // Load recent activity (for managers)
        if (currentUser.role === 'manager') {
            const activityResult = await makeApiCall('/analytics/manager/activity?limit=10');
            if (activityResult.success) {
                renderRecentActivity(activityResult.data.recent_activities);
            }
        }

        // Load active logs
        const logsResult = await makeApiCall('/parking/logs/active');
        if (logsResult.success) {
            renderActiveLogs(logsResult.data);
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Rendering Functions
function renderCustomersTable() {
    const tbody = document.querySelector('#customersTable tbody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.cust_id}</td>
            <td>${customer.Name}</td>
            <td>${customer.Phone}</td>
            <td>${customer.Gender || 'Not specified'}</td>
            <td>${new Date(customer.created_at).toLocaleDateString()}</td>
            <td class="table-actions">
                <button class="btn-warning btn-sm" onclick="editCustomer(${customer.cust_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger btn-sm" onclick="deleteCustomer(${customer.cust_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderVehiclesTable() {
    const tbody = document.querySelector('#vehiclesTable tbody');
    
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No vehicles found</td></tr>';
        return;
    }

    tbody.innerHTML = vehicles.map(vehicle => `
        <tr>
            <td><strong>${vehicle.license_plate}</strong></td>
            <td>${vehicle.customer_name}</td>
            <td>${vehicle.v_type_name}</td>
            <td>$${vehicle.hourly_rate}/hr</td>
            <td class="table-actions">
                <button class="btn-warning btn-sm" onclick="editVehicle('${vehicle.license_plate}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger btn-sm" onclick="deleteVehicle('${vehicle.license_plate}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderParkingLots() {
    const container = document.getElementById('lotsGrid');
    
    if (parkingLots.length === 0) {
        container.innerHTML = '<div class="loading">No parking lots found</div>';
        return;
    }

    container.innerHTML = parkingLots.map(lot => `
        <div class="lot-card">
            <div class="lot-header">
                <div>
                    <div class="lot-title">${lot.name}</div>
                    <div class="lot-location">${lot.location}</div>
                </div>
                <div class="lot-status available">Available</div>
            </div>
            <div class="lot-stats">
                <div class="lot-stat">
                    <div class="lot-stat-value">${lot.total_spaces}</div>
                    <div class="lot-stat-label">Total Spaces</div>
                </div>
                <div class="lot-stat">
                    <div class="lot-stat-value">0</div>
                    <div class="lot-stat-label">Occupied</div>
                </div>
            </div>
            <button class="btn-primary" onclick="viewLotSpaces(${lot.lot_id})">
                <i class="fas fa-eye"></i> View Spaces
            </button>
        </div>
    `).join('');
}

function renderActiveLogs(logs) {
    const tbody = document.querySelector('#activeLogsTable tbody');
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No active sessions</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const entryTime = new Date(log.entry_time);
        const duration = Math.floor((Date.now() - entryTime.getTime()) / (1000 * 60)); // minutes
        
        return `
            <tr>
                <td><strong>${log.license_plate}</strong></td>
                <td>${log.customer_name}</td>
                <td>${log.lot_name} - Space ${log.space_number}</td>
                <td>${entryTime.toLocaleString()}</td>
                <td>${duration} min</td>
                <td class="table-actions">
                    <button class="btn-danger btn-sm" onclick="logVehicleExit(${log.log_id})">
                        <i class="fas fa-sign-out-alt"></i> Exit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="loading">No recent activity</div>';
        return;
    }

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-info">
                <strong>${activity.license_plate}</strong> - ${activity.customer_name}
                <small>${activity.lot_name} - Space ${activity.space_number}</small>
            </div>
            <div class="activity-status ${activity.status === 'open' ? 'entry' : 'exit'}">
                ${activity.status === 'open' ? 'Entry' : 'Exit'}
            </div>
        </div>
    `).join('');
}

function updateDashboardStats(stats) {
    document.getElementById('totalLots').textContent = stats.total_lots || 0;
    document.getElementById('totalSpaces').textContent = stats.total_spaces || 0;
    document.getElementById('occupiedSpaces').textContent = stats.occupied_spaces || 0;
    document.getElementById('totalCustomers').textContent = stats.total_customers || 0;
    
    // Update occupancy rate
    const occupancyRate = stats.total_spaces > 0 
        ? Math.round((stats.occupied_spaces / stats.total_spaces) * 100)
        : 0;
    
    document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;
    
    // Update occupancy circle
    const circle = document.querySelector('.occupancy-circle');
    const degrees = (occupancyRate / 100) * 360;
    circle.style.background = `conic-gradient(var(--primary-color) ${degrees}deg, var(--border-color) ${degrees}deg)`;
}

// Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-tabs .tab-btn')[0].classList.add('active');
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-tabs .tab-btn')[1].classList.add('active');
}

function showAddCustomerModal() {
    document.getElementById('addCustomerModal').classList.add('show');
}

function closeAddCustomerModal() {
    document.getElementById('addCustomerModal').classList.remove('show');
    document.getElementById('addCustomerForm').reset();
}

function showAddVehicleModal() {
    document.getElementById('addVehicleModal').classList.add('show');
}

function closeAddVehicleModal() {
    document.getElementById('addVehicleModal').classList.remove('show');
    document.getElementById('addVehicleForm').reset();
}

function showEntryModal() {
    document.getElementById('entryModal').classList.add('show');
}

function closeEntryModal() {
    document.getElementById('entryModal').classList.remove('show');
    document.getElementById('entryForm').reset();
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Customer Functions
async function handleAddCustomer(e) {
    e.preventDefault();
    
    const Name = document.getElementById('customerName').value;
    const Phone = document.getElementById('customerPhone').value;
    const Gender = document.getElementById('customerGender').value;

    try {
        showLoading(true);
        await makeApiCall('/customers', 'POST', { Name, Phone, Gender });
        
        showToast('Customer added successfully!', 'success');
        closeAddCustomerModal();
        await loadCustomers();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        showLoading(true);
        await makeApiCall(`/customers/${id}`, 'DELETE');
        
        showToast('Customer deleted successfully!', 'success');
        await loadCustomers();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Vehicle Functions
async function handleAddVehicle(e) {
    e.preventDefault();
    
    const license_plate = document.getElementById('vehiclePlate').value;
    const customer_id = document.getElementById('vehicleCustomer').value;
    const v_type_id = document.getElementById('vehicleType').value;

    try {
        showLoading(true);
        await makeApiCall('/vehicles', 'POST', { license_plate, customer_id, v_type_id });
        
        showToast('Vehicle added successfully!', 'success');
        closeAddVehicleModal();
        await loadVehicles();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteVehicle(licensePlate) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
        showLoading(true);
        await makeApiCall(`/vehicles/${licensePlate}`, 'DELETE');
        
        showToast('Vehicle deleted successfully!', 'success');
        await loadVehicles();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Parking Functions
async function handleVehicleEntry(e) {
    e.preventDefault();
    
    const license_plate = document.getElementById('entryPlate').value;
    const space_id = document.getElementById('entrySpace').value;

    try {
        showLoading(true);
        await makeApiCall('/parking/entry', 'POST', { license_plate, space_id });
        
        showToast('Vehicle entry logged successfully!', 'success');
        closeEntryModal();
        await loadDashboardData();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function logVehicleExit(logId) {
    if (!confirm('Are you sure you want to log this vehicle exit?')) return;

    try {
        showLoading(true);
        await makeApiCall('/parking/exit', 'POST', { log_id: logId });
        
        showToast('Vehicle exit logged successfully!', 'success');
        await loadDashboardData();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadAvailableSpaces() {
    const lotId = document.getElementById('entryLot').value;
    const spaceSelect = document.getElementById('entrySpace');
    
    if (!lotId) {
        spaceSelect.innerHTML = '<option value="">Select Available Space</option>';
        return;
    }

    try {
        // For simplicity, we'll load all spaces for the lot and filter available ones
        const result = await makeApiCall(`/parking/spaces/lot/${lotId}`);
        const availableSpaces = result.data.filter(space => !space.is_occupied);
        
        spaceSelect.innerHTML = '<option value="">Select Available Space</option>' +
            availableSpaces.map(space => 
                `<option value="${space.space_id}">Space ${space.space_number}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading available spaces:', error);
    }
}

function viewLotSpaces(lotId) {
    showSection('parking');
    showParkingTab('spaces');
    document.getElementById('lotFilter').value = lotId;
    filterSpaces();
}

// Utility Functions
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Show section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    // Load section-specific data
    if (sectionName === 'dashboard') {
        loadDashboardData();
    } else if (sectionName === 'customers') {
        loadCustomers();
    } else if (sectionName === 'vehicles') {
        loadVehicles();
    } else if (sectionName === 'parking') {
        loadParkingLots();
    }
}

function showParkingTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.parking-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show tab content
    document.querySelectorAll('.parking-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`parking${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

    if (tabName === 'logs') {
        loadDashboardData(); // This will reload active logs
    }
}

function filterCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const filteredCustomers = customers.filter(customer => 
        customer.Name.toLowerCase().includes(searchTerm) ||
        customer.Phone.includes(searchTerm)
    );
    
    const tbody = document.querySelector('#customersTable tbody');
    tbody.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td>${customer.cust_id}</td>
            <td>${customer.Name}</td>
            <td>${customer.Phone}</td>
            <td>${customer.Gender || 'Not specified'}</td>
            <td>${new Date(customer.created_at).toLocaleDateString()}</td>
            <td class="table-actions">
                <button class="btn-warning btn-sm" onclick="editCustomer(${customer.cust_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger btn-sm" onclick="deleteCustomer(${customer.cust_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterVehicles() {
    const searchTerm = document.getElementById('vehicleSearch').value.toLowerCase();
    const filteredVehicles = vehicles.filter(vehicle => 
        vehicle.license_plate.toLowerCase().includes(searchTerm) ||
        vehicle.customer_name.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.querySelector('#vehiclesTable tbody');
    tbody.innerHTML = filteredVehicles.map(vehicle => `
        <tr>
            <td><strong>${vehicle.license_plate}</strong></td>
            <td>${vehicle.customer_name}</td>
            <td>${vehicle.v_type_name}</td>
            <td>$${vehicle.hourly_rate}/hr</td>
            <td class="table-actions">
                <button class="btn-warning btn-sm" onclick="editVehicle('${vehicle.license_plate}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger btn-sm" onclick="deleteVehicle('${vehicle.license_plate}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterSpaces() {
    // This would filter parking spaces based on lot and type
    // Implementation depends on your specific requirements
}

function populateCustomerDropdowns() {
    const select = document.getElementById('vehicleCustomer');
    select.innerHTML = '<option value="">Select Customer</option>' +
        customers.map(customer => 
            `<option value="${customer.cust_id}">${customer.Name} (${customer.Phone})</option>`
        ).join('');
}

function populateVehicleTypeDropdowns() {
    const select = document.getElementById('vehicleType');
    select.innerHTML = '<option value="">Select Vehicle Type</option>' +
        vehicleTypes.map(type => 
            `<option value="${type.v_type_id}">${type.v_type_name} ($${type.hourly_rate}/hr)</option>`
        ).join('');
}

function populateLotDropdowns() {
    const select = document.getElementById('entryLot');
    select.innerHTML = '<option value="">Select Parking Lot</option>' +
        parkingLots.map(lot => 
            `<option value="${lot.lot_id}">${lot.name} - ${lot.location}</option>`
        ).join('');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// Placeholder functions for edit operations
function editCustomer(id) {
    showToast('Edit customer functionality coming soon!', 'info');
}

function editVehicle(licensePlate) {
    showToast('Edit vehicle functionality coming soon!', 'info');
}

function applyDateFilter() {
    showToast('Date filter functionality coming soon!', 'info');
}