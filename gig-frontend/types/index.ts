export interface User {
  id: string;
  name: string;
  email: string;
  skillScore: number;
  department?: string;
}

export interface Gig {
  id: number;
  title: string;
  description: string;
  skills: string[];
  skillPoints: number;
  status: 'Open' | 'In Progress' | 'Completed';
  postedBy?: string;
  acceptedBy?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ProofOfWork {
  id: string;
  gigId: number;
  gigTitle: string;
  skill: string;
  rating: number;
  skillScoreGained: number;
  verificationId: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  skillScore: number;
  department?: string;
}

export interface SkillBreakdown {
  skill: string;
  points: number;
  color?: string;
}
