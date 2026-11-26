
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AuthUser = require("../models/authUser");
const Store = require("../models/store");

const resolveStoreId = async (storeValue) => {
    if (!storeValue) return null;

    const assignedStore = storeValue.toString().trim();
    if (mongoose.Types.ObjectId.isValid(assignedStore)) return assignedStore;

    const store = await Store.findOne({
        $or: [
            { name: assignedStore },
            { code: assignedStore },
            { id: assignedStore }
        ]
    }).select("_id").lean();

    return store?._id.toString() || null;
};

const protect = async (req, res, next) => {
    try {
        // Read JWT from HTTP-only cookie
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please log in."
            });
        }

        // Verify JWT signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user
        const user = await AuthUser.findById(decoded.userId).select("+tokenVersion");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found"
            });
        }

        // Check whether the account is still active
        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        // Check whether this token has been invalidated
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please log in again."
            });
        }

        let storeId = null;
        if (user.role !== "ADMIN") {
            try {
                storeId = await resolveStoreId(user.store);
            } catch (error) {
                console.error("Assigned store lookup error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Unable to verify your assigned store"
                });
            }
        }

        // Attach authenticated user information to the request
        req.user = {
            userId: user._id.toString(),
            id: user.id,
            role: user.role,
            storeId,
            store: storeId
        };
        req.auth = { persistent: Boolean(decoded.persistent) };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session. Please log in again."
        });
    }
};

module.exports = {
    protect,
 };
