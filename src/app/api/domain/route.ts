import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// 🧠 Helper: check if role is tech
function isTechRole(roleName: string): boolean {
  if (!roleName) return false;

  const lower = roleName.toLowerCase();
  const techKeywords = [
    "developer",
    "software",
    "engineer",
    "devops",
    "data",
    "cyber",
    "security",
    "network",
    "cloud",
    "qa",
    "python",
    "java",
    "scientist",
    "servicenow",
    "sap",
    "embedded",
    "full stack",
    "game",
    "ai",
    "machine learning",
    "active directory",
    ".net",
    "computer science",
    "database",
    "sailpoint",
  ];

  return techKeywords.some((keyword) => lower.includes(keyword));
}

export async function GET() {
  try {
    // 1️⃣ Fetch all unique job roles
    const { data, error } = await supabase
      .from("unique_job_role_names")
      .select("job_role_name");

    if (error) throw error;

    // 2️⃣ Map each role with isTech
    const result = (data || []).map((item) => ({
      role: item.job_role_name.trim(),
      isTech: isTechRole(item.job_role_name),
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/domain:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
