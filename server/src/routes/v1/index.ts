import { Router } from 'express';
import authRoutes from './auth';
import driverRoutes from './driver';
import bookingRoutes from './booking';
import userRoutes from './user';
import reviewRoutes from './review';
import messageRoutes from './message';
import adminRoutes from './admin';
import paymentRoutes from './payment';
import sslCommerzRoutes from './sslcommerz';
import truckCategoryRoutes from './truckCategory';
import areaSearchRoutes from './areaSearch';
import systemSettingRoutes from './systemSetting';
import fareCalculationRoutes from './fareCalculation';
import emergencyAlertRoutes from './emergencyAlert';
import trackingRoutes from './tracking';
import searchRoutes from './search';
import dashboardRoutes from './dashboard';
import notificationRoutes from './notifications';

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
router.use('/sslcommerz', sslCommerzRoutes);
router.use('/truck-categories', truckCategoryRoutes);
router.use('/area-search', areaSearchRoutes);
router.use('/system-settings', systemSettingRoutes);
router.use('/fare-calculation', fareCalculationRoutes);
router.use('/emergency-alerts', emergencyAlertRoutes);
router.use('/tracking', trackingRoutes);
router.use('/search', searchRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

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