"use client";
import { createContext, useContext } from "react";

const PayloadAuthContext = createContext(null);

export function PayloadAuthProvider({ user, children }) {
  return (
    <PayloadAuthContext.Provider value={{ user }}>
      {children}
    </PayloadAuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(PayloadAuthContext);
  // Return a mock NextAuth session object for backward compatibility
  return { 
    data: context?.user ? { user: context.user } : null,
    status: context?.user ? "authenticated" : "unauthenticated"
  };
}
