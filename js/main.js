const projectOptions = [
	{ value: "", label: "No Project" },
	{ value: "Work", label: "Work" },
	{ value: "Personal", label: "Personal" },
	{ value: "Errands", label: "Errands" },
];

document.addEventListener("DOMContentLoaded", () => {
	loadTasks();
	loadTheme();
	setupDragAndDrop();
	populateProjectDropdown("projectSelect"); // ✅ Populate the main dropdown

	document.getElementById("darkModeToggle").addEventListener("change", toggleTheme);
});

// Function to populate project dropdowns
function populateProjectDropdown(selectId, selectedValue = "") {
	const selectMenu = document.getElementById(selectId);
	selectMenu.innerHTML = `
      <option value="">-- Select Project (Optional) --</option>
      ${projectOptions
				.map(
					(project) =>
						`<option value="${project.value}" ${project.value === selectedValue ? "selected" : ""}>
              ${project.label}
          </option>`
				)
				.join("")}
  `;
}

function loadTheme() {
	const darkModeEnabled = localStorage.getItem("darkMode") === "enabled";
	document.body.classList.toggle("dark-mode", darkModeEnabled);
	document.getElementById("darkModeToggle").checked = darkModeEnabled;
}

function toggleTheme() {
	const darkModeEnabled = document.getElementById("darkModeToggle").checked;
	document.body.classList.toggle("dark-mode", darkModeEnabled);
	localStorage.setItem("darkMode", darkModeEnabled ? "enabled" : "disabled");
}

function addTask() {
	const taskInput = document.getElementById("taskInput");
	const projectSelect = document.getElementById("projectSelect");
	const taskText = taskInput.value.trim();
	const project = projectSelect.value.trim();

	if (taskText === "") return alert("Please enter a task.");

	const taskList = document.getElementById("taskList");
	const li = document.createElement("li");
	li.draggable = true;
	li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

	// Display format: Show project if selected
	let taskDisplay = project ? `<strong>Project Name:</strong> ${project}<br><strong>Task:</strong> ${taskText}` : `<strong>Task:</strong> ${taskText}`;

	li.innerHTML = `
        <div class="task-content">${taskDisplay}</div>
        <div>
            <button class="btn btn-warning btn-sm me-2" onclick="editTask(this)">
                <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="btn btn-secondary btn-sm me-2" onclick="copyTask(this)">
                <i class="fa-solid fa-copy"></i> Copy
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(this)">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </div>
    `;

	taskList.appendChild(li);
	taskInput.value = "";
	projectSelect.value = "";

	saveTasks();
	setupDragAndDrop();
}

function editTask(button) {
	const taskItem = button.closest("li");
	const taskContent = taskItem.querySelector(".task-content");

	// Extract project name and task text
	let projectName = "";
	let taskDescription = "";

	taskContent.innerText.split("\n").forEach((line) => {
		if (line.startsWith("Project Name:")) {
			projectName = line.replace("Project Name:", "").trim();
		} else if (line.startsWith("Task:")) {
			taskDescription = line.replace("Task:", "").trim();
		}
	});

	// Create a unique ID for the dropdown
	const dropdownId = `edit-project-${Math.random().toString(36).substr(2, 9)}`;

	// Replace task content with editable fields
	taskContent.innerHTML = `
      <div class="edit-container">
          <select id="${dropdownId}" class="form-select form-select-sm edit-project"></select>
          <input type="text" class="form-control form-control-sm edit-task" value="${taskDescription}">
      </div>
  `;

	// Populate the select menu with the same JSON data
	populateProjectDropdown(dropdownId, projectName);

	// Change buttons to "Save" and "Cancel"
	button.parentElement.innerHTML = `
      <button class="btn btn-success btn-sm me-2" onclick="saveTask(this, '${dropdownId}')">
          <i class="fa-solid fa-check"></i> Save
      </button>
      <button class="btn btn-secondary btn-sm" onclick="cancelEdit(this, '${projectName}', '${taskDescription}')">
          <i class="fa-solid fa-xmark"></i> Cancel
      </button>
  `;
}

