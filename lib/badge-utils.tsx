import { Priority, Energy, Context, ProjectStatus } from './types';
import { Flag, Target, Clock, CheckCircle, Pause } from 'lucide-react';

/**
 * Get priority badge color classes
 */
export const getPriorityColor = (priority: Priority | null | undefined): string => {
  switch (priority) {
    case Priority.P1:
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case Priority.P2:
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case Priority.P3:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case null:
    case undefined:
      return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
  }
};

/**
 * Get energy level badge color classes
 */
export const getEnergyColor = (energy: Energy | null | undefined): string => {
  switch (energy) {
    case Energy.HIGH:
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case Energy.MEDIUM:
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case Energy.LOW:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case null:
    case undefined:
      return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
  }
};

/**
 * Get context badge color classes
 */
export const getContextColor = (context: Context | null | undefined): string => {
  switch (context) {
    case Context.HOME:
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case Context.COMPUTER:
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case Context.CALLS:
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    case Context.ERRANDS:
      return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800";
    case null:
    case undefined:
      return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
  }
};

/**
 * Get project status badge color classes
 */
export const getProjectStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case ProjectStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case ProjectStatus.COMPLETED:
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case ProjectStatus.ON_HOLD:
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
  }
};

/**
 * Get priority badge JSX element
 */
export const getPriorityBadge = (priority: Priority | null | undefined) => {
  if (!priority) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700">
        <Flag className="h-3 w-3" />
        None
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority)}`}>
      <Flag className="h-3 w-3" />
      {priority}
    </span>
  );
};

/**
 * Get project status badge JSX element
 */
export const getStatusBadge = (status: ProjectStatus) => {
  const statusConfig = {
    ACTIVE: {
      label: 'Active',
      icon: Target,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      icon: Clock,
    },
    COMPLETED: {
      label: 'Completed',
      icon: CheckCircle,
    },
    ON_HOLD: {
      label: 'On Hold',
      icon: Pause,
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getProjectStatusColor(status)}`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  );
};

/**
 * Get energy level badge JSX element
 */
export const getEnergyBadge = (energy: Energy | null | undefined) => {
  if (!energy) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700">
        <span className="h-3 w-3" />
        None
      </span>
    );
  }

  const displayText = energy === 'HIGH' ? 'High' : 
                     energy === 'MEDIUM' ? 'Medium' :
                     energy === 'LOW' ? 'Low' : energy;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getEnergyColor(energy)}`}>
      <span className="h-3 w-3" />
      {displayText}
    </span>
  );
};

/**
 * Get context badge JSX element
 */
export const getContextBadge = (context: Context | null | undefined) => {
  if (!context) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700">
        <span className="h-3 w-3" />
        None
      </span>
    );
  }

  const displayText = context === 'HOME' ? '@home' : 
                     context === 'COMPUTER' ? '@computer' :
                     context === 'CALLS' ? '@calls' :
                     context === 'ERRANDS' ? '@errands' : context;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getContextColor(context)}`}>
      <span className="h-3 w-3" />
      {displayText}
    </span>
  );
};