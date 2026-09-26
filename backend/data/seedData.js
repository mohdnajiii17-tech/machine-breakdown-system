export const SEED_USERS = [
  {
    userId: 'USR-OP-01',
    name: 'Alex Rivera',
    email: 'alex.operator@factory.com',
    role: 'OPERATOR',
    skills: [],
    isAvailable: true,
    activeWorkloadCount: 0,
    assignedMachines: ['CNC-07', 'PRESS-02', 'ROBOT-01']
  },
  {
    userId: 'USR-TECH-01',
    name: 'David Vance',
    email: 'david.vance@factory.com',
    role: 'TECHNICIAN',
    skills: ['MECHANICAL', 'HYDRAULIC'],
    isAvailable: true,
    activeWorkloadCount: 0,
    assignedMachines: ['CNC-07', 'PRESS-02']
  },
  {
    userId: 'USR-TECH-02',
    name: 'Elena Rostova',
    email: 'elena.rostova@factory.com',
    role: 'TECHNICIAN',
    skills: ['ELECTRICAL', 'PLC'],
    isAvailable: true,
    activeWorkloadCount: 1,
    assignedMachines: ['ROBOT-01', 'CONVEYOR-04']
  },
  {
    userId: 'USR-SUP-01',
    name: 'Marcus Brody',
    email: 'marcus.supervisor@factory.com',
    role: 'SUPERVISOR',
    skills: ['EHS', 'INSPECTION', 'SAFETY'],
    isAvailable: true,
    activeWorkloadCount: 0,
    assignedMachines: []
  },
  {
    userId: 'USR-ADMIN-01',
    name: 'System Admin',
    email: 'admin@factory.com',
    role: 'ADMIN',
    skills: ['ALL'],
    isAvailable: true,
    activeWorkloadCount: 0,
    assignedMachines: []
  }
];

export const SEED_MACHINES = [
  {
    machineId: 'CNC-07',
    name: '5-Axis CNC Milling Lathe',
    category: 'CNC',
    lineLocation: 'Line 1 - Machine Shop',
    criticality: 'HIGH',
    status: 'AVAILABLE',
    digitalLockActive: false,
    activeLockId: null,
    activeLockTimestamp: null,
    activeLockTechnicianId: null,
    lastMaintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    totalBreakdownsCount: 3,
    healthScore: 78
  },
  {
    machineId: 'PRESS-02',
    name: '500-Ton Hydraulic Stamping Press',
    category: 'Press',
    lineLocation: 'Line 2 - Stamping Bay',
    criticality: 'HIGH',
    status: 'AVAILABLE',
    digitalLockActive: false,
    activeLockId: null,
    activeLockTimestamp: null,
    activeLockTechnicianId: null,
    lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalBreakdownsCount: 4,
    healthScore: 65
  },
  {
    machineId: 'ROBOT-01',
    name: 'KUKA 6-Axis Welding Robotic Arm',
    category: 'Robotics',
    lineLocation: 'Line 3 - Automated Assembly',
    criticality: 'HIGH',
    status: 'AVAILABLE',
    digitalLockActive: false,
    activeLockId: null,
    activeLockTimestamp: null,
    activeLockTechnicianId: null,
    lastMaintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalBreakdownsCount: 1,
    healthScore: 92
  },
  {
    machineId: 'CONVEYOR-04',
    name: 'Main Packaging Belt Conveyor',
    category: 'Conveyor',
    lineLocation: 'Line 4 - Packaging Depot',
    criticality: 'MEDIUM',
    status: 'AVAILABLE',
    digitalLockActive: false,
    activeLockId: null,
    activeLockTimestamp: null,
    activeLockTechnicianId: null,
    lastMaintenanceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    totalBreakdownsCount: 2,
    healthScore: 84
  },
  {
    machineId: 'MOLDING-09',
    name: 'Heavy Industrial Injection Molding Unit',
    category: 'Molding',
    lineLocation: 'Line 5 - Plastics Division',
    criticality: 'LOW',
    status: 'AVAILABLE',
    digitalLockActive: false,
    activeLockId: null,
    activeLockTimestamp: null,
    activeLockTechnicianId: null,
    lastMaintenanceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    totalBreakdownsCount: 1,
    healthScore: 88
  }
];

export const SEED_SPARE_PARTS = [
  {
    partId: 'PRT-BRG-6205',
    name: 'High-Precision Roller Bearing 6205-2RS',
    category: 'Bearings',
    currentStock: 8,
    minStockThreshold: 3,
    unitCost: 145,
    compatibleMachineCategories: ['CNC', 'Conveyor'],
    binLocation: 'Shelf A-12'
  },
  {
    partId: 'PRT-HYD-SEAL',
    name: 'Viton Heavy Duty Hydraulic Cylinder Seal Kit',
    category: 'Hydraulic Seals',
    currentStock: 2, // Low stock alert!
    minStockThreshold: 4,
    unitCost: 280,
    compatibleMachineCategories: ['Press', 'Molding'],
    binLocation: 'Shelf B-04'
  },
  {
    partId: 'PRT-PLC-MOD',
    name: 'Siemens S7-1200 Digital I/O Expansion Module',
    category: 'PLC Modules',
    currentStock: 5,
    minStockThreshold: 2,
    unitCost: 620,
    compatibleMachineCategories: ['Robotics', 'CNC'],
    binLocation: 'Cabinet E-01'
  },
  {
    partId: 'PRT-FUSE-30A',
    name: 'Fast-Acting Industrial Ceramic Fuse 30A 600V',
    category: 'Electrical Fuses',
    currentStock: 25,
    minStockThreshold: 10,
    unitCost: 18,
    compatibleMachineCategories: ['CNC', 'Press', 'Robotics', 'Conveyor', 'Molding'],
    binLocation: 'Bin C-09'
  },
  {
    partId: 'PRT-BELT-V300',
    name: 'Reinforced Polymer Drive V-Belt V-300',
    category: 'Belts',
    currentStock: 0, // Out of stock demo!
    minStockThreshold: 2,
    unitCost: 75,
    compatibleMachineCategories: ['Conveyor'],
    binLocation: 'Rack D-02'
  }
];

export const SEED_HISTORICAL_BREAKDOWNS = [
  {
    breakdownId: 'BKD-HIST-101',
    machineId: 'CNC-07',
    reportedBy: 'USR-OP-01',
    reportedSymptom: 'VIBRATION',
    symptomLabel: 'Excessive Shaft Vibration',
    notes: 'Spindle vibrating above 4000 RPM during rough milling.',
    calculatedPriorityScore: 78,
    priorityTier: 'HIGH',
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  },
  {
    breakdownId: 'BKD-HIST-102',
    machineId: 'CNC-07',
    reportedBy: 'USR-OP-01',
    reportedSymptom: 'NOISE',
    symptomLabel: 'Unusual Grinding Noise',
    notes: 'Grinding sound coming from main axis gearbox.',
    calculatedPriorityScore: 70,
    priorityTier: 'HIGH',
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    breakdownId: 'BKD-HIST-103',
    machineId: 'PRESS-02',
    reportedBy: 'USR-OP-01',
    reportedSymptom: 'LEAKAGE',
    symptomLabel: 'Hydraulic Fluid Seepage',
    notes: 'Fluid dripping from main ram pressure manifold.',
    calculatedPriorityScore: 82,
    priorityTier: 'CRITICAL',
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  }
];
