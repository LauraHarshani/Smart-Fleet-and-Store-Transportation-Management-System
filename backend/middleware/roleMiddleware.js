const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check whether the user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check whether the user's role is permitted
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = { allowRoles };
