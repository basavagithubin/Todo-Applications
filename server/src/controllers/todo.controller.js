const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Todo = require('../models/Todo');

const buildQuery = (userId, query) => {
  const q = { user: userId, isDeleted: false };
  if (query.status) q.status = query.status;
  if (query.priority) q.priority = query.priority;
  if (query.tags) q.tags = { $in: query.tags.split(',') };
  if (query.search) {
    const r = new RegExp(query.search, 'i');
    q.$or = [{ title: r }, { description: r }];
  }
  if (query.startDate || query.endDate) {
    q.dueDate = {};
    if (query.startDate) q.dueDate.$gte = new Date(query.startDate);
    if (query.endDate) q.dueDate.$lte = new Date(query.endDate);
  }
  if (query.overdue === 'true') {
    q.dueDate = q.dueDate || {};
    q.dueDate.$lt = new Date();
    q.status = { $ne: 'completed' };
  }
  return q;
};

const createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const payload = { ...req.body, user: req.user.id };
  if (!payload.startDate) payload.startDate = new Date();
  const todo = await Todo.create(payload);
  res.status(201).json({ todo });
};

const getTodos = async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const sort = (() => {
    const s = req.query.sort || 'createdAt:desc';
    const [field, order] = s.split(':');
    return { [field]: order === 'asc' ? 1 : -1 };
  })();
  const q = buildQuery(req.user.id, req.query);
  const [items, total] = await Promise.all([
    Todo.find(q).sort(sort).skip(skip).limit(limit),
    Todo.countDocuments(q)
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

const getTodo = async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

const updateTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

const deleteTodo = async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isDeleted: true },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
};

const updateStatus = async (req, res) => {
  const set = { status: req.body.status };
  if (req.body.status === 'completed') set.completedAt = new Date();
  if (req.body.status === 'pending') set.completedAt = null;
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    set,
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

const getTrash = async (req, res) => {
  const items = await Todo.find({ user: req.user.id, isDeleted: true }).sort({ updatedAt: -1 });
  res.json({ items });
};

const restore = async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id, isDeleted: true },
    { isDeleted: false },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

const summary = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const [total, completed, pending, overdue, dueToday] = await Promise.all([
    Todo.countDocuments({ user: userId, isDeleted: false }),
    Todo.countDocuments({ user: userId, isDeleted: false, status: 'completed' }),
    Todo.countDocuments({ user: userId, isDeleted: false, status: 'pending' }),
    Todo.countDocuments({ user: userId, isDeleted: false, dueDate: { $lt: now }, status: { $ne: 'completed' } }),
    Todo.countDocuments({ user: userId, isDeleted: false, dueDate: { $gte: startOfDay, $lte: endOfDay } })
  ]);
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  res.json({ total, completed, pending, overdue, dueToday, completionRate });
};

const monthly = async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit || '6', 10);
  const data = await Todo.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: limit },
    { $sort: { _id: 1 } }
  ]);
  res.json({ data });
};

const addProgress = async (req, res) => {
  const percent = Math.max(0, Math.min(100, Number(req.body.percent)));
  const note = String(req.body.note || '');
  const update = { $push: { progress: { percent, note } } };
  if (percent === 100) {
    update.$set = { status: 'completed', completedAt: new Date() };
  }
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id, isDeleted: false },
    update,
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

const updateProgress = async (req, res) => {
  const { id, pid } = req.params;
  const set = {};
  if (typeof req.body.percent !== 'undefined') {
    const percent = Math.max(0, Math.min(100, Number(req.body.percent)));
    set['progress.$.percent'] = percent;
    if (percent === 100) {
      set.status = 'completed';
      set.completedAt = new Date();
    }
  }
  if (typeof req.body.note !== 'undefined') {
    set['progress.$.note'] = String(req.body.note || '');
  }
  const todo = await Todo.findOneAndUpdate(
    { _id: id, user: req.user.id, 'progress._id': pid, isDeleted: false },
    { $set: set },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

const deleteProgress = async (req, res) => {
  const { id, pid } = req.params;
  const todo = await Todo.findOneAndUpdate(
    { _id: id, user: req.user.id, isDeleted: false },
    { $pull: { progress: { _id: pid } } },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json({ todo });
};

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  updateStatus,
  getTrash,
  restore,
  summary,
  monthly,
  addProgress,
  updateProgress,
  deleteProgress
}
