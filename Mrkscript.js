let currentPage = 1;
let pageSize = 10; // Default page size
let totalPages = 0;

// Function to fetch data from JSON
async function fetchData() {
    try {
        const response = await fetch('markData.json');  // Adjust path as necessary
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to render statistics
function renderStatistics(marksData) {
    document.getElementById('total-students').textContent = marksData.totalStudents;
    document.getElementById('total-pass').textContent = marksData.totalPass;
    document.getElementById('total-fail').textContent = marksData.totalFail;
    document.getElementById('total-absent').textContent = marksData.totalAbsent;
}

// Function to render table data dynamically based on the group
function renderTable(marksData) {
    const tableBody = document.getElementById('marks-table');
    tableBody.innerHTML = ''; // Clear the table first

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Slice students based on current page and page size
    const paginatedStudents = marksData.students.slice(startIndex, endIndex);

    paginatedStudents.forEach((student, index) => {
        const row = document.createElement('tr');
        const subjects = Object.keys(student.subjects);

        // Build subject headers if not yet rendered
        renderTableHeaders(subjects);

        // Create student row dynamically based on the subjects
        let rowHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${student.name} <br> <span style="font-size: 12px; color: #666;">ID: ${student.id} <br> Roll: ${student.roll}</span></td>
            <td>${student.group}</td>
            <td>${student.optionalCourse}</td>
            <td>${student.averageMark}</td>
            <td>${student.totalMark}</td>
        `;

        // Loop through subjects and add them to the row
        subjects.forEach(subject => {
            let mark = student.subjects[subject];
            // Check if the current subject is not the optional course
            if (mark < 7 && subject !== student.optionalCourse) {
                // Apply red color and underline if mark is less than 7 and it's not the optional course
                rowHTML += `<td style="color: red; text-decoration: underline;">${mark}</td>`;
            } else {
                rowHTML += `<td>${mark}</td>`;
            }
        });

        row.innerHTML = rowHTML;
        tableBody.appendChild(row);
    });
}
// // Function to render table data dynamically based on the group
// function renderTable(marksData) {
//     const tableBody = document.getElementById('marks-table');
//     tableBody.innerHTML = ''; // Clear the table first

//     const startIndex = (currentPage - 1) * pageSize;
//     const endIndex = startIndex + pageSize;

//     // Slice students based on current page and page size
//     const paginatedStudents = marksData.students.slice(startIndex, endIndex);

//     paginatedStudents.forEach((student, index) => {
//         const row = document.createElement('tr');
//         const subjects = Object.keys(student.subjects);

//         // Build subject headers if not yet rendered
//         renderTableHeaders(subjects);

//         // Create student row dynamically based on the subjects
//         let rowHTML = 
//             <td>${startIndex + index + 1}</td>
//             <td>${student.name}</td>
//             <td>${student.group}</td>
//             <td>${student.optionalCourse}</td>
//             <td>${student.averageMark}</td>
//             <td>${student.totalMark}</td>
//         ;

       
//         // Loop through subjects and add them to the row
//         subjects.forEach(subject => {
//             let mark = student.subjects[subject];
//           // Check if the current subject is not the optional course
//           if (mark < 7 && subject !== student.optionalCourse) {
//             // Apply red color and underline if mark is less than 6 and it's not the optional course
//             rowHTML += <td style="color: red; text-decoration: underline;">${mark}</td>;
//         } else {
//             rowHTML += <td>${mark}</td>;
//         }
//         });

//         row.innerHTML = rowHTML;
//         tableBody.appendChild(row);
//     });
// }


// Function to dynamically generate table headers based on subjects
function renderTableHeaders(subjects) {
    const thead = document.querySelector('thead');
    if (thead.innerHTML.includes(subjects[0])) return; // If already rendered, don't add again

    const subjectHeaders = subjects.map(subject => `<th>${subject} (20)</th>`).join('');
    const additionalRow = `
        <tr>
            <th rowspan="2">SL</th>
            <th rowspan="2">Student</th>
            <th rowspan="2">Group</th>
            <th rowspan="2">Optional Course</th>
            <th rowspan="2">Average Mark</th>
            <th rowspan="2">Total Mark</th>
            ${subjectHeaders}
        </tr>
        <tr>
            <!-- Empty row below headers, since they are already covered in the row above -->
        </tr>
    `;
    thead.innerHTML = additionalRow;
}

// Function to update pagination
function updatePagination(marksData) {
    const totalStudents = marksData.students.length;
    totalPages = Math.ceil(totalStudents / pageSize);
    document.getElementById('current-page').textContent = `Page ${currentPage}`;
}

// Initialize the page
async function initialize() {
    const marksData = await fetchData();
    if (marksData) {
        // Filter students by Science group
        const scienceStudents = {
            totalStudents: marksData.students.filter(student => student.group === "Science").length,
            totalPass: marksData.totalPass,
            totalFail: marksData.totalFail,
            totalAbsent: marksData.totalAbsent,
            students: marksData.students.filter(student => student.group === "Science")
        };
        
        renderStatistics(scienceStudents);
        renderTable(scienceStudents);
        updatePagination(scienceStudents);
    }
}

// Event listener for setting the page size
document.getElementById('set-page-size').addEventListener('click', () => {
    const inputValue = parseInt(document.getElementById('page-size').value);
    if (!isNaN(inputValue) && inputValue > 0) {
        pageSize = inputValue;
        currentPage = 1; // Reset to first page
        initialize();
    }
});

initialize();

// For Print the report
document.getElementById('print-button').addEventListener('click', function () {
    window.print();
});
