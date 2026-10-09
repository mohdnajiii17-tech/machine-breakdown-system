import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OperatorView from './components/OperatorView';
import TechnicianView from './components/TechnicianView';
import SupervisorView from './components/SupervisorView';
import MachineHealthSummary from './components/MachineHealthSummary';
import AuditLogView from './components/AuditLogView';
import NotFoundView from './components/NotFoundView';
import { useAuth, AuthProvider } from './context/AuthContext';

function MainLayout() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('WORKFLOW');

  // Update dynamic page title based on active view tab & role
  useEffect(() => {
    let titlePrefix = 'Smart Maintenance Coordination';
    if (activeTab === 'WORKFLOW') {
      titlePrefix = `${currentUser.role.charAt(0) + currentUser.role.slice(1).toLowerCase()} Portal - Breakdown & LOTO Lock`;
    } else if (activeTab === 'HEALTH') {
      titlePrefix = 'Machine Health & Reliability Metrics';
    } else if (activeTab === 'AUDIT') {
      titlePrefix = 'EHS Compliance Audit Log';
    } else if (activeTab === 'NOT_FOUND') {
      titlePrefix = '404 Page Not Found';
    }
    document.title = `${titlePrefix} | Smart Machine Breakdown & Lock System`;
  }, [activeTab, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-cyan-500 focus:text-slate-950 focus:font-bold"
      >
        Skip to main content
      </a>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'WORKFLOW' && (
          <>
            {currentUser.role === 'OPERATOR' && <OperatorView />}
            {currentUser.role === 'TECHNICIAN' && <TechnicianView />}
            {(currentUser.role === 'SUPERVISOR' || currentUser.role === 'ADMIN') && <SupervisorView />}
          </>
        )}

        {activeTab === 'HEALTH' && <MachineHealthSummary />}

        {activeTab === 'AUDIT' && <AuditLogView />}

        {activeTab === 'NOT_FOUND' && <NotFoundView onNavigateHome={setActiveTab} />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span>Smart Machine Breakdown & Digital Maintenance Lock System</span>
          <span className="text-slate-600">• OSHA 1910.147 Software Workflow Compliant</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
