import { db } from '../config/firebase.js';
import { writeSubscription } from '../services/subscriptionService.js';
import { PLANS } from '../constants/plans.js';

export const getAllPayments = async (req, res) => {
  try {
    const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').get();
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const snapshot = await db.collection('subscriptions').orderBy('createdAt', 'desc').get();
    const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const activateSubscriptionManual = async (req, res) => {
  try {
    const { userId, planType = 'monthly', paymentId = 'manual', preferenceId = 'manual' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId.' });
    }

    const result = await writeSubscription({
      userId,
      planType,
      paymentId,
      preferenceId,
      amount: PLANS[planType]?.amount || 0,
      status: 'active'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
