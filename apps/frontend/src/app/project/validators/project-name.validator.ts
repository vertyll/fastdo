export function validateProjectName(projectName: string): {
  isValid: boolean;
  error?: string;
} {
  if (!projectName || projectName.length < 3) {
    return {
      isValid: false,
      error: 'Project name must be at least 3 characters long',
    };
  }
  return { isValid: true };
}
