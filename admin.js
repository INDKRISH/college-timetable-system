// Admin dashboard functionality

document.addEventListener('DOMContentLoaded', async function() {
    const userInfo = utils.getUserInfo();

    if (!userInfo || userInfo.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Update admin name display
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement) {
        adminNameElement.textContent = userInfo.username || 'Administrator';
    }

    // Load dashboard data
    await loadDashboardStats();

    // Set up forms
    setupTeacherForm();
});

async function loadDashboardStats() {
    try {
        const stats = await api.get('/admin/dashboard');

        document.getElementById('teachersCount').textContent = stats.teachers || 0;
        document.getElementById('coursesCount').textContent = stats.courses || 0;
        document.getElementById('roomsCount').textContent = stats.rooms || 0;
        document.getElementById('batchesCount').textContent = stats.batches || 0;
        document.getElementById('scheduledCount').textContent = stats.scheduled_classes || 0;
        document.getElementById('pendingRequestsCount').textContent = stats.pending_requests || 0;

        // Update pending count for the button
        window.pendingCount = stats.pending_requests || 0;
        updatePendingCountInButton();

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updatePendingCountInButton() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Change Requests')) {
            btn.innerHTML = `📝 Change Requests (${window.pendingCount})`;
        }
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.getElementById('timetableSection').classList.add('hidden');
    document.getElementById('teachersSection').classList.add('hidden');
    document.getElementById('coursesSection').classList.add('hidden');
    document.getElementById('requestsSection').classList.add('hidden');

    // Show selected section
    document.getElementById(sectionName + 'Section').classList.remove('hidden');

    // Load section data
    switch (sectionName) {
        case 'timetable':
            loadAllTimetables();
            break;
        case 'teachers':
            loadTeachers();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'requests':
            loadChangeRequests();
            break;
    }
}

async function loadAllTimetables() {
    const timetableContent = document.getElementById('timetableContent');
    timetableContent.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading all timetables...</p>
        </div>
    `;

    try {
        const timetableData = await api.get('/admin/timetable');

        if (timetableData.length === 0) {
            timetableContent.innerHTML = `
                <div class="text-center" style="padding: 50px;">
                    <h3>No Timetables Found</h3>
                    <p>No classes have been scheduled yet.</p>
                    <button class="action-btn" onclick="generateTimetable()">Generate Timetable</button>
                </div>
            `;
            return;
        }

        // Group timetable data by branch and semester
        const groupedData = {};
        timetableData.forEach(item => {
            const key = `${item.branch_name} - Semester ${item.semester}`;
            if (!groupedData[key]) {
                groupedData[key] = {};
                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                days.forEach(day => {
                    groupedData[key][day] = {};
                    for (let slot = 1; slot <= 6; slot++) {
                        groupedData[key][day][slot] = [];
                    }
                });
            }

            if (groupedData[key][item.day_of_week] && groupedData[key][item.day_of_week][item.slot_index]) {
                groupedData[key][item.day_of_week][item.slot_index].push({
                    id: item.id,
                    course_name: item.course_name,
                    course_code: item.course_code,
                    course_type: item.course_type,
                    teacher_name: item.teacher_name,
                    room_name: item.room_name,
                    room_type: item.room_type,
                    batch_name: item.batch_name,
                    section: item.section,
                    time: `${item.start_time.substring(0,5)} - ${item.end_time.substring(0,5)}`
                });
            }
        });

        // Create HTML for all timetables
        let html = '';
        Object.keys(groupedData).forEach(groupKey => {
            html += `
                <div class="timetable-container" style="margin-bottom: 40px;">
                    <div class="timetable-header">
                        <h3 class="timetable-title">${groupKey}</h3>
                    </div>
                    ${utils.createTimetableTable(groupedData[groupKey], true)}
                </div>
            `;
        });

        timetableContent.innerHTML = html;

    } catch (error) {
        console.error('Error loading timetables:', error);
        timetableContent.innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load timetables: ${error.message}
            </div>
        `;
    }
}

async function generateTimetable() {
    if (!confirm('This will replace the current timetable. Are you sure?')) {
        return;
    }

    // Show generating message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'generating-message';
    messageDiv.innerHTML = `
        <div class="spinner" style="display: inline-block; margin-right: 10px;"></div>
        Generating new timetable... This may take a moment.
    `;

    const content = document.querySelector('.dashboard-content');
    content.insertBefore(messageDiv, content.firstChild);

    try {
        const result = await api.post('/timetable/generate', {});

        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            ✅ Timetable generated successfully! 
            Scheduled: ${result.scheduled} assignments
            ${result.conflicts && result.conflicts.length > 0 ? `| Conflicts: ${result.conflicts.length}` : ''}
        `;

        // Refresh dashboard stats and timetable if visible
        await loadDashboardStats();
        if (!document.getElementById('timetableSection').classList.contains('hidden')) {
            await loadAllTimetables();
        }

        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);

    } catch (error) {
        console.error('Error generating timetable:', error);
        messageDiv.className = 'error-message';
        messageDiv.innerHTML = `❌ Failed to generate timetable: ${error.message}`;

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

async function loadTeachers() {
    const teachersContent = document.getElementById('teachersContent');
    teachersContent.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading teachers...</p>
        </div>
    `;

    try {
        const teachers = await api.get('/admin/teachers');

        if (teachers.length === 0) {
            teachersContent.innerHTML = `
                <div class="text-center" style="padding: 50px;">
                    <h3>No Teachers Found</h3>
                    <p>No teachers have been added yet.</p>
                    <button class="action-btn" onclick="showAddTeacherForm()">Add First Teacher</button>
                </div>
            `;
            return;
        }

        let html = `
            <table class="management-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Max Hours/Day</th>
                        <th>Max Hours/Week</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        teachers.forEach(teacher => {
            html += `
                <tr>
                    <td>${teacher.name}</td>
                    <td>${teacher.email || '-'}</td>
                    <td>${teacher.phone || '-'}</td>
                    <td>${teacher.max_hours_per_day}</td>
                    <td>${teacher.max_hours_per_week}</td>
                    <td>
                        <button class="btn-small btn-edit" onclick="editTeacher(${teacher.id})">Edit</button>
                        <button class="btn-small btn-delete" onclick="deleteTeacher(${teacher.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        teachersContent.innerHTML = html;

    } catch (error) {
        console.error('Error loading teachers:', error);
        teachersContent.innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load teachers: ${error.message}
            </div>
        `;
    }
}

function showAddTeacherForm() {
    document.getElementById('addTeacherForm').classList.remove('hidden');
}

function hideAddTeacherForm() {
    document.getElementById('addTeacherForm').classList.add('hidden');
    document.getElementById('teacherForm').reset();
}

function setupTeacherForm() {
    const form = document.getElementById('teacherForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const teacherData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            max_hours_per_day: parseInt(formData.get('max_hours_per_day')),
            max_hours_per_week: parseInt(formData.get('max_hours_per_day')) * 5 // Default calculation
        };

        try {
            await api.post('/admin/teachers', teacherData);

            // Show success message
            utils.showSuccess('Teacher added successfully!');

            // Hide form and refresh list
            hideAddTeacherForm();
            await loadTeachers();
            await loadDashboardStats();

        } catch (error) {
            console.error('Error adding teacher:', error);
            utils.showError(error.message || 'Failed to add teacher');
        }
    });
}

async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher?')) {
        return;
    }

    try {
        await api.delete(`/admin/teachers/${teacherId}`);

        utils.showSuccess('Teacher deleted successfully!');
        await loadTeachers();
        await loadDashboardStats();

    } catch (error) {
        console.error('Error deleting teacher:', error);
        utils.showError(error.message || 'Failed to delete teacher');
    }
}

async function loadCourses() {
    const coursesContent = document.getElementById('coursesContent');
    coursesContent.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading courses...</p>
        </div>
    `;

    try {
        const courses = await api.get('/admin/courses');

        if (courses.length === 0) {
            coursesContent.innerHTML = `
                <div class="text-center" style="padding: 50px;">
                    <h3>No Courses Found</h3>
                    <p>No courses have been added yet.</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="management-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Semester</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Hours/Week</th>
                    </tr>
                </thead>
                <tbody>
        `;

        courses.forEach(course => {
            html += `
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>${course.branch_name || '-'}</td>
                    <td>${course.semester || '-'}</td>
                    <td>${course.credits}</td>
                    <td>${course.type}</td>
                    <td>${course.hours_per_week}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        coursesContent.innerHTML = html;

    } catch (error) {
        console.error('Error loading courses:', error);
        coursesContent.innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load courses: ${error.message}
            </div>
        `;
    }
}

async function loadChangeRequests() {
    const requestsContent = document.getElementById('requestsContent');
    requestsContent.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading change requests...</p>
        </div>
    `;

    try {
        const requests = await api.get('/admin/change-requests');

        if (requests.length === 0) {
            requestsContent.innerHTML = `
                <div class="text-center" style="padding: 50px;">
                    <h3>No Change Requests</h3>
                    <p>No change requests have been submitted.</p>
                </div>
            `;
            return;
        }

        let html = '';
        requests.forEach(request => {
            const statusClass = `status-${request.status}`;
            const date = new Date(request.requested_at).toLocaleDateString();

            html += `
                <div class="request-card">
                    <div class="request-header">
                        <div>
                            <h4>${request.teacher_name}</h4>
                            <p><strong>${request.course_code} - ${request.course_name}</strong></p>
                        </div>
                        <div class="request-status ${statusClass}">
                            ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                    </div>

                    <div class="request-details">
                        <p><strong>Class:</strong> ${request.batch_name} Section ${request.section}</p>
                        <p><strong>Current Time:</strong> ${request.day_of_week} ${utils.formatTime(request.start_time)} - ${utils.formatTime(request.end_time)}</p>
                        <p><strong>Room:</strong> ${request.room_name}</p>
                        <p><strong>Reason:</strong> ${request.reason}</p>
                        <p><strong>Submitted:</strong> ${date}</p>
                    </div>

                    ${request.status === 'pending' ? `
                        <div class="request-actions">
                            <button class="btn-small btn-approve" onclick="processRequest(${request.id}, 'approved')">
                                Approve
                            </button>
                            <button class="btn-small btn-reject" onclick="processRequest(${request.id}, 'rejected')">
                                Reject
                            </button>
                        </div>
                    ` : ''}

                    ${request.admin_notes ? `
                        <div class="admin-notes">
                            <strong>Admin Notes:</strong> ${request.admin_notes}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        requestsContent.innerHTML = html;

    } catch (error) {
        console.error('Error loading change requests:', error);
        requestsContent.innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load change requests: ${error.message}
            </div>
        `;
    }
}

async function processRequest(requestId, status) {
    const notes = prompt(`Please enter admin notes for this ${status} request (optional):`);

    try {
        await api.put(`/admin/change-requests/${requestId}`, {
            status: status,
            admin_notes: notes
        });

        utils.showSuccess(`Request ${status} successfully!`);
        await loadChangeRequests();
        await loadDashboardStats();

    } catch (error) {
        console.error('Error processing request:', error);
        utils.showError(error.message || `Failed to ${status} request`);
    }
}
