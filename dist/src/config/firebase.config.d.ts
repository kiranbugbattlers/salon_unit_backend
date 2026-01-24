import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
export declare const initializeFirebase: (configService: ConfigService) => admin.app.App;
export declare const getFirebaseApp: () => admin.app.App;
export declare const getFirebaseMessaging: () => admin.messaging.Messaging;
