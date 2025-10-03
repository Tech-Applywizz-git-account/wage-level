// src/app/api/admin/createUser/route.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role } = body as { email: string; role: "admin" | "lead" };
    const password = generatePassword();
    console.log(supabaseServiceKey);

    // Create Supabase user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    if (!authData?.user) {
      return Response.json({ error: "Failed to create user" }, { status: 400 });
    }

    // Insert into users table
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert([{ user_id: authData.user.id, email, role }]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 400 });
    }

    return Response.json({ message: "User created successfully!" });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
