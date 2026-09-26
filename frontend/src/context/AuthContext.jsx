import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

const AuthContext = createContext();

export const DEFAULT_DEMO_USERS = [
  {
    userId: 'USR-OP-01',
    name: 'Alex Rivera',
    email: 'alex.operator@factory.com',
    role: 'OPERATOR',
    skills: [],
    badge: 'Operator (Line 1)'
  },
  {
    userId: 'USR-TECH-01',
    name: 'David Vance',
    email: 'david.vance@factory.com',
    role: 'TECHNICIAN',
    skills: ['MECHANICAL', 'HYDRAULIC'],
    badge: 'Senior Mechanical Tech'
  },
  {
    userId: 'USR-SUP-01',
    name: 'Marcus Brody',
    email: 'marcus.supervisor@factory.com',
    role: 'SUPERVISOR',
    skills: ['EHS', 'SAFETY'],
    badge: 'EHS & Line Supervisor'
  },
  {
    userId: 'USR-ADMIN-01',
    name: 'System Admin',
    email: 'admin@factory.com',
    role: 'ADMIN',
    skills: ['ALL'],
    badge: 'Plant Operations Admin'
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('demo_user');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USERS[0]; // Default to Operator
  });

  const [machines, setMachines] = useState([]);
  const [breakdowns, setBreakdowns] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Switch Role function for 1-click Hackathon presentation
  const switchRole = (roleOrUser) => {
    let targetUser = typeof roleOrUser === 'string' 
      ? DEFAULT_DEMO_USERS.find(u => u.role === roleOrUser) || DEFAULT_DEMO_USERS[0]
      : roleOrUser;
    
    setCurrentUser(targetUser);
    localStorage.setItem('demo_user', JSON.stringify(targetUser));
  };

  // Reload all core state from backend
  const refreshData = async () => {
    try {
      setLoading(true);
      const [machinesData, ticketsData, jobsData, partsData, logsData] = await Promise.all([
        fetchApi('/machines').catch(() => []),
        fetchApi('/breakdowns').catch(() => []),
        fetchApi('/job-cards').catch(() => []),
        fetchApi('/spare-parts').catch(() => []),
        fetchApi('/audit').catch(() => [])
      ]);

      setMachines(machinesData);
      setBreakdowns(ticketsData);
      setJobCards(jobsData);
      setSpareParts(partsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error refreshing state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      machines,
      breakdowns,
      jobCards,
      spareParts,
      auditLogs,
      refreshData,
      loading,
      DEFAULT_DEMO_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
