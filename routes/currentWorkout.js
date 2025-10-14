import express from 'express';
import { auth } from '../middleware/auth.js';
import CurrentWorkout from '../models/CurrentWorkout.js';

const router = express.Router();

// Get user's current workout session
router.get('/', auth, async (req, res) => {
  try {
    const currentWorkout = await CurrentWorkout.findOne({ user: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json({ currentWorkout: currentWorkout?.session || [] });
  } catch (error) {
    console.error('Get current workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save/Update current workout session
router.post('/', auth, async (req, res) => {
  try {
    const { session } = req.body;
    
    // Find existing session or create new one
    let currentWorkout = await CurrentWorkout.findOne({ user: req.user._id });
    
    if (currentWorkout) {
      currentWorkout.session = session;
      currentWorkout.updatedAt = new Date();
    } else {
      currentWorkout = new CurrentWorkout({
        user: req.user._id,
        session,
        createdAt: new Date()
      });
    }

    await currentWorkout.save();

    res.status(201).json({ 
      message: 'Current workout session saved successfully',
      currentWorkout: currentWorkout.session
    });
  } catch (error) {
    console.error('Save current workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear current workout session
router.delete('/', auth, async (req, res) => {
  try {
    await CurrentWorkout.findOneAndDelete({ user: req.user._id });
    
    res.json({ message: 'Current workout session cleared successfully' });
  } catch (error) {
    console.error('Clear current workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 