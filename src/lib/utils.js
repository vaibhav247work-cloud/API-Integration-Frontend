import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const extractError = (error) => {
  return error?.response?.data?.message || error?.message || 'An unknown error occurred';
};
