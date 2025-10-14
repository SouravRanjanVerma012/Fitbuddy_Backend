import express from 'express';
import { auth } from '../middleware/auth.js';
import WorkoutPlan from '../models/WorkoutPlan.js';

const router = express.Router();

// Get user's weekly workout plan
router.get('/', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ workoutPlan: workoutPlan?.plan || null });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save/Update weekly workout plan
router.post('/', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Find existing plan or create new one
    let workoutPlan = await WorkoutPlan.findOne({ user: req.user._id });
    
    if (workoutPlan) {
      workoutPlan.plan = plan;
      workoutPlan.updatedAt = new Date();
    } else {
      workoutPlan = new WorkoutPlan({
        user: req.user._id,
        plan,
        createdAt: new Date()
      });
    }

    await workoutPlan.save();

    res.status(201).json({ 
      message: 'Workout plan saved successfully',
      workoutPlan: workoutPlan.plan
    });
  } catch (error) {
    console.error('Save workout plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete workout plan
router.delete('/', auth, async (req, res) => {
  try {
    await WorkoutPlan.findOneAndDelete({ user: req.user._id });
    
    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 