import request from 'supertest';
import { createServer } from 'http';
import login from '../pages/api/auth/login'; 
import { connectToDatabase } from '@/lib/mongodb'; 
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn(),
}));

jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const server = createServer((req, res) => login(req, res));

describe('POST /api/login', () => {
  const SECRET_KEY = 'your-secret-key'; 

  it('should return token for valid credentials', async () => {

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword', 
      role: 'admin',
    };

    bcrypt.compare.mockResolvedValue(true);

    User.findOne.mockResolvedValue(mockUser);

    jwt.sign.mockReturnValue('fake-jwt-token');

    const res = await request(server)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'correctPassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 401 for invalid credentials (incorrect email)', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(server)
      .post('/api/login')
      .send({ email: 'invalid@example.com', password: 'password' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 401 for invalid credentials (incorrect password)', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'admin',
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false); 

    const res = await request(server)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'wrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 405 for non-POST requests', async () => {
    const res = await request(server).get('/api/login');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('message', 'Method Not Allowed');
  });

  it('should handle internal server errors', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const res = await request(server)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error logging in');
  });
});
