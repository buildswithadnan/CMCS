"use client";

import React, { FormEvent, useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      onLogin(); // Navigate to dashboard
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-hero">
        <img
          src="/assets/chinar-logo.png"
          alt="Chinar Media Consulting Services"
        />
        <div>
          <span>CMCS INTERNAL PLATFORM</span>
          <h1>One workspace for every production.</h1>
          <p>
            Coordinate projects, people, finance and field operations from a
            clear, connected control centre.
          </p>
        </div>
        <div className="auth-hero-foot">
          <span>Real-time authentication</span>
          <span>•</span>
          <span>Secure workspace access</span>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <span className="eyebrow">SECURE WORKSPACE</span>
            <h2>Welcome back</h2>
            <p>Sign in to your CMCS workspace</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@chinar.tv"
                disabled={isLoading}
                autoFocus
              />
              <span className="auth-field-help">
                Use your CMCS employee email address.
              </span>
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShow(!show)}
                  disabled={isLoading}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"} <ArrowUpRight size={16} />
            </button>
          </form>
          <div className="auth-demo-hint">
            <p><strong>Test Credentials (Password: ChinarCEO@2026)</strong></p>
            <small>CEO: ceo@chinar.tv</small>
            <small>Operations: hoo@chinar.tv</small>
            <small>Finance: finance@chinar.tv</small>
            <small>Technical: technical@chinar.tv</small>
            <small>Production: production@chinar.tv</small>
            <small>Admin: admin@chinar.tv</small>
          </div>
          <p className="auth-authorized">
            <ShieldCheck size={13} /> Authorized CMCS personnel only
          </p>
        </div>
      </div>
    </section>
  );
}
