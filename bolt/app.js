// Main application initialization and coordination

class ParkEaseApp {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing ParkEase Application');
        
        // Initialize theme early
        Utils.initTheme();
        
        // Setup global error handling
        this.setupErrorHandling();
        
        // Setup app-wide event listeners
        this.setupGlobalEventListeners();
        
        // Initialize authentication
        if (window.authManager) {
            authManager.init();
        }
        
        // Check for existing session and redirect appropriately
        this.handleInitialNavigation();
        
        this.initialized = true;
        console.log('✅ ParkEase Application initialized successfully');
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
            Utils.showToast('An unexpected error occurred', 'error');
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            Utils.showToast('An error occurred while processing your request', 'error');
            event.preventDefault();
        });
    }

    setupGlobalEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            // Handle navigation state if implementing SPA routing
            console.log('Navigation state changed:', event.state);
        });

        // Handle visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Tab hidden - pausing updates');
            } else {
                console.log('Tab visible - resuming updates');
                this.refreshCurrentView();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            Utils.showToast('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            Utils.showToast('Connection lost - working offline', 'warning');
        });
    }

    handleKeyboardShortcuts(event) {
        // Alt + L for logout
        if (event.altKey && event.key === 'l') {
            event.preventDefault();
            if (authManager.isAuthenticated()) {
                authManager.handleLogout();
            }
        }

        // Alt + T for theme toggle
        if (event.altKey && event.key === 't') {
            event.preventDefault();
            Utils.toggleTheme();
        }

        // Escape key to close modals
        if (event.key === 'Escape') {
            const modal = document.getElementById('modal-overlay');
            if (modal && modal.classList.contains('active')) {
                Utils.hideModal();
            }
        }
    }

    handleInitialNavigation() {
        const currentUser = authManager.getCurrentUser();
        
        if (currentUser) {
            // User is logged in, show appropriate dashboard
            if (currentUser.role === 'manager') {
                this.showManagerDashboard();
            } else if (currentUser.role === 'admin') {
                this.showAdminDashboard();
            }
        } else {
            // No user session, show login
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        this.hideAllScreens();
        document.getElementById('login-screen').classList.add('active');
        
        // Focus on first form field
        setTimeout(() => {
            const firstInput = document.querySelector('#login-form input, #login-form select');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    showManagerDashboard() {
        this.hideAllScreens();
        document.getElementById('manager-screen').classList.add('active');
        
        // Initialize manager app if not already done
        if (window.managerApp) {
            managerApp.init();
        }
    }

    showAdminDashboard() {
        this.hideAllScreens();
        document.getElementById('admin-screen').classList.add('active');
        
        // Initialize admin app if not already done
        if (window.adminApp) {
            adminApp.init();
        }
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    refreshCurrentView() {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;

        // Refresh data in current view
        if (currentUser.role === 'manager' && window.managerApp) {
            const currentSection = managerApp.currentSection;
            managerApp.showSection(currentSection);
        } else if (currentUser.role === 'admin' && window.adminApp) {
            const currentSection = adminApp.currentSection;
            adminApp.showSection(currentSection);
        }
    }

    // Utility methods for app state management
    saveAppState() {
        const appState = {
            timestamp: new Date().getTime(),
            theme: document.documentElement.getAttribute('data-theme'),
            currentUser: authManager.getCurrentUser()
        };
        
        Utils.saveToStorage('parkeease_app_state', appState);
    }

    loadAppState() {
        const appState = Utils.loadFromStorage('parkeease_app_state');
        
        if (appState) {
            // Restore theme
            if (appState.theme) {
                document.documentElement.setAttribute('data-theme', appState.theme);
            }
        }
        
        return appState;
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load performance:', {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                }
            }, 30000);
        }
    }

    // Data backup and restore
    async exportAllData() {
        try {
            const allData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: dataManager.exportAllData(),
                settings: dataManager.getSettings()
            };
            
            const filename = `parkeease_backup_${new Date().toISOString().split('T')[0]}.json`;
            Utils.exportToJSON(allData, filename);
            
            Utils.showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            Utils.showToast('Export failed', 'error');
        }
    }

    async importData() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);
                        
                        if (importData.data) {
                            dataManager.importAllData(importData.data);
                            Utils.showToast('Data imported successfully', 'success');
                            
                            // Refresh current view
                            this.refreshCurrentView();
                            resolve(importData);
                        } else {
                            throw new Error('Invalid data format');
                        }
                    } catch (error) {
                        console.error('Import failed:', error);
                        Utils.showToast('Import failed - invalid file format', 'error');
                        reject(error);
                    }
                };
                reader.readAsText(file);
            };
            
            input.click();
        });
    }

    // System health check
    performHealthCheck() {
        const health = {
            timestamp: new Date(),
            status: 'healthy',
            checks: {
                auth: authManager ? 'ok' : 'error',
                dataManager: dataManager ? 'ok' : 'error',
                localStorage: this.testLocalStorage(),
                performance: this.checkPerformance()
            }
        };
        
        const hasErrors = Object.values(health.checks).includes('error');
        health.status = hasErrors ? 'unhealthy' : 'healthy';
        
        console.log('System health check:', health);
        return health;
    }

    testLocalStorage() {
        try {
            const testKey = 'parkeease_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return 'ok';
        } catch (error) {
            return 'error';
        }
    }

    checkPerformance() {
        if ('memory' in performance) {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                return 'warning';
            }
        }
        return 'ok';
    }

    // Cleanup and shutdown
    cleanup() {
        console.log('🧹 Cleaning up ParkEase Application');
        
        // Save current state
        this.saveAppState();
        
        // Cleanup manager app
        if (window.managerApp && typeof managerApp.destroy === 'function') {
            managerApp.destroy();
        }
        
        // Clear intervals and timeouts
        this.clearAllTimers();
        
        // Remove event listeners
        this.removeGlobalEventListeners();
        
        console.log('✅ ParkEase Application cleanup completed');
    }

    clearAllTimers() {
        // Clear all intervals and timeouts
        const highestId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    }

    removeGlobalEventListeners() {
        // Remove global event listeners if needed
        // This is a simplified version - in practice, you'd track and remove specific listeners
        console.log('Global event listeners cleanup');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.parkEaseApp = new ParkEaseApp();
    parkEaseApp.init();
    
    // Performance monitoring
    parkEaseApp.startPerformanceMonitoring();
    
    // Health check every 5 minutes
    setInterval(() => {
        parkEaseApp.performHealthCheck();
    }, 5 * 60 * 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.parkEaseApp) {
        parkEaseApp.cleanup();
    }
});

// Export for debugging
window.parkEaseApp = window.parkEaseApp || null;