// Admin Dashboard Application

class AdminApp {
    constructor() {
        this.currentSection = 'admin-overview';
    }

    init() {
        if (!authManager.requireRole('admin')) return;
        
        this.setupEventListeners();
        this.initializeData();
        this.showSection('admin-overview');
        
        Utils.showToast('Admin dashboard loaded successfully', 'success');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('#admin-screen .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('admin-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                Utils.toggleTheme();
            });
        }

        // Add lot button
        const addLotBtn = document.getElementById('add-lot-btn');
        if (addLotBtn) {
            addLotBtn.addEventListener('click', () => this.showAddLotModal());
        }

        // Add manager button
        const addManagerBtn = document.getElementById('add-manager-btn');
        if (addManagerBtn) {
            addManagerBtn.addEventListener('click', () => this.showAddManagerModal());
        }

        // Report generation buttons
        document.querySelectorAll('.report-card button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.closest('.report-card').querySelector('h4').textContent;
                this.generateReport(reportType);
            });
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('#admin-screen .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`#admin-screen [data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('#admin-screen .content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'admin-overview':
                this.updateOverview();
                break;
            case 'lots':
                this.updateLotsList();
                break;
            case 'managers':
                this.updateManagersTable();
                break;
            case 'admin-analytics':
                this.updateSystemAnalytics();
                break;
            case 'reports':
                // Reports section is static
                break;
        }
    }

    initializeData() {
        Utils.initTheme();
    }

    updateOverview() {
        // Update lots performance
        this.updateLotsPerformance();
        this.updateSystemAnalytics();
    }

    updateLotsPerformance() {
        const lots = dataManager.getLots();
        const performanceDiv = document.getElementById('lots-performance');
        
        if (!performanceDiv) return;

        performanceDiv.innerHTML = lots.map(lot => {
            const occupancyRate = (lot.occupiedSpaces / lot.totalSpaces * 100).toFixed(0);
            const performance = lot.occupiedSpaces / lot.totalSpaces * 100;
            
            return `
                <div class="lot-card">
                    <h5>${lot.name}</h5>
                    <div class="lot-metrics">
                        <span>Occupancy: ${occupancyRate}%</span>
                        <span>Revenue: ${Utils.formatCurrency(lot.revenue)}</span>
                    </div>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${performance}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateLotsList() {
        const lots = dataManager.getLots();
        const managers = dataManager.getManagers();
        const lotsList = document.getElementById('lots-list');
        
        if (!lotsList) return;

        lotsList.innerHTML = lots.map(lot => {
            const manager = managers.find(m => m.id === lot.managerId);
            const occupancyRate = (lot.occupiedSpaces / lot.totalSpaces * 100).toFixed(0);
            
            return `
                <div class="lot-item">
                    <div class="lot-info">
                        <h4>${lot.name}</h4>
                        <p>${lot.address}</p>
                        <p><strong>Manager:</strong> ${manager ? manager.name : 'Unassigned'}</p>
                    </div>
                    <div class="lot-stats">
                        <div class="lot-stat">
                            <div class="stat-value">${lot.totalSpaces}</div>
                            <div class="stat-label">Total Spaces</div>
                        </div>
                        <div class="lot-stat">
                            <div class="stat-value">${occupancyRate}%</div>
                            <div class="stat-label">Occupied</div>
                        </div>
                        <div class="lot-stat">
                            <div class="stat-value">${Utils.formatCurrency(lot.revenue)}</div>
                            <div class="stat-label">Revenue</div>
                        </div>
                    </div>
                    <div class="lot-actions">
                        <button class="btn btn-primary btn-sm" onclick="adminApp.editLot('${lot.id}')">
                            Edit
                        </button>
                        <span class="status-badge ${lot.status}">${Utils.capitalize(lot.status)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateManagersTable() {
        const managers = dataManager.getManagers();
        const lots = dataManager.getLots();
        const tbody = document.getElementById('managers-tbody');
        
        if (!tbody) return;

        tbody.innerHTML = managers.map(manager => {
            const lot = lots.find(l => l.managerId === manager.id);
            
            return `
                <tr>
                    <td><strong>${manager.name}</strong></td>
                    <td>${manager.email}</td>
                    <td>${lot ? lot.name : 'Unassigned'}</td>
                    <td>
                        <div class="performance-bar" style="width: 100px; height: 8px;">
                            <div class="performance-fill" style="width: ${manager.performance}%"></div>
                        </div>
                        <span class="ml-2">${manager.performance}%</span>
                    </td>
                    <td><span class="status-badge ${manager.status}">${Utils.capitalize(manager.status)}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="adminApp.editManager('${manager.id}')">
                            Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateSystemAnalytics() {
        // Update cross-lot revenue chart
        const lots = dataManager.getLots();
        const revenueData = {
            labels: lots.map(lot => lot.name),
            values: lots.map(lot => lot.revenue)
        };
        
        const revenueCanvas = document.getElementById('cross-lot-revenue-chart');
        if (revenueCanvas) {
            Utils.createChart(revenueCanvas, 'bar', revenueData);
        }

        // Update occupancy trends chart
        const occupancyData = {
            labels: lots.map(lot => lot.name),
            values: lots.map(lot => (lot.occupiedSpaces / lot.totalSpaces * 100))
        };
        
        const occupancyCanvas = document.getElementById('occupancy-trends-chart');
        if (occupancyCanvas) {
            Utils.createChart(occupancyCanvas, 'line', occupancyData);
        }
    }

    showAddLotModal() {
        const managers = dataManager.getManagers().filter(m => m.status === 'active');
        
        const content = `
            <form id="add-lot-form" class="modal-form">
                <div class="form-group">
                    <label for="lot-name">Lot Name</label>
                    <input type="text" id="lot-name" required placeholder="Enter lot name">
                </div>
                <div class="form-group">
                    <label for="lot-address">Address</label>
                    <input type="text" id="lot-address" required placeholder="Enter full address">
                </div>
                <div class="form-group">
                    <label for="lot-spaces">Total Spaces</label>
                    <input type="number" id="lot-spaces" required min="1" placeholder="Enter number of spaces">
                </div>
                <div class="form-group">
                    <label for="lot-manager">Assign Manager</label>
                    <select id="lot-manager">
                        <option value="">Select Manager (Optional)</option>
                        ${managers.map(manager => 
                            `<option value="${manager.id}">${manager.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </form>
        `;

        Utils.showModal('Add New Parking Lot', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Add Lot',
                class: 'btn-primary',
                handler: () => this.addNewLot()
            }
        ]);
    }

    addNewLot() {
        const name = document.getElementById('lot-name').value.trim();
        const address = document.getElementById('lot-address').value.trim();
        const totalSpaces = parseInt(document.getElementById('lot-spaces').value);
        const managerId = document.getElementById('lot-manager').value;

        if (!name || !address || !totalSpaces) {
            Utils.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (totalSpaces < 1) {
            Utils.showToast('Total spaces must be at least 1', 'error');
            return;
        }

        const lot = dataManager.addLot({
            name: name,
            address: address,
            totalSpaces: totalSpaces,
            occupiedSpaces: 0,
            managerId: managerId || null,
            revenue: 0,
            status: 'active'
        });

        if (lot) {
            Utils.hideModal();
            Utils.showToast('Parking lot added successfully', 'success');
            if (this.currentSection === 'lots') {
                this.updateLotsList();
            }
            if (this.currentSection === 'admin-overview') {
                this.updateLotsPerformance();
            }
        } else {
            Utils.showToast('Failed to add parking lot', 'error');
        }
    }

    editLot(lotId) {
        const lots = dataManager.getLots();
        const lot = lots.find(l => l.id === lotId);
        const managers = dataManager.getManagers().filter(m => m.status === 'active');
        
        if (!lot) return;

        const content = `
            <form id="edit-lot-form" class="modal-form">
                <div class="form-group">
                    <label for="edit-lot-name">Lot Name</label>
                    <input type="text" id="edit-lot-name" required value="${lot.name}">
                </div>
                <div class="form-group">
                    <label for="edit-lot-address">Address</label>
                    <input type="text" id="edit-lot-address" required value="${lot.address}">
                </div>
                <div class="form-group">
                    <label for="edit-lot-spaces">Total Spaces</label>
                    <input type="number" id="edit-lot-spaces" required min="1" value="${lot.totalSpaces}">
                </div>
                <div class="form-group">
                    <label for="edit-lot-manager">Assign Manager</label>
                    <select id="edit-lot-manager">
                        <option value="">Select Manager (Optional)</option>
                        ${managers.map(manager => 
                            `<option value="${manager.id}" ${manager.id === lot.managerId ? 'selected' : ''}>
                                ${manager.name}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-lot-status">Status</label>
                    <select id="edit-lot-status">
                        <option value="active" ${lot.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${lot.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </form>
        `;

        Utils.showModal('Edit Parking Lot', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Save Changes',
                class: 'btn-primary',
                handler: () => this.saveLotChanges(lotId)
            }
        ]);
    }

    saveLotChanges(lotId) {
        const lots = dataManager.getLots();
        const lotIndex = lots.findIndex(l => l.id === lotId);
        
        if (lotIndex === -1) {
            Utils.showToast('Lot not found', 'error');
            return;
        }

        const name = document.getElementById('edit-lot-name').value.trim();
        const address = document.getElementById('edit-lot-address').value.trim();
        const totalSpaces = parseInt(document.getElementById('edit-lot-spaces').value);
        const managerId = document.getElementById('edit-lot-manager').value;
        const status = document.getElementById('edit-lot-status').value;

        if (!name || !address || !totalSpaces) {
            Utils.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (totalSpaces < 1) {
            Utils.showToast('Total spaces must be at least 1', 'error');
            return;
        }

        // Update lot
        lots[lotIndex] = {
            ...lots[lotIndex],
            name: name,
            address: address,
            totalSpaces: totalSpaces,
            managerId: managerId || null,
            status: status
        };

        dataManager.setLots(lots);
        
        Utils.hideModal();
        Utils.showToast('Parking lot updated successfully', 'success');
        this.updateLotsList();
        if (this.currentSection === 'admin-overview') {
            this.updateLotsPerformance();
        }
    }

    showAddManagerModal() {
        const lots = dataManager.getLots();
        const unassignedLots = lots.filter(lot => !lot.managerId);
        
        const content = `
            <form id="add-manager-form" class="modal-form">
                <div class="form-group">
                    <label for="manager-name">Full Name</label>
                    <input type="text" id="manager-name" required placeholder="Enter full name">
                </div>
                <div class="form-group">
                    <label for="manager-email">Email</label>
                    <input type="email" id="manager-email" required placeholder="Enter email address">
                </div>
                <div class="form-group">
                    <label for="manager-phone">Phone</label>
                    <input type="tel" id="manager-phone" required placeholder="Enter phone number">
                </div>
                <div class="form-group">
                    <label for="manager-lot">Assign to Lot</label>
                    <select id="manager-lot">
                        <option value="">Select Lot (Optional)</option>
                        ${unassignedLots.map(lot => 
                            `<option value="${lot.id}">${lot.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </form>
        `;

        Utils.showModal('Add New Manager', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Add Manager',
                class: 'btn-primary',
                handler: () => this.addNewManager()
            }
        ]);
    }

    addNewManager() {
        const name = document.getElementById('manager-name').value.trim();
        const email = document.getElementById('manager-email').value.trim();
        const phone = document.getElementById('manager-phone').value.trim();
        const lotId = document.getElementById('manager-lot').value;

        if (!name || !email || !phone) {
            Utils.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        const manager = dataManager.addManager({
            name: name,
            email: email,
            phone: phone,
            lotId: lotId || null
        });

        // Update lot if assigned
        if (lotId && manager) {
            const lots = dataManager.getLots();
            const lotIndex = lots.findIndex(l => l.id === lotId);
            if (lotIndex !== -1) {
                lots[lotIndex].managerId = manager.id;
                dataManager.setLots(lots);
            }
        }

        if (manager) {
            Utils.hideModal();
            Utils.showToast('Manager added successfully', 'success');
            if (this.currentSection === 'managers') {
                this.updateManagersTable();
            }
        } else {
            Utils.showToast('Failed to add manager', 'error');
        }
    }

    editManager(managerId) {
        const managers = dataManager.getManagers();
        const manager = managers.find(m => m.id === managerId);
        const lots = dataManager.getLots();
        
        if (!manager) return;

        const currentLot = lots.find(l => l.managerId === managerId);
        const unassignedLots = lots.filter(lot => !lot.managerId || lot.id === currentLot?.id);

        const content = `
            <form id="edit-manager-form" class="modal-form">
                <div class="form-group">
                    <label for="edit-manager-name">Full Name</label>
                    <input type="text" id="edit-manager-name" required value="${manager.name}">
                </div>
                <div class="form-group">
                    <label for="edit-manager-email">Email</label>
                    <input type="email" id="edit-manager-email" required value="${manager.email}">
                </div>
                <div class="form-group">
                    <label for="edit-manager-phone">Phone</label>
                    <input type="tel" id="edit-manager-phone" required value="${manager.phone}">
                </div>
                <div class="form-group">
                    <label for="edit-manager-lot">Assign to Lot</label>
                    <select id="edit-manager-lot">
                        <option value="">No Assignment</option>
                        ${unassignedLots.map(lot => 
                            `<option value="${lot.id}" ${currentLot?.id === lot.id ? 'selected' : ''}>
                                ${lot.name}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-manager-status">Status</label>
                    <select id="edit-manager-status">
                        <option value="active" ${manager.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${manager.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </form>
        `;

        Utils.showModal('Edit Manager', content, [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                handler: () => Utils.hideModal()
            },
            {
                text: 'Save Changes',
                class: 'btn-primary',
                handler: () => this.saveManagerChanges(managerId)
            }
        ]);
    }

    saveManagerChanges(managerId) {
        const managers = dataManager.getManagers();
        const managerIndex = managers.findIndex(m => m.id === managerId);
        
        if (managerIndex === -1) {
            Utils.showToast('Manager not found', 'error');
            return;
        }

        const name = document.getElementById('edit-manager-name').value.trim();
        const email = document.getElementById('edit-manager-email').value.trim();
        const phone = document.getElementById('edit-manager-phone').value.trim();
        const lotId = document.getElementById('edit-manager-lot').value;
        const status = document.getElementById('edit-manager-status').value;

        if (!name || !email || !phone) {
            Utils.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        const oldManager = managers[managerIndex];
        
        // Update manager
        managers[managerIndex] = {
            ...oldManager,
            name: name,
            email: email,
            phone: phone,
            lotId: lotId || null,
            status: status
        };

        dataManager.setManagers(managers);

        // Update lot assignments
        const lots = dataManager.getLots();
        lots.forEach(lot => {
            if (lot.managerId === managerId) {
                lot.managerId = null; // Remove old assignment
            }
            if (lot.id === lotId) {
                lot.managerId = managerId; // Add new assignment
            }
        });
        
        dataManager.setLots(lots);
        
        Utils.hideModal();
        Utils.showToast('Manager updated successfully', 'success');
        this.updateManagersTable();
        if (this.currentSection === 'lots') {
            this.updateLotsList();
        }
    }

    generateReport(reportType) {
        Utils.showToast(`Generating ${reportType}...`, 'info');
        
        // Simulate report generation
        setTimeout(() => {
            let reportData;
            let filename;
            
            switch (reportType) {
                case 'Financial Report':
                    reportData = this.generateFinancialReport();
                    filename = 'financial_report.csv';
                    break;
                case 'Occupancy Report':
                    reportData = this.generateOccupancyReport();
                    filename = 'occupancy_report.csv';
                    break;
                case 'Manager Performance':
                    reportData = this.generateManagerPerformanceReport();
                    filename = 'manager_performance.csv';
                    break;
                default:
                    Utils.showToast('Unknown report type', 'error');
                    return;
            }
            
            if (reportData.length > 0) {
                Utils.exportToCSV(reportData, filename);
                Utils.showToast(`${reportType} generated and downloaded`, 'success');
            } else {
                Utils.showToast('No data available for report', 'warning');
            }
        }, 2000);
    }

    generateFinancialReport() {
        const lots = dataManager.getLots();
        const sessions = dataManager.getParkingSessions().filter(s => s.exitTime);
        
        return lots.map(lot => ({
            'Lot Name': lot.name,
            'Address': lot.address,
            'Total Revenue': lot.revenue,
            'Completed Sessions': sessions.filter(s => s.spaceId.includes(lot.id)).length,
            'Average Fee': sessions.length > 0 ? (lot.revenue / sessions.length).toFixed(2) : 0,
            'Status': lot.status
        }));
    }

    generateOccupancyReport() {
        const lots = dataManager.getLots();
        
        return lots.map(lot => ({
            'Lot Name': lot.name,
            'Total Spaces': lot.totalSpaces,
            'Occupied Spaces': lot.occupiedSpaces,
            'Available Spaces': lot.totalSpaces - lot.occupiedSpaces,
            'Occupancy Rate': ((lot.occupiedSpaces / lot.totalSpaces) * 100).toFixed(1) + '%',
            'Status': lot.status
        }));
    }

    generateManagerPerformanceReport() {
        const managers = dataManager.getManagers();
        const lots = dataManager.getLots();
        
        return managers.map(manager => {
            const assignedLot = lots.find(l => l.managerId === manager.id);
            
            return {
                'Manager Name': manager.name,
                'Email': manager.email,
                'Assigned Lot': assignedLot ? assignedLot.name : 'Unassigned',
                'Performance Score': manager.performance + '%',
                'Hire Date': Utils.formatDate(new Date(manager.hireDate)),
                'Status': manager.status
            };
        });
    }
}

// Create global instance
window.adminApp = new AdminApp();