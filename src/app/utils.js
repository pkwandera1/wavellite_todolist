// src/app/utils.js

// ─────────────────────────────
// Unique ID Generator
// ─────────────────────────────
export const generateUniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

// ─────────────────────────────
// Debounce Utility
// ─────────────────────────────
export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// ─────────────────────────────
// Date Utilities
// ─────────────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

export const parseDate = (str) => {
  const date = new Date(str);
  return isNaN(date) ? null : date;
};

// ─────────────────────────────
// localStorage Helpers
// ─────────────────────────────
const STORAGE_KEY = 'todo-projects';

export const saveProjectsToStorage = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
};

export const loadProjectsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};
