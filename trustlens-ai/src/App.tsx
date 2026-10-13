import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SentinelChatbot } from './components/chatbot/SentinelChatbot';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BrandRegistryPage } from './pages/BrandRegistryPage';
import { ThreatScannerPage } from './pages/ThreatScannerPage';
import { FraudReportsPage } from './pages/FraudReportsPage';
import { EvidencePassportPage } from './pages/EvidencePassportPage';
import { BlocklistPage } from './pages/BlocklistPage';
import { ProtectedBrowsingPage } from './pages/ProtectedBrowsingPage';
import { LoginRiskPage } from './pages/LoginRiskPage';
import { FederatedLearningPage } from './pages/FederatedLearningPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedPassportReportId, setSelectedPassportReportId] = useState<string>('REP-2026-00101');
  const [protectedUrl, setProtectedUrl] = useState<string>('novapay-secure-login.com');

  // Check URL parameters for protected browsing route
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      setProtectedUrl(urlParam);
      setCurrentView('protected');
    }
  }, []);

  // If user is not authenticated and views a protected page, redirect to landing or login
  const handleOpenProtectedUrl = (url: string) => {
    setProtectedUrl(url);
    setCurrentView('protected');
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedPassportReportId(reportId);
    setCurrentView('passport');
  };

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setCurrentView('dashboard')}
        onGoToLogin={() => setCurrentView('login')}
        onGoToRegister={() => setCurrentView('login')}
      />
    );
  }

  // Render Login Page only when explicitly navigated to (demo mode — no forced redirect)
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentView('dashboard')}
        onGoToRegister={() => setCurrentView('login')}
        onBackToDashboard={() => setCurrentView('dashboard')}
      />
    );
  }


  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col antialiased relative">
      {/* Ambient Aqua-Blue Shade at Corners of the Screen */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* Top Navbar */}
      <div className="relative z-20">
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenChat={() => setIsChatOpen(true)}
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent pb-24">
          {currentView === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentView}
              onSelectReportForPassport={handleSelectReport}
            />
          )}

          {currentView === 'registry' && (
            <BrandRegistryPage />
          )}

          {currentView === 'scanner' && (
            <ThreatScannerPage
              onNavigate={setCurrentView}
              onSelectReportForPassport={handleSelectReport}
            />
          )}

          {currentView === 'reports' && (
            <FraudReportsPage
              onNavigate={setCurrentView}
              onSelectReportForPassport={handleSelectReport}
            />
          )}

          {currentView === 'passport' && (
            <EvidencePassportPage
              selectedReportId={selectedPassportReportId}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'blocklist' && (
            <BlocklistPage
              onNavigate={setCurrentView}
              onOpenProtectedUrl={handleOpenProtectedUrl}
            />
          )}

          {currentView === 'protected' && (
            <ProtectedBrowsingPage
              initialUrl={protectedUrl}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'risk' && (
            <LoginRiskPage
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'federated' && (
            <FederatedLearningPage />
          )}

          {currentView === 'audit' && (
            <AuditLogsPage />
          )}

          {currentView === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Floating 24/7 AI Sentinel Chatbot Available Across Dashboard */}
      <SentinelChatbot
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
