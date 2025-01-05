import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Application from '@/models/Application';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;
  console.log({jobId})

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Check if jobId is provided
    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ message: 'Invalid jobId' });
    }

    const applications = await Application.find({ jobId });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}
