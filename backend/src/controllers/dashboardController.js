import { getDashboardSummary } from '../services/dashboardService.js';

// GET /api/dashboard
export const getDashboard = async (req, res) => {
  const summary = await getDashboardSummary();

  res.status(200).json({
    success: true,
    message: 'Dashboard data retrieved',
    data: summary,
  });
};
