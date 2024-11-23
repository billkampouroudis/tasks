import { possibleTasks } from '../data/tasks';
import { Task, FrequencyType } from '../types/task';

interface TaskHistory {
  taskKey: string;
  lastUsed: string;
  frequency: FrequencyType;
}

const HISTORY_KEY = 'taskHistory';
const TASKS_KEY = 'dailyTasks';
const DATE_KEY = 'tasksDate';

const getTaskHistory = (): TaskHistory[] => {
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

const updateTaskHistory = (taskKey: string, frequency: FrequencyType) => {
  const history = getTaskHistory();
  const today = new Date().toISOString();

  const existingIndex = history.findIndex((h) => h.taskKey === taskKey);
  if (existingIndex >= 0) {
    history[existingIndex].lastUsed = today;
  } else {
    history.push({ taskKey, lastUsed: today, frequency });
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

const canUseTask = (taskKey: string, frequency: FrequencyType): boolean => {
  const history = getTaskHistory();
  const historyEntry = history.find((h) => h.taskKey === taskKey);

  if (!historyEntry) return true;

  const lastUsed = new Date(historyEntry.lastUsed);
  const today = new Date();
  const daysSinceLastUse = Math.floor(
    (today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastUse >= frequency;
};

const selectTask = (
  category: (typeof possibleTasks)[0],
  usedIndices: Set<string>,
  preferredFrequency?: FrequencyType
): Task | null => {
  // Sort tasks by frequency (prioritize more frequent tasks)
  const availableTasks = category.tasks
    .map((task, index) => ({ task, index }))
    .filter(
      ({ task, index }) =>
        !usedIndices.has(`${category.id}-${index}`) &&
        canUseTask(`${category.id}-${index}`, task.frequency) &&
        (!preferredFrequency || task.frequency === preferredFrequency)
    )
    .sort((a, b) => a.task.frequency - b.task.frequency);

  if (availableTasks.length > 0) {
    // Weighted random selection favoring more frequent tasks
    const totalWeight = availableTasks.reduce(
      (sum, { task }) => sum + 1 / task.frequency,
      0
    );
    let random = Math.random() * totalWeight;

    for (const { task, index } of availableTasks) {
      random -= 1 / task.frequency;
      if (random <= 0) {
        const taskKey = `${category.id}-${index}`;
        updateTaskHistory(taskKey, task.frequency);
        usedIndices.add(taskKey);

        return {
          id: `task-${taskKey}`,
          text: task.text,
          completed: false,
          category: category.id,
          frequency: task.frequency,
        };
      }
    }
  }

  return null;
};

export const generateNewTask = (existingTasks: Task[]): Task | null => {
  const usedIndices = new Set<string>();
  existingTasks.forEach((task) => {
    const [category, index] = task.id.replace('task-', '').split('-');
    usedIndices.add(`${category}-${index}`);
  });

  // Try to maintain task frequency distribution
  const categories = [...possibleTasks].sort(() => Math.random() - 0.5);
  for (const category of categories) {
    const task = selectTask(category, usedIndices);
    if (task) return task;
  }

  return null;
};

export const generateDailyTasks = (): Task[] => {
  const today = new Date().toDateString();
  const storedTasks = localStorage.getItem(TASKS_KEY);
  const storedDate = localStorage.getItem(DATE_KEY);

  if (storedTasks && storedDate === today) {
    return JSON.parse(storedTasks);
  }

  const tasks: Task[] = [];
  const usedIndices = new Set<string>();

  // Ensure we get some daily tasks first
  const dailyCategories = [...possibleTasks].sort(() => Math.random() - 0.5);
  for (const category of dailyCategories) {
    const task = selectTask(category, usedIndices);
    if (task && task.frequency <= 2) {
      // Only add if it's a frequent task
      tasks.push(task);
      if (tasks.length >= 3) break; // Ensure at least 3 frequent tasks
    }
  }

  // Fill remaining slots with any frequency
  while (tasks.length < 5) {
    const categoryIndex = Math.floor(Math.random() * possibleTasks.length);
    const task = selectTask(possibleTasks[categoryIndex], usedIndices);
    if (task) {
      tasks.push(task);
    }
  }

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(DATE_KEY, today);

  return tasks;
};
