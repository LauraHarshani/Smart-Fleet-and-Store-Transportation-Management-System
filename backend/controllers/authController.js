const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthUser = require("../models/authUser");

//Cookie configuration
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
};

//LOGIN
const login = async (req,res) => {
    try{
        const { email, password, rememberMe = false } = req.body;

        //validation inputs
        if(typeof email !== "string" || !email.trim() || typeof password !== "string" || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        //find user and include password
        const user = await AuthUser.findOne({
            email: email.toLowerCase().trim()
        }).select("+password +tokenVersion");

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email and password"
            });
        }

        //compare entered password with hash password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        //check account status
        if(user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact the administrator."
            });
        }

        // Check whether the user has completed password setup
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: "Password setup is required for this account"
            });
        }

        //Generate JWT
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                tokenVersion: user.tokenVersion,
                persistent: Boolean(rememberMe)
            },
            process.env.JWT_SECRET,
            {
                expiresIn: rememberMe ? "30d" : (process.env.JWT_EXPIRES_IN || "1d")
            }
        );

        //set token in HTTP-only cookie
        res.cookie("token", token, rememberMe ? {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000
        } : cookieOptions);

        // Return user details without password
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                store: user.store,
                department: user.department,
                avatar: user.avatar,
                status: user.status
            }
        });
    } catch (error){
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

//Get current User
const getMe = async (req,res) => {
    try {
        //req.user is set by authentication middleware
        const user = await AuthUser.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                store: user.store,
                department: user.department,
                avatar: user.avatar,
                status: user.status
            }
        });
    } catch (error) {

        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

const updateMe = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const updates = {};
        if (typeof name === "string" && name.trim()) updates.name = name.trim();
        if (typeof email === "string" && email.trim()) updates.email = email.trim().toLowerCase();
        if (typeof phone === "string") updates.phone = phone.trim();

        const user = await AuthUser.findByIdAndUpdate(req.user.userId, updates, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                store: user.store,
                department: user.department,
                avatar: user.avatar,
                status: user.status,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "That email address is already in use." });
        }
        console.error("Update profile error:", error);
        return res.status(400).json({ success: false, message: "Unable to update profile" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new passwords are required." });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
        }

        const user = await AuthUser.findById(req.user.userId).select("+password +tokenVersion");
        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) {
            return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }

        user.password = newPassword;
        user.tokenVersion += 1;
        await user.save();

        const persistentSession = Boolean(req.auth?.persistent);
        const token = jwt.sign(
            { userId: user._id.toString(), tokenVersion: user.tokenVersion, persistent: persistentSession },
            process.env.JWT_SECRET,
            { expiresIn: persistentSession ? "30d" : (process.env.JWT_EXPIRES_IN || "1d") }
        );
        res.cookie("token", token, persistentSession ? {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        } : cookieOptions);

        return res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ success: false, message: "Unable to change password." });
    }
};

// 5. LOGOUT
const logout = async (req, res) => {
    try {
        // Increment token version to invalidate existing JWTs
        await AuthUser.findByIdAndUpdate(
            req.user.userId,
            { $inc: { tokenVersion: 1 } }
        );

        // Clear browser cookie
        res.clearCookie("token", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during logout"
        });
    }
};


module.exports = {
    login,
    getMe,
    updateMe,
    changePassword,
    logout,
}
