import { db } from '../config/firebase.js';
import admin from 'firebase-admin';
import { PLANS } from '../constants/plans.js';

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const writeSubscription = async ({ userId, planType, paymentId, preferenceId, amount, status = 'active' }) => {
  const plan = PLANS[planType] || PLANS.monthly;
  const now = new Date();
  const expirationDate = addDays(now, plan.days);
  const subscriptionId = `${userId}_${paymentId || preferenceId || Date.now()}`;
  const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);

  await subscriptionRef.set({
    userId,
    planType,
    status,
    paymentId: paymentId || '',
    preferenceId: preferenceId || '',
    amount,
    startDate: admin.firestore.Timestamp.fromDate(now),
    expirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('users').doc(userId).set(
    {
      premium: status === 'active',
      premiumPlan: planType,
      premiumExpirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return { subscriptionId, expirationDate: expirationDate.toISOString() };
};

export const cancelSubscription = async (subscriptionId, userId, userRole) => {
  const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
  const snapshot = await subscriptionRef.get();
  
  if (!snapshot.exists) {
    throw new Error('Suscripción inexistente.');
  }

  const subscription = snapshot.data();
  if (subscription.userId !== userId && userRole !== 'admin') {
    throw new Error('No tienes permiso para cancelar esta suscripción.');
  }

  await subscriptionRef.update({
    status: 'cancelled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('users').doc(subscription.userId).set(
    {
      premium: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return { success: true };
};
