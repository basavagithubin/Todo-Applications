const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    startDate: { type: Date },
    completedAt: { type: Date },
    progress: [
      {
        percent: { type: Number, min: 0, max: 100, required: true },
        note: { type: String, default: '' },
        at: { type: Date, default: Date.now }
      }
    ],
    tags: [{ type: String }],
    subtasks: [subtaskSchema],
    isDeleted: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

todoSchema.index({ user: 1, isDeleted: 1, createdAt: -1 });
todoSchema.index({ user: 1, isDeleted: 1, status: 1, createdAt: -1 });
todoSchema.index({ user: 1, isDeleted: 1, startDate: 1 });
todoSchema.index({ user: 1, isDeleted: 1, priority: 1, createdAt: -1 });
todoSchema.index({ user: 1, isDeleted: 1, tags: 1, createdAt: -1 });

module.exports = mongoose.model('Todo', todoSchema);
