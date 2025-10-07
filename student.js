// Student timetable functionality

document.addEventListener('DOMContentLoaded', async function() {
    const studentInfo = utils.getUserInfo();

    if (!studentInfo || studentInfo.role !== 'student') {
        window.location.href = '/login.html';
        return;
    }

    // Update student info display
    const studentInfoElement = document.getElementById('studentInfo');
    if (studentInfoElement) {
        studentInfoElement.textContent = `Branch: ${await getBranchName(studentInfo.branch)} | Semester: ${studentInfo.semester} | Year: ${studentInfo.year}`;
    }

    // Load and display timetable
    await loadStudentTimetable();
});

async function getBranchName(branchId) {
    try {
        const branches = await api.get('/student/branches');
        const branch = branches.find(b => b.id == branchId);
        return branch ? branch.name : 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

async function loadStudentTimetable() {
    const studentInfo = utils.getUserInfo();
    const { branch, semester, year } = studentInfo;

    try {
        // Update title and info
        const branchName = await getBranchName(branch);
        document.getElementById('timetableTitle').textContent = `${branchName} Timetable`;
        document.getElementById('timetableInfo').textContent = `Semester ${semester} - Year ${year}`;

        // Fetch timetable data
        const timetableData = await api.get(`/student/timetable/${branch}/${semester}/${year}`);

        // Display timetable
        displayTimetable(timetableData);

    } catch (error) {
        console.error('Error loading timetable:', error);
        document.getElementById('timetableContent').innerHTML = `
            <div class="error-message" style="display: block; margin: 20px 0;">
                Failed to load timetable: ${error.message}
            </div>
        `;
    }
}

function displayTimetable(data) {
    const timetableContainer = document.getElementById('timetableContent');

    if (!data.timetable || Object.keys(data.timetable).length === 0) {
        timetableContainer.innerHTML = `
            <div class="text-center" style="padding: 50px;">
                <h3>No Timetable Available</h3>
                <p>No classes have been scheduled for this branch and semester yet.</p>
                <p>Please check back later or contact the administration.</p>
            </div>
        `;
        return;
    }

    // Create timetable HTML
    const timetableHTML = utils.createTimetableTable(data.timetable, true);
    timetableContainer.innerHTML = timetableHTML;
}
