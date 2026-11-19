const AuditLog = require('../models/AuditLog');

const createAuditLog = async (actorId, action, entityType, entityId, changeSummary) => {
  try {
    await AuditLog.create({
      performedBy: actorId,
      action: action,
      entityType: entityType,
      entityId: entityId,
      details: changeSummary,
      timestamp: new Date()
    });
    console.log(`Audit Log Recorded: ${action} on ${entityType}`);
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
};

module.exports = { createAuditLog };