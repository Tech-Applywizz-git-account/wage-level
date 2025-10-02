// pages/api/admin/createUser.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type CreateUserBody = {
  email: string;
  role: "admin" | "lead";
};

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, role }: CreateUserBody = req.body;
    console.log("issue here");
    const password = generatePassword(); // Generate a random password

    try {
      // Create user with Supabase Admin API
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      if (!authData?.user) {
        return res.status(400).json({ error: "Failed to create user" });
      }

      // Insert user data into the 'users' table
      const { error: dbError } = await supabaseAdmin
        .from("users")
        .insert([{ user_id: authData.user.id, email, role }]);

      if (dbError) {
        return res.status(400).json({ error: dbError.message });
      }

      return res.status(200).json({ message: "User created successfully!" });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

// Generate random password function
function generatePassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
