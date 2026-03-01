interface ProofCardProps {
  gigTitle: string;
  skill: string;
  rating: number;
  skillScoreGained: number;
  verificationId: string;
}

export default function ProofCard({
  gigTitle,
  skill,
  rating,
  skillScoreGained,
  verificationId,
}: ProofCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-xl p-6 text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">Proof of Work</h3>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < rating ? 'text-yellow-300' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-indigo-200 text-sm">Gig Completed</p>
          <p className="text-lg font-semibold">{gigTitle}</p>
        </div>
        
        <div>
          <p className="text-indigo-200 text-sm">Skill Demonstrated</p>
          <p className="text-lg font-semibold">{skill}</p>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-indigo-400">
          <div>
            <p className="text-indigo-200 text-sm">SkillScore Gained</p>
            <p className="text-3xl font-bold">+{skillScoreGained}</p>
          </div>
          
          <div className="text-right">
            <p className="text-indigo-200 text-xs">Verification ID</p>
            <p className="text-sm font-mono">{verificationId}</p>
          </div>
        </div>
      </div>
      
      <button className="mt-6 w-full bg-white text-indigo-600 py-2 rounded-md hover:bg-indigo-50 transition-colors font-medium">
        Share Achievement
      </button>
    </div>
  );
}
