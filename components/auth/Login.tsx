"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Building2, Check, ChevronDown, ShieldCheck } from "lucide-react";
import { User } from "../../lib/types";
import { loginDepartments, users } from "../../lib/dummy-data/mock-data";

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [department, setDepartment] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [error, setError] = useState("");
  const departmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeDepartmentMenu = (event: MouseEvent) => {
      if (!departmentRef.current?.contains(event.target as Node)) {
        setDepartmentOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDepartmentMenu);
    return () => document.removeEventListener("mousedown", closeDepartmentMenu);
  }, []);

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
              <div className={`department-field ${departmentOpen ? "is-open" : ""}`} ref={departmentRef}>
                <Building2 size={16} aria-hidden="true" />
                <button
                  type="button"
                  className={`department-trigger ${department ? "has-value" : ""}`}
                  aria-haspopup="listbox"
                  aria-expanded={departmentOpen}
                  onClick={() => setDepartmentOpen((open) => !open)}
                >
                  {department || "Select your department"}
                </button>
                <ChevronDown className="department-chevron" size={15} aria-hidden="true" />
                {departmentOpen && <div className="department-menu" role="listbox" aria-label="Select your department">
                  {loginDepartments.map((item) => <button
                    type="button"
                    className={`department-option ${department === item ? "is-selected" : ""}`}
                    role="option"
                    aria-selected={department === item}
                    key={item}
                    onClick={() => {
                      setDepartment(item);
                      setDepartmentOpen(false);
                      setError("");
                    }}
                  >
                    <span>{item}</span>
                    {department === item && <Check size={14} />}
                  </button>)}
                </div>}
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
