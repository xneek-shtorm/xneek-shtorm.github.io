import { getData, getNextKey, setData } from './firebase.js';
import { Item, Placeholder, RoomFooter } from './ui.js';

const sp = new URLSearchParams(window.location.search);
const room = sp.get('room') || 'all';

function loadTasks() {
  tasks_list.innerHTML = '';
  tasks_list.append(new Placeholder(`Loading...`));
  getData(`tasks/${room}`).then((res) => {
    if (!res) {
      tasks_list.innerHTML = '';
      tasks_list.append(new Placeholder(`Has no tasks in room «${room}»`));
      return;
    };
    const arr = Object.values(res).reverse();
    tasks_list.innerHTML = '';
    arr.forEach((taskData) => {
      tasks_list.append(new Item(taskData));
    })
  })
}

function loadOneTask(id) {
  if (id === 'new') {
    taskForm.reset();
    taskDialog.showModal();
    return;
  }


  getData(`tasks/${room}/${id}`).then((taskData) => {
    taskForm.elements.id.value = taskData.id;
    taskForm.elements.name.value = taskData.name;
    taskForm.elements.complete.checked = taskData.isComplete;
    taskForm.elements.description.value = taskData.description;
    taskForm.elements.metadata.value = taskData.metadata;
    taskForm.elements.createdAt.value = taskData.createdAt;
    taskForm.elements.updatedAt.value = taskData.updatedAt;
    taskDialog.showModal()
  })
}



addTaskBtn.onclick = () => {
  window.location.href = '#new'
}
refreshBtn.onclick = () => {
  loadTasks()
}

taskForm.onsubmit = () => {
  const entryId = taskForm.elements.id.value;
  const name = taskForm.elements.name.value;
  const isComplete = taskForm.elements.complete.checked;
  const description = taskForm.elements.description.value;
  const metadata = taskForm.elements.metadata.value;
  const createdAt = taskForm.elements.createdAt.value;
  const updatedAt = taskForm.elements.updatedAt.value;

  const id = entryId || getNextKey('tasks');

  const data = {
    id,
    name,
    isComplete,
    description,
    metadata,
    createdAt,
    updatedAt
  }

  if (entryId) {
    data.updatedAt = new Date().toISOString();
  } else {
    data.createdAt = new Date().toISOString();
  }

  setData(`tasks/${room}/${id}`, data).then(() => {
    
    const temp = taskForm.innerHTML;
    taskForm.innerHTML = `✅ Successfully saved`;
    taskDialog.show()
    setTimeout(() => {
      
      taskForm.innerHTML = temp;
      taskForm.onreset();
    }, 1000);
    
    loadTasks();
  });
}

taskForm.onreset = () => {
  taskDialog.close();
}

taskDialog.onclose = () => {
  window.location.hash = ""
}

function init() {
  if (window.location.hash.length > 1) {
    loadOneTask(window.location.hash.substring(1));
  } else {
    pageTitle.textContent = `Tasks of ${room}`;
    document.title = `Tasks of ${room}`;
  }

  pageFooter.innerHTML = '';
  pageFooter.append(new RoomFooter(room));
  
}

window.onhashchange = () => {
  init()
}

window.onload = () => {
  init();
  loadTasks();
}