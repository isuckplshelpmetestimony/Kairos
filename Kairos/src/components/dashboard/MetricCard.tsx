import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  positive?: boolean;
  note?: string;
}

export const MetricCard = ({ title, value, change, subtitle, positive, note }: MetricCardProps) => {
  return (
    <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <p className="text-xs text-gray-500 mb-2">{title}</p>
      <h2 className="text-xl font-semibold text-gray-900 mb-1 break-words">{value}</h2>
      {change && (
        <p className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
      {note && (
        <p className="text-[10px] text-gray-500 mt-2">{note}</p>
      )}
    </Card>
  );
};