function saveTask(button, dropdownId) {
	const taskItem = button.closest("li");
	const taskContent = taskItem.querySelector(".task-content");

	// Get edited values
	const newProject = document.getElementById(dropdownId).value.trim();
	const newTaskText = taskItem.querySelector(".edit-task").value.trim();

	if (newTaskText === "") return alert("Task cannot be empty!");

	// Update task display
	let updatedDisplay = newProject
		? `<strong>Project Name:</strong> ${newProject}<br><strong>Task:</strong> ${newTaskText}`
		: `<strong>Task:</strong> ${newTaskText}`;

	taskContent.innerHTML = updatedDisplay;

	// Restore buttons
	button.parentElement.innerHTML = `
      <button class="btn btn-warning btn-sm me-2" onclick="editTask(this)">
          <i class="fa-solid fa-pen"></i> Edit
      </button>
      <button class="btn btn-secondary btn-sm me-2" onclick="copyTask(this)">
          <i class="fa-solid fa-copy"></i> Copy
      </button>
      <button class="btn btn-danger btn-sm" onclick="deleteTask(this)">
          <i class="fa-solid fa-trash"></i> Delete
      </button>
  `;

	saveTasks(); // ✅ Update localStorage
}

function cancelEdit(button, originalProject, originalTask) {
	const taskItem = button.closest("li");
	const taskContent = taskItem.querySelector(".task-content");

	// Restore original content
	let restoredDisplay = originalProject
		? `<strong>Project Name:</strong> ${originalProject}<br><strong>Task:</strong> ${originalTask}`
		: `<strong>Task:</strong> ${originalTask}`;

	taskContent.innerHTML = restoredDisplay;

	// Restore buttons
	button.parentElement.innerHTML = `
    <button class="btn btn-warning btn-sm me-2" onclick="editTask(this)">
        <i class="fa-solid fa-pen"></i> Edit
    </button>
    <button class="btn btn-secondary btn-sm me-2" onclick="copyTask(this)">
        <i class="fa-solid fa-copy"></i> Copy
    </button>
    <button class="btn btn-danger btn-sm" onclick="deleteTask(this)">
        <i class="fa-solid fa-trash"></i> Delete
    </button>
  `;
}

function copyTask(button) {
	const taskText = button.parentElement.previousElementSibling.innerText.trim();
	navigator.clipboard.writeText(taskText).then(() => {
		showAlert("Task copied to clipboard!", "success");
	});
}

function deleteTask(button) {
	button.closest("li").remove();
	saveTasks();
	showAlert("Task deleted successfully!", "danger");
}

function showAlert(message, type) {
	const alertContainer = document.getElementById("alertContainer");

	// Create a new alert div
	const alertDiv = document.createElement("div");
	alertDiv.className = `alert alert-${type} alert-dismissible fade show text-center`;
	alertDiv.setAttribute("role", "alert");
	alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

	// Append the alert to the container
	alertContainer.appendChild(alertDiv);

	// Remove the alert after 3 seconds
	setTimeout(() => {
		alertDiv.classList.remove("show");
		alertDiv.classList.add("fade");
		setTimeout(() => alertDiv.remove(), 500); // Ensure smooth fade out
	}, 3000);
}

function deleteAllTasks() {
	if (confirm("Are you sure you want to delete all tasks?")) {
		document.getElementById("taskList").innerHTML = "";
		saveTasks();
		showAlert("All tasks deleted successfully!", "danger"); // ❌ Red alert
	}
}

