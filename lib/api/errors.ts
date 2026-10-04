import { isAxiosError } from 'axios';

export function commerceErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message;
    if (message) return message;
    if (!error.response) return 'Unable to reach Shoozy. Check your connection and try again.';
  }
  return fallback;
}
