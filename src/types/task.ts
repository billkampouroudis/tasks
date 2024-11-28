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

// Utility type guard to check if a number is a valid FrequencyType
export const isValidFrequency = (frequency: number): frequency is FrequencyType => {
  const validFrequencies: FrequencyType[] = [1, 2, 3, 7, 14, 30];
  return validFrequencies.includes(frequency as FrequencyType);
};
