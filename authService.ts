// This service handles Google Sign-In using the official Google Identity Services library.

// Add google to the global window object
declare global {
  interface Window { google: any; }
}

export interface User {
  sub: string; // The user's unique Google ID
  name: string;
  picture: string;
  email: string;
}

type AuthStateListener = (user: User | null) => void;

// NOTE: This Client ID is provided by the user for this specific application.
// In a real-world scenario, this should be stored in environment variables.
const GOOGLE_CLIENT_ID = "947807281209-868it91gif9itlr935m9ciktruq06c96.apps.googleusercontent.com";
const TOKEN_STORAGE_KEY = 'google_id_token';

let currentUser: User | null = null;
const listeners = new Set<AuthStateListener>();
let isInitialized = false;

const notifyListeners = () => {
  listeners.forEach(listener => listener(currentUser));
};

const jwtDecode = (token: string): User => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

const handleCredentialResponse = (response: any) => {
    const idToken = response.credential;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, idToken);
    currentUser = jwtDecode(idToken);
    notifyListeners();
};

export const initializeGoogleSignIn = () => {
    if (isInitialized || typeof window.google === 'undefined') {
        return;
    }
    isInitialized = true;

    // Check for a stored token on initialization
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
        try {
            currentUser = jwtDecode(storedToken);
        } catch (error) {
            console.error("Failed to decode stored token:", error);
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    }

    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
    });

    notifyListeners(); // Notify with the user from session storage, if any
};

export const renderGoogleButton = (element: HTMLElement) => {
    if (!isInitialized || !element) return;
    window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
    });
};

export const signOut = (): Promise<void> => {
  return new Promise(resolve => {
    if (isInitialized) {
        window.google.accounts.id.disableAutoSelect();
    }
    currentUser = null;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    notifyListeners();
    resolve();
  });
};

export const onAuthStateChanged = (callback: AuthStateListener): (() => void) => {
  listeners.add(callback);
  
  // Immediately call the callback with the current state
  Promise.resolve().then(() => callback(currentUser));

  // Return an unsubscribe function
  return () => {
    listeners.delete(callback);
  };
};