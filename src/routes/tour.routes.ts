import express from "express";
import { TourService } from "../services/tour.service";
import { TourUseCase } from "../business/tour/tour.usecase";
import { TourController } from "../controllers/tour.controller";
import { checkAdminRoleWithRefreshToken } from "../middleware/auth.middleware";

const router = express.Router();
const tourService = new TourService();
const tourUseCase = new TourUseCase(tourService);
const tourController = new TourController(tourUseCase);

router
    .route('/')
    .get(tourController.getTours.bind(tourController))
    .post(checkAdminRoleWithRefreshToken, tourController.createTour.bind(tourController))
    .put(checkAdminRoleWithRefreshToken, tourController.updateTour.bind(tourController));

router
    .route('/with-games')
    .get(tourController.getToursWithGames.bind(tourController));

router
    .route('/:id')
    .get(tourController.getTour.bind(tourController))
    .delete(checkAdminRoleWithRefreshToken, tourController.deleteTour.bind(tourController));

export default router;