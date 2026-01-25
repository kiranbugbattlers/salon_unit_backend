"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseMessaging = exports.getFirebaseApp = exports.initializeFirebase = void 0;
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
let firebaseApp;
const initializeFirebase = (configService) => {
    if (firebaseApp) {
        return firebaseApp;
    }
    const serviceAccountPath = configService.get('app.firebase.serviceAccountPath');
    if (!serviceAccountPath) {
        throw new Error('Firebase service account path is not configured');
    }
    try {
        const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountFile);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
        console.log('🔥 Firebase Admin SDK initialized successfully');
        return firebaseApp;
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error);
        throw error;
    }
};
exports.initializeFirebase = initializeFirebase;
const getFirebaseApp = () => {
    if (!firebaseApp) {
        throw new Error('Firebase has not been initialized. Call initializeFirebase first.');
    }
    return firebaseApp;
};
exports.getFirebaseApp = getFirebaseApp;
const getFirebaseMessaging = () => {
    return (0, exports.getFirebaseApp)().messaging();
};
exports.getFirebaseMessaging = getFirebaseMessaging;
//# sourceMappingURL=firebase.config.js.map