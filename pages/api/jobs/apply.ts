import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import formidable, { File, Fields } from "formidable";
import path from "path";
import fs from "fs/promises";
import Application from "@/models/Application";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await connectToDatabase();

    const uploadDir = path.join(process.cwd(), "/public/uploads");

    // Vérification et création du répertoire si nécessaire
    if (!(await fs.stat(uploadDir).catch(() => false))) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
    });

    try {
      const parsedForm = await new Promise<[Fields, formidable.Files]>((resolve, reject) =>
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        })
      );

      const [fields, files] = parsedForm;

      const fullName = Array.isArray(fields.fullName) ? fields.fullName[0] : fields.fullName;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      let jobId: string | undefined | mongoose.Types.ObjectId = fields.jobId && Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId;

      const cvFile = Array.isArray(files.cv) ? files.cv[0] : (files.cv as File | undefined);

      if (!fullName || !email || !jobId || !cvFile) {
        res.status(400).json({ message: "All fields are required." });
        return;
      }

      // Conversion en ObjectId
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: "Invalid jobId format." });
        return;
      }

      jobId = new mongoose.Types.ObjectId(jobId);

      const newApplication = await Application.create({
        fullName,
        email,
        jobId,
        cvPath: `/uploads/${path.basename(cvFile.filepath)}`,
      });

      res.status(201).json({ message: "Application submitted.", application: newApplication });
    } catch (error) {
      console.error("Error processing application:", error);
      res.status(500).json({
        message: "Error processing the application.",
        error: (error as Error).message || "Unknown error",
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
