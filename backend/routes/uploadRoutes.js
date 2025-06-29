import path from 'path';
import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    // Optional: Set a public_id (filename) format
    public_id: (req, file) => {
      return `${file.fieldname}-${Date.now()}${path.extname(
        file.originalname
      )}`;
    },
  },
});

// File filter (same as before)
function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp|avif/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/avif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });

// Single Image Upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // Cloudinary returns the URL in `req.file.path` (or `req.file.secure_url`)
    res.status(200).send({
      message: 'Image uploaded successfully',
      image: req.file.path, // Direct Cloudinary URL
    });
  } catch (err) {
    res.status(500).send({ message: 'Upload failed', error: err.message });
  }
});

// Multiple Image Upload
router.post('/multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: 'No files uploaded' });
    }

    const images = req.files.map((file) => ({
      url: file.path, // Cloudinary URL
      color: req.body.color || null,
      isVariantMain: req.body.isVariantMain || false,
    }));

    res.status(200).send({
      message: 'Images uploaded successfully',
      images: images,
    });
  } catch (err) {
    res.status(500).send({ message: 'Upload failed', error: err.message });
  }
});

export default router;
