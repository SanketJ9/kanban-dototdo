import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Ensure the 'uploads' directory exists so the server doesn't crash when saving an image
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// --- Setup Multer for Image Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Give the file a unique name using the current timestamp so files don't overwrite each other
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage });

// --- API Routes ---
// POST /api/auth/register (Expects a single file named 'profileImage')
router.post('/register', upload.single('profileImage'), register);

// POST /api/auth/login
router.post('/login', login);

export default router;