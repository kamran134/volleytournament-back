import express from 'express';
import { LocationService } from '../services/location.service';
import { LocationUseCase } from '../business/location/location.usecase';
import { LocationController } from '../controllers/location.controller';
import { checkAdminRole } from '../middleware/auth.middleware';

const router = express.Router();
const locationService = new LocationService();
const locationUseCase = new LocationUseCase(locationService);
const locationController = new LocationController(locationUseCase);

router
    .route('/')
    .get(checkAdminRole, locationController.getLocations.bind(locationController))
    .post(checkAdminRole, locationController.createLocation.bind(locationController))
    .put(checkAdminRole, locationController.updateLocation.bind(locationController));

router
    .route('/:id')
    .get(locationController.getLocation.bind(locationController))
    .delete(checkAdminRole, locationController.deleteLocation.bind(locationController));

export default router;