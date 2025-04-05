// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const departmentList = document.getElementById('department-list');
    const employeeList = document.getElementById('employee-list');

    const departmentForm = document.getElementById('department-form');
    const departmentIdInput = document.getElementById('department-id');
    const departmentNameInput = document.getElementById('department-name');
    const cancelDeptEditBtn = document.getElementById('cancel-dept-edit');
    const deptFormTitle = document.getElementById('dept-form-title');
    const deptErrorDiv = document.getElementById('dept-error');

    const employeeForm = document.getElementById('employee-form');
    const employeeIdInput = document.getElementById('employee-id');
    const employeeFirstNameInput = document.getElementById('employee-firstName');
    const employeeLastNameInput = document.getElementById('employee-lastName');
    const employeeDeptsCheckboxesDiv = document.getElementById('employee-departments-checkboxes');
    const deptSelectionErrorDiv = document.getElementById('dept-selection-error');
    const cancelEmpEditBtn = document.getElementById('cancel-emp-edit');
    const empFormTitle = document.getElementById('emp-form-title');
    const empErrorDiv = document.getElementById('emp-error');

    const API_BASE_URL = '/api'; // Use relative URL for API calls

    let availableDepartments = []; // Cache departments for employee form

    // --- Utility Functions ---
    const showErrorMessage = (div, message) => {
        div.textContent = message;
        div.style.display = 'block';
    };
    const clearErrorMessage = (div) => {
        div.textContent = '';
        div.style.display = 'none';
    };

    // --- Department Functions ---
    const resetDepartmentForm = () => {
        departmentForm.reset();
        departmentIdInput.value = '';
        deptFormTitle.textContent = 'Add Department';
        cancelDeptEditBtn.style.display = 'none';
        clearErrorMessage(deptErrorDiv);
    };

    const fetchDepartments = async () => {
        try {
            clearErrorMessage(deptErrorDiv);
            const response = await fetch(`${API_BASE_URL}/departments`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const departments = await response.json();
            availableDepartments = departments; // Update cache
            renderDepartments(departments);
            populateDepartmentCheckboxes(); // Update checkboxes in employee form
        } catch (error) {
            console.error("Error fetching departments:", error);
            departmentList.innerHTML = '<li>Error loading departments. Check console.</li>';
            showErrorMessage(deptErrorDiv, `Failed to load departments: ${error.message}`);
        }
    };

    const renderDepartments = (departments) => {
        departmentList.innerHTML = ''; // Clear list
        if (departments.length === 0) {
            departmentList.innerHTML = '<li>No departments found. Add one below!</li>';
            return;
        }
        departments.forEach(dept => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${dept.name}</span>
                <div>
                    <button class="edit-btn" data-id="${dept._id}" data-name="${dept.name}" title="Edit ${dept.name}">Edit</button>
                    <button class="delete-btn" data-id="${dept._id}" data-name="${dept.name}" title="Delete ${dept.name}">Delete</button>
                </div>
            `;
            departmentList.appendChild(li);
        });
    };

    const handleDepartmentSubmit = async (event) => {
        event.preventDefault();
        clearErrorMessage(deptErrorDiv);
        const name = departmentNameInput.value.trim();
        const id = departmentIdInput.value;
        if (!name) return showErrorMessage(deptErrorDiv, 'Department name cannot be empty.');

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/departments/${id}` : `${API_BASE_URL}/departments`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const result = await response.json(); // Try to parse JSON regardless of status
            if (!response.ok) {
                 throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            resetDepartmentForm();
            fetchDepartments(); // Refresh list and employee form checkboxes
        } catch (error) {
            console.error("Error saving department:", error);
            showErrorMessage(deptErrorDiv, `Error: ${error.message}`);
        }
    };

    const handleDepartmentEditClick = (id, name) => {
        departmentIdInput.value = id;
        departmentNameInput.value = name;
        deptFormTitle.textContent = 'Edit Department';
        cancelDeptEditBtn.style.display = 'inline-block';
        clearErrorMessage(deptErrorDiv);
        departmentNameInput.focus();
        // Optionally scroll form into view
        departmentForm.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDepartmentDeleteClick = async (id, name) => {
        if (!confirm(`Are you sure you want to delete the department "${name}"? This cannot be undone.`)) return;
        clearErrorMessage(deptErrorDiv);

        try {
             const response = await fetch(`${API_BASE_URL}/departments/${id}`, { method: 'DELETE' });
             const result = await response.json(); // Try parsing response
             if (!response.ok) {
                 throw new Error(result.message || `HTTP error! status: ${response.status}`);
             }
             fetchDepartments(); // Refresh list and employee form checkboxes
             // If the currently edited department was deleted, reset the form
             if(departmentIdInput.value === id) {
                resetDepartmentForm();
             }
        } catch (error) {
             console.error("Error deleting department:", error);
             showErrorMessage(deptErrorDiv, `Delete failed: ${error.message}`);
        }
    };

    // --- Employee Functions ---
    const resetEmployeeForm = () => {
        employeeForm.reset();
        employeeIdInput.value = '';
        empFormTitle.textContent = 'Add Employee';
        cancelEmpEditBtn.style.display = 'none';
        // Ensure checkboxes are correctly reset (unchecked)
        populateDepartmentCheckboxes();
        clearErrorMessage(empErrorDiv);
        clearErrorMessage(deptSelectionErrorDiv);
    };

    const populateDepartmentCheckboxes = () => {
        employeeDeptsCheckboxesDiv.innerHTML = ''; // Clear existing checkboxes
        if (availableDepartments.length === 0) {
            employeeDeptsCheckboxesDiv.innerHTML = '<span>No departments available. Please add departments first.</span>';
        } else {
            availableDepartments.forEach(dept => {
                const checkboxId = `emp-dept-${dept._id}`;
                const label = document.createElement('label');
                label.htmlFor = checkboxId;
                label.innerHTML = `
                    <input type="checkbox" name="departments" value="${dept._id}" id="${checkboxId}">
                    ${dept.name}
                `;
                employeeDeptsCheckboxesDiv.appendChild(label);
            });
        }
    };

    const fetchEmployees = async () => {
         try {
             clearErrorMessage(empErrorDiv);
             const response = await fetch(`${API_BASE_URL}/employees`);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
             const employees = await response.json();
             renderEmployees(employees);
         } catch (error) {
             console.error("Error fetching employees:", error);
             employeeList.innerHTML = '<li>Error loading employees. Check console.</li>';
             showErrorMessage(empErrorDiv, `Failed to load employees: ${error.message}`);
         }
    };

     const renderEmployees = (employees) => {
         employeeList.innerHTML = ''; // Clear list
          if (employees.length === 0) {
            employeeList.innerHTML = '<li>No employees found. Add one below!</li>';
            return;
         }
         employees.forEach(emp => {
             const li = document.createElement('li');
              const deptNames = emp.departments && Array.isArray(emp.departments) && emp.departments.length > 0
                  ? emp.departments.map(d => d ? d.name : 'Unknown').join(', ')
                  : 'None';
              const deptIds = emp.departments && Array.isArray(emp.departments)
                  ? emp.departments.map(d => d ? d._id : null).filter(id => id !== null)
                  : [];

             li.innerHTML = `
                 <span>${emp.firstName} ${emp.lastName} <em class="emp-depts">(Depts: ${deptNames})</em></span>
                 <div>
                      <button class="edit-btn" data-id="${emp._id}" data-firstname="${emp.firstName}" data-lastname="${emp.lastName}" data-departments='${JSON.stringify(deptIds)}' title="Edit ${emp.firstName} ${emp.lastName}">Edit</button>
                      <button class="delete-btn" data-id="${emp._id}" data-name="${emp.firstName} ${emp.lastName}" title="Delete ${emp.firstName} ${emp.lastName}">Delete</button>
                 </div>
             `;
             employeeList.appendChild(li);
         });
    };

    const handleEmployeeSubmit = async (event) => {
         event.preventDefault();
         clearErrorMessage(empErrorDiv);
         clearErrorMessage(deptSelectionErrorDiv);

         const firstName = employeeFirstNameInput.value.trim();
         const lastName = employeeLastNameInput.value.trim();
         const selectedCheckboxes = employeeDeptsCheckboxesDiv.querySelectorAll('input[name="departments"]:checked');
         const departments = Array.from(selectedCheckboxes).map(cb => cb.value);
         const id = employeeIdInput.value;

         if (!firstName || !lastName) return showErrorMessage(empErrorDiv, 'First and Last Name are required.');
         if (departments.length === 0) return showErrorMessage(deptSelectionErrorDiv, 'At least one department must be selected.');

         const method = id ? 'PUT' : 'POST';
         const url = id ? `${API_BASE_URL}/employees/${id}` : `${API_BASE_URL}/employees`;
         const payload = { firstName, lastName, departments };

         try {
              const response = await fetch(url, {
                 method: method,
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
             });
             const result = await response.json();
             if (!response.ok) {
                 throw new Error(result.message || `HTTP error! status: ${response.status}`);
             }
             resetEmployeeForm();
             fetchEmployees(); // Refresh employee list
         } catch (error) {
             console.error("Error saving employee:", error);
              showErrorMessage(empErrorDiv, `Error: ${error.message}`);
         }
    };

     const handleEmployeeEditClick = (id, firstName, lastName, departmentIds) => {
         employeeIdInput.value = id;
         employeeFirstNameInput.value = firstName;
         employeeLastNameInput.value = lastName;
         empFormTitle.textContent = 'Edit Employee';
         cancelEmpEditBtn.style.display = 'inline-block';
         clearErrorMessage(empErrorDiv);
         clearErrorMessage(deptSelectionErrorDiv);

        // Check the appropriate department checkboxes
        const allCheckboxes = employeeDeptsCheckboxesDiv.querySelectorAll('input[name="departments"]');
         allCheckboxes.forEach(cb => {
             // Check if the checkbox value (dept ID) is in the employee's departmentIds array
             cb.checked = departmentIds.includes(cb.value);
         });

        employeeFirstNameInput.focus();
        employeeForm.scrollIntoView({ behavior: 'smooth' });
    };

    const handleEmployeeDeleteClick = async (id, name) => {
         if (!confirm(`Are you sure you want to delete employee "${name}"?`)) return;
         clearErrorMessage(empErrorDiv);

        try {
             const response = await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
              const result = await response.json();
             if (!response.ok) {
                 throw new Error(result.message || `HTTP error! status: ${response.status}`);
             }
             fetchEmployees(); // Refresh list
             // If the currently edited employee was deleted, reset the form
             if(employeeIdInput.value === id) {
                resetEmployeeForm();
             }
        } catch (error) {
             console.error("Error deleting employee:", error);
             showErrorMessage(empErrorDiv, `Delete failed: ${error.message}`);
        }
    };


    // --- Event Listeners ---
    departmentForm.addEventListener('submit', handleDepartmentSubmit);
    cancelDeptEditBtn.addEventListener('click', resetDepartmentForm);

    employeeForm.addEventListener('submit', handleEmployeeSubmit);
    cancelEmpEditBtn.addEventListener('click', resetEmployeeForm);

    // Use event delegation for edit/delete buttons on the lists
     departmentList.addEventListener('click', (event) => {
         if (event.target.classList.contains('edit-btn')) {
             const button = event.target;
             handleDepartmentEditClick(button.dataset.id, button.dataset.name);
         } else if (event.target.classList.contains('delete-btn')) {
             const button = event.target;
             handleDepartmentDeleteClick(button.dataset.id, button.dataset.name);
         }
     });

    employeeList.addEventListener('click', (event) => {
         if (event.target.classList.contains('edit-btn')) {
              const button = event.target;
             const departmentIds = JSON.parse(button.dataset.departments || '[]');
             handleEmployeeEditClick(button.dataset.id, button.dataset.firstname, button.dataset.lastname, departmentIds);
         } else if (event.target.classList.contains('delete-btn')) {
              const button = event.target;
             handleEmployeeDeleteClick(button.dataset.id, button.dataset.name);
         }
     });

    // --- Initial Data Load ---
    fetchDepartments(); // Load departments first (populates checkboxes)
    fetchEmployees(); // Then load employees
});