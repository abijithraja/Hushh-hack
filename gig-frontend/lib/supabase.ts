import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upload image to Supabase Storage
export const uploadImage = async (file: File): Promise<string> => {
  const fileName = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage
    .from("gigs-images")
    .upload(fileName, file);

  if (error) throw error;

  return `${supabaseUrl}/storage/v1/object/public/gigs-images/${fileName}`;
};

// Get current session JWT token
export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Failed to get auth token:', error.message);
    return null;
  }
  return session?.access_token || null;
};

// Types for database tables
export interface DBUser {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  year: string | null;
  skill_score: number;
  skills: string[] | null;
  about: string | null;
  mobile: string | null;
  dob: string | null;
  address: string | null;
  institution: string | null;
  degree: string | null;
  created_at: string;
}

export interface DBGig {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  status: string;
  created_at: string;
}

export interface DBApplication {
  id: string;
  gig_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
}

export interface DBCompletedGig {
  id: string;
  gig_id: string;
  completed_by: string;
  skill_points: number;
  created_at: string;
}
