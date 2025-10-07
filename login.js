// Login page functionality

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userTypeSelect = document.getElementById('userType');
    const credentialsSection = document.getElementById('credentialsSection');
    const studentSection = document.getElementById('studentSection');
    const branchSelect = document.getElementById('branch');

    // Handle user type change
    userTypeSelect.addEventListener('change', function() {
        const userType = this.value;
        const loginBtn = document.getElementById('loginBtnText');

        if (userType === 'student') {
            credentialsSection.style.display = 'none';
            studentSection.style.display = 'block';
            loginBtn.textContent = 'View Timetable';
            loadBranches();
        } else if (userType === 'admin' || userType === 'teacher') {
            credentialsSection.style.display = 'block';
            studentSection.style.display = 'none';
            loginBtn.textContent = 'Sign In';
        } else {
            credentialsSection.style.display = 'none';
            studentSection.style.display = 'none';
            loginBtn.textContent = 'Sign In';
        }

        // Clear error messages
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) errorMsg.style.display = 'none';
    });

    // Load branches for student selection
    async function loadBranches() {
        try {
            const branches = await api.get('/student/branches');
            branchSelect.innerHTML = '<option value="">Select Branch</option>';

            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = `${branch.name} - ${branch.full_name}`;
                branchSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading branches:', error);
            utils.showError('Failed to load branches');
        }
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const userType = formData.get('userType');

        if (!userType) {
            utils.showError('Please select a user type');
            return;
        }

        if (userType === 'student') {
            await handleStudentLogin(formData);
        } else {
            await handleUserLogin(formData);
        }
    });

    // Handle student login (no authentication)
    async function handleStudentLogin(formData) {
        const branch = formData.get('branch');
        const semester = formData.get('semester');
        const year = formData.get('year');

        if (!branch || !semester || !year) {
            utils.showError('Please select branch, semester, and year');
            return;
        }

        utils.showLoading('loginBtn', 'Loading Timetable...');

        try {
            // Store student selection for the student page
            const studentInfo = {
                role: 'student',
                branch: branch,
                semester: semester,
                year: year
            };

            utils.saveUserInfo(studentInfo);

            // Redirect to student timetable page
            window.location.href = '/student.html';

        } catch (error) {
            console.error('Student login error:', error);
            utils.showError('Failed to load timetable');
        } finally {
            utils.hideLoading('loginBtn', 'View Timetable');
        }
    }

    // Handle admin/teacher login
    async function handleUserLogin(formData) {
        const username = formData.get('username');
        const password = formData.get('password');
        const role = formData.get('userType');

        if (!username || !password) {
            utils.showError('Please enter username and password');
            return;
        }

        utils.showLoading('loginBtn', 'Signing In...');

        try {
            const response = await api.post('/auth/login', {
                username: username,
                password: password,
                role: role
            });

            // Store authentication token and user info
            api.setToken(response.token);
            utils.saveUserInfo(response.user);

            // Show success message briefly
            utils.showSuccess('Login successful! Redirecting...');

            // Redirect to appropriate dashboard
            setTimeout(() => {
                utils.redirectToDashboard(response.user.role);
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            utils.showError(error.message || 'Login failed');
        } finally {
            utils.hideLoading('loginBtn', 'Sign In');
        }
    }
});
