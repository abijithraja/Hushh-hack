interface LeaderboardItemProps {
  rank: number;
  name: string;
  skillScore: number;
  department?: string;
}

export default function LeaderboardItem({
  rank,
  name,
  skillScore,
  department,
}: LeaderboardItemProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-slate-50 border-slate-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-slate-200';
  };

  const getBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-[#FFD700] text-[#111]';
    if (rank === 2) return 'bg-[#C0C0C0] text-[#111]';
    if (rank === 3) return 'bg-[#CD7F32] text-white';
    return 'bg-slate-200 text-slate-600';
  };

  return (
    <div className={`flex items-center p-4 rounded-xl border mb-3 ${getRankColor(rank)}`}>
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${getBadgeColor(rank)}`}>
        {rank}
      </div>
      
      <div className="ml-4 flex-1">
        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
        {department && (
          <p className="text-sm text-slate-500">{department}</p>
        )}
      </div>
      
      <div className="text-right">
        <p className="text-2xl font-bold text-blue-600">{skillScore}</p>
        <p className="text-xs text-slate-500">SkillScore</p>
      </div>
    </div>
  );
}
