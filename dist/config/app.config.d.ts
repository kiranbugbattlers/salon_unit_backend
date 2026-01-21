declare const _default: (() => {
    port: number;
    environment: string;
    dbMode: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    supabase: {
        url: string;
        anonKey: string;
        database: {
            host: string;
            port: number;
            username: string;
            password: string;
            database: string;
        };
    };
    jwt: {
        secret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
    };
    google: {
        clientId: string;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    otp: {
        provider: string;
    };
    firebase: {
        serviceAccountPath: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    environment: string;
    dbMode: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    supabase: {
        url: string;
        anonKey: string;
        database: {
            host: string;
            port: number;
            username: string;
            password: string;
            database: string;
        };
    };
    jwt: {
        secret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
    };
    google: {
        clientId: string;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    otp: {
        provider: string;
    };
    firebase: {
        serviceAccountPath: string;
    };
}>;
export default _default;
