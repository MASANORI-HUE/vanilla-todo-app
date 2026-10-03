document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const taskCount = document.getElementById('task-count');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // LocalStorageから取得、なければ空配列
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';

  // 保存処理
  const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
  };

  // 描画処理
  const render = () => {
    todoList.innerHTML = '';

    const filtered = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });

    if (filtered.length === 0) {
      todoList.innerHTML = `
        <li class="text-center text-slate-400 text-xs py-4">タスクがありません</li>
      `;
    } else {
      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition';
        li.innerHTML = `
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              ${todo.completed ? 'checked' : ''}
              class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              data-id="${todo.id}"
            />
            <span class="text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}">
              ${escapeHtml(todo.text)}
            </span>
          </div>
          <button
            class="delete-btn text-xs text-rose-500 hover:text-rose-700 p-1"
            data-id="${todo.id}"
          >
            削除
          </button>
        `;
        todoList.appendChild(li);
      });
    }

    // 残りタスク数の更新
    const remainingCount = todos.filter(t => !t.completed).length;
    taskCount.textContent = `残り ${remainingCount} 件`;
  };

  // XSS対策のエスケープ関数
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // タスク追加
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    todos.push({
      id: Date.now().toString(),
      text,
      completed: false
    });

    input.value = '';
    saveTodos();
    render();
  });

  // タスク完了・削除のイベント移譲
  todoList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.type === 'checkbox') {
      todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: e.target.checked } : todo
      );
      saveTodos();
      render();
    } else if (e.target.classList.contains('delete-btn')) {
      todos = todos.filter(todo => todo.id !== id);
      saveTodos();
      render();
    }
  });

  // フィルタ切り替え
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.className = 'filter-btn bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-md font-medium';
      });
      btn.className = 'filter-btn bg-slate-800 text-white px-3 py-1.5 rounded-md font-medium';
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // 初回描画
  render();
});