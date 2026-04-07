/**
 * Subscription routes — updated with cancel, resume, status endpoints
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const ctrl = require('../controllers/subscriptionController');

const checkoutSchema = z.object({ plan: z.enum(['pro', 'pro-yearly']) });

router.use(authenticate);
router.post('/checkout', validate(checkoutSchema), ctrl.createCheckout);
router.post('/cancel', ctrl.cancelSubscription);
router.post('/resume', ctrl.resumeSubscription);
router.get('/portal', ctrl.managePortal);
router.get('/status', ctrl.getStatus);

module.exports = router;