function copyAllTasks() {
	const taskList = document.querySelectorAll("#taskList li .task-content");
	if (taskList.length === 0) {
		return alert("No tasks to copy.");
	}

	const now = new Date();
	const options = { timeZone: "America/Phoenix", year: "numeric", month: "long", day: "numeric" };
	const formattedDate = new Intl.DateTimeFormat("en-US", options).format(now);

	const includeWeek = document.getElementById("includeWeekCheckbox").checked;
	const weekNumber = getWeekNumber(now);

	let copyText = "";
	if (includeWeek) {
		copyText += `Week ${weekNumber}\n`;
	}
	copyText += `${formattedDate}\n\n`;

	let tasksByProject = {}; // Object to group tasks by project name

	taskList.forEach((div) => {
		let projectName = "";
		let taskDescription = "";

		div.innerText.split("\n").forEach((line) => {
			if (line.startsWith("Project Name:")) {
				projectName = line.replace("Project Name:", "").trim();
			} else if (line.startsWith("Task:")) {
				taskDescription = line.replace("Task:", "").trim();
			}
		});

		if (!taskDescription) return; // Ignore empty tasks

		// Default to "No Project" if no project name exists
		if (!projectName) projectName = "No Project";

		// Group tasks by project name
		if (!tasksByProject[projectName]) {
			tasksByProject[projectName] = [];
		}

		tasksByProject[projectName].push(`Task: ${taskDescription}\n---`);
	});

	// Construct the final text output
	Object.keys(tasksByProject).forEach((project) => {
		if (project !== "No Project") {
			copyText += `Project Name: ${project}\n`;
		}
		copyText += tasksByProject[project].join("\n") + "\n";
	});

	navigator.clipboard.writeText(copyText.trim()).then(() => {
		showAlert("All tasks copied to clipboard!", "success"); // ✅ Green alert
	});
}

function getWeekNumber(date) {
	const start = new Date(date.getFullYear(), 0, 1);
	const diff = date - start + ((start.getDay() + 6) % 7) * 86400000;
	return Math.ceil(diff / (7 * 86400000));
}

function saveTasks() {
	const tasks = Array.from(document.querySelectorAll("#taskList li")).map((li) => {
		const taskContent = li.querySelector(".task-content").innerText.trim();

		let projectName = "";
		let taskDescription = "";

		taskContent.split("\n").forEach((line) => {
			if (line.startsWith("Project Name:")) {
				projectName = line.replace("Project Name:", "").trim();
			} else if (line.startsWith("Task:")) {
				taskDescription = line.replace("Task:", "").trim();
			}
		});

		return {
			project: projectName,
			text: taskDescription,
		};
	});

	localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
	const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
	const taskList = document.getElementById("taskList");
	taskList.innerHTML = "";

	savedTasks.forEach((task) => {
		const li = document.createElement("li");
		li.draggable = true;
		li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

		// Correctly format task display
		let taskDisplay = task.project
			? `<strong>Project Name:</strong> ${task.project}<br><strong>Task:</strong> ${task.text}`
			: `<strong>Task:</strong> ${task.text}`;

		li.innerHTML = `
            <div class="task-content">${taskDisplay}</div>
            <div>
                <button class="btn btn-warning btn-sm me-2" onclick="editTask(this)">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-secondary btn-sm me-2" onclick="copyTask(this)">
                    <i class="fa-solid fa-copy"></i> Copy
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(this)">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;

		taskList.appendChild(li);
	});

	setupDragAndDrop();
}

function setupDragAndDrop() {
	const taskList = document.getElementById("taskList");
	let draggedItem = null;

	document.querySelectorAll("#taskList li").forEach((item) => {
		item.setAttribute("draggable", "true");

		// Start dragging
		item.addEventListener("dragstart", (e) => {
			draggedItem = item;
			e.dataTransfer.effectAllowed = "move";
			setTimeout(() => item.classList.add("dragging"), 0);
		});

		// Remove dragging class when done
		item.addEventListener("dragend", () => {
			draggedItem.classList.remove("dragging");
			saveTasks(); // ✅ Save new order after drag-and-drop
		});

		// Allow drop target
		item.addEventListener("dragover", (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";

			const afterElement = getDragAfterElement(taskList, e.clientY);
			if (afterElement == null) {
				taskList.appendChild(draggedItem);
			} else {
				taskList.insertBefore(draggedItem, afterElement);
			}
		});
	});
}

// Helper function to find where to insert the dragged item
function getDragAfterElement(taskList, y) {
	const draggableElements = [...taskList.querySelectorAll("li:not(.dragging)")];

	return draggableElements.reduce(
		(closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		},
		{ offset: Number.NEGATIVE_INFINITY }
	).element;
}
