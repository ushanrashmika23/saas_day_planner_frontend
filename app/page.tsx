'use client'
import React from "react";
import Login from "./views/auth/login";
import Register from "./views/auth/register";
export default function Home() {
  const [authState, setAuthState] = React.useState<"login" | "register" | "verify" | "checkInbox" | "workspace">("register");
  const handleAuthStateChange = (state: "login" | "register" | "verify" | "checkInbox" | "workspace"): void => {
    setAuthState(state);
  }
  return (
    <div className="">
      {authState === "register" && <Register handleAuthStateChange={handleAuthStateChange} />}
      {authState === "login" && <Login handleAuthStateChange={handleAuthStateChange} />}
    </div>
  );
}
