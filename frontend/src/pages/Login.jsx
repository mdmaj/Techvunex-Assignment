import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState("user");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fillAdminCredentials = () => {
    const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || "";
    const configuredAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "";
    if (configuredAdminEmail) {
      setEmail(configuredAdminEmail);
    }
    if (configuredAdminPassword) {
      setPassword(configuredAdminPassword);
    }
    document.querySelector('input[autocomplete="current-password"]')?.focus();
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setEmail("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
    setDevOtp("");
    setError("");
    setNotice("");
  };

  const sendOTP = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const response = await api.post("/auth/send-otp", { email });
      setOtpSent(true);
      setDevOtp(response.data.devOtp || "");
      setNotice(response.data.message || "Your login code is on its way.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate(response.data.user.isAdmin ? "/admin" : "/products");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const response = await api.post("/auth/admin-login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="brand brand-light" to="/products">
          <span className="brand-mark">T</span>
          <span>Technuvex</span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow">The everyday edit</p>
          <h1>Good things, thoughtfully gathered.</h1>
          <p>
            Discover a small, considered collection of products made for better
            routines.
          </p>
          <div className="story-pill">
            <span className="story-dot" />A quieter way to shop
          </div>
        </div>
        <div className="story-note">
          <span>01</span>
          <span>
            Curated essentials
            <br />
            for modern living
          </span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="login-tabs" role="tablist" aria-label="Login type">
            <button
              className={loginMode === "user" ? "active" : ""}
              onClick={() => switchMode("user")}
              type="button"
            >
              User login
            </button>
            <button
              className={loginMode === "admin" ? "active" : ""}
              onClick={() => switchMode("admin")}
              type="button"
            >
              Admin login
            </button>
          </div>
          <p className="eyebrow">
            {loginMode === "admin" ? "Private access" : "Welcome back"}
          </p>
          <h2>
            {loginMode === "admin"
              ? "Admin sign in"
              : "Sign in with your email"}
          </h2>
          <p className="muted">
            {loginMode === "admin"
              ? "Use the administrator credentials configured for this store."
              : otpSent
                ? `We sent a six-digit code to ${email}.`
                : "We will send a one-time code. No password to remember."}
          </p>
          {loginMode === "user" && otpSent && (
            <div className="login-stepper">
              <span className="step-done">1</span>
              <span className="step-line" />
              <span className="step-active">2</span>
              <span>Verify your code</span>
            </div>
          )}
          <form
            onSubmit={
              loginMode === "admin" ? adminLogin : otpSent ? verifyOTP : sendOTP
            }
            className="auth-form"
          >
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                disabled={loginMode === "user" && otpSent}
              />
            </label>
            {loginMode === "admin" && (
              <label>
                Admin password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoComplete="current-password"
                />
              </label>
            )}
            {loginMode === "admin" && (
              <p className="admin-reference">
                Admin reference: click
                <button
                  type="button"
                  className="reference-button"
                  onClick={fillAdminCredentials}
                >
                  ADMIN_EMAIL / ADMIN_PASS
                </button>
                to fill the configured development credentials.
              </p>
            )}
            {loginMode === "user" && otpSent && (
              <label>
                One-time code
                <input
                  inputMode="numeric"
                  maxLength="6"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="000000"
                  required
                  autoFocus
                />
              </label>
            )}
            {error && <p className="form-error">{error}</p>}
            {notice && !error && <p className="form-notice">{notice}</p>}
            {devOtp && (
              <p className="dev-hint">
                Local development code: <strong>{devOtp}</strong>
              </p>
            )}
            <button
              className="button button-dark button-wide"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : loginMode === "admin"
                  ? "Sign in as admin"
                  : otpSent
                    ? "Enter storefront"
                    : "Send me a code"}
            </button>
          </form>
          {loginMode === "user" && otpSent && (
            <div className="login-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setDevOtp("");
                }}
              >
                Use a different email
              </button>
              <button type="button" className="text-button" onClick={sendOTP}>
                Resend code
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
