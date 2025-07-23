import { Home, Trophy, MessageSquare, BarChart, PlusCircle, LogOut, LucideProps } from 'lucide-react';

const icons = {
  Home,
  Trophy,
  MessageSquare,
  BarChart,
  PlusCircle,
  LogOut,
};

interface IconProps extends LucideProps {
  name: keyof typeof icons;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = icons[name];
  if (!LucideIcon) {
    return null; // or a fallback icon
  }
  return <LucideIcon {...props} />;
};
