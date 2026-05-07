// Configuração do Firebase e Groq AI
// A chave Groq fica aqui pois o plano Spark do Firebase
// não permite chamadas HTTP externas nas Cloud Functions.
// Para produção com múltiplos usuários, migre para o plano Blaze.

export const ENV = {
    // Firebase config
    FIREBASE_API_KEY: 'AIzaSyDf_4E0i6MOWAcGnrKKRFT7emnsLf0QelM',
    FIREBASE_AUTH_DOMAIN: 'dateapp-mobile.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'dateapp-mobile',
    FIREBASE_STORAGE_BUCKET: 'dateapp-mobile.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: '453562375256',
    FIREBASE_APP_ID: '1:453562375256:web:2d493f3ba5575809b53e2d',
    FIREBASE_MEASUREMENT_ID: 'G-CSBFMSWM7J',

    // Chave Groq AI (gratuita)
    // Obtenha em: https://console.groq.com/keys
    GROQ_API_KEY: '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',
};
