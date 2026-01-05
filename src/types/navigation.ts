/**
 * Navigation type definitions
 */

export type RootStackParamList = {
    MainTabs: undefined;
    UploadPdf: undefined;
    StatementDetails: { id: string };
};

export type TabParamList = {
    Home: undefined;
    History: undefined;
    Analytics: undefined;
    Settings: undefined;
};

export type AuthStackParamList = {
    SignIn: undefined;
    SignUp: undefined;
};
