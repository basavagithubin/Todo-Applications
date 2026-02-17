const express = require('express');
const { param, body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
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
} = require('../controllers/todo.controller');
const router = express.Router();

router.use(auth);

router.get('/', getTodos);
router.get('/trash', getTrash);
router.get('/summary', summary);
router.get('/monthly', monthly);
router.post('/:id/progress', body('percent').isNumeric(), addProgress);
router.patch('/:id/progress/:pid', [param('id').isMongoId(), param('pid').isMongoId()], updateProgress);
router.delete('/:id/progress/:pid', [param('id').isMongoId(), param('pid').isMongoId()], deleteProgress);
router.post(
  '/',
  [body('title').isString().isLength({ min: 1 }), body('priority').optional().isIn(['low', 'medium', 'high'])],
  createTodo
);
router.get('/:id', [param('id').isMongoId()], getTodo);
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['pending', 'completed'])
  ],
  updateTodo
);
router.delete('/:id', [param('id').isMongoId()], deleteTodo);
router.patch('/:id/status', [param('id').isMongoId(), body('status').isIn(['pending', 'completed'])], updateStatus);
router.patch('/:id/restore', [param('id').isMongoId()], restore);

module.exports = router;
