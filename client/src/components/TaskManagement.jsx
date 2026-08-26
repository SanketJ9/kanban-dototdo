import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  selectTasksByStage,
  selectTasksLoading,
  selectTaskError,
  clearTaskError,
} from '../redux/taskSlice';
import Navbar from './Navbar';

const STAGES = [
  { id: 0, name: 'Backlog', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { id: 1, name: 'To Do', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 2, name: 'Ongoing', color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff' },
  { id: 3, name: 'Done', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
];

const PRIORITY_COLORS = {
  high: { text: '#dc2626', bg: '#fef2f2' },
  medium: { text: '#f59e0b', bg: '#fffbeb' },
  low: { text: '#22c55e', bg: '#f0fdf4' },
};

export default function TaskManagement() {
  const { token } = useAuth();
  const dispatch = useDispatch();
  const loading = useSelector(selectTasksLoading);
  const error = useSelector(selectTaskError);

  // Form state
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');

  // Edit state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (token) dispatch(fetchTasks());
  }, [token, dispatch]);

  // Handle create task
  const handleCreateTask = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !priority || !deadline) {
      setFormError('Please fill in all fields: task name, priority, and deadline.');
      return;
    }

    dispatch(createTask({ title: title.trim(), priority, deadline }));
    setTitle('');
    setPriority('');
    setDeadline('');
  };

  // Handle move task
  const handleMove = (taskId, newStage) => {
    dispatch(moveTask({ id: taskId, stage: newStage }));
  };

  // Handle edit
  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline?.split('T')[0] || '');
  };

  const handleSaveEdit = (taskId) => {
    if (!editTitle.trim() || !editPriority || !editDeadline) return;
    dispatch(updateTask({
      id: taskId,
      updates: { title: editTitle.trim(), priority: editPriority, deadline: editDeadline },
    }));
    setEditingTask(null);
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  // Handle delete
  const handleDelete = (taskId) => {
    dispatch(deleteTask(taskId));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Task Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Task Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task name..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-colors bg-white"
              >
                <option value="">Select...</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="w-44">
              <label className="block text-xs font-medium text-gray-500 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              + Create Task
            </button>
          </form>
          {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              editingTask={editingTask}
              editTitle={editTitle}
              editPriority={editPriority}
              editDeadline={editDeadline}
              setEditTitle={setEditTitle}
              setEditPriority={setEditPriority}
              setEditDeadline={setEditDeadline}
              onMove={handleMove}
              onStartEdit={startEditing}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={cancelEditing}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Are you sure you want to delete this task?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// STAGE COLUMN COMPONENT
// ==========================================
function StageColumn({
  stage, editingTask, editTitle, editPriority, editDeadline,
  setEditTitle, setEditPriority, setEditDeadline,
  onMove, onStartEdit, onSaveEdit, onCancelEdit,
  deleteConfirm, setDeleteConfirm, onDelete,
}) {
  const tasks = useSelector(selectTasksByStage(stage.id));

  return (
    <div
      className="rounded-2xl p-4 min-h-[400px]"
      style={{ backgroundColor: stage.bg, border: `1px solid ${stage.border}` }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }}></div>
          <span className="text-sm font-semibold text-gray-800">{stage.name}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: stage.color }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
            {editingTask === task._id ? (
              /* Edit Mode */
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                />
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onSaveEdit(task._id)}
                    className="flex-1 text-xs py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="flex-1 text-xs py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                    style={{
                      color: PRIORITY_COLORS[task.priority]?.text,
                      backgroundColor: PRIORITY_COLORS[task.priority]?.bg,
                    }}
                  >
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-400">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : ''}
                  </span>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-1 border-t border-gray-100 pt-2">
                  {/* Back */}
                  <button
                    onClick={() => onMove(task._id, task.stage - 1)}
                    disabled={task.stage === 0}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move back"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  {/* Forward */}
                  <button
                    onClick={() => onMove(task._id, task.stage + 1)}
                    disabled={task.stage === 3}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move forward"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  <div className="flex-1"></div>
                  {/* Edit */}
                  <button
                    onClick={() => onStartEdit(task)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(task._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No tasks here</p>
        )}
      </div>
    </div>
  );
}
