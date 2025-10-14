import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats');
    res.json({ stats: user.stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');
    res.json(user.settings || {});
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to get settings' });
  }
});

// Save user settings
router.post('/settings', async (req, res) => {
  try {
    const settings = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Settings saved successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

// Export user data
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let data;
    switch (format) {
      case 'json':
        data = {
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
            stats: user.stats,
            preferences: user.preferences,
            settings: user.settings,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          macroSummaries: user.macroSummaries || []
        };
        break;
      case 'csv':
        // For now, return JSON format for CSV as well
        // In a real implementation, you'd convert to CSV format
        data = {
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
            stats: user.stats,
            preferences: user.preferences,
            settings: user.settings,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          macroSummaries: user.macroSummaries || []
        };
        break;
      case 'pdf':
        // For now, return JSON format for PDF as well
        // In a real implementation, you'd generate PDF content
        data = {
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
            stats: user.stats,
            preferences: user.preferences,
            settings: user.settings,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          macroSummaries: user.macroSummaries || []
        };
        break;
      default:
        return res.status(400).json({ message: 'Unsupported format' });
    }

    res.json(data);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

export default router;