import { Router } from 'express';
import { SearchController } from '../../controllers/searchController';
import { auth, authorize } from '../../middleware/auth';

const router = Router();

// Search trucks (Public)
router.post('/trucks', SearchController.searchTrucks);

// Get popular trucks (Public)
router.get('/trucks/popular', SearchController.getPopularTrucks);

// Get nearby trucks (Public)
router.get('/trucks/nearby', SearchController.getNearbyTrucks);

// Get truck recommendations (User only)
router.get('/trucks/recommendations', auth, authorize('USER'), SearchController.getTruckRecommendations);

// Get search suggestions (Public)
router.get('/suggestions', SearchController.getSearchSuggestions);

// Advanced search (Public)
router.get('/advanced', SearchController.getAdvancedSearch);

export default router; 