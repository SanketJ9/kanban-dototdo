import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'], // Forces the value to only be one of these three
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  stage: {
    type: Number,
    default: 0 // 0 = Backlog, 1 = To Do, 2 = Ongoing, 3 = Done
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates a relationship linking this task to a specific User document
    required: true
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

export default mongoose.model('Task', taskSchema);