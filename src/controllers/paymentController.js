import { Preference, Payment } from 'mercadopago';
import client from '../config/mercadopago.js';
import { db } from '../config/firebase.js';
import admin from 'firebase-admin';
import { PLANS } from '../constants/plans.js';
import { writeSubscription } from '../services/subscriptionService.js';
import dotenv from 'dotenv';

dotenv.config();

export const createPreference = async (req, res) => {
  try {
    const { planType = 'monthly' } = req.body;
    const plan = PLANS[planType];
    
    if (!plan) {
      return res.status(400).json({ error: 'Plan inválido.' });
    }

    const userSnapshot = await db.collection('users').doc(req.user.uid).get();
    const user = userSnapshot.data();

    if (!user || user.status === 'banned') {
      return res.status(403).json({ error: 'Usuario no habilitado.' });
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: planType,
            title: plan.title,
            quantity: 1,
            unit_price: plan.amount,
            currency_id: 'ARS'
          }
        ],
        payer: {
          email: user.email
        },
        external_reference: JSON.stringify({ userId: req.user.uid, planType }),
        notification_url: process.env.MP_WEBHOOK_URL,
        back_urls: {
          success: process.env.SUCCESS_URL,
          pending: process.env.PENDING_URL,
          failure: process.env.FAILURE_URL
        },
        auto_return: 'approved'
      }
    });

    await db.collection('payments').doc(response.id).set({
      userId: req.user.uid,
      planType,
      status: 'preference_created',
      preferenceId: response.id,
      amount: plan.amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const type = req.query.type || req.body?.type || req.body?.topic;
    const id = req.query['data.id'] || req.query.id || req.body?.data?.id || req.body?.id;

    if (type !== 'payment' || !id) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id });
    
    const externalReference = payment.external_reference ? JSON.parse(payment.external_reference) : {};
    const userId = externalReference.userId;
    const planType = externalReference.planType || payment.additional_info?.items?.[0]?.id || 'monthly';
    const amount = payment.transaction_amount || PLANS[planType]?.amount || 0;

    await db.collection('payments').doc(String(payment.id)).set(
      {
        userId,
        planType,
        paymentId: String(payment.id),
        preferenceId: payment.preference_id || '',
        amount,
        status: payment.status,
        statusDetail: payment.status_detail || '',
        paymentMethodId: payment.payment_method_id || '',
        raw: JSON.parse(JSON.stringify(payment)),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    if (payment.status === 'approved' && userId) {
      await writeSubscription({
        userId,
        planType,
        paymentId: String(payment.id),
        preferenceId: payment.preference_id,
        amount,
        status: 'active'
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en Webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const snapshot = await db.collection('payments')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
