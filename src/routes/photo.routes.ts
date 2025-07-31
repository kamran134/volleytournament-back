import express from 'express';
import multer from 'multer';
import path from 'path';
import { PhotoService } from '../services/photo.service';
import { PhotoUseCase } from '../business/photo/photo.usecase';
import { PhotoController } from '../controllers/photo.controller';
import { checkAdminRole } from '../middleware/auth.middleware';
import { parseFormDataTeams } from '../middleware/formData.middleware';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|webp/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

const router = express.Router();
const photoService = new PhotoService();
const photoUseCase = new PhotoUseCase(photoService);
const photoController = new PhotoController(photoUseCase);
router
    .route('/')
    .get(photoController.getPhotos.bind(photoController))
    .post(checkAdminRole, upload.single('file'), parseFormDataTeams, photoController.createPhoto.bind(photoController));
router
    .route('/last')
    .get(photoController.getLastPhotos.bind(photoController)); // Assuming this is for getting the last photos
router
    .route('/bulk')
    .post(checkAdminRole, upload.array('files', 50), parseFormDataTeams, photoController.createPhotos.bind(photoController))
    .delete(checkAdminRole, photoController.deletePhotos.bind(photoController));
router
    .route('/update')
    .put(checkAdminRole, upload.single('photo'), parseFormDataTeams, photoController.updatePhoto.bind(photoController));
router
    .route('/:id')
    .delete(checkAdminRole, photoController.deletePhoto.bind(photoController));

export default router;