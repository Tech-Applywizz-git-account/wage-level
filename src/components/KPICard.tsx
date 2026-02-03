import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const KPICard = ({ title, value, icon: Icon, trend, onClick, clickable }: KPICardProps) => {

  const handleClick = () => {
    console.log(`KPICard clicked: ${title}`);
    if (onClick) {
      console.log('Executing onClick handler...');
      onClick();
    } else {
      console.log('No onClick handler provided');
    }
  };

  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-lg transition-smooth animate-slide-up border-primary/10 bg-gradient-to-br from-card to-card/50 group ${clickable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        }`}
      onClick={clickable ? handleClick : undefined}
      style={{ transition: 'all 0.2s ease' }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-accent font-semibold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl group-hover:scale-110 transition-smooth border border-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
};
