// Common utilities for College Timetable Management System

// API base URL
const API_BASE = '/api';

// HTTP client
class ApiClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    getToken() {
        return this.token;
    }

    clearAuth() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
    }
}

// Global API client instance
const api = new ApiClient();

// Utility functions
const utils = {
    // Show error message
    showError(message, containerId = 'errorMessage') {
        const container = document.getElementById(containerId);
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    },

    // Show success message
    showSuccess(message, containerId = 'successMessage') {
        const container = document.getElementById(containerId);
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
            setTimeout(() => {
                container.style.display = 'none';
            }, 3000);
        }
    },

    // Show loading state
    showLoading(buttonId, text = 'Loading...') {
        const button = document.getElementById(buttonId);
        const textElement = document.getElementById(buttonId + 'Text');
        const spinner = document.getElementById(buttonId + 'Spinner');

        if (button) {
            button.disabled = true;
            if (textElement) textElement.textContent = text;
            if (spinner) spinner.style.display = 'inline-block';
        }
    },

    // Hide loading state
    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        const textElement = document.getElementById(buttonId + 'Text');
        const spinner = document.getElementById(buttonId + 'Spinner');

        if (button) {
            button.disabled = false;
            if (textElement) textElement.textContent = originalText;
            if (spinner) spinner.style.display = 'none';
        }
    },

    // Format time
    formatTime(timeString) {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    },

    // Get user info from localStorage
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    // Save user info to localStorage
    saveUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    // Logout user
    logout() {
        api.clearAuth();
        window.location.href = '/login.html';
    },

    // Check if user is authenticated
    isAuthenticated() {
        return api.getToken() !== null;
    },

    // Redirect to appropriate dashboard based on role
    redirectToDashboard(role) {
        switch (role) {
            case 'admin':
                window.location.href = '/admin.html';
                break;
            case 'teacher':
                window.location.href = '/teacher.html';
                break;
            case 'student':
                window.location.href = '/student.html';
                break;
            default:
                window.location.href = '/login.html';
        }
    },

    // Create timetable table
    createTimetableTable(timetableData, showSection = false) {
        if (!timetableData) return '<p>No timetable data available</p>';

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeSlots = [
            { slot: 1, time: '09:00 - 10:00' },
            { slot: 2, time: '10:00 - 11:00' },
            { slot: 3, time: '11:15 - 12:15' },
            { slot: 4, time: '12:15 - 13:15' },
            { slot: 5, time: '14:00 - 15:00' },
            { slot: 6, time: '15:00 - 16:00' }
        ];

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        ${days.map(day => `<th>${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        timeSlots.forEach(slot => {
            html += `
                <tr>
                    <td class="time-slot">${slot.time}</td>
            `;

            days.forEach(day => {
                const classes = timetableData[day] && timetableData[day][slot.slot] 
                    ? timetableData[day][slot.slot] 
                    : [];

                html += `<td class="class-cell">`;

                classes.forEach(classItem => {
                    html += `
                        <div class="class-item">
                            <div class="class-name">${classItem.course_code} - ${classItem.course_name}</div>
                            <div class="class-teacher">${classItem.teacher_name}</div>
                            <div class="class-room">${classItem.room_name}</div>
                            ${showSection ? `<div class="class-room">Section: ${classItem.section}</div>` : ''}
                        </div>
                    `;
                });

                html += `</td>`;
            });

            html += `</tr>`;
        });

        html += `
                </tbody>
            </table>
        `;

        return html;
    }
};

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for protected pages
    const protectedPages = ['/admin.html', '/teacher.html'];
    const currentPage = window.location.pathname;

    if (protectedPages.includes(currentPage) && !utils.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Add logout functionality to logout buttons
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                utils.logout();
            }
        });
    });
});
