import Task from '../models/Task.js';

// 1. Create a task
export const createTask = async (req, res) => {
  try {
    const { title, priority, deadline } = req.body;
    const newTask = new Task({
      title,
      priority,
      deadline,
      stage: 0, 
      createdBy: req.userId 
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating task' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// 3. Update a task (edit details or change stage)
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId }, // Ensure they own the task
      req.body,
      { new: true } // Return the updated task
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// 4. Delete a task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message || 'Server error deleting task' });
  }
};
