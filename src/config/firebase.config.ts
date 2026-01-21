import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

let firebaseApp: admin.app.App;

export const initializeFirebase = (configService: ConfigService): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccountPath = configService.get<string>('app.firebase.serviceAccountPath');

  if (!serviceAccountPath) {
    throw new Error('Firebase service account path is not configured');
  }

  try {
    // Read and parse the service account key
    const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountFile);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('🔥 Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase has not been initialized. Call initializeFirebase first.');
  }
  return firebaseApp;
};

export const getFirebaseMessaging = (): admin.messaging.Messaging => {
  return getFirebaseApp().messaging();
};
