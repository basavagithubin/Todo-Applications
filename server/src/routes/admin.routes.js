const express = require('express');
const { param } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const { getUsers, blockUser, unblockUser, deleteUser, getTodos, analytics } = require('../controllers/admin.controller');
const router = express.Router();

router.use(auth, authorize('superadmin'));

router.get('/users', getUsers);
router.patch('/block/:id', [param('id').isMongoId()], blockUser);
router.patch('/unblock/:id', [param('id').isMongoId()], unblockUser);
router.delete('/user/:id', [param('id').isMongoId()], deleteUser);
router.get('/todos', getTodos);
router.get('/analytics', analytics);

module.exports = router;
