import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, fetchTasks, updateTask, deleteTask, selectTasksByStage } from '../redux/taskSlice';
import Navbar from './Navbar';
import { TextField, MenuItem, IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';

const textFieldSx = {
  '& .MuiInputBase-input': { fontSize: '14px' },
  '& .MuiInputLabel-root': { fontSize: '14px' },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#fff',
    '&.Mui-focused fieldset': { borderColor: '#070707' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#070707' },
};

const STAGES = [
  { id: 0, title: 'Backlog', border: 'border-orange-200', background: 'bg-orange-100' },
  { id: 1, title: 'To Do', border: 'border-blue-200', background: 'bg-blue-100' },
  { id: 2, title: 'Ongoing', border: 'border-pink-200', background: 'bg-pink-100' },
  { id: 3, title: 'Done', border: 'border-green-200', background: 'bg-green-100' }
];

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export default function TaskManagement() {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(''); // Empty initially
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');
  const dateRef = useRef(null);

  // Edit State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); 

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !priority || !deadline) {
      setFormError('Please fill in all fields (Title, Priority, Deadline).');
      return;
    }

    dispatch(createTask({ title: title.trim(), priority, deadline }));
    setTitle('');
    setPriority('');
    setDeadline('');
  };

  const handleMove = (task, direction) => {
    const newStage = task.stage + direction;
    if (newStage >= 0 && newStage <= 3) {
      dispatch(updateTask({ id: task._id, updates: { stage: newStage } }));
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteTask(id));
    setDeleteConfirm(null);
  };

  const handleStartEdit = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline.split('T')[0]); 
  };

  const handleSaveEdit = (id) => {
    dispatch(updateTask({
      id,
      updates: { title: editTitle, priority: editPriority, deadline: editDeadline }
    }));
    setEditingTask(null);
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    setShowTrash(true);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDropColumn = (e, stageId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      dispatch(updateTask({ id: taskId, updates: { stage: stageId } }));
    }
    setDraggedTaskId(null);
    setShowTrash(false);
  };

  const handleDropTrash = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      setDeleteConfirm(taskId); 
    }
    setDraggedTaskId(null);
    setShowTrash(false);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setShowTrash(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Task Management</h1>
        
        {/* Create Task Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 mb-4 w-full">
          <TextField
            fullWidth label="Task Name" placeholder="E.g., Design homepage"
            value={title} onChange={(e) => setTitle(e.target.value)}
            sx={{ ...textFieldSx, flex: { md: 1 } }} InputLabelProps={{ shrink: true }}
          />
          <TextField
            select label="Priority"
            value={priority} onChange={(e) => setPriority(e.target.value)}
            sx={{ ...textFieldSx, minWidth: '160px', width: { xs: '100%', md: 'auto' } }} InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="high" sx={{ fontSize: '14px' }}>High</MenuItem>
            <MenuItem value="medium" sx={{ fontSize: '14px' }}>Medium</MenuItem>
            <MenuItem value="low" sx={{ fontSize: '14px' }}>Low</MenuItem>
          </TextField>
          <TextField
            type="date" label="Deadline"
            value={deadline} onChange={(e) => setDeadline(e.target.value)}
            inputRef={dateRef} onClick={() => dateRef.current?.showPicker()}
            inputProps={{ min: getTomorrowDateString() }}
            sx={{ ...textFieldSx, minWidth: '160px', width: { xs: '100%', md: 'auto' }, cursor: 'pointer' }}
            InputLabelProps={{ shrink: true }}
          />
          <button type="submit" disabled={loading} className="w-full md:w-auto px-8 h-[52px] rounded-xl text-white font-semibold text-sm cursor-pointer transition-all disabled:opacity-50 hover:shadow-lg whitespace-nowrap" style={{ background: '#070707' }}>
            {loading ? 'Adding...' : '+ Create Task'}
          </button>
        </form>
        {formError && <p className="text-red-500 text-sm mb-6">{formError}</p>}

        {/* Kanban Board */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {STAGES.map(stage => (
            <StageColumn 
              key={stage.id} stage={stage}
              editingTask={editingTask} editTitle={editTitle} editPriority={editPriority} editDeadline={editDeadline}
              setEditTitle={setEditTitle} setEditPriority={setEditPriority} setEditDeadline={setEditDeadline}
              onMove={handleMove} onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit} onCancelEdit={() => setEditingTask(null)}
              onDelete={(id) => setDeleteConfirm(id)}
              onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={(e) => handleDropColumn(e, stage.id)} onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>

      {/* Floating Trash Bin */}
      {showTrash && (
        <div 
          onDragOver={handleDragOver} 
          onDrop={handleDropTrash}
          className="fixed bottom-10 right-10 w-20 h-20 bg-gray-50/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center text-gray-400 shadow-xl transition-all hover:scale-110 hover:border-red-400 hover:text-red-500 hover:bg-red-50 z-50"
        >
          <DeleteOutlined sx={{ fontSize: 32 }} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Task?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to permanently remove this task? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer shadow-md">Delete Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for each column to keep things clean and use Redux selectors efficiently
function StageColumn({ 
  stage, editingTask, editTitle, editPriority, editDeadline, 
  setEditTitle, setEditPriority, setEditDeadline,
  onMove, onStartEdit, onSaveEdit, onCancelEdit, onDelete,
  onDragStart, onDragOver, onDrop, onDragEnd
}) {
  const tasks = useSelector(selectTasksByStage(stage.id));

  return (
    <div 
      onDragOver={onDragOver} 
      onDrop={onDrop}
      className={`bg-white rounded-md p-4 min-h-[500px] border-t-[3px] border-[1px] ${stage.border} ${stage.background} shadow-sm flex flex-col`}
    >
      <div className="flex items-center mb-5 mt-1">
        <h2 className="font-bold text-gray-800 text-[15px]">{stage.title}</h2>
        <span className="text-gray-400 text-[15px] ml-2">({tasks.length})</span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {tasks.map(task => (
          <div 
            key={task._id} 
            draggable 
            onDragStart={(e) => onDragStart(e, task._id)}
            onDragEnd={onDragEnd}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing active:rotate-2 active:shadow-lg active:scale-[1.02] hover:shadow-md transition-all"
          >
            {editingTask === task._id ? (
              // EDIT MODE
              <div className="flex flex-col gap-2">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border p-1.5 rounded text-sm w-full outline-blue-500" />
                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="border p-1.5 rounded text-sm w-full outline-blue-500">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input type="date" min={getTomorrowDateString()} value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="border p-1.5 rounded text-sm w-full outline-blue-500" />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onSaveEdit(task._id)} className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded hover:bg-green-600 cursor-pointer">Save</button>
                  <button onClick={onCancelEdit} className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded hover:bg-gray-300 cursor-pointer">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-700 text-[14px] mb-3 leading-tight">{task.title}</h3>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-400 text-[11px] font-semibold px-2 py-1 rounded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                  </span>
                  
                  {/* Subtle priority dot based on the image's bottom right indicator */}
                  <span className={`w-2 h-2 rounded-full 
                    ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`}
                    title={`Priority: ${task.priority}`}
                  ></span>
                </div>
                
                {/* ACTION BUTTONS (Hidden subtly until hovered or just styled light) */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-1 -mx-1">
                  <div className="flex gap-0">
                    <IconButton size="small" onClick={() => onMove(task, -1)} disabled={stage.id === 0} sx={{ color: '#d1d5db', '&:hover': { color: '#6b7280' } }}>
                      <ArrowBack sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => onMove(task, 1)} disabled={stage.id === 3} sx={{ color: '#d1d5db', '&:hover': { color: '#6b7280' } }}>
                      <ArrowForward sx={{ fontSize: 14 }} />
                    </IconButton>
                  </div>
                  <div className="flex gap-0">
                    <IconButton size="small" onClick={() => onStartEdit(task)} sx={{ color: '#d1d5db', '&:hover': { color: '#3b82f6' } }}>
                      <Edit sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(task._id)} sx={{ color: '#d1d5db', '&:hover': { color: '#ef4444' } }}>
                      <Delete sx={{ fontSize: 14 }} />
                    </IconButton>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}