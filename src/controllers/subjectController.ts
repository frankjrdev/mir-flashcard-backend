import { Request, Response, NextFunction } from 'express';
import Subject from '../models/Subject';
import Flashcard from '../models/Flashcard';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private
const getSubjects = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // If user is admin, get all subjects, else get only user's subjects
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };

    const subjects = await Subject.find(filter).populate('createdBy', 'name email');

    sendResponse(res, 200, true, 'Subjects retrieved successfully', { subjects });
});

// @desc    Get single subject
// @route   GET /api/v1/subjects/:id
// @access  Private
const getSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const subject = await Subject.findById(req.params.id).populate('createdBy', 'name email');

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to access this subject'));
    }

    sendResponse(res, 200, true, 'Subject retrieved successfully', { subject });
});

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private
const createSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const subject = await Subject.create(req.body);

    sendResponse(res, 201, true, 'Subject created successfully', { subject });
});

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private
const updateSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to update this subject'));
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'Subject updated successfully', { subject });
});

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private
const deleteSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to delete this subject'));
    }

    // Delete all flashcards associated with this subject
    await Flashcard.deleteMany({ subject: req.params.id });

    await subject.deleteOne();

    sendResponse(res, 200, true, 'Subject deleted successfully', {});
});

export { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };