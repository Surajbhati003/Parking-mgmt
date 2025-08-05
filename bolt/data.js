// Data management and storage for the parking management system

class DataManager {
    constructor() {
        this.storageKeys = {
            USERS: 'parkease_users',
            CUSTOMERS: 'parkease_customers',
            VEHICLES: 'parkeease_vehicles',
            PARKING_SESSIONS: 'parkeease_parking_sessions',
            PARKING_SPACES: 'parkeease_parking_spaces',
            LOTS: 'parkeease_lots',
            MANAGERS: 'parkeease_managers',
            SETTINGS: 'parkeease_settings'
        };
        
        this.initializeData();
    }

    initializeData() {
        // Initialize default users if not exists
        if (!this.getUsers().length) {
            this.setUsers([
                {
                    id: 'user_manager',
                    username: 'manager',
                    password: 'pass123',
                    role: 'manager',
                    name: 'John Manager',
                    email: 'manager@parkeease.com'
                },
                {
                    id: 'user_admin',
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    name: 'Admin User',
                    email: 'admin@parkeease.com'
                }
            ]);
        }

        // Initialize parking spaces if not exists
        if (!this.getParkingSpaces().length) {
            const spaces = [];
            for (let i = 1; i <= 50; i++) {
                spaces.push({
                    id: `space_${i}`,
                    number: i,
                    status: 'available', // available, occupied
                    vehicle: null,
                    customer: null
                });
            }
            this.setParkingSpaces(spaces);
        }

        // Initialize sample data if needed
        this.initializeSampleData();
    }

