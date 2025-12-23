import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';

const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, Invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const adminProtect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const admin = await Admin.findById(decoded.userId).select('-password');

            if (!admin) {
                res.status(401);
                throw new Error('Not authorized, admin not found');
            }

            // Check if the user is actually an admin
            if (!admin.isAdmin) {
                res.status(403);
                throw new Error('Not authorized, admin privileges required');
            }

            req.admin = admin;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, Invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Alternative version if you use a single User model with role field
const adminProtectAlt = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            // Check if the user has admin role
            if (user.role !== 'admin') {
                res.status(403);
                throw new Error('Not authorized, admin privileges required');
            }

            req.user = user;
            req.isAdmin = true;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, Invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect, adminProtect, adminProtectAlt };