import request from 'supertest';
import { createServer } from 'http';
import signup from '../pages/api/auth/signup';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn(),
}));

jest.mock('@/models/User', () => ({
  save: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

const server = createServer((req, res) => signup(req, res));

describe('POST /api/signup', () => {
  const mockUser = {
    _id: 'user123',
    name: 'John Doe',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'costumer',
  };

  it('should create a user and return success message', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');

    User.prototype.save.mockResolvedValue(mockUser);

    const res = await request(server)
      .post('/api/signup')
      .send({ name: 'John Doe', email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should return 400 when a required field is missing', async () => {
    const res = await request(server)
      .post('/api/signup')
      .send({ name: 'John Doe' });  

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'All fields are required');
  });

  it('should return 500 for internal server errors (e.g. error during user creation)', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.prototype.save.mockRejectedValue(new Error('Database error'));

    const res = await request(server)
      .post('/api/signup')
      .send({ name: 'John Doe', email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error creating user');
  });

  it('should return 405 for non-POST requests', async () => {
    const res = await request(server).get('/api/signup');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('message', 'Method Not Allowed');
  });
});