    initializeSampleData() {
        // Only add sample data if no existing data
        if (this.getCustomers().length === 0) {
            const mockData = Utils.generateMockData();
            const sampleCustomers = [];
            const sampleVehicles = [];
            const sampleSessions = [];

            // Generate 10 sample customers
            for (let i = 0; i < 10; i++) {
                const name = mockData.randomName();
                const customer = {
                    id: Utils.generateId(),
                    name: name,
                    email: mockData.randomEmail(name),
                    phone: mockData.randomPhone(),
                    registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    vehicles: []
                };

                // Add 1-2 vehicles per customer
                const vehicleCount = Math.random() > 0.6 ? 2 : 1;
                for (let j = 0; j < vehicleCount; j++) {
                    const vehicle = {
                        id: Utils.generateId(),
                        customerId: customer.id,
                        licensePlate: mockData.randomLicensePlate(),
                        make: mockData.randomVehicle().split(' ')[0],
                        model: mockData.randomVehicle().split(' ')[1] || 'Unknown',
                        color: mockData.randomColor(),
                        registrationDate: customer.registrationDate
                    };
                    
                    customer.vehicles.push(vehicle.id);
                    sampleVehicles.push(vehicle);
                }

                sampleCustomers.push(customer);
            }

            // Generate some active parking sessions
            const activeVehicles = sampleVehicles.slice(0, 8);
            const spaces = this.getParkingSpaces();
            
            activeVehicles.forEach((vehicle, index) => {
                const space = spaces[index];
                const customer = sampleCustomers.find(c => c.id === vehicle.customerId);
                
                const entryTime = new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000);
                const session = {
                    id: Utils.generateId(),
                    vehicleId: vehicle.id,
                    customerId: vehicle.customerId,
                    spaceId: space.id,
                    entryTime: entryTime,
                    exitTime: null,
                    fee: 0,
                    status: 'active'
                };

                // Update space status
                space.status = 'occupied';
                space.vehicle = vehicle;
                space.customer = customer;
                
                sampleSessions.push(session);
            });

            // Generate some completed sessions for analytics
            for (let i = 0; i < 20; i++) {
                const vehicle = sampleVehicles[Math.floor(Math.random() * sampleVehicles.length)];
                const entryTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
                const exitTime = new Date(entryTime.getTime() + (Math.random() * 8 + 0.5) * 60 * 60 * 1000);
                const duration = Utils.calculateDetailedDuration(entryTime, exitTime);
                
                const session = {
                    id: Utils.generateId(),
                    vehicleId: vehicle.id,
                    customerId: vehicle.customerId,
                    spaceId: `space_${Math.floor(Math.random() * 50) + 1}`,
                    entryTime: entryTime,
                    exitTime: exitTime,
                    fee: Utils.calculateParkingFee(duration),
                    status: 'completed'
                };
                
                sampleSessions.push(session);
            }

            this.setCustomers(sampleCustomers);
            this.setVehicles(sampleVehicles);
            this.setParkingSessions(sampleSessions);
            this.setParkingSpaces(spaces);

            // Initialize lots and managers for admin
            this.initializeLotsAndManagers();
        }
    }

    initializeLotsAndManagers() {
        if (this.getLots().length === 0) {
            const lots = [
                {
                    id: 'lot_1',
                    name: 'Downtown Plaza',
                    address: '123 Main St, Downtown',
                    totalSpaces: 50,
                    occupiedSpaces: 8,
                    managerId: 'manager_1',
                    revenue: 2340,
                    status: 'active'
                },
                {
                    id: 'lot_2',
                    name: 'Mall Parking',
                    address: '456 Shopping Ave',
                    totalSpaces: 100,
                    occupiedSpaces: 45,
                    managerId: 'manager_2',
                    revenue: 4560,
                    status: 'active'
                },
                {
                    id: 'lot_3',
                    name: 'Airport Terminal',
                    address: '789 Airport Rd',
                    totalSpaces: 200,
                    occupiedSpaces: 120,
                    managerId: 'manager_3',
                    revenue: 8920,
                    status: 'active'
                }
            ];

            const managers = [
                {
                    id: 'manager_1',
                    name: 'John Manager',
                    email: 'john.manager@parkeease.com',
                    phone: '(555) 123-4567',
                    lotId: 'lot_1',
                    hireDate: new Date('2023-01-15'),
                    performance: 92,
                    status: 'active'
                },
                {
                    id: 'manager_2',
                    name: 'Sarah Wilson',
                    email: 'sarah.wilson@parkeease.com',
                    phone: '(555) 234-5678',
                    lotId: 'lot_2',
                    hireDate: new Date('2023-03-20'),
                    performance: 87,
                    status: 'active'
                },
                {
                    id: 'manager_3',
                    name: 'Mike Johnson',
                    email: 'mike.johnson@parkeease.com',
                    phone: '(555) 345-6789',
                    lotId: 'lot_3',
                    hireDate: new Date('2023-02-10'),
                    performance: 95,
                    status: 'active'
                }
            ];

            this.setLots(lots);
            this.setManagers(managers);
        }
    }

    // Generic storage methods
    saveData(key, data) {
        return Utils.saveToStorage(key, data);
    }

    loadData(key, defaultValue = []) {
        return Utils.loadFromStorage(key, defaultValue);
    }

    // User management
    getUsers() {
        return this.loadData(this.storageKeys.USERS);
    }

    setUsers(users) {
        return this.saveData(this.storageKeys.USERS, users);
    }

    findUser(username, password) {
        const users = this.getUsers();
        return users.find(user => user.username === username && user.password === password);
    }

    // Customer management
    getCustomers() {
        return this.loadData(this.storageKeys.CUSTOMERS);
    }

    setCustomers(customers) {
        return this.saveData(this.storageKeys.CUSTOMERS, customers);
    }

    addCustomer(customer) {
        const customers = this.getCustomers();
        customer.id = customer.id || Utils.generateId();
        customer.registrationDate = customer.registrationDate || new Date();
        customer.vehicles = customer.vehicles || [];
        customers.push(customer);
        this.setCustomers(customers);
        return customer;
    }

    updateCustomer(customerId, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates };
            this.setCustomers(customers);
            return customers[index];
        }
        return null;
    }

    deleteCustomer(customerId) {
        const customers = this.getCustomers();
        const filtered = customers.filter(c => c.id !== customerId);
        this.setCustomers(filtered);
        
        // Also remove customer's vehicles
        const vehicles = this.getVehicles();
        const filteredVehicles = vehicles.filter(v => v.customerId !== customerId);
        this.setVehicles(filteredVehicles);
        
        return true;
    }

    findCustomer(id) {
        const customers = this.getCustomers();
        return customers.find(c => c.id === id);
    }

    searchCustomers(query) {
        const customers = this.getCustomers();
        return Utils.searchItems(customers, query, ['name', 'email', 'phone']);
    }

    // Vehicle management
    getVehicles() {
        return this.loadData(this.storageKeys.VEHICLES);
    }

    setVehicles(vehicles) {
        return this.saveData(this.storageKeys.VEHICLES, vehicles);
    }

    addVehicle(vehicle) {
        const vehicles = this.getVehicles();
        vehicle.id = vehicle.id || Utils.generateId();
        vehicle.registrationDate = vehicle.registrationDate || new Date();
        vehicles.push(vehicle);
        this.setVehicles(vehicles);
        
        // Update customer's vehicle list
        const customer = this.findCustomer(vehicle.customerId);
        if (customer) {
            customer.vehicles = customer.vehicles || [];
            customer.vehicles.push(vehicle.id);
            this.updateCustomer(customer.id, { vehicles: customer.vehicles });
        }
        
        return vehicle;
    }

    updateVehicle(vehicleId, updates) {
        const vehicles = this.getVehicles();
        const index = vehicles.findIndex(v => v.id === vehicleId);
        if (index !== -1) {
            vehicles[index] = { ...vehicles[index], ...updates };
            this.setVehicles(vehicles);
            return vehicles[index];
        }
        return null;
    }

    deleteVehicle(vehicleId) {
        const vehicles = this.getVehicles();
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return false;
        
        const filtered = vehicles.filter(v => v.id !== vehicleId);
        this.setVehicles(filtered);
        
        // Update customer's vehicle list
        const customer = this.findCustomer(vehicle.customerId);
        if (customer && customer.vehicles) {
            customer.vehicles = customer.vehicles.filter(vId => vId !== vehicleId);
            this.updateCustomer(customer.id, { vehicles: customer.vehicles });
        }
        
        return true;
    }

    findVehicle(id) {
        const vehicles = this.getVehicles();
        return vehicles.find(v => v.id === id);
    }

    findVehicleByPlate(licensePlate) {
        const vehicles = this.getVehicles();
        return vehicles.find(v => v.licensePlate.toUpperCase() === licensePlate.toUpperCase());
    }

    getCustomerVehicles(customerId) {
        const vehicles = this.getVehicles();
        return vehicles.filter(v => v.customerId === customerId);
    }

    // Parking session management
    getParkingSessions() {
        return this.loadData(this.storageKeys.PARKING_SESSIONS);
    }

    setParkingSessions(sessions) {
        return this.saveData(this.storageKeys.PARKING_SESSIONS, sessions);
    }

    startParkingSession(vehicleId, spaceId) {
        const sessions = this.getParkingSessions();
        const spaces = this.getParkingSpaces();
        const vehicle = this.findVehicle(vehicleId);
        const customer = this.findCustomer(vehicle.customerId);
        
        const session = {
            id: Utils.generateId(),
            vehicleId: vehicleId,
            customerId: vehicle.customerId,
            spaceId: spaceId,
            entryTime: new Date(),
            exitTime: null,
            fee: 0,
            status: 'active'
        };
        
        sessions.push(session);
        
        // Update space status
        const space = spaces.find(s => s.id === spaceId);
        if (space) {
            space.status = 'occupied';
            space.vehicle = vehicle;
            space.customer = customer;
        }
        
        this.setParkingSessions(sessions);
        this.setParkingSpaces(spaces);
        
        return session;
    }

    endParkingSession(sessionId) {
        const sessions = this.getParkingSessions();
        const spaces = this.getParkingSpaces();
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session || session.status !== 'active') {
            return null;
        }
        
        session.exitTime = new Date();
        session.status = 'completed';
        
        const duration = Utils.calculateDetailedDuration(session.entryTime, session.exitTime);
        session.fee = Utils.calculateParkingFee(duration);
        
        // Update space status
        const space = spaces.find(s => s.id === session.spaceId);
        if (space) {
            space.status = 'available';
            space.vehicle = null;
            space.customer = null;
        }
        
        this.setParkingSessions(sessions);
        this.setParkingSpaces(spaces);
        
        return session;
    }

    getActiveSessions() {
        const sessions = this.getParkingSessions();
        return sessions.filter(s => s.status === 'active');
    }

    getSessionHistory(customerId = null) {
        const sessions = this.getParkingSessions();
        if (customerId) {
            return sessions.filter(s => s.customerId === customerId);
        }
        return sessions;
    }

    // Parking space management
    getParkingSpaces() {
        return this.loadData(this.storageKeys.PARKING_SPACES);
    }

    setParkingSpaces(spaces) {
        return this.saveData(this.storageKeys.PARKING_SPACES, spaces);
    }

    getAvailableSpaces() {
        const spaces = this.getParkingSpaces();
        return spaces.filter(s => s.status === 'available');
    }

    getOccupiedSpaces() {
        const spaces = this.getParkingSpaces();
        return spaces.filter(s => s.status === 'occupied');
    }

    findAvailableSpace() {
        const availableSpaces = this.getAvailableSpaces();
        return availableSpaces.length > 0 ? availableSpaces[0] : null;
    }

    // Analytics and reporting
    getDashboardStats() {
        const spaces = this.getParkingSpaces();
        const sessions = this.getParkingSessions();
        const customers = this.getCustomers();
        
        const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
        const availableSpaces = spaces.filter(s => s.status === 'available').length;
        const totalCustomers = customers.length;
        
        // Calculate today's revenue
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const todaySessions = sessions.filter(s => 
            s.exitTime && 
            s.exitTime >= todayStart && 
            s.exitTime < todayEnd
        );
        
        const dailyRevenue = todaySessions.reduce((sum, session) => sum + (session.fee || 0), 0);
        
        return {
            occupiedSpaces,
            availableSpaces,
            totalCustomers,
            dailyRevenue
        };
    }

    getRevenueData(period = 'daily') {
        const sessions = this.getParkingSessions().filter(s => s.exitTime && s.fee);
        const now = new Date();
        
        if (period === 'daily') {
            // Last 7 days
            const data = { labels: [], values: [] };
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                
                const dayRevenue = sessions
                    .filter(s => s.exitTime >= dayStart && s.exitTime < dayEnd)
                    .reduce((sum, s) => sum + s.fee, 0);
                
                data.labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                data.values.push(dayRevenue);
            }
            return data;
        }
        
        // Add weekly and monthly implementations as needed
        return { labels: [], values: [] };
    }

    getPeakHoursData() {
        const sessions = this.getParkingSessions();
        const hourCounts = new Array(24).fill(0);
        
        sessions.forEach(session => {
            if (session.entryTime) {
                const hour = new Date(session.entryTime).getHours();
                hourCounts[hour]++;
            }
        });
        
        const labels = [];
        for (let i = 0; i < 24; i++) {
            labels.push(`${i}:00`);
        }
        
        return {
            labels: labels,
            values: hourCounts
        };
    }

    getRecentActivity(limit = 10) {
        const sessions = this.getParkingSessions();
        const vehicles = this.getVehicles();
        const customers = this.getCustomers();
        
        const activities = [];
        
        sessions
            .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
            .slice(0, limit * 2) // Get more to filter
            .forEach(session => {
                const vehicle = vehicles.find(v => v.id === session.vehicleId);
                const customer = customers.find(c => c.id === session.customerId);
                
                if (vehicle && customer) {
                    activities.push({
                        type: 'entry',
                        title: `${vehicle.licensePlate} entered`,
                        subtitle: `${customer.name} - Space ${session.spaceId.replace('space_', '')}`,
                        time: session.entryTime,
                        icon: '🚗'
                    });
                    
                    if (session.exitTime) {
                        activities.push({
                            type: 'exit',
                            title: `${vehicle.licensePlate} exited`,
                            subtitle: `${customer.name} - Fee: ${Utils.formatCurrency(session.fee)}`,
                            time: session.exitTime,
                            icon: '💰'
                        });
                    }
                }
            });
        
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, limit);
    }

    // Admin-specific data methods
    getLots() {
        return this.loadData(this.storageKeys.LOTS);
    }

    setLots(lots) {
        return this.saveData(this.storageKeys.LOTS, lots);
    }

    getManagers() {
        return this.loadData(this.storageKeys.MANAGERS);
    }

    setManagers(managers) {
        return this.saveData(this.storageKeys.MANAGERS, managers);
    }

    addLot(lot) {
        const lots = this.getLots();
        lot.id = lot.id || Utils.generateId();
        lots.push(lot);
        this.setLots(lots);
        return lot;
    }

    addManager(manager) {
        const managers = this.getManagers();
        manager.id = manager.id || Utils.generateId();
        manager.hireDate = manager.hireDate || new Date();
        manager.performance = manager.performance || 0;
        manager.status = manager.status || 'active';
        managers.push(manager);
        this.setManagers(managers);
        return manager;
    }

    // Settings management
    getSettings() {
        return this.loadData(this.storageKeys.SETTINGS, {
            theme: 'light',
            currency: 'USD',
            baseRate: 5,
            hourlyRate: 3,
            timezone: 'America/New_York'
        });
    }

    setSettings(settings) {
        return this.saveData(this.storageKeys.SETTINGS, settings);
    }

    updateSettings(updates) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...updates };
        this.setSettings(newSettings);
        return newSettings;
    }

    // Backup and restore
    exportAllData() {
        const data = {};
        Object.values(this.storageKeys).forEach(key => {
            data[key] = this.loadData(key);
        });
        return data;
    }

    importAllData(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (Object.values(this.storageKeys).includes(key)) {
                this.saveData(key, value);
            }
        });
    }

    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            Utils.removeFromStorage(key);
        });
        this.initializeData();
    }
}

// Create global instance
window.dataManager = new DataManager();