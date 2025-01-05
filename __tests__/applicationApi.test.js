import request from 'supertest';
import { createServer } from 'http';
import handler from '../pages/api/jobs/apply';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/models/Application';
import formidable from 'formidable';

jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn(),
}));

jest.mock('@/models/Application', () => ({
  create: jest.fn(),
}));

jest.mock('formidable', () => jest.fn().mockImplementation(() => ({
  parse: jest.fn((req, callback) => callback(null, {}, {}))
})));

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  mkdir: jest.fn(),
}));

const server = createServer((req, res) => handler(req, res));

describe('POST /api/application', () => {
  const mockApplication = {
    _id: 'app123',
    fullName: 'John Doe',
    email: 'john@example.com',
    jobId: new mongoose.Types.ObjectId(),
    cvPath: '/uploads/mockCV.pdf',
  };

  it('should successfully submit an application with valid fields and file', async () => {
    fs.stat.mockResolvedValue(false);  
    fs.mkdir.mockResolvedValue(undefined);  
    formidable.mockImplementationOnce((options) => ({
      parse: jest.fn((req, callback) => callback(null, { fullName: ['John Doe'], email: ['john@example.com'], jobId: ['job123'] }, { cv: { filepath: '/path/to/mockCV.pdf' } }))
    }));
    
    Application.create.mockResolvedValue(mockApplication);  

    const res = await request(server)
      .post('/api/application')
      .field('fullName', 'John Doe')
      .field('email', 'john@example.com')
      .field('jobId', 'job123')
      .attach('cv', path.resolve(__dirname, 'mockCV.pdf'));  

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Application submitted.');
    expect(res.body.application).toHaveProperty('cvPath', '/uploads/mockCV.pdf');
  });

  it('should return 400 when a required field is missing', async () => {
    const res = await request(server)
      .post('/api/application')
      .send({ fullName: 'John Doe' });  

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'All fields are required.');
  });

  it('should return 400 for invalid jobId format', async () => {
    const res = await request(server)
      .post('/api/application')
      .send({ fullName: 'John Doe', email: 'john@example.com', jobId: 'invalidJobId' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid jobId format.');
  });

  it('should return 500 for errors during file handling or DB creation', async () => {
    Application.create.mockRejectedValue(new Error('Database error'));

    const res = await request(server)
      .post('/api/application')
      .field('fullName', 'John Doe')
      .field('email', 'john@example.com')
      .field('jobId', 'job123')
      .attach('cv', path.resolve(__dirname, 'mockCV.pdf'));

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error processing the application.');
  });

  it('should return 405 for non-POST requests', async () => {
    const res = await request(server).get('/api/application');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('message', 'Method not allowed.');
  });
});
