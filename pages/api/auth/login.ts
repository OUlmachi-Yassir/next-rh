import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";


const SECRET_KEY = process.env.SECRET_KEY as string;

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      await connectToDatabase();
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const payload= {
        userId:user._id,
        role:user.role,
      }

      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ message: "Error logging in", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
