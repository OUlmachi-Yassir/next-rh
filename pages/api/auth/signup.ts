import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      await connectToDatabase();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Set the role explicitly as 'costumer' while creating the user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'costumer',  // Explicitly assigning the role here
      });

      await user.save();

      return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error during user creation:", error);
      return res.status(500).json({ message: "Error creating user", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
