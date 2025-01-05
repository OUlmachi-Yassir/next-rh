import request from 'supertest';
import { createServer } from 'http';
import handler from '../pages/api/offres'; 
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';

jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn(),
}));

jest.mock('@/models/Job', () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

describe('Job API', () => {
  const mockJob = {
    _id: 'job123',
    title: 'Software Engineer',
    description: 'Develop software applications.',
    company: 'Tech Corp',
  };

  describe('POST /api/jobs', () => {
    it('should successfully create a new job offer', async () => {
      Job.create.mockResolvedValue(mockJob);

      const res = await request(createServer(handler))
        .post('/api/jobs')
        .send({
          title: 'Software Engineer',
          description: 'Develop software applications.',
          company: 'Tech Corp',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Job offer created.');
      expect(res.body.job).toHaveProperty('title', 'Software Engineer');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(createServer(handler))
        .post('/api/jobs')
        .send({
          title: 'Software Engineer', 
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required.');
    });

    it('should return 500 if there is a server error', async () => {
      Job.create.mockRejectedValue(new Error('Database error'));

      const res = await request(createServer(handler))
        .post('/api/jobs')
        .send({
          title: 'Software Engineer',
          description: 'Develop software applications.',
          company: 'Tech Corp',
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error creating job offer.');
    });
  });

  describe('GET /api/jobs', () => {
    it('should fetch all job offers', async () => {
      Job.find.mockResolvedValue([mockJob]); 

      const res = await request(createServer(handler)).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('title', 'Software Engineer');
    });

    it('should return 500 if there is an error fetching jobs', async () => {
      Job.find.mockRejectedValue(new Error('Database error'));

      const res = await request(createServer(handler)).get('/api/jobs');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error fetching job offers.');
    });
  });

  describe('Invalid Methods', () => {
    it('should return 405 Method Not Allowed for PUT requests', async () => {
      const res = await request(createServer(handler)).put('/api/jobs');

      expect(res.status).toBe(405);
      expect(res.body).toHaveProperty('message', 'Method not allowed');
    });

    it('should return 405 Method Not Allowed for DELETE requests', async () => {
      const res = await request(createServer(handler)).delete('/api/jobs');

      expect(res.status).toBe(405);
      expect(res.body).toHaveProperty('message', 'Method not allowed');
    });
  });
});
