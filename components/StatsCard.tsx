interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export default function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="p-4 rounded-lg shadow bg-white">
      <h3 className="text-lg font-semibold text-primary-dark mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}