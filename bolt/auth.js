// Authentication management for the parking system

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'parkeease_session';
        this.init();
    }

    init() {
        // Check for existing session
        this.loadSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout buttons
        const logoutBtns = document.querySelectorAll('[id*="logout-btn"]');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // Auto-logout on tab close/refresh (optional)
        window.addEventListener('beforeunload', () => {
            // Optionally save session state
        });
    }

    async handleLogin() {
        const role = document.getElementById('role').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!role || !username || !password) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#login-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Authenticate user
            const user = this.authenticateUser(username, password, role);
            
            if (user) {
                this.currentUser = user;
                this.saveSession();
                this.redirectToDashboard();
                Utils.showToast(`Welcome back, ${user.name}!`, 'success');
            } else {
                Utils.showToast('Invalid credentials or role mismatch', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            Utils.showToast('Login failed. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    authenticateUser(username, password, role) {
        // In a real application, this would make an API call
        const user = dataManager.findUser(username, password);
        
        if (user && user.role === role) {
            return {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email,
                loginTime: new Date()
            };
        }
        
        return null;
    }

    handleLogout() {
        this.currentUser = null;
        this.clearSession();
        this.redirectToLogin();
        Utils.showToast('You have been logged out', 'info');
    }

    saveSession() {
        if (this.currentUser) {
            Utils.saveToStorage(this.sessionKey, {
                user: this.currentUser,
                timestamp: new Date().getTime()
            });
        }
    }

    loadSession() {
        const session = Utils.loadFromStorage(this.sessionKey);
        
        if (session && session.user) {
            // Check if session is still valid (24 hours)
            const sessionAge = new Date().getTime() - session.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge < maxAge) {
                this.currentUser = session.user;
                this.redirectToDashboard();
            } else {
                this.clearSession();
            }
        }
    }

    clearSession() {
        Utils.removeFromStorage(this.sessionKey);
    }

    redirectToDashboard() {
        if (!this.currentUser) return;

        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        if (this.currentUser.role === 'manager') {
            document.getElementById('manager-screen').classList.add('active');
            if (window.managerApp) {
                window.managerApp.init();
            }
        } else if (this.currentUser.role === 'admin') {
            document.getElementById('admin-screen').classList.add('active');
            if (window.adminApp) {
                window.adminApp.init();
            }
        }
    }

    redirectToLogin() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById('login-screen').classList.add('active');
        
        // Clear form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    requireRole(role) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasRole(role)) {
            Utils.showToast('Access denied. Insufficient permissions.', 'error');
            return false;
        }
        return true;
    }

    // Password utilities (for future enhancement)
    static hashPassword(password) {
        // In a real application, use proper password hashing
        // This is just for demo purposes
        return btoa(password);
    }

    static validatePassword(password) {
        // Basic password validation
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        
        if (!/[A-Za-z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one letter' };
        }
        
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        
        return { valid: true, message: 'Password is valid' };
    }

    // Session management utilities
    extendSession() {
        if (this.currentUser) {
            this.saveSession();
        }
    }

    getSessionInfo() {
        const session = Utils.loadFromStorage(this.sessionKey);
        if (session) {
            const sessionAge = new Date().getTime() - session.timestamp;
            const remainingTime = 24 * 60 * 60 * 1000 - sessionAge; // 24 hours - current age
            
            return {
                user: session.user,
                loginTime: new Date(session.timestamp),
                remainingTime: Math.max(0, remainingTime),
                isExpired: remainingTime <= 0
            };
        }
        return null;
    }

    // Security utilities
    logSecurityEvent(event, details = {}) {
        const securityLog = Utils.loadFromStorage('parkeease_security_log', []);
        
        securityLog.push({
            timestamp: new Date(),
            event: event,
            user: this.currentUser ? this.currentUser.username : 'anonymous',
            details: details,
            userAgent: navigator.userAgent,
            ip: 'localhost' // In real app, get actual IP
        });
        
        // Keep only last 100 entries
        if (securityLog.length > 100) {
            securityLog.splice(0, securityLog.length - 100);
        }
        
        Utils.saveToStorage('parkeease_security_log', securityLog);
    }

    getSecurityLog() {
        return Utils.loadFromStorage('parkeease_security_log', []);
    }

    // Multi-factor authentication (placeholder for future enhancement)
    async requestMFA() {
        // Placeholder for MFA implementation
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, token: 'mfa_token_' + Math.random() });
            }, 1000);
        });
    }

    verifyMFA(token, userToken) {
        // Placeholder for MFA verification
        return token === userToken;
    }

    // Account lockout protection
    trackFailedLogin(username) {
        const failedAttempts = Utils.loadFromStorage('parkeease_failed_attempts', {});
        
        if (!failedAttempts[username]) {
            failedAttempts[username] = {
                count: 0,
                lastAttempt: new Date(),
                lockedUntil: null
            };
        }
        
        failedAttempts[username].count++;
        failedAttempts[username].lastAttempt = new Date();
        
        // Lock account after 5 failed attempts
        if (failedAttempts[username].count >= 5) {
            failedAttempts[username].lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        
        Utils.saveToStorage('parkeease_failed_attempts', failedAttempts);
        
        return failedAttempts[username];
    }

    isAccountLocked(username) {
        const failedAttempts = Utils.loadFromStorage('parkeease_failed_attempts', {});
        const userAttempts = failedAttempts[username];
        
        if (!userAttempts || !userAttempts.lockedUntil) {
            return false;
        }
        
        if (new Date() > new Date(userAttempts.lockedUntil)) {
            // Lock expired, reset attempts
            delete failedAttempts[username];
            Utils.saveToStorage('parkeease_failed_attempts', failedAttempts);
            return false;
        }
        
        return true;
    }

    clearFailedAttempts(username) {
        const failedAttempts = Utils.loadFromStorage('parkeease_failed_attempts', {});
        delete failedAttempts[username];
        Utils.saveToStorage('parkeease_failed_attempts', failedAttempts);
    }
}

// Create global instance
window.authManager = new AuthManager();