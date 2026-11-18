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
        const {email,password} = req.body;

        //validation inputs
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        //find user and include password
        const user = await AuthUser.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");

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
        if(user.status != "Active") {
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
                tokenVersion: user.tokenVersion
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        //set token in HTTP-only cookie
        res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        });

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
    logout,
}