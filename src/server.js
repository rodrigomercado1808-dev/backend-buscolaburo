import app from './app.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import admin from 'firebase-admin';
import { db } from './config/firebase.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Cron Jobs
// Revisar suscripciones vencidas cada día a las 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Iniciando tarea programada: Expirar suscripciones...');
  try {
    const now = admin.firestore.Timestamp.now();
    const expiredSnapshot = await db
      .collection('subscriptions')
      .where('status', '==', 'active')
      .where('expirationDate', '<=', now)
      .get();

    if (expiredSnapshot.empty) {
      console.log('No hay suscripciones para expirar.');
      return;
    }

    const batch = db.batch();
    expiredSnapshot.docs.forEach((subscription) => {
      const data = subscription.data();
      batch.update(subscription.ref, {
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      batch.set(
        db.collection('users').doc(data.userId),
        {
          premium: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    });

    await batch.commit();
    console.log(`Se expiraron ${expiredSnapshot.size} suscripciones.`);
  } catch (error) {
    console.error('Error en cron de expiración:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
