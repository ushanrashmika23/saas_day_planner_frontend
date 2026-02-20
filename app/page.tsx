'use client'
import React, { useEffect } from "react";
import Login from "./views/auth/login";
import Register from "./views/auth/register";
import { registerUser, RegisterPayload, sendVerificationEmail, verifyEmail, loginUser, validateToken } from "./api/auth";
import CheckInbox from "./views/auth/checkInbox";
import VerificationResult from "./views/auth/verifyEmail";
import { decode } from "./utils/verificationEncryptation";
import Dashboard from "./views/workspace/dashboard";

export default function Home() {
  const [authState, setAuthState] = React.useState<"login" | "register" | "verify" | "checkInbox" | "workspace">("login");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [registerFormData, setRegisterFormData] = React.useState<RegisterPayload>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [loginFormData, setLoginFormData] = React.useState({
    email: "",
    password: "",
  });
  const [candidateEmail, setCandidateEmail] = React.useState<string>("");
  const [verificationStatus, setVerificationStatus] = React.useState<boolean>(false);
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);

  // === Auto-login function ===
  const handleAutoLogin = React.useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token)
        .then(res => {
          if (res.isValid) {
            console.log(res);
            localStorage.setItem("user", JSON.stringify(res.user));
            setAuthState("workspace");
          }
        })
        .catch(err => {
          console.error("Token validation failed:", err);
          localStorage.removeItem("token");
        });
    }
  }, []);

  // Handle auto-login on mount
  useEffect(() => {
    handleAutoLogin();
  }, [handleAutoLogin]);

  // Handle URL query parameters on client side only
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    if (code) {
      try {
        const data = decode<{ email: string }>(code);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCandidateEmail(data.email);
        setAuthState("verify");

        // Automatically verify the email
        setIsVerifying(true);
        verifyEmail({ code })
          .then(res => {
            setVerificationStatus(true);
            setToastMessage(res.message || "Email verified successfully!");
          })
          .catch(err => {
            setVerificationStatus(false);
            setToastMessage(err.message || "Verification failed.");
            console.error(err);
          })
          .finally(() => {
            setIsVerifying(false);
          });
      } catch (error) {
        console.error("Failed to decode token:", error);
        setVerificationStatus(false);
      }
    }
  }, []);

  // === Auth handlers ===
  const handleRegisterChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAuthStateChange = React.useCallback((state: "login" | "register" | "verify" | "checkInbox" | "workspace"): void => {
    setAuthState(state);
  }, []);

  const handleRegister = React.useCallback(() => {
    registerUser(registerFormData)
      .then(res => {
        setToastMessage("Registration successful!");
        handleAuthStateChange("checkInbox");
      })
      .catch(err => {
        setToastMessage("Registration failed. Please try again.");
        console.error(err);
      });
  }, [registerFormData, handleAuthStateChange]);

  const handleResendVerificationEmail = React.useCallback((email: string) => {
    sendVerificationEmail({ email: email })
      .then(res => {
        setToastMessage("Verification email sent!");
      })
      .catch(err => {
        setToastMessage("Failed to send verification email.");
        console.error(err);
      });
  }, [registerFormData.email]);

  const handleVerification = React.useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    if (code) {
      setIsVerifying(true);
      verifyEmail({ code })
        .then(res => {
          setVerificationStatus(true);
          console.log("returned data" + res);
          setToastMessage(res.message || "Email verified successfully!");
        })
        .catch(err => {
          setVerificationStatus(false);
          setToastMessage(err.message || "Verification failed.");
          console.error(err);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, []);

  const handleLogin = () => {
    loginUser(loginFormData)
      .then(res => {
        console.log(res);
        localStorage.setItem("token", res.data.token || "");
        setToastMessage("Login successful!");
        handleAuthStateChange("workspace");
      })
      .catch(err => {
        setToastMessage("Login failed. Please check your credentials and try again.");
        console.error(err);
      });
  }

  const handleLoginChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="">
      {(() => {
        switch (authState) {
          case "register":
            return (
              <Register
                handleAuthStateChange={handleAuthStateChange}
                handleRegister={handleRegister}
                formData={registerFormData}
                handleChange={handleRegisterChange}
              />
            );
          case "login":
            return <Login
              handleAuthStateChange={handleAuthStateChange}
              handleLogin={handleLogin}
              formData={loginFormData}
              handleChange={handleLoginChange}
            />;
          case "checkInbox":
            return <CheckInbox email={registerFormData.email} handleResend={() => handleResendVerificationEmail(registerFormData.email)} handleAuthStateChange={handleAuthStateChange} />;
          case "verify":
            return <VerificationResult verificationStatus={verificationStatus} email={candidateEmail} handleResend={() => { handleResendVerificationEmail(candidateEmail); setAuthState("checkInbox"); }} handleVerification={handleVerification} isVerifying={isVerifying} />;
          case "workspace":
            return <Dashboard />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
