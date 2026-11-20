const { createAuditLog } = require('../utils/auditLogger');

const auditMutation = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  res.once('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 400 || !req.user?.userId) return;

    const resource = (req.baseUrl.split('/').filter(Boolean).pop() || 'resource').replace(/s$/, '');
    const actions = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };
    const entityId = req.params.id || req.body?.id || req.body?.code || req.body?.registrationNumber || req.body?.email || 'unknown';
    void createAuditLog(
      req.user.userId,
      actions[req.method],
      resource,
      String(entityId),
      { method: req.method, path: req.originalUrl, responseStatus: res.statusCode }
    );
  });

  return next();
};

module.exports = { auditMutation };
