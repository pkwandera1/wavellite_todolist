import { addProject, setActiveProjectId, getActiveProjectId, getProjects, getProjectById, removeProject } from '../app/projectManager';
import { addTodo, reorderTodos } from '../app/todoManager';
import { saveProjects } from '../storage/localStorage';
import { renderProjects, renderTodos, renderApp } from './domController';
import createProject from '../app/project';
import createTodo from '../app/todo';

export function initEventListeners() {
  const addProjectBtn = document.getElementById('add-project-btn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      const projectModal = document.getElementById('projectModal');
      const projectNameInput = document.getElementById('projectNameInput');
      if (projectModal && projectNameInput) {
        projectModal.classList.remove('hidden');
        projectNameInput.focus();
      }
    });
  }

  const projectList = document.getElementById('project-list');
  if (projectList) {
    projectList.addEventListener('click', (e) => {
      const target = e.target.closest('[data-project-id]');
      if (
        target &&
        !e.target.classList.contains('edit-project-btn') &&
        !e.target.classList.contains('delete-project-btn')
      ) {
        const id = target.dataset.projectId;
        setActiveProjectId(id);
        renderProjects();
        renderTodos();
      }
    });
  }
  

  const todoForm = document.getElementById('todo-form');
  if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const todo = createTodo(
        data.get('title'),
        data.get('description'),
        data.get('dueDate'),
        data.get('priority')
      );
      addTodo(getActiveProjectId(), todo);
      saveProjects(getProjects());
      renderTodos();
      e.target.reset();
    });
  }

  const todoList = document.getElementById('todo-list');
  let dragged;
  
  // ✅ Drag and Drop functionality
  if (todoList) {
    todoList.addEventListener('dragstart', (e) => {
      dragged = e.target;
    });
  
    todoList.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
  
    todoList.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.target.closest('li') && dragged) {
        const list = [...document.querySelectorAll('#todo-list li')];
        const draggedIndex = list.indexOf(dragged);
        const targetIndex = list.indexOf(e.target.closest('li'));
  
        const todos = getProjects()
          .find(p => p.id === getActiveProjectId())
          .todos.slice();
  
        const [moved] = todos.splice(draggedIndex, 1);
        todos.splice(targetIndex, 0, moved);
  
        reorderTodos(getActiveProjectId(), todos);
        saveProjects(getProjects());
        renderTodos();
      }
    });
  
    // ✅ Click actions (mark complete, edit, delete)
    todoList.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const project = getProjectById(getActiveProjectId());
  
      if (!id || !project) return;
  
      // ✅ Mark as complete
      if (e.target.classList.contains('mark-complete-btn')) {
        const todo = project.todos.find(t => t.id === id);
        if (todo) {
          todo.completed = true;
          saveProjects(getProjects());
          renderTodos(); // Show remaining active todos
        }
      }
  
      // 🗑️ Delete completed
      if (e.target.classList.contains('delete-completed-btn')) {
        project.todos = project.todos.filter(t => t.id !== id);
        saveProjects(getProjects());
  
        const completedTodos = project.todos.filter(todo => todo.completed);
        renderTodos(completedTodos, true); // Show updated completed list
      }
  
      // 📝 Edit todo
      if (e.target.classList.contains('edit-todo-btn')) {
        const todo = project.todos.find(t => t.id === id);
        if (todo) {
          const newTitle = prompt('Edit title:', todo.title);
          const newDescription = prompt('Edit description:', todo.description);
          const newDueDate = prompt('Edit due date (YYYY-MM-DD):', todo.dueDate);
          const newPriority = prompt('Edit priority (low, medium, high):', todo.priority);
  
          if (newTitle && newDueDate && newPriority) {
            todo.title = newTitle;
            todo.description = newDescription;
            todo.dueDate = newDueDate;
            todo.priority = newPriority;
            saveProjects(getProjects());
  
            const isCompleted = todo.completed;
            const todosToRender = project.todos.filter(t => t.completed === isCompleted);
            renderTodos(todosToRender, isCompleted);
          }
        }
      }
  
      // 🗑️ Delete active todo
      if (e.target.classList.contains('delete-todo-btn')) {
        project.todos = project.todos.filter(t => t.id !== id);
        saveProjects(getProjects());
  
        const activeTodos = project.todos.filter(todo => !todo.completed);
        renderTodos(activeTodos, false);
      }
    });
  }
  
  // ✅ View completed button
  const viewCompletedBtn = document.getElementById('view-completed-btn');
  if (viewCompletedBtn) {
    viewCompletedBtn.addEventListener('click', () => {
      const project = getProjectById(getActiveProjectId());
      const completedTodos = project.todos.filter(todo => todo.completed);
      renderTodos(completedTodos, true);
    });
  }
  


  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      const projectId = e.target.dataset.projectId;

      if (e.target.classList.contains('edit-project-btn')) {
        const newName = prompt('Enter new project name:');
        if (newName) {
          const project = getProjectById(projectId);
          if (project) {
            project.name = newName;
            saveProjects(getProjects());
            renderApp();
          }
        }
      }

      if (e.target.classList.contains('delete-project-btn')) {
        const confirmDelete = confirm('Are you sure you want to delete this project?');
        if (confirmDelete) {
          removeProject(projectId);
          const remaining = getProjects();
          if (remaining.length > 0) {
            setActiveProjectId(remaining[0].id);
          } else {
            const defaultProject = createProject('Today');
            addProject(defaultProject);
            setActiveProjectId(defaultProject.id);
          }
          saveProjects(getProjects());
          renderApp();
        }
      }
    });
  }
}
