import { Router } from 'express';
import authRoutes from './auth';
import driverRoutes from './driver';
import bookingRoutes from './booking';
import userRoutes from './user';
import reviewRoutes from './review';
import messageRoutes from './message';
import adminRoutes from './admin';
import paymentRoutes from './payment';
import truckCategoryRoutes from './truckCategory';
import areaRoutes from './area';
import systemSettingRoutes from './systemSetting';
import fareCalculationRoutes from './fareCalculation';
import emergencyAlertRoutes from './emergencyAlert';
import trackingRoutes from './tracking';
import searchRoutes from './search';

const router = Router();

// API Version 1 Routes
router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/truck-categories', truckCategoryRoutes);
router.use('/areas', areaRoutes);
router.use('/system-settings', systemSettingRoutes);
router.use('/fare-calculation', fareCalculationRoutes);
router.use('/emergency-alerts', emergencyAlertRoutes);
router.use('/tracking', trackingRoutes);
router.use('/search', searchRoutes);

// Health check for v1
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router; 