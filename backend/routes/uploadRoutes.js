import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    res.status(200).send({
      message: 'Image uploaded successfully',
      image: `/${req.file.path}`,
    });
  });
});

// Add a new route for multiple images with color info
const uploadMultipleImages = upload.array('images', 10); // Allow up to 10 images

router.post('/multiple', (req, res) => {
  uploadMultipleImages(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    const images = req.files.map((file) => ({
      url: `/${file.path}`,
      color: req.body.color || null,
      isVariantMain: req.body.isVariantMain || false,
    }));

    res.status(200).send({
      message: 'Images uploaded successfully',
      images: images,
    });
  });
});

export default router;
