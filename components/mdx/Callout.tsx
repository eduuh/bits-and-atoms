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
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  warning: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  danger: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
  success: 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300',
  gotcha: 'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300',
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
      'my-6 p-4 rounded-lg border flex gap-4 items-start',
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
