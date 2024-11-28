import { possibleTasks } from '../data/tasks';
import { Task, FrequencyType, isValidFrequency } from '../types/task';

interface TaskHistory {
  taskKey: string;
  lastUsed: string;
  frequency: FrequencyType;
}

// Local storage keys for persisting task data
const HISTORY_KEY = 'taskHistory';
const TASKS_KEY = 'dailyTasks';
const DATE_KEY = 'tasksDate';

/**
 * Retrieves the task usage history from local storage.
 * This history tracks when each task was last used to prevent frequent repetition.
 * @returns {TaskHistory[]} Array of task history entries
 */
const getTaskHistory = (): TaskHistory[] => {
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

/**
 * Updates the task history when a task is used.
 * Records the current date as the last usage date for the given task.
 * @param {string} taskKey - Unique identifier for the task
 * @param {FrequencyType} frequency - How often the task should appear
 */
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

/**
 * Determines if a task can be used based on its frequency and last usage date.
 * Prevents tasks from appearing more often than their designated frequency.
 * @param {string} taskKey - Unique identifier for the task
 * @param {FrequencyType} frequency - How often the task should appear
 * @returns {boolean} True if enough time has passed since last usage
 */
const canUseTask = (taskKey: string, frequency: FrequencyType): boolean => {
  const history = getTaskHistory();
  const historyEntry = history.find((h) => h.taskKey === taskKey);

  if (!historyEntry) return true;

  const lastUsed = new Date(historyEntry.lastUsed);
  const today = new Date();
  const daysSinceLastUse = Math.floor((today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceLastUse >= frequency;
};

/**
 * Validates and converts a number to FrequencyType.
 * @param {number} frequency - The frequency value to validate
 * @returns {FrequencyType | null} Valid frequency or null if invalid
 */
const validateFrequency = (frequency: number): FrequencyType | null => {
  return isValidFrequency(frequency) ? frequency : null;
};

/**
 * Selects a random task from a category that meets the frequency criteria.
 * Uses weighted random selection favoring more frequent tasks.
 * @param {typeof possibleTasks[0]} category - Category to select task from
 * @param {Set<string>} usedIndices - Set of already used task indices
 * @param {FrequencyType} [preferredFrequency] - Optional preferred frequency for task selection
 * @returns {Task | null} Selected task or null if no suitable task found
 */
const selectTask = (
  category: (typeof possibleTasks)[0],
  usedIndices: Set<string>,
  preferredFrequency?: FrequencyType
): Task | null => {
  // Sort tasks by frequency (prioritize more frequent tasks)
  const availableTasks = category.tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task, index }) => {
      const validatedFrequency = validateFrequency(task.frequency);
      if (!validatedFrequency) {
        console.warn(`Invalid frequency ${task.frequency} found for task: ${task.text}`);
        return false;
      }
      return (
        !usedIndices.has(`${category.id}-${index}`) &&
        canUseTask(`${category.id}-${index}`, validatedFrequency) &&
        (!preferredFrequency || validatedFrequency === preferredFrequency)
      );
    })
    .sort((a, b) => a.task.frequency - b.task.frequency);

  if (availableTasks.length > 0) {
    // Weighted random selection favoring more frequent tasks
    const totalWeight = availableTasks.reduce((sum, { task }) => {
      const validatedFrequency = validateFrequency(task.frequency);
      return sum + (validatedFrequency ? 1 / validatedFrequency : 0);
    }, 0);

    let random = Math.random() * totalWeight;

    for (const { task, index } of availableTasks) {
      const validatedFrequency = validateFrequency(task.frequency);
      if (!validatedFrequency) continue;

      random -= 1 / validatedFrequency;
      if (random <= 0) {
        const taskKey = `${category.id}-${index}`;
        updateTaskHistory(taskKey, validatedFrequency);
        usedIndices.add(taskKey);

        return {
          id: `task-${taskKey}`,
          text: task.text,
          completed: false,
          category: category.id,
          frequency: validatedFrequency,
        };
      }
    }
  }

  return null;
};

/**
 * Generates a new task to replace an existing one.
 * Ensures the new task follows frequency rules and isn't already in use.
 * @param {Task[]} existingTasks - Current list of tasks
 * @returns {Task | null} New task or null if no suitable task found
 */
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

/**
 * Generates the daily set of tasks.
 * Creates a balanced mix of tasks with different frequencies,
 * ensuring at least 3 frequent tasks (daily/every 2 days) are included.
 * @returns {Task[]} Array of 5 tasks for the day
 */
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
