import { db } from '../config/firebase.js';
import { cancelSubscription } from '../services/subscriptionService.js';

export const getMySubscription = async (req, res) => {
  try {
    const snapshot = await db.collection('subscriptions')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.json({ active: false });
    }

    res.json({ active: true, ...snapshot.docs[0].data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleCancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Falta subscriptionId.' });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userRole = userDoc.data()?.role;

    await cancelSubscription(subscriptionId, req.user.uid, userRole);
    res.json({ cancelled: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubscriptionHistory = async (req, res) => {
  try {
    const snapshot = await db.collection('subscriptions')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
