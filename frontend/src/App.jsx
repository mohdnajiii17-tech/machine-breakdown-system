import React, { useState } from 'react';
import Navbar from './components/Navbar';
import OperatorView from './components/OperatorView';
import TechnicianView from './components/TechnicianView';
import SupervisorView from './components/SupervisorView';
import MachineHealthSummary from './components/MachineHealthSummary';
import AuditLogView from './components/AuditLogView';
import { useAuth, AuthProvider } from './context/AuthContext';

function MainLayout() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('WORKFLOW');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'WORKFLOW' && (
          <>
            {currentUser.role === 'OPERATOR' && <OperatorView />}
            {currentUser.role === 'TECHNICIAN' && <TechnicianView />}
            {(currentUser.role === 'SUPERVISOR' || currentUser.role === 'ADMIN') && <SupervisorView />}
          </>
        )}

        {activeTab === 'HEALTH' && <MachineHealthSummary />}

        {activeTab === 'AUDIT' && <AuditLogView />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        Smart Machine Breakdown & Maintenance Lock System • BE Mini Project / Hackathon Edition
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
