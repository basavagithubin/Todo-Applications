const User = require('../models/User');
const Todo = require('../models/Todo');

const getUsers = async (req, res) => {
  const users = await User.find().select('_id name email role isBlocked createdAt');
  res.json({ users });
};

const blockUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user });
};

const unblockUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user });
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  await Todo.deleteMany({ user: user._id });
  res.json({ success: true });
};

const getTodos = async (req, res) => {
  const user = req.query.user;
  const q = {};
  if (user) q.user = user;
  const items = await Todo.find(q).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ items });
};

const analytics = async (req, res) => {
  const [totalUsers, blockedUsers, totalTodos, completedTodos, monthlyUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBlocked: true }),
    Todo.countDocuments(),
    Todo.countDocuments({ status: 'completed' }),
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);
  const pendingTodos = totalTodos - completedTodos;
  res.json({
    totalUsers,
    activeUsers: totalUsers - blockedUsers,
    blockedUsers,
    totalTodos,
    completedTodos,
    pendingTodos,
    monthlyUsers
  });
};

module.exports = { getUsers, blockUser, unblockUser, deleteUser, getTodos, analytics };
