import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import * as paymentController from '../controllers/paymentController.js';
import * as subscriptionController from '../controllers/subscriptionController.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Payments
router.post('/payments/create-preference', authenticate, paymentController.createPreference);
router.post('/payments/webhook', paymentController.handleWebhook);
router.get('/payments/history', authenticate, paymentController.getPaymentHistory);

// Subscriptions
router.get('/subscriptions/me', authenticate, subscriptionController.getMySubscription);
router.post('/subscriptions/cancel', authenticate, subscriptionController.handleCancelSubscription);
router.get('/subscriptions/history', authenticate, subscriptionController.getSubscriptionHistory);

// Admin
router.get('/admin/payments', authenticate, isAdmin, adminController.getAllPayments);
router.get('/admin/subscriptions', authenticate, isAdmin, adminController.getAllSubscriptions);
router.get('/admin/users', authenticate, isAdmin, adminController.getAllUsers);
router.post('/admin/subscriptions/activate', authenticate, isAdmin, adminController.activateSubscriptionManual);

export default router;
