import express from 'express';
import { auth } from '../middleware/auth.js';
import UserPreference from '../models/UserPreference.js';

const router = express.Router();

// Get user preferences
router.get('/', auth, async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({ user: req.user._id });
    res.json({ preferences: preferences?.data || {} });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save user preferences
router.post('/', auth, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    let preferences = await UserPreference.findOne({ user: req.user._id });
    
    if (preferences) {
      preferences.data = { ...preferences.data, [key]: value };
      preferences.updatedAt = new Date();
    } else {
      preferences = new UserPreference({
        user: req.user._id,
        data: { [key]: value },
        createdAt: new Date()
      });
    }

    await preferences.save();

    res.status(201).json({ 
      message: 'Preferences saved successfully',
      preferences: preferences.data
    });
  } catch (error) {
    console.error('Save user preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific preference
router.get('/:key', auth, async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({ user: req.user._id });
    const value = preferences?.data?.[req.params.key] || null;
    res.json({ value });
  } catch (error) {
    console.error('Get specific preference error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 