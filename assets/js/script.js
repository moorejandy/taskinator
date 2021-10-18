var taskIdCounter = 0;

var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");

var tasks= [];

var taskFormHandler = function (event) {
  event.preventDefault();
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;

  if(!taskNameInput || !taskTypeInput) {
    alert("You need to fill out the task form.");
    return false;
  }

  formEl.reset();

  var isEdit = formEl.hasAttribute("data-task-id");
  
  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completeEditTask(taskNameInput, taskTypeInput, taskId);
  } 
  // no data attribute, so create object as normal and pass to createTaskEl function
  else {
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do",
    };
  
    createTaskEl(taskDataObj);
  }

};

var createTaskEl = function(taskDataObj){

  console.log(taskDataObj);
  console.log(taskDataObj.status);
  // create list item
  var listItemEl = document.createElement("li");
  listItemEl.className = "task-item";

  //add id as a custom data attribute
  listItemEl.setAttribute("data-task-id", taskIdCounter);

  // create div to hold task info and add to list item
  var taskInfoEl = document.createElement("div");
  taskInfoEl.className = "task-info";
  taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
  listItemEl.appendChild(taskInfoEl);

  var taskActionsEl = createTaskActions(taskIdCounter);
  listItemEl.appendChild(taskActionsEl);

  tasksToDoEl.appendChild(listItemEl);

  // add entire list item to list
  tasksToDoEl.appendChild(listItemEl);

  taskDataObj.id = taskIdCounter;
  tasks.push(taskDataObj);

  taskIdCounter++;

  saveTasks();
};

var createTaskActions = function(taskId) {
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";

  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id", taskId);

  actionContainerEl.appendChild(editButtonEl);

  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id", taskId);

  actionContainerEl.appendChild(deleteButtonEl);

  var statusSelectEl = document.createElement("select");
  statusSelectEl.className = "select-status";
  statusSelectEl.setAttribute("name", "status-change");
  statusSelectEl.setAttribute("data-task-id", taskId);

  actionContainerEl.appendChild(statusSelectEl);

  var statusChoices = ["To Do", "In Progress", "Completed"];

  for (i = 0; i < statusChoices.length; i++) {
    var statusOptionEl = document.createElement("option");
    statusOptionEl.setAttribute("value", statusChoices[i]);
    statusOptionEl.textContent = statusChoices[i];

    statusSelectEl.appendChild(statusOptionEl);
  }

  return actionContainerEl;
}

formEl.addEventListener("submit", taskFormHandler);

var taskButtonHandler = function(event){
  console.log(event.target);

  if(event.target.matches(".edit-btn")) {
    var taskId = event.target.getAttribute("data-task-id");
    editTask(taskId);
  }

  if (event.target.matches(".delete-btn")) {
    var taskId = event.target.getAttribute("data-task-id");
    deleteTask(taskId);
  }
}

pageContentEl.addEventListener("click", taskButtonHandler);

  var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    var updatedTaskArr = [];

    //loop through current tasks
    for ( var i = 0; i < tasks.length; i++) {
      if(tasks[i].id !== parseInt(taskId)) {
        updatedTaskArr.push(tasks[i]);
      }
    }

    tasks = updatedTaskArr;

    saveTasks();
  };

  var editTask = function(taskId) {
    console.log("editing task #" + taskId);

    //get task list item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get content from task name
    var taskName = taskSelected.querySelector("h3.task-name").textContent;

    //get content from task type
    var taskType = taskSelected.querySelector("span.task-type").textContent;
    
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    formEl.querySelector("#save-task").textContent = "Save Task";
    formEl.setAttribute("data-task-id", taskId);
  };

  var completeEditTask = function(taskName, taskType, taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    //loop through tasks array and update task object w/ new content

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === parseInt(taskId)) {
        tasks[i].name = taskName;
        tasks[i].type = taskType;
      }
    }

    saveTasks();

    alert("Task Updated.");

    formEl.removeAttribute("data-task-id");
    formEl.querySelector("#save-task").textContent = "Add Task";
  };

    var taskStatusChangeHandler = function(event) {
      // get the task item's id
    var taskId = event.target.getAttribute("data-task-id");
    
      // get the currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();
    
      // find the parent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if (statusValue === "to do") {
      tasksToDoEl.appendChild(taskSelected);
    } 
    else if (statusValue === "in progress") {
      tasksInProgressEl.appendChild(taskSelected);
    } 
    else if (statusValue === "completed") {
      tasksCompletedEl.appendChild(taskSelected);
     }

     for (var i = 0; i < tasks.length; i++) {
       if (tasks[i].id === parseInt(taskId)) {
         tasks[i].status = statusValue;
       }
     }

     saveTasks();

    };

    var saveTasks = function() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    var loadTasks = function() {
      //get task items from local storage
      var savedTasks = localStorage.getItem("tasks", tasks);

      if(!savedTasks) {
        return false;
      }
      //convert tasks from JSON into an array of objects
      savedTasks = JSON.parse(savedTasks);

      for (var i = 0; i < savedTasks.length; i++) {
        // pass each task object into the `createTaskEl()` function
        createTaskEl(savedTasks[i]);
      }
      console.log(savedTasks)
    }

    loadTasks();

  pageContentEl.addEventListener("change", taskStatusChangeHandler);
