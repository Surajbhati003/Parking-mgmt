// Manager Dashboard Application

class ManagerApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.searchTimeout = null;
        this.updateInterval = null;
    }

    init() {
        if (!authManager.requireRole('manager')) return;
        
        this.setupEventListeners();
        this.initializeData();
        this.startPeriodicUpdates();
        this.showSection('dashboard');
        
        Utils.showToast('Manager dashboard loaded successfully', 'success');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                Utils.toggleTheme();
            });
        }

        // Vehicle management buttons
        const vehicleEntryBtn = document.getElementById('vehicle-entry-btn');
        const vehicleExitBtn = document.getElementById('vehicle-exit-btn');
        
        if (vehicleEntryBtn) {
            vehicleEntryBtn.addEventListener('click', () => this.showVehicleEntryModal());
        }
        
        if (vehicleExitBtn) {
            vehicleExitBtn.addEventListener('click', () => this.showVehicleExitModal());
        }

        // Customer management
        const addCustomerBtn = document.getElementById('add-customer-btn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => this.showAddCustomerModal());
        }

        // Search functionality
        const vehicleSearch = document.getElementById('vehicle-search');
        const customerSearch = document.getElementById('customer-search');
        
        if (vehicleSearch) {
            vehicleSearch.addEventListener('input', Utils.debounce((e) => {
                this.searchVehicles(e.target.value);
            }, 300));
        }
        
        if (customerSearch) {
            customerSearch.addEventListener('input', Utils.debounce((e) => {
                this.searchCustomers(e.target.value);
            }, 300));
        }

        // Modal close
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => Utils.hideModal());
        }

        // Analytics period change
        const analyticsPeriod = document.getElementById('analytics-period');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', (e) => {
                this.updateAnalytics(e.target.value);
            });
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'vehicles':
                this.updateVehiclesTable();
                break;
            case 'customers':
                this.updateCustomersGrid();
                break;
            case 'parking':
                this.updateParkingLot();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
        }
    }

    initializeData() {
        // Update current date
        const currentDate = document.getElementById('current-date');
        if (currentDate) {
            currentDate.textContent = Utils.formatDate(new Date());
        }

        // Initialize theme
        Utils.initTheme();
    }

    startPeriodicUpdates() {
        // Update dashboard stats every 30 seconds
        this.updateInterval = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.updateDashboard();
            }
        }, 30000);
    }

    updateDashboard() {
        const stats = dataManager.getDashboardStats();
        
        // Update stat cards with animation
        Utils.animateValue(document.getElementById('occupied-spaces'), 0, stats.occupiedSpaces);
        Utils.animateValue(document.getElementById('available-spaces'), 0, stats.availableSpaces);
        Utils.animateValue(document.getElementById('total-customers'), 0, stats.totalCustomers);
        
        const revenueElement = document.getElementById('daily-revenue');
        if (revenueElement) {
            revenueElement.textContent = Utils.formatCurrency(stats.dailyRevenue);
        }

        // Update recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activities = dataManager.getRecentActivity(8);
        const activityList = document.getElementById('recent-activity-list');
        
        if (!activityList) return;

        if (activities.length === 0) {
            activityList.innerHTML = '<p class="text-center text-secondary">No recent activity</p>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item fade-in">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-details">
                    <p class="activity-title">${activity.title}</p>
                    <p class="activity-subtitle">${activity.subtitle}</p>
                </div>
                <div class="activity-time">
                    ${Utils.formatTime(new Date(activity.time))}
                </div>
            </div>
        `).join('');
    }

    updateVehiclesTable() {
        const activeSessions = dataManager.getActiveSessions();
        const vehicles = dataManager.getVehicles();
        const customers = dataManager.getCustomers();
        const tbody = document.getElementById('vehicles-tbody');
        
        if (!tbody) return;

        if (activeSessions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No active parking sessions</td></tr>';
            return;
        }

        tbody.innerHTML = activeSessions.map(session => {
            const vehicle = vehicles.find(v => v.id === session.vehicleId);
            const customer = customers.find(c => c.id === session.customerId);
            const duration = Utils.calculateDuration(new Date(session.entryTime));
            
            return `
                <tr>
                    <td><strong>${vehicle?.licensePlate || 'N/A'}</strong></td>
                    <td>${customer?.name || 'N/A'}</td>
                    <td>${Utils.formatDateTime(new Date(session.entryTime))}</td>
                    <td>Space ${session.spaceId.replace('space_', '')}</td>
                    <td><span class="status-badge active">${duration}</span></td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="managerApp.processExit('${session.id}')">
                            Process Exit
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateCustomersGrid() {
        const customers = dataManager.getCustomers();
        const vehicles = dataManager.getVehicles();
        const grid = document.getElementById('customers-grid');
        
        if (!grid) return;

        if (customers.length === 0) {
            grid.innerHTML = '<p class="text-center">No customers registered yet</p>';
            return;
        }

        grid.innerHTML = customers.map(customer => {
            const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
            const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return `
                <div class="customer-card fade-in">
                    <div class="customer-header">
                        <div class="customer-avatar">${initials}</div>
                        <div class="customer-info">
                            <h4>${customer.name}</h4>
                            <p>${customer.email}</p>
                        </div>
                    </div>
                    <div class="customer-vehicles">
                        <h5>Vehicles (${customerVehicles.length})</h5>
                        ${customerVehicles.map(vehicle => 
                            `<span class="vehicle-tag">${vehicle.licensePlate}</span>`
                        ).join('')}
                    </div>
                    <div class="customer-actions">
                        <button class="btn btn-primary btn-sm" onclick="managerApp.editCustomer('${customer.id}')">
                            Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="managerApp.addVehicleToCustomer('${customer.id}')">
                            Add Vehicle
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateParkingLot() {
        const spaces = dataManager.getParkingSpaces();
        const parkingLot = document.getElementById('parking-lot');
        
        if (!parkingLot) return;

        parkingLot.innerHTML = spaces.map(space => `
            <div class="parking-space ${space.status}" 
                 onclick="managerApp.showSpaceDetails('${space.id}')"
                 title="${space.status === 'occupied' ? 
                    `${space.customer?.name} - ${space.vehicle?.licensePlate}` : 
                    'Available'
                 }">
                ${space.number}
            </div>
        `).join('');
    }

    updateAnalytics(period = 'daily') {
        // Update revenue chart
        const revenueData = dataManager.getRevenueData(period);
        const revenueCanvas = document.getElementById('revenue-chart');
        if (revenueCanvas) {
            Utils.createChart(revenueCanvas, 'line', revenueData);
        }

        // Update peak hours chart
        const peakHoursData = dataManager.getPeakHoursData();
        const peakHoursCanvas = document.getElementById('peak-hours-chart');
        if (peakHoursCanvas) {
            Utils.createChart(peakHoursCanvas, 'bar', peakHoursData);
        }

        // Update summary stats
        this.updateAnalyticsSummary();
    }

    updateAnalyticsSummary() {
        const sessions = dataManager.getParkingSessions().filter(s => s.exitTime);
        
        if (sessions.length === 0) return;

        // Calculate average duration
        const totalDuration = sessions.reduce((sum, session) => {
            return sum + Utils.calculateDetailedDuration(
                new Date(session.entryTime), 
                new Date(session.exitTime)
            );
        }, 0);
        const avgDuration = totalDuration / sessions.length;
        
        const avgDurationElement = document.getElementById('avg-duration');
        if (avgDurationElement) {
            avgDurationElement.textContent = `${avgDuration.toFixed(1)} hours`;
        }

        // Find peak hour
        const peakHoursData = dataManager.getPeakHoursData();
        const peakHourIndex = peakHoursData.values.indexOf(Math.max(...peakHoursData.values));
        const peakHourElement = document.getElementById('peak-hour');
        if (peakHourElement) {
            peakHourElement.textContent = peakHoursData.labels[peakHourIndex];
        }

        // Calculate retention rate (customers with more than 1 visit)
        const customerSessions = Utils.groupBy(sessions, 'customerId');
        const returningCustomers = Object.values(customerSessions).filter(sessions => sessions.length > 1).length;
        const totalCustomers = Object.keys(customerSessions).length;
        const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers * 100) : 0;
        
        const retentionElement = document.getElementById('retention-rate');
        if (retentionElement) {
            retentionElement.textContent = `${retentionRate.toFixed(0)}%`;
        }
    }

    showVehicleEntryModal() {
        const customers = dataManager.getCustomers();
        const availableSpaces = dataManager.getAvailableSpaces();
        
        if (availableSpaces.length === 0) {
            Utils.showToast('No available parking spaces', 'error');
            return;
        }

        const content = `
            <form id="vehicle-entry-form" class="modal-form">
                <div class="form-group">
                    <label for="entry-customer">Customer</label>
                    <select id="entry-customer" required>
                        <option value="">Select Customer</option>
                        ${customers.map(customer => 
                            `<option value="${customer.id}">${customer.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="entry-vehicle">Vehicle</label>
                    <select id="entry-vehicle" required disabled>
                        <option value="">Select Vehicle</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="entry-space">Parking Space</label>
                    <select id="entry-space" required>
                        <option value="">Auto-assign</option>
                        ${availableSpaces.slice(0, 10).map(space => 
                            `<option value="${space.id}">Space ${space.number}</option>`
                        ).join('')}
                    </select>
                </div>
            </form>
        `;

        Utils.showModal('Vehicle Entry', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Process Entry',
                class: 'btn-primary',
                handler: () => this.processVehicleEntry()
            }
        ]);

        // Setup customer change handler
        document.getElementById('entry-customer').addEventListener('change', (e) => {
            this.loadCustomerVehicles(e.target.value, 'entry-vehicle');
        });
    }

    loadCustomerVehicles(customerId, selectId) {
        const select = document.getElementById(selectId);  
        const vehicles = dataManager.getCustomerVehicles(customerId);
        
        select.innerHTML = '<option value="">Select Vehicle</option>';
        
        if (vehicles.length > 0) {
            select.disabled = false;
            vehicles.forEach(vehicle => {
                select.innerHTML += `<option value="${vehicle.id}">${vehicle.licensePlate} - ${vehicle.make} ${vehicle.model}</option>`;
            });
        } else {
            select.disabled = true;
            select.innerHTML += '<option value="">No vehicles registered</option>';
        }
    }

    processVehicleEntry() {
        const customerId = document.getElementById('entry-customer').value;
        const vehicleId = document.getElementById('entry-vehicle').value;
        let spaceId = document.getElementById('entry-space').value;

        if (!customerId || !vehicleId) {
            Utils.showToast('Please select customer and vehicle', 'error');
            return;
        }

        // Auto-assign space if not selected
        if (!spaceId) {
            const availableSpace = dataManager.findAvailableSpace();
            if (!availableSpace) {
                Utils.showToast('No available parking spaces', 'error');
                return;
            }
            spaceId = availableSpace.id;
        }

        const session = dataManager.startParkingSession(vehicleId, spaceId);
        if (session) {
            Utils.hideModal();
            Utils.showToast('Vehicle entry processed successfully', 'success');
            this.updateDashboard();
            if (this.currentSection === 'vehicles') {
                this.updateVehiclesTable();
            }
            if (this.currentSection === 'parking') {
                this.updateParkingLot();
            }
        } else {
            Utils.showToast('Failed to process vehicle entry', 'error');
        }
    }

    showVehicleExitModal() {
        const activeSessions = dataManager.getActiveSessions();
        
        if (activeSessions.length === 0) {
            Utils.showToast('No active parking sessions', 'error');
            return;
        }

        const vehicles = dataManager.getVehicles();
        const customers = dataManager.getCustomers();

        const content = `
            <form id="vehicle-exit-form" class="modal-form">
                <div class="form-group">
                    <label for="exit-session">Active Session</label>
                    <select id="exit-session" required>
                        <option value="">Select Session</option>
                        ${activeSessions.map(session => {
                            const vehicle = vehicles.find(v => v.id === session.vehicleId);
                            const customer = customers.find(c => c.id === session.customerId);
                            const duration = Utils.calculateDuration(new Date(session.entryTime));
                            
                            return `<option value="${session.id}">
                                ${vehicle?.licensePlate} - ${customer?.name} (${duration})
                            </option>`;
                        }).join('')}
                    </select>
                </div>
                <div id="exit-details" class="mt-3"></div>
            </form>
        `;

        Utils.showModal('Vehicle Exit', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Process Exit',
                class: 'btn-primary',
                handler: () => this.processVehicleExit()
            }
        ]);

        // Setup session change handler
        document.getElementById('exit-session').addEventListener('change', (e) => {
            this.showExitDetails(e.target.value);
        });
    }

    showExitDetails(sessionId) {
        const detailsDiv = document.getElementById('exit-details');
        if (!sessionId) {
            detailsDiv.innerHTML = '';
            return;
        }

        const sessions = dataManager.getActiveSessions();
        const session = sessions.find(s => s.id === sessionId);
        const vehicle = dataManager.findVehicle(session.vehicleId);
        const customer = dataManager.findCustomer(session.customerId);
        
        const entryTime = new Date(session.entryTime);
        const duration = Utils.calculateDetailedDuration(entryTime);
        const fee = Utils.calculateParkingFee(duration);

        detailsDiv.innerHTML = `
            <div class="exit-summary">
                <h4>Exit Summary</h4>
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Vehicle:</strong> ${vehicle.licensePlate}</p>
                <p><strong>Entry Time:</strong> ${Utils.formatDateTime(entryTime)}</p>
                <p><strong>Duration:</strong> ${Utils.calculateDuration(entryTime)}</p>
                <p><strong>Parking Fee:</strong> <span style="color: var(--primary); font-weight: bold;">${Utils.formatCurrency(fee)}</span></p>
            </div>
        `;
    }

    processVehicleExit() {
        const sessionId = document.getElementById('exit-session').value;
        
        if (!sessionId) {
            Utils.showToast('Please select a session', 'error');
            return;
        }

        const completedSession = dataManager.endParkingSession(sessionId);
        if (completedSession) {
            Utils.hideModal();
            Utils.showToast(`Vehicle exit processed. Fee: ${Utils.formatCurrency(completedSession.fee)}`, 'success');
            this.updateDashboard();
            if (this.currentSection === 'vehicles') {
                this.updateVehiclesTable();
            }
            if (this.currentSection === 'parking') {
                this.updateParkingLot();
            }
        } else {
            Utils.showToast('Failed to process vehicle exit', 'error');
        }
    }

    processExit(sessionId) {
        const completedSession = dataManager.endParkingSession(sessionId);
        if (completedSession) {
            Utils.showToast(`Vehicle exit processed. Fee: ${Utils.formatCurrency(completedSession.fee)}`, 'success');
            this.updateVehiclesTable();
            this.updateDashboard();
            if (this.currentSection === 'parking') {
                this.updateParkingLot();
            }
        } else {
            Utils.showToast('Failed to process vehicle exit', 'error');
        }
    }

    showAddCustomerModal() {
        const content = `
            <form id="add-customer-form" class="modal-form">
                <div class="form-group">
                    <label for="customer-name">Full Name</label>
                    <input type="text" id="customer-name" required placeholder="Enter full name">
                </div>
                <div class="form-group">
                    <label for="customer-email">Email</label>
                    <input type="email" id="customer-email" required placeholder="Enter email address">
                </div>
                <div class="form-group">
                    <label for="customer-phone">Phone</label>
                    <input type="tel" id="customer-phone" required placeholder="Enter phone number">
                </div>
                <hr>
                <h4>Vehicle Information</h4>
                <div class="form-group">
                    <label for="vehicle-plate">License Plate</label>
                    <input type="text" id="vehicle-plate" required placeholder="Enter license plate">
                </div>
                <div class="form-group">
                    <label for="vehicle-make">Make</label>
                    <input type="text" id="vehicle-make" required placeholder="e.g., Toyota, Honda">
                </div>
                <div class="form-group">
                    <label for="vehicle-model">Model</label>
                    <input type="text" id="vehicle-model" required placeholder="e.g., Camry, Civic">
                </div>
                <div class="form-group">
                    <label for="vehicle-color">Color</label>
                    <input type="text" id="vehicle-color" required placeholder="e.g., Black, White">
                </div>
            </form>
        `;

        Utils.showModal('Add New Customer', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Add Customer',
                class: 'btn-primary',
                handler: () => this.addNewCustomer()
            }
        ]);
    }

    addNewCustomer() {
        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const licensePlate = document.getElementById('vehicle-plate').value.trim();
        const make = document.getElementById('vehicle-make').value.trim();
        const model = document.getElementById('vehicle-model').value.trim();
        const color = document.getElementById('vehicle-color').value.trim();

        // Validation
        if (!name || !email || !phone || !licensePlate || !make || !model || !color) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!Utils.validateLicensePlate(licensePlate)) {
            Utils.showToast('Please enter a valid license plate', 'error');
            return;
        }

        // Check if license plate already exists
        const existingVehicle = dataManager.findVehicleByPlate(licensePlate);
        if (existingVehicle) {
            Utils.showToast('A vehicle with this license plate already exists', 'error');
            return;
        }

        // Create customer
        const customer = dataManager.addCustomer({
            name: name,
            email: email,
            phone: phone
        });

        // Create vehicle
        const vehicle = dataManager.addVehicle({
            customerId: customer.id,
            licensePlate: Utils.formatLicensePlate(licensePlate),
            make: make,
            model: model,
            color: color
        });

        Utils.hideModal();
        Utils.showToast('Customer and vehicle added successfully', 'success');
        
        if (this.currentSection === 'customers') {
            this.updateCustomersGrid();
        }
    }

    editCustomer(customerId) {
        const customer = dataManager.findCustomer(customerId);
        if (!customer) return;

        const content = `
            <form id="edit-customer-form" class="modal-form">
                <div class="form-group">
                    <label for="edit-customer-name">Full Name</label>
                    <input type="text" id="edit-customer-name" required value="${customer.name}">
                </div>
                <div class="form-group">
                    <label for="edit-customer-email">Email</label>
                    <input type="email" id="edit-customer-email" required value="${customer.email}">
                </div>
                <div class="form-group">
                    <label for="edit-customer-phone">Phone</label>
                    <input type="tel" id="edit-customer-phone" required value="${customer.phone}">
                </div>
            </form>
        `;

        Utils.showModal('Edit Customer', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Delete Customer',
                class: 'btn-error',
                handler: () => this.confirmDeleteCustomer(customerId)
            },
            {
                text: 'Save Changes',
                class: 'btn-primary',
                handler: () => this.saveCustomerChanges(customerId)
            }
        ]);
    }

    saveCustomerChanges(customerId) {
        const name = document.getElementById('edit-customer-name').value.trim();
        const email = document.getElementById('edit-customer-email').value.trim();
        const phone = document.getElementById('edit-customer-phone').value.trim();

        if (!name || !email || !phone) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        const updatedCustomer = dataManager.updateCustomer(customerId, {
            name: name,
            email: email,
            phone: phone
        });

        if (updatedCustomer) {
            Utils.hideModal();
            Utils.showToast('Customer updated successfully', 'success');
            this.updateCustomersGrid();
        } else {
            Utils.showToast('Failed to update customer', 'error');
        }
    }

    confirmDeleteCustomer(customerId) {
        Utils.showModal('Confirm Delete', 
            '<p>Are you sure you want to delete this customer? This action cannot be undone and will also delete all associated vehicles.</p>',
            [
                {
                    text: 'Cancel',
                    class: 'btn-ghost',
                    handler: () => Utils.hideModal()
                },
                {
                    text: 'Delete',
                    class: 'btn-error',
                    handler: () => this.deleteCustomer(customerId)
                }
            ]
        );
    }

    deleteCustomer(customerId) {
        const success = dataManager.deleteCustomer(customerId);
        if (success) {
            Utils.hideModal();
            Utils.showToast('Customer deleted successfully', 'success');
            this.updateCustomersGrid();
        } else {
            Utils.showToast('Failed to delete customer', 'error');
        }
    }

    addVehicleToCustomer(customerId) {
        const customer = dataManager.findCustomer(customerId);
        if (!customer) return;

        const content = `
            <form id="add-vehicle-form" class="modal-form">
                <p><strong>Adding vehicle for:</strong> ${customer.name}</p>
                <div class="form-group">
                    <label for="new-vehicle-plate">License Plate</label>
                    <input type="text" id="new-vehicle-plate" required placeholder="Enter license plate">
                </div>
                <div class="form-group">
                    <label for="new-vehicle-make">Make</label>
                    <input type="text" id="new-vehicle-make" required placeholder="e.g., Toyota, Honda">
                </div>
                <div class="form-group">
                    <label for="new-vehicle-model">Model</label>
                    <input type="text" id="new-vehicle-model" required placeholder="e.g., Camry, Civic">
                </div>
                <div class="form-group">
                    <label for="new-vehicle-color">Color</label>
                    <input type="text" id="new-vehicle-color" required placeholder="e.g., Black, White">
                </div>
            </form>
        `;

        Utils.showModal('Add Vehicle', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Add Vehicle',
                class: 'btn-primary',
                handler: () => this.saveNewVehicle(customerId)
            }
        ]);
    }

    saveNewVehicle(customerId) {
        const licensePlate = document.getElementById('new-vehicle-plate').value.trim();
        const make = document.getElementById('new-vehicle-make').value.trim();
        const model = document.getElementById('new-vehicle-model').value.trim();
        const color = document.getElementById('new-vehicle-color').value.trim();

        if (!licensePlate || !make || !model || !color) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.validateLicensePlate(licensePlate)) {
            Utils.showToast('Please enter a valid license plate', 'error');
            return;
        }

        // Check if license plate already exists
        const existingVehicle = dataManager.findVehicleByPlate(licensePlate);
        if (existingVehicle) {
            Utils.showToast('A vehicle with this license plate already exists', 'error');
            return;
        }

        const vehicle = dataManager.addVehicle({
            customerId: customerId,
            licensePlate: Utils.formatLicensePlate(licensePlate),
            make: make,
            model: model,
            color: color
        });

        if (vehicle) {
            Utils.hideModal();
            Utils.showToast('Vehicle added successfully', 'success');
            this.updateCustomersGrid();
        } else {
            Utils.showToast('Failed to add vehicle', 'error');
        }
    }

    showSpaceDetails(spaceId) {
        const spaces = dataManager.getParkingSpaces();
        const space = spaces.find(s => s.id === spaceId);
        
        if (!space) return;

        let content = `<div class="space-details">
            <h4>Space ${space.number}</h4>
            <p><strong>Status:</strong> <span class="status-badge ${space.status}">${Utils.capitalize(space.status)}</span></p>
        `;

        if (space.status === 'occupied' && space.customer && space.vehicle) {
            const activeSessions = dataManager.getActiveSessions();
            const session = activeSessions.find(s => s.spaceId === spaceId);
            const duration = session ? Utils.calculateDuration(new Date(session.entryTime)) : 'N/A';
            
            content += `
                <p><strong>Customer:</strong> ${space.customer.name}</p>
                <p><strong>Vehicle:</strong> ${space.vehicle.licensePlate}</p>
                <p><strong>Duration:</strong> ${duration}</p>
            `;
        }

        content += '</div>';

        const actions = space.status === 'occupied' ? [
            {
                text: 'Close',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Process Exit',
                class: 'btn-warning',
                handler: () => {
                    Utils.hideModal();
                    const activeSessions = dataManager.getActiveSessions();
                    const session = activeSessions.find(s => s.spaceId === spaceId);
                    if (session) {
                        this.processExit(session.id);
                    }
                }
            }
        ] : [
            {
                text: 'Close',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            }
        ];

        Utils.showModal(`Space ${space.number} Details`, content, actions);
    }

    searchVehicles(query) {
        // Implementation would filter the vehicles table based on query
        // For brevity, just show a toast
        if (query) {
            Utils.showToast(`Searching for: ${query}`, 'info');
        }
    }

    searchCustomers(query) {
        if (!query) {
            this.updateCustomersGrid();
            return;
        }

        const customers = dataManager.searchCustomers(query);
        const vehicles = dataManager.getVehicles();
        const grid = document.getElementById('customers-grid');
        
        if (!grid) return;

        if (customers.length === 0) {
            grid.innerHTML = '<p class="text-center">No customers found</p>';
            return;
        }

        grid.innerHTML = customers.map(customer => {
            const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
            const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return `
                <div class="customer-card fade-in">
                    <div class="customer-header">
                        <div class="customer-avatar">${initials}</div>
                        <div class="customer-info">
                            <h4>${customer.name}</h4>
                            <p>${customer.email}</p>
                        </div>
                    </div>
                    <div class="customer-vehicles">
                        <h5>Vehicles (${customerVehicles.length})</h5>
                        ${customerVehicles.map(vehicle => 
                            `<span class="vehicle-tag">${vehicle.licensePlate}</span>`
                        ).join('')}
                    </div>
                    <div class="customer-actions">
                        <button class="btn btn-primary btn-sm" onclick="managerApp.editCustomer('${customer.id}')">
                            Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="managerApp.addVehicleToCustomer('${customer.id}')">
                            Add Vehicle
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Create global instance
window.managerApp = new ManagerApp();