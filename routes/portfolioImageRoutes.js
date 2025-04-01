// routes/portfolioImageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Add image to portfolio
router.post('/add', auth('add_portfolio_image'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const traineeId = req.user.userId;
    const imagePath = req.file.path.replace(/\\/g, '/');

    const [result] = await pool.execute(
      'INSERT INTO trainee_portfolio_images (trainee_id, image_path) VALUES (?, ?)',
      [traineeId, imagePath]
    );

    res.status(201).json({
      success: true,
      message: 'Image added to portfolio successfully',
      image_id: result.insertId,
      image_path: imagePath
    });
  } catch (error) {
    console.error('Error adding portfolio image:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to add image to portfolio'
    });
  }
});

// Remove image from portfolio
router.delete('/remove/:id', auth('remove_portfolio_image'), async (req, res) => {
  try {
    const imageId = req.params.id;
    const traineeId = req.user.userId;

    // Verify the image belongs to the trainee
    const [images] = await pool.execute(
      'SELECT image_path FROM trainee_portfolio_images WHERE id = ? AND trainee_id = ?',
      [imageId, traineeId]
    );

    if (images.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Image not found or not owned by trainee' 
      });
    }

    const imagePath = images[0].image_path;

    // Delete the image file
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting image file:', err);
    });

    // Delete the database record
    await pool.execute('DELETE FROM trainee_portfolio_images WHERE id = ?', [imageId]);

    res.json({
      success: true,
      message: 'Image removed from portfolio successfully'
    });
  } catch (error) {
    console.error('Error removing portfolio image:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove image from portfolio'
    });
  }
});

module.exports = router;