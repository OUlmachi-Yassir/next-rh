import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "POST") {
    const { title, description, company } = req.body;

    if (!title || !description || !company) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      const newJob = await Job.create({ title, description, company });
      res.status(201).json({ message: "Job offer created.", job: newJob });
    } catch (error) {
      res.status(500).json({ message: "Error creating job offer.", error });
    }
  } else if (req.method === "GET") {
    try {
      const jobs = await Job.find({});
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching job offers.", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
