import express from 'express';
import { auth } from '../middleware/auth.js';
import Workout from '../models/Workout.js';
import User from '../models/User.js';

const router = express.Router();

// Get all workouts for user
router.get('/', auth, async (req, res) => {
  try {
    // Force fresh data from MongoDB
    const workouts = await Workout.find({ user: req.user._id })
      .sort({ date: -1 })
      .lean() // Get plain JavaScript objects for better performance
      .exec();
    
    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save workout
router.post('/', auth, async (req, res) => {
  try {
    const { session } = req.body;
    
    // Validate session data
    if (!session || !Array.isArray(session) || session.length === 0) {
      return res.status(400).json({ error: 'Invalid session data' });
    }
    
    // Validate each exercise has required fields
    for (let i = 0; i < session.length; i++) {
      const exercise = session[i];
      if (!exercise.name || !exercise.targetSets || !exercise.sets) {
        return res.status(400).json({ 
          error: `Exercise ${i + 1} missing required fields: name, targetSets, or sets` 
        });
      }
    }
    
    const workout = new Workout({
      user: req.user._id,
      session,
      date: new Date()
    });

    await workout.save();

    // Update user stats (handle case where stats might not exist)
    try {
      if (!req.user.stats) {
        req.user.stats = {
          totalWorkouts: 0,
          lastWorkoutDate: null
        };
      }
      req.user.stats.totalWorkouts += 1;
      req.user.stats.lastWorkoutDate = new Date();
      await req.user.save();
    } catch (statsError) {
      // Continue even if stats update fails
    }

    res.status(201).json({ 
      message: 'Workout saved successfully',
      workout 
    });
  } catch (error) {
    console.error('Save workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get macro summaries for user
router.get('/macro-summaries', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('macroSummaries');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ macroSummaries: user.macroSummaries || [] });
  } catch (error) {
    console.error('Get macro summaries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save macro summary to user profile
router.post('/macro-summary', auth, async (req, res) => {
  try {
    const { period, summary, exercises } = req.body;
    
    // Validate required fields
    if (!period || !summary || !exercises) {
      return res.status(400).json({ error: 'Missing required fields: period, summary, exercises' });
    }
    
    // Find user and add macro summary
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add the new macro summary
    user.macroSummaries.push({
      date: new Date(),
      period,
      summary,
      exercises
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Macro summary saved successfully',
      macroSummary: user.macroSummaries[user.macroSummaries.length - 1]
    });
  } catch (error) {
    console.error('Save macro summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get workout by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 