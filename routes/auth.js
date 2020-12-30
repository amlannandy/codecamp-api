const express = require('express');

const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  updateDetails,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/auth');

const router = express.Router();

router.post('/login', login);
router.get('/logout', protect, logout);
router.post('/register', register);
router.get('/me', protect, getCurrentUser);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
