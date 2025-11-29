// Role-based permissions and navigation mapping based on Django User model

export const USER_ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  SITE_ENGINEER: 'site_engineer',
  FOREMAN: 'foreman',
  SUBCONTRACTOR: 'subcontractor',
  WORKER: 'worker',
  SAFETY_OFFICER: 'safety_officer',
  QUALITY_INSPECTOR: 'quality_inspector',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canManageProjects: true,
    canViewReports: true,
    canManageBudgets: true,
    canManageVendors: true,
    canAccessAllModules: true,
    dashboardRoute: 'AdminDashboard',
    displayName: 'Admin',
    icon: '🏗️',
  },
  [USER_ROLES.PROJECT_MANAGER]: {
    canManageProjects: true,
    canManageTeam: true,
    canViewReports: true,
    canManageBudgets: true,
    canPlanResources: true,
    dashboardRoute: 'ProjectManagerDashboard',
    displayName: 'Project Manager',
    icon: '📋',
  },
  [USER_ROLES.SITE_ENGINEER]: {
    canManageTasks: true,
    canViewDocuments: true,
    canManageEquipment: true,
    canAssignSubcontractors: true,
    canSubmitReports: true,
    dashboardRoute: 'EngineerDashboard',
    displayName: 'Site Engineer',
    icon: '👷',
  },
  [USER_ROLES.FOREMAN]: {
    canManageCrew: true,
    canViewTasks: true,
    canUpdateProgress: true,
    canRequestMaterials: true,
    canConductSafetyChecks: true,
    dashboardRoute: 'ForemanDashboard',
    displayName: 'Foreman',
    icon: '👷♂️',
  },
  [USER_ROLES.SUBCONTRACTOR]: {
    canViewAssignedTasks: true,
    canSubmitProgress: true,
    canAccessDocuments: true,
    canLogTime: true,
    canSubmitInvoices: true,
    dashboardRoute: 'SubcontractorDashboard',
    displayName: 'Subcontractor',
    icon: '🔧',
  },
  [USER_ROLES.WORKER]: {
    canViewMyTasks: true,
    canMarkAttendance: true,
    canAccessSafetyTraining: true,
    canViewInstructions: true,
    dashboardRoute: 'WorkerDashboard',
    displayName: 'Worker',
    icon: '👷',
  },
  [USER_ROLES.SAFETY_OFFICER]: {
    canConductInspections: true,
    canManageIncidents: true,
    canManageTraining: true,
    canMonitorCompliance: true,
    canManageSafetyEquipment: true,
    dashboardRoute: 'SafetyOfficerDashboard',
    displayName: 'Safety Officer',
    icon: '🦺',
  },
  [USER_ROLES.QUALITY_INSPECTOR]: {
    canConductQualityInspections: true,
    canGenerateTestReports: true,
    canManageNonConformance: true,
    canAccessQualityStandards: true,
    canScheduleInspections: true,
    dashboardRoute: 'QualityInspectorDashboard',
    displayName: 'Quality Inspector',
    icon: '🔍',
  },
};

// Helper functions
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || null;
};

export const hasPermission = (userRole, permission) => {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions ? rolePermissions[permission] === true : false;
};

export const getDashboardRoute = (role) => {
  const rolePermissions = getRolePermissions(role);
  return rolePermissions ? rolePermissions.dashboardRoute : null;
};

export const getRoleDisplayInfo = (role) => {
  const rolePermissions = getRolePermissions(role);
  return rolePermissions ? {
    displayName: rolePermissions.displayName,
    icon: rolePermissions.icon,
  } : { displayName: 'Unknown', icon: '❓' };
};

export const canAccessModule = (userRole, module) => {
  const rolePermissions = getRolePermissions(userRole);
  if (!rolePermissions) return false;
  
  // Admin can access all modules
  if (rolePermissions.canAccessAllModules) return true;
  
  // Module-specific access control
  const modulePermissions = {
    'ProjectManagement': ['canManageProjects', 'canViewProjects'],
    'UserManagement': ['canManageUsers'],
    'BudgetFinancials': ['canManageBudgets', 'canViewBudgets'],
    'VendorProcurement': ['canManageVendors'],
    'TaskAssignment': ['canManageTasks', 'canViewTasks'],
    'DocumentManagement': ['canViewDocuments', 'canManageDocuments'],
    'ReportsAnalytics': ['canViewReports'],
    'SafetyCompliance': ['canConductInspections', 'canManageIncidents'],
    'EquipmentInventory': ['canManageEquipment'],
  };
  
  const requiredPermissions = modulePermissions[module] || [];
  return requiredPermissions.some(permission => rolePermissions[permission]);
};