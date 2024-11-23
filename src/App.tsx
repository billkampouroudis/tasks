import { useState, useEffect } from 'react';
import { generateDailyTasks, generateNewTask } from './utils/taskUtils';
import TaskCard from './components/TaskCard';
import { Calendar, RefreshCw } from 'lucide-react';
import { Task } from './types/task';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(generateDailyTasks());
  }, []);

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('dailyTasks', JSON.stringify(updatedTasks));
  };

  const replaceTask = (id: string) => {
    const newTask = generateNewTask(tasks);
    if (newTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? newTask : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('dailyTasks', JSON.stringify(updatedTasks));
    }
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daily Tasks</h1>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('dailyTasks');
                localStorage.removeItem('tasksDate');
                setTasks(generateDailyTasks());
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Generate new tasks"
            >
              <RefreshCw className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Daily Progress
              </span>
              <span className="text-sm font-medium text-gray-600">
                {completedCount}/{tasks.length} tasks
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onReplace={replaceTask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
