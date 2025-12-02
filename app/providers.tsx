'use client';

import { GoogleOAuthProvider } from "@react-oauth/google";
const CLIENT_ID = "1019014061339-qsnjb810knu8fs8ohab39thmdain6dub.apps.googleusercontent.com";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}