import { Home, Trophy, MessageSquare, Users, LogOut, LucideProps, PlusCircle, BarChart } from 'lucide-react';

const icons = {
  Home,
  Trophy,
  MessageSquare,
  Users,
  LogOut,
  PlusCircle,
  BarChart,
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
