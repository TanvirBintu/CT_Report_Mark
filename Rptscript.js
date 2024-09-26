fetch('markData.json')
    .then(response => response.json())
    .then(data => {
        examData = data; // Assign fetched data
        populateExamTable(); // Call the table population function
    })
    .catch(error => console.error('Error fetching data:', error));

// Function to render statistics
function renderStatistics(marksData) {
    document.getElementById('total-students').textContent = marksData.totalStudents;
    document.getElementById('total-pass').textContent = marksData.totalPass;
    document.getElementById('total-fail').textContent = marksData.totalFail;
    document.getElementById('total-absent').textContent = marksData.totalAbsent;
}

// Function to determine if the student has passed all required subjects
function hasPassed(student) {
    const { subjects, optionalCourse } = student;
    let hasFailed = false;

    // Check all subjects except the optional course
    for (const [subject, mark] of Object.entries(subjects)) {
        if (subject !== optionalCourse && mark < 7) {
            hasFailed = true;
            break;
        }
    }

    // If student has failed in any non-optional subject, they fail
    return !hasFailed;
}

// Function to calculate and populate the table
function populateExamTable() {
    const tableBody = document.querySelector('#examTable tbody');
    const students = examData.students;

    const groupData = {};

    // Iterate over the student data
    students.forEach(student => {
        const { group, version, section } = student;
        const key = `${group}-${version}-${section}`;

        // If this group-version-section combination doesn't exist in groupData, initialize it
        if (!groupData[key]) {
            groupData[key] = {
                group,
                version,
                section,
                totalStudents: 0,
                totalAppeared: 0,
                totalPassed: 0,
                totalFailed: 0,
                totalAbsent: 0
            };
        }

        // Update the group data
        groupData[key].totalStudents++;
        if (student.totalMark > 0) {
            groupData[key].totalAppeared++;
            if (hasPassed(student)) {
                groupData[key].totalPassed++;
            } else {
                groupData[key].totalFailed++;
            }
        } else {
            groupData[key].totalAbsent++;
        }
    });

    // Group by group and version to calculate rowspan
    const groupCounts = {};
    const versionCounts = {};

    Object.values(groupData).forEach(group => {
        if (!groupCounts[group.group]) {
            groupCounts[group.group] = {
                count: 0,
                versionCounts: {}
            };
        }
        groupCounts[group.group].count++;

        if (!groupCounts[group.group].versionCounts[group.version]) {
            groupCounts[group.group].versionCounts[group.version] = 0;
        }
        groupCounts[group.group].versionCounts[group.version]++;
    });

    // Create rows for each group-version-section
    Object.values(groupData).forEach(group => {
        const passPercentage = ((group.totalPassed / group.totalAppeared) * 100).toFixed(2);

        const row = document.createElement('tr');

        // Add group cell with rowspan
        if (groupCounts[group.group].count > 0) {
            const groupCell = document.createElement('td');
            groupCell.setAttribute('rowspan', groupCounts[group.group].count);
            groupCell.textContent = group.group;
            row.appendChild(groupCell);
            groupCounts[group.group].count = 0; // Reset count after adding
        }

        // Add version cell with rowspan
        if (groupCounts[group.group].versionCounts[group.version] > 0) {
            const versionCell = document.createElement('td');
            versionCell.setAttribute('rowspan', groupCounts[group.group].versionCounts[group.version]);
            versionCell.textContent = group.version;
            row.appendChild(versionCell);
            groupCounts[group.group].versionCounts[group.version] = 0; // Reset count after adding
        }

        // Add the remaining columns
        row.innerHTML += `
            <td>${group.section}</td>
            <td>${group.totalStudents}</td>
            <td>${group.totalAppeared}</td>
            <td>${group.totalPassed}</td>
            <td>${group.totalFailed}</td>
            <td>${group.totalAbsent}</td>
            <td>${passPercentage}%</td>
        `;

        tableBody.appendChild(row);
    });
}

// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', populateExamTable);
