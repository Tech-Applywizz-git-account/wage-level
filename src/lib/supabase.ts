import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our job_jobrole_sponsored table
export interface JobData {
  id: number;
  company: string;
  job_role_name: string;
  title: string;
  location: string;
  date_posted: string | null;
  sponsored_job: string;
  job_description: string;
  requirements: string;
  salary_range: string;
  experience_level: string;
  job_type: string;
  remote_work: string;
  benefits: string;
  application_deadline: string | null;
  contact_email: string;
  website: string;
  url: string;
  created_at: string;
}

export interface DatabaseStats {
  totalJobs: number;
  sponsoredJobs: number;
  nonSponsoredJobs: number;
  doesNotMention: number;
  uniqueCompanies: number;
  uniqueRoles: number;
  uniqueLocations: number;
  topCompanies: Array<{ company: string; count: number }>;
  topRoles: Array<{ job_role_name: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
}

// Authentication types
export interface UserRole {
  id: string;
  email: string;
  role: "admin" | "lead" | "user";
}

export interface AuthUser extends User {
  role?: "admin" | "lead" | "user";
}

// Role checking functions
export async function getUserRole(
  userId: string,
): Promise<"admin" | "lead" | "user"> {
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId) // Use ID instead of email
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return "user";
    }

    return userData?.role || "user";
  } catch (error) {
    console.error("Error checking user role:", error);
    return "user";
  }
}

export async function checkUserPermissions(
  user: User | null,
): Promise<AuthUser | null> {
  if (!user) return null;

  try {
    const role = await getUserRole(user.id); // Use user.id instead of user.email
    return {
      ...user,
      role,
    };
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return {
      ...user,
      role: "user",
    };
  }
}
