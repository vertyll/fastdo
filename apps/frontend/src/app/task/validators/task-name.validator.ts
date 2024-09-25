export function validateTaskName(taskName: string): {
  isValid: boolean;
  error?: string;
} {
  if (!taskName || taskName.length < 3) {
    return {
      isValid: false,
      error: 'Task name must be at least 3 characters long',
    };
  }
  return { isValid: true };
}
