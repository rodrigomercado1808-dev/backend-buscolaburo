import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  // Maneja tanto claves con saltos de línea reales como escapados (\n)
  // y elimina comillas accidentales que puedan venir de variables de entorno
  let formatted = key.replace(/\\n/g, '\n').trim();
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.substring(1, formatted.length - 1);
  }
  return formatted;
};

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ ERROR: Faltan variables de entorno críticas de Firebase.');
    console.log('Valores actuales:', { projectId, clientEmail, hasPrivateKey: !!privateKey });
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: `${projectId}.firebasestorage.app`
      });
      console.log('✅ Firebase Admin inicializado correctamente para:', projectId);
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Admin:', error.message);
    }
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;
