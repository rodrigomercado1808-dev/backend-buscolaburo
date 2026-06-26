import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Función para limpiar la clave privada de Firebase
const formatPrivateKey = (key) => {
  if (!key) return undefined;
  // Reemplaza los escapes de saltos de línea literales por saltos de línea reales
  return key.replace(/\\n/g, '\n');
};

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
    });
    console.log('Firebase Admin inicializado correctamente para el proyecto:', process.env.FIREBASE_PROJECT_ID);
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;
