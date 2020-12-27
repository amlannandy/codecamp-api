const express = require('express');

const { protect } = require('../middleware/auth');
const { register, login, getCurrentUser } = require('../controllers/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getCurrentUser);

module.exports = router;
