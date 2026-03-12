import apiService from './apiService.js';

export const analyticsService = {
  getOverview(days = 30) {
    return apiService.get(`/analytics/overview?days=${days}`);
  },
  getDailyTrend(days = 30) {
    return apiService.get(`/analytics/trend/daily?days=${days}`);
  },
  getTopAgents(limit = 10, days = 30) {
    return apiService.get(`/analytics/agents/top?limit=${limit}&days=${days}`);
  },
  getHotWords(limit = 30, days = 30) {
    return apiService.get(`/analytics/words/hot?limit=${limit}&days=${days}`);
  },
  getActivityByHour(days = 30) {
    return apiService.get(`/analytics/activity/hourly?days=${days}`);
  },
  getAvgLength(days = 30) {
    return apiService.get(`/analytics/conversations/avg-length?days=${days}`);
  },
  getUserGrowth(days = 30) {
    return apiService.get(`/analytics/users/growth?days=${days}`);
  },
  getAgentAnalytics(agentId, days = 30) {
    return apiService.get(`/analytics/agent/${agentId}?days=${days}`);
  },
};
