// Utility functions for the parking management system

class Utils {
    // Date and time utilities
    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static formatTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    static formatDateTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    static calculateDuration(startTime, endTime = new Date()) {
        const diff = endTime - startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours === 0) {
            return `${minutes}m`;
        }
        return `${hours}h ${minutes}m`;
    }

    static calculateDetailedDuration(startTime, endTime = new Date()) {
        const diff = endTime - startTime;
        const hours = diff / (1000 * 60 * 60);
        return hours;
    }

    // Fee calculation
    static calculateParkingFee(hours) {
        const baseRate = 5; // $5 for first hour
        const hourlyRate = 3; // $3 for each additional hour
        
        if (hours <= 1) {
            return baseRate;
        }
        
        return baseRate + Math.ceil(hours - 1) * hourlyRate;
    }

    // Currency formatting
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // String utilities
    static generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static formatLicensePlate(plate) {
        return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    // Validation utilities
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return re.test(phone);
    }

    static validateLicensePlate(plate) {
        // Basic validation - adjust based on your region's format
        const re = /^[A-Z0-9]{2,8}$/;
        return re.test(plate.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    }

    // Array utilities
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, ascending = true) {
        return array.sort((a, b) => {
            if (ascending) {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    }

    // Search utilities
    static searchItems(items, query, fields = []) {
        if (!query) return items;
        
        const searchTerm = query.toLowerCase();
        return items.filter(item => {
            if (fields.length === 0) {
                // Search all string properties
                return Object.values(item).some(value => 
                    typeof value === 'string' && 
                    value.toLowerCase().includes(searchTerm)
                );
            } else {
                // Search specific fields
                return fields.some(field => {
                    const value = this.getNestedProperty(item, field);
                    return typeof value === 'string' && 
                           value.toLowerCase().includes(searchTerm);
                });
            }
        });
    }

    static getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    // Toast notifications
    static showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);

        return toast;
    }

    // Modal utilities
    static showModal(title, content, actions = []) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');

        if (!overlay || !modal || !modalTitle || !modalContent) return;

        modalTitle.textContent = title;
        modalContent.innerHTML = content;

        // Add actions if provided
        if (actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'modal-actions';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `btn ${action.class || 'btn-primary'}`;
                button.textContent = action.text;
                button.onclick = action.handler;
                actionsDiv.appendChild(button);
            });
            
            modalContent.appendChild(actionsDiv);
        }

        overlay.classList.add('active');

        // Close modal when clicking overlay
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.hideModal();
            }
        };

        return modal;
    }

    static hideModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // Theme utilities
    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle button
        const toggleBtns = document.querySelectorAll('[id*="theme-toggle"]');
        toggleBtns.forEach(btn => {
            btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
        
        return newTheme;
    }

    static initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle buttons
        const toggleBtns = document.querySelectorAll('[id*="theme-toggle"]');
        toggleBtns.forEach(btn => {
            btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    // Chart utilities (basic implementation)
    static createChart(canvas, type, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (type === 'line') {
            this.drawLineChart(ctx, data, width, height, options);
        } else if (type === 'bar') {
            this.drawBarChart(ctx, data, width, height, options);
        }
    }

    static drawLineChart(ctx, data, width, height, options) {
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Find max value for scaling
        const maxValue = Math.max(...data.values);
        const minValue = Math.min(...data.values, 0);
        const valueRange = maxValue - minValue;
        
        // Draw axes
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Plot data
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.labels.forEach((label, index) => {
            const x = padding + (index / (data.labels.length - 1)) * chartWidth;
            const y = height - padding - ((data.values[index] - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#3B82F6';
        data.labels.forEach((label, index) => {
            const x = padding + (index / (data.labels.length - 1)) * chartWidth;
            const y = height - padding - ((data.values[index] - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    static drawBarChart(ctx, data, width, height, options) {
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        const maxValue = Math.max(...data.values);
        const barWidth = chartWidth / data.labels.length * 0.8;
        const barSpacing = chartWidth / data.labels.length * 0.2;
        
        // Draw axes
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw bars
        ctx.fillStyle = '#3B82F6';
        data.labels.forEach((label, index) => {
            const barHeight = (data.values[index] / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - padding - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }

    // Performance utilities
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Animation utilities
    static animateValue(element, start, end, duration = 1000) {
        const startTimestamp = performance.now();
        
        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    // Data export utilities
    static exportToCSV(data, filename = 'export.csv') {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    static exportToJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Local storage helpers
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Random data generators (for demo purposes)
    static generateMockData() {
        const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
        const vehicles = ['Toyota Camry', 'Honda Civic', 'Ford Focus', 'BMW 320i', 'Audi A4'];
        const colors = ['Red', 'Blue', 'Black', 'White', 'Silver'];
        
        return {
            randomName: () => names[Math.floor(Math.random() * names.length)],
            randomVehicle: () => vehicles[Math.floor(Math.random() * vehicles.length)],
            randomColor: () => colors[Math.floor(Math.random() * colors.length)],
            randomLicensePlate: () => {
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const numbers = '0123456789';
                return Array.from({length: 3}, () => letters[Math.floor(Math.random() * letters.length)]).join('') +
                       Array.from({length: 3}, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
            },
            randomEmail: (name) => {
                const domain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
                return `${name.toLowerCase().replace(' ', '.')}@${domain[Math.floor(Math.random() * domain.length)]}`;
            },
            randomPhone: () => {
                return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
            }
        };
    }
}

// Export for use in other modules
window.Utils = Utils;