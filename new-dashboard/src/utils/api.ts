/// <reference types="vite/client" />
/**
 * API Client - Connects to existing betting dashboard (read-only)
 * Does not modify, write, or delete any data
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch today's betting picks (read-only)
 */
export const fetchPicks = async () => {
  try {
    const response = await apiClient.get('/api/ranked-bets');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching picks:', error);
    return [];
  }
};

/**
 * Fetch betting stats and record (read-only)
 */
export const fetchStats = async () => {
  try {
    const response = await apiClient.get('/api/stats');
    return response.data || {
      wins: 0,
      losses: 0,
      winRate: 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      wins: 0,
      losses: 0,
      winRate: 0,
    };
  }
};

/**
 * Health check - verify API is accessible
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/healthcheck');
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default apiClient;
