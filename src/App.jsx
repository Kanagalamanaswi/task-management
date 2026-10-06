
import { useEffect, useState } from "react";
import "./App.css";

const initialTasks = [];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskflow_tasks")) || initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [section, setSection] = useState("Dashboard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;
  const today = new Date().toLocaleDateString("en-CA");

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
  }

  function saveTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    if (editingId !== null) {
      setTasks((old) =>
        old.map((t) =>
          t.id === editingId
            ? {
                ...t,
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate
              }
            : t
        )
      );
    } else {
      setTasks((old) => [
        ...old,
        {
          id: Date.now(),
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate,
          completed: false,
          createdAt: new Date().toISOString()
        }
      ]);
    }

    resetForm();
    setSection("All Tasks");
  }

  function editTask(task) {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setEditingId(task.id);
    setSection("Add Task");
  }

  function deleteTask(id) {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((old) => old.filter((t) => t.id !== id));
    }
  }

  function toggleTask(id) {
    setTasks((old) =>
      old.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < today
  ).length;

  const filteredTasks = tasks.filter((t) => {
    const matchesSection =
      section === "Completed Tasks"
        ? t.completed
        : section === "Pending Tasks"
        ? !t.completed
        : section === "Overdue Tasks"
        ? !t.completed && t.dueDate && t.dueDate < today
        : true;

    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      filterPriority === "All" || t.priority === filterPriority;

    return matchesSection && matchesSearch && matchesPriority;
  });

  const menu = [
    { name: "Dashboard", icon: "▦" },
    { name: "Add Task", icon: "+" },
    { name: "All Tasks", icon: "☰" },
    { name: "Pending Tasks", icon: "◷" },
    { name: "Completed Tasks", icon: "✓" },
    { name: "Overdue Tasks", icon: "!" }
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>TaskFlow</span>
        </div>

        <p className="menu-label">MENU</p>

        <nav>
          {menu.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                section === item.name ? "active" : ""
              }`}
              onClick={() => {
                setSection(item.name);
                resetForm();
                setSearch("");
                setFilterPriority("All");
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Pending Tasks" && (
                <span className="nav-count">{pending}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Task Management System</p>
          <span>React JS Project</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{section}</h1>
            <p>Manage your work and stay organized.</p>
          </div>
          <button
            className="primary-btn"
            onClick={() => {
              resetForm();
              setSection("Add Task");
            }}
          >
            + New Task
          </button>
        </header>

        {section === "Dashboard" && (
          <>
            <div className="welcome">
              <div>
                <h2>Welcome to TaskFlow!</h2>
                <p>Plan your tasks and track your progress.</p>
              </div>
              <span className="welcome-icon">✦</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card purple">
                <span className="stat-icon">☰</span>
                <p>Total Tasks</p>
                <h2>{tasks.length}</h2>
              </div>
              <div className="stat-card orange">
                <span className="stat-icon">◷</span>
                <p>Pending Tasks</p>
                <h2>{pending}</h2>
              </div>
              <div className="stat-card green">
                <span className="stat-icon">✓</span>
                <p>Completed Tasks</p>
                <h2>{completed}</h2>
              </div>
              <div className="stat-card red">
                <span className="stat-icon">!</span>
                <p>Overdue Tasks</p>
                <h2>{overdue}</h2>
              </div>
            </div>

            <section className="panel">
              <div className="panel-heading">
                <h2>Recent Tasks</h2>
                <button
                  className="text-btn"
                  onClick={() => setSection("All Tasks")}
                >
                  View all →
                </button>
              </div>

              {tasks.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="task-list">
                  {[...tasks].slice(-5).reverse().map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onEdit={editTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {section === "Add Task" && (
          <section className="panel form-panel">
            <h2>{editingId !== null ? "Edit Task" : "Create a New Task"}</h2>
            <p className="muted">Fill in the details below.</p>

            <form onSubmit={saveTask}>
              <label>Task Title *</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />

              <label>Description</label>
              <textarea
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />

              <div className="form-row">
                <div>
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label>Due Date</label>
                  <input
                    type="date"
                    min={today}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingId !== null ? "Update Task" : "Create Task"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        )}

        {section !== "Dashboard" && section !== "Add Task" && (
          <section className="panel">
            <div className="filters">
              <input
                type="search"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="All">All priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="panel-heading list-heading">
              <h2>{section}</h2>
              <span className="muted">{filteredTasks.length} tasks</span>
            </div>

            {filteredTasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="task-list">
                {[...filteredTasks].reverse().map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={editTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  return (
    <div className="task-row">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Complete ${task.title}`}
      />

      <div className="task-details">
        <h3 className={task.completed ? "done" : ""}>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          {task.dueDate && <span>Due: {task.dueDate}</span>}
          <span className={task.completed ? "status-done" : "status-pending"}>
            {task.completed ? "Completed" : "Pending"}
          </span>
        </div>
      </div>

      <div className="row-actions">
        <button className="edit-btn" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <span>☰</span>
      <h3>No tasks found</h3>
      <p>Add a task or change your filters.</p>
    </div>
  );
}

export default App;