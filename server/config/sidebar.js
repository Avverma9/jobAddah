// Export a set of sidebar/menu permission constants.
// Use these strings when assigning permissions to users so front-end and back-end agree.

const SIDEBAR = Object.freeze({
  DASHBOARD: 'menu.dashboard',
  JOBS_VIEW: 'menu.jobs.view',
  JOBS_CREATE: 'menu.jobs.create',
  JOBS_EDIT: 'menu.jobs.edit',
  USERS_MANAGE: 'menu.users.manage',
  SETTINGS: 'menu.settings'
});

const ALL_PERMISSIONS = Object.values(SIDEBAR);

module.exports = { SIDEBAR, ALL_PERMISSIONS };
