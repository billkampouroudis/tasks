import { CheckCircle2, Circle, RotateCw } from 'lucide-react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onReplace: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onReplace }: TaskCardProps) {
  const categoryColors = {
    clean: 'bg-blue-50 border-blue-200',
    personal: 'bg-green-50 border-green-200',
    household: 'bg-purple-50 border-purple-200',
    maintenance: 'bg-orange-50 border-orange-200',
  };

  const getFrequencyLabel = (frequency: number) => {
    if (frequency === 1) return 'Daily';
    if (frequency === 2) return 'Every 2 days';
    if (frequency === 3) return 'Every 3 days';
    if (frequency === 7) return 'Weekly';
    if (frequency === 14) return 'Bi-weekly';
    return 'Monthly';
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 shadow-sm transition-all duration-300 ${
        categoryColors[task.category as keyof typeof categoryColors]
      } ${task.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className="focus:outline-none"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400" />
          )}
        </button>
        <div className="flex-1">
          <span
            className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}
          >
            {task.text}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm text-gray-500">
              {getFrequencyLabel(task.frequency)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onReplace(task.id)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Replace task"
        >
          <RotateCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
