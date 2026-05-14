import { initializeApp, getApps } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey:            process.env['EXPO_PUBLIC_FIREBASE_API_KEY'],
    authDomain:        process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'],
    projectId:         process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
    storageBucket:     process.env['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
    appId:             process.env['EXPO_PUBLIC_FIREBASE_APP_ID'],
    measurementId:     process.env['EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'],
};

// Inicializa o app Firebase apenas uma vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exporta instâncias para uso futuro (Auth, Firestore, etc.)
export const functions = getFunctions(app);

export default app;
