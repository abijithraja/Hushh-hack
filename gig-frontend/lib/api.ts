import { getAuthToken } from "./supabase";

// Always use the Next.js proxy path — the rewrite in next.config.ts forwards
// /api/backend/* → Express backend. This means every device (desktop AND mobile)
// only ever needs to reach port 3000 (the forwarded port), never port 5000 directly.
const API_URL = "/api/backend";

// Helper to make authenticated requests to backend
async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    // Backend is not reachable – return empty data instead of crashing
    console.warn(`Backend unreachable (${API_URL}${endpoint}). Is the server running?`);
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    const msg = error.message || error.error || "Request failed";
    // Log as warning (not error) so it doesn't trigger Next.js dev error overlay
    console.warn(`API warning [${response.status}] ${endpoint}: ${msg}`);
    return null;
  }

  return response.json();
}

// Gig API
export const gigApi = {
  // Create a new gig
  create: async (data: { title: string; description: string; image_url?: string; required_skills?: string[] }) => {
    return authFetch("/gigs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get all gigs
  getAll: async () => {
    return authFetch("/gigs");
  },

  // Get user's gigs
  getMyGigs: async () => {
    return authFetch("/gigs/my");
  },

  // Get a single gig
  getById: async (id: string) => {
    return authFetch(`/gigs/${id}`);
  },

  // Apply to a gig
  apply: async (gigId: string) => {
    return authFetch(`/apply/${gigId}`, {
      method: "POST",
    });
  },

  // Get applications for a gig
  getApplications: async (gigId: string) => {
    return authFetch(`/gigs/${gigId}/applications`);
  },

  // Accept an application
  acceptApplication: async (applicationId: string) => {
    return authFetch(`/applications/${applicationId}/accept`, {
      method: "POST",
    });
  },

  // Complete a gig
  complete: async (gigId: string, userId: string) => {
    return authFetch(`/complete/${gigId}/${userId}`, {
      method: "POST",
    });
  },
};

// User API
export const userApi = {
  // Register new user
  register: async (data: { full_name: string; department: string; year: string }) => {
    return authFetch("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get current user profile
  getProfile: async () => {
    return authFetch("/users/me");
  },

  // Update user profile
  updateProfile: async (data: { full_name?: string; department?: string; year?: string }) => {
    return authFetch("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Check if user exists
  checkExists: async () => {
    return authFetch("/users/check");
  },
};

// Leaderboard API
export const leaderboardApi = {
  // Get top users
  getTop: async (limit: number = 10) => {
    return authFetch(`/leaderboard?limit=${limit}`);
  },
};
