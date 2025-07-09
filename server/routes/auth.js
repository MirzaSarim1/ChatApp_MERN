import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Check authentication status
router.get('/check', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
