"use client";

import React, { FormEvent, useState } from "react";
import { ArrowUpRight, Building2, ShieldCheck } from "lucide-react";
import { User } from "../../lib/types";
import { loginDepartments, users } from "../../lib/dummy-data/mock-data";

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [department, setDepartment] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const normalizedIdentity = identity.trim().toLowerCase();
    const found = Object.values(users).find(
      (u) =>
        u.department === department &&
        (u.email === normalizedIdentity ||
          u.employeeId.toLowerCase() === normalizedIdentity),
    );
    if (!found || found.password !== password) {
      setError(
        department
          ? `Those credentials do not match a ${department} account.`
          : "Select your department to continue.",
      );
      return;
    }
    onLogin(found);
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
          <span>Six departments</span>
          <span>•</span>
          <span>One source of truth</span>
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
              Department
              <div className="department-field">
                <Building2 size={16} aria-hidden="true" />
                <select
                  required
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setError("");
                  }}
                  aria-label="Select your department"
                >
                  <option value="" disabled>
                    Select your department
                  </option>
                  {loginDepartments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <span className="auth-field-help">
                Use the workspace assigned to your department.
              </span>
            </label>
            <label>
              Employee ID or email
              <input
                required
                value={identity}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  setError("");
                }}
                placeholder="you@chinar.tv"
              />
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
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit">
              Sign in <ArrowUpRight size={16} />
            </button>
          </form>
          <p className="auth-authorized">
            <ShieldCheck size={13} /> Authorized CMCS personnel only
          </p>
        </div>
      </div>
    </section>
  );
}
