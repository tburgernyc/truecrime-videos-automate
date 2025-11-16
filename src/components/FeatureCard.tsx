interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-all hover:transform hover:scale-105">
      <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden">
        <img src={icon} alt={title} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
