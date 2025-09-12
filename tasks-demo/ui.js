export class Item {
  constructor(taskData) {
      const li = document.createElement('li');

      const a = document.createElement('a');
      a.href = `#${taskData.id}`
      a.style.opacity = taskData.isComplete ? 0.4 : 1;
      

      const strong = document.createElement('strong');
      strong.title = [taskData.name, taskData.description, taskData.metadata].join('\n---\n')
      strong.textContent = taskData.name;
      strong.style.textDecorationLine = taskData.isComplete ? 'line-through' : 'none';
      a.append(strong);

      const em = document.createElement('em');
      em.textContent = taskData.description;
      a.append(em);

      const small = document.createElement('small');
      small.title = [taskData.createdAt, taskData.updatedAt].join('\n')
      small.textContent = [new Date(taskData.createdAt).toLocaleString(), taskData.updatedAt && new Date(taskData.updatedAt).toLocaleString()].filter(Boolean).join(' • ');

      a.append(small);

      li.append(a);

      return li;
  }
}

export class Placeholder {
  constructor(text) {
      const span = document.createElement('span');
      span.classList.add('placeholder');
      span.textContent = text

      return span;
  }
}
export class RoomFooter {
  constructor(project) {
    const span = document.createElement('span');
    span.textContent = `Current project is: «${project}». `;
    const a = document.createElement('a');
    a.textContent = 'Create new';
    a.href='javascript:void(0)';
    a.onclick = () => {
      const name = prompt('Room name', project);
      if (name) {
        window.location.href = `?project=${name.replace(/\s+/g, '_')}`
      }
    }
    span.append(a);
    return span;
  }
}