import { Request, Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { AuthRequest } from '@/middleware/auth.middleware';

export class SubjectController {
  private subjectService: SubjectService;

  constructor() {
    this.subjectService = new SubjectService();
  }

  createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subject = await this.subjectService.createSubject(req.user.id, req.body);
      res.status(201).json(subject);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getUserSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subjects = await this.subjectService.getUserSubjects(req.user.id);
      res.json(subjects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getSubjectById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subject = await this.subjectService.getSubjectById(req.user.id, req.params.id);
      res.json(subject);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subject = await this.subjectService.updateSubject(req.user.id, req.params.id, req.body);
      res.json(subject);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.subjectService.deleteSubject(req.user.id, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  getSubjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.subjectService.getSubjectStats(req.user.id, req.params.id);
      res.json(stats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
