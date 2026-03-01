interface GigCardProps {
  title: string;
  description: string;
  skills: string[];
  skillPoints: number;
  status: 'Open' | 'In Progress' | 'Completed';
  onHelp?: () => void;
}

export default function GigCard({
  title,
  description,
  skills,
  skillPoints,
  status,
  onHelp,
}: GigCardProps) {
  const statusColors = {
    Open: 'bg-green-100 text-green-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-black">{title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
        >
          {status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-[#E7F3FF] text-[#0A66C2] rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-[#0A66C2]">{skillPoints}</span>
          <span className="ml-2 text-gray-600">SkillPoints</span>
        </div>
        
        {status === 'Open' && onHelp && (
          <button
            onClick={onHelp}
            className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors"
          >
            I Can Help
          </button>
        )}
      </div>
    </div>
  );
}
