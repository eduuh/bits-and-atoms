import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle,
  gotcha: Lightbulb, // Using Lightbulb for "Gotcha" / "Did you know"
};

const styles = {
  info: 'border-l-blue-500 from-blue-500/10 to-transparent text-blue-700 dark:text-blue-300',
  warning: 'border-l-yellow-500 from-yellow-500/10 to-transparent text-yellow-700 dark:text-yellow-300',
  danger: 'border-l-red-500 from-red-500/10 to-transparent text-red-700 dark:text-red-300',
  success: 'border-l-green-500 from-green-500/10 to-transparent text-green-700 dark:text-green-300',
  gotcha: 'border-l-purple-500 from-purple-500/10 to-transparent text-purple-700 dark:text-purple-300',
};

interface CalloutProps {
  type?: keyof typeof icons;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type];
  
  return (
    <div className={clsx(
      'my-6 p-4 rounded-r-lg border-l-4 bg-gradient-to-r flex gap-4 items-start',
      styles[type]
    )}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <strong className="block mb-1 font-semibold">{title}</strong>}
        <div className="[&>p]:m-0 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
