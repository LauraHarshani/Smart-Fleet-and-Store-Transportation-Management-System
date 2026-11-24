const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, 
  entityType: { type: String, required: true }, 
  entityId: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'authUsers', required: true },
  details: { type: Object }, 
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
