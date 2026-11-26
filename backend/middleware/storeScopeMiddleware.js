const storeScope = (req, res, next) => {
    try {
        // Authentication must run before this middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { role } = req.user;
        const store = req.user.storeId;

        // Admins can access all stores
        if (role === "ADMIN") {
            req.storeScope = null;
            return next();
        }

        // Drivers will use a separate trip-based access middleware
        if (role === "DRIVER") {
            return res.status(403).json({
                success: false,
                message: "Drivers cannot access store-wide resources"
            });
        }

        // Only Store Managers and Store Employees are supported here
        if (
            role !== "STORE MANAGER" &&
            role !== "STORE EMPLOYEE"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid role for store access"
            });
        }

        // Check whether a store is assigned
        if (!store) {
            return res.status(403).json({
                success: false,
                message: "No store has been assigned to your account"
            });
        }

        // Identify the requested store, if supplied
        const requestedStore =
            req.params.storeId ||
            req.query.storeId ||
            req.query.store ||
            req.body?.storeId ||
            req.body?.store;

        // Prevent access to another store
        if (
            requestedStore &&
            requestedStore.toString() !== store.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot access another store's data."
            });
        }

        // Set the permitted store scope for the controller
        req.storeScope = store;

        next();

    } catch (error) {
        console.error("Store scope middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Error checking store permissions"
        });
    }
};

module.exports = { storeScope };
