"use client";

import { useState } from "react";
import { Dashboard, Login } from "../components/ctms";
import { AuthProvider, useAuth } from "../lib/context/AuthContext";

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user && loggedIn) {
    return (
      <Dashboard 
        user={{
          employeeId: user.employeeId,
          email: user.email,
          password: '', // Not needed anymore
          name: user.name,
          firstName: user.firstName,
          role: user.role,
          department: user.department,
        }} 
        onLogout={async () => {
          await logout();
          setLoggedIn(false);
        }}
      />
    );
  }

  // Show login screen
  return <Login onLogin={() => setLoggedIn(true)} />;
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
