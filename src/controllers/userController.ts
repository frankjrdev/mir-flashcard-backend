
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().select('-password');

    sendResponse(res, 200, true, 'Users retrieved successfully', { users });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
    }

    sendResponse(res, 200, true, 'User retrieved successfully', { user });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role },
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
    }

    sendResponse(res, 200, true, 'User updated successfully', { user });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
    }

    sendResponse(res, 200, true, 'User deleted successfully', {});
});

export { getUsers, getUser, updateUser, deleteUser };