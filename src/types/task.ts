export type FrequencyType = 1 | 2 | 3 | 7 | 14 | 30;

export interface TaskItem {
  text: string;
  frequency: FrequencyType;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  frequency: FrequencyType;
}
