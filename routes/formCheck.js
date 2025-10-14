import express from 'express';
import { auth as protect } from '../middleware/auth.js';
import FormCheck from '../models/FormCheck.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary (with fallback for missing credentials)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('Cloudinary credentials not found. Form check media will be stored as data URLs.');
}

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// @route   GET /api/form-check
// @desc    Get all form checks for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const formChecks = await FormCheck.find({ user: req.user._id })
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: formChecks
    });
  } catch (error) {
    console.error('Get form checks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/form-check
// @desc    Create new form check
// @access  Private
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { exercise, mediaType, notes } = req.body;
    let mediaUrl = '';
    let cloudinaryId = '';

    // Debug logging
    console.log('Form check upload request:', {
      exercise,
      mediaType,
      notes,
      hasFile: !!req.file,
      fileMimeType: req.file?.mimetype,
      fileSize: req.file?.size
    });

    // Determine media type with fallback
    let finalMediaType = mediaType;
    if (!finalMediaType && req.file) {
      // Fallback: determine from file mimetype
      if (req.file.mimetype.startsWith('image/')) {
        finalMediaType = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        finalMediaType = 'video';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only images and videos are supported.'
        });
      }
      console.log('Media type determined from mimetype:', finalMediaType);
    }

    // Handle media upload
    if (req.file) {
      // Convert buffer to base64
      const base64Data = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;
      
      // Try to upload to Cloudinary if credentials are available
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: finalMediaType === 'video' ? 'video' : 'image',
            folder: 'form-checks',
            public_id: `${req.user._id}_${Date.now()}`
          });
          
          mediaUrl = uploadResult.secure_url;
          cloudinaryId = uploadResult.public_id;
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed, falling back to data URL:', cloudinaryError);
          mediaUrl = dataURI;
        }
      } else {
        // Store as data URL if Cloudinary is not configured
        mediaUrl = dataURI;
      }
    } else if (req.body.mediaUrl) {
      // Handle data URL from frontend
      mediaUrl = req.body.mediaUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No media provided'
      });
    }

    const formCheck = await FormCheck.create({
      user: req.user._id,
      exercise,
      mediaType: finalMediaType,
      mediaUrl,
      cloudinaryId,
      notes
    });

    res.status(201).json({
      success: true,
      data: formCheck
    });
  } catch (error) {
    console.error('Create form check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/form-check/:id
// @desc    Delete form check
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const formCheck = await FormCheck.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!formCheck) {
      return res.status(404).json({
        success: false,
        message: 'Form check not found'
      });
    }

    // Delete from Cloudinary if it exists
    if (formCheck.cloudinaryId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(formCheck.cloudinaryId, {
          resource_type: formCheck.mediaType === 'video' ? 'video' : 'image'
        });
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError);
      }
    }

    res.json({
      success: true,
      message: 'Form check deleted successfully'
    });
  } catch (error) {
    console.error('Delete form check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/form-check
// @desc    Delete all form checks for user
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const formChecks = await FormCheck.find({ user: req.user._id });
    
    // Delete from Cloudinary if they exist
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      for (const check of formChecks) {
        if (check.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(check.cloudinaryId, {
              resource_type: check.mediaType === 'video' ? 'video' : 'image'
            });
          } catch (cloudinaryError) {
            console.warn('Failed to delete from Cloudinary:', cloudinaryError);
          }
        }
      }
    }

    await FormCheck.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'All form checks deleted successfully'
    });
  } catch (error) {
    console.error('Delete all form checks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;