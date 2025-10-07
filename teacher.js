// Teacher dashboard functionality

let teacherTimetableData = {};
let teacherClasses = [];

document.addEventListener('DOMContentLoaded', async function() {
    const userInfo = utils.getUserInfo();

    if (!userInfo || userInfo.role !== 'teacher') {
        window.location.href = '/login.html';
        return;
    }

    // Update teacher name display
    const teacherNameElement = document.getElementById('teacherName');
    if (teacherNameElement && userInfo.teacherInfo) {
        teacherNameElement.textContent = userInfo.teacherInfo.name;
    }

    // Load teacher timetable by default
    await showMyTimetable();

    // Set up change request form
    setupChangeRequestForm();
});

async function showMyTimetable() {
    hideAllSections();
    document.getElementById('timetableSection').classList.remove('hidden');

    await loadTeacherTimetable();
}

async function showChangeRequests() {
    hideAllSections();
    document.getElementById('changeRequestSection').classList.remove('hidden');

    await loadClassesForRequest();
}

async function showRequestHistory() {
    hideAllSections();
    document.getElementById('requestHistorySection').classList.remove('hidden');

    await loadRequestHistory();
}

function hideAllSections() {
    document.getElementById('timetableSection').classList.add('hidden');
    document.getElementById('changeRequestSection').classList.add('hidden');
    document.getElementById('requestHistorySection').classList.add('hidden');
}

async function loadTeacherTimetable() {
    const timetableContent = document.getElementById('timetableContent');
    timetableContent.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading your timetable...</p>
        </div>
    `;

    try {
        const response = await api.get('/teacher/timetable');
        teacherTimetableData = response.timetable;

        if (!teacherTimetableData || Object.keys(teacherTimetableData).length === 0) {
            timetableContent.innerHTML = `
                <div class="text-center" style="padding: 50px;">
                    <h3>No Classes Assigned</h3>
                    <p>You don't have any classes assigned yet.</p>
                    <p>Please contact the administration if this seems incorrect.</p>
                </div>
            `;
            return;
        }

        // Create timetable HTML
        const timetableHTML = utils.createTimetableTable(teacherTimetableData, true);
        timetableContent.innerHTML = timetableHTML;

    } catch (error) {
        console.error('Error loading teacher timetable:', error);
        timetableContent.innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load your timetable: ${error.message}
            </div>
        `;
    }
}

async function loadClassesForRequest() {
    const classSelect = document.getElementById('classSelect');
    classSelect.innerHTML = '<option value="">Loading classes...</option>';

    try {
        // Get teacher's scheduled classes
        const response = await api.get('/teacher/timetable');
        teacherClasses = [];

        // Extract individual classes from timetable
        Object.keys(response.timetable).forEach(day => {
            Object.keys(response.timetable[day]).forEach(slot => {
                const classes = response.timetable[day][slot];
                classes.forEach(classItem => {
                    teacherClasses.push({
                        id: classItem.id,
                        display: `${classItem.course_code} - ${classItem.course_name} (${day} ${classItem.time}) - ${classItem.batch_name}`,
                        details: classItem
                    });
                });
            });
        });

        // Populate select dropdown
        classSelect.innerHTML = '<option value="">Select a class...</option>';
        teacherClasses.forEach(classItem => {
            const option = document.createElement('option');
            option.value = classItem.id;
            option.textContent = classItem.display;
            classSelect.appendChild(option);
        });

        if (teacherClasses.length === 0) {
            classSelect.innerHTML = '<option value="">No classes found</option>';
        }

    } catch (error) {
        console.error('Error loading classes:', error);
        classSelect.innerHTML = '<option value="">Error loading classes</option>';
    }
}

function setupChangeRequestForm() {
    const form = document.getElementById('changeRequestForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const scheduledClassId = formData.get('classSelect');
        const reason = formData.get('changeReason');

        if (!scheduledClassId || !reason.trim()) {
            utils.showError('Please select a class and provide a reason', 'changeRequestError');
            return;
        }

        utils.showLoading('submitBtn', 'Submitting...');

        try {
            await api.post('/teacher/change-request', {
                scheduled_class_id: parseInt(scheduledClassId),
                reason: reason.trim()
            });

            utils.showSuccess('Change request submitted successfully!', 'changeRequestSuccess');

            // Reset form
            this.reset();

            // Optionally redirect to history after a delay
            setTimeout(() => {
                showRequestHistory();
            }, 2000);

        } catch (error) {
            console.error('Error submitting change request:', error);
            utils.showError(error.message || 'Failed to submit request', 'changeRequestError');
        } finally {
            utils.hideLoading('submitBtn', 'Submit Request');
        }
    });
}

async function loadRequestHistory() {
    const historyContent = document.getElementById('requestHistoryContent');
    historyContent.innerHTML = `
        <div class="loading-message">
            <div class="spinner"></div>
            <p>Loading request history...</p>
        </div>
    `;

    try {
        const requests = await api.get('/teacher/change-requests');

        if (requests.length === 0) {
            historyContent.innerHTML = `
                <div class="text-center" style="padding: 50px;">
                    <h3>No Change Requests</h3>
                    <p>You haven't submitted any change requests yet.</p>
                </div>
            `;
            return;
        }

        let html = '';
        requests.forEach(request => {
            const statusClass = `status-${request.status}`;
            const date = new Date(request.requested_at).toLocaleDateString();
            const processedDate = request.processed_at 
                ? new Date(request.processed_at).toLocaleDateString()
                : null;

            html += `
                <div class="request-item">
                    <div class="request-header">
                        <div class="request-class">
                            ${request.course_code} - ${request.course_name}
                        </div>
                        <div class="request-status ${statusClass}">
                            ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                    </div>

                    <div class="request-details">
                        <p><strong>Class:</strong> ${request.batch_name} Section ${request.section}</p>
                        <p><strong>Time:</strong> ${request.day_of_week} ${utils.formatTime(request.start_time)} - ${utils.formatTime(request.end_time)}</p>
                        <p><strong>Room:</strong> ${request.room_name}</p>
                    </div>

                    <div class="request-reason">
                        <strong>Reason:</strong> ${request.reason}
                    </div>

                    <div class="request-date">
                        Submitted: ${date}
                        ${processedDate ? `| Processed: ${processedDate}` : ''}
                    </div>

                    ${request.admin_notes ? `
                        <div class="admin-notes">
                            <strong>Admin Notes:</strong> ${request.admin_notes}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        historyContent.innerHTML = html;

    } catch (error) {
        console.error('Error loading request history:', error);
        historyContent.innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load request history: ${error.message}
            </div>
        `;
    }
}
