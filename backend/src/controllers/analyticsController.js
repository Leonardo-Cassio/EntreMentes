const analyticsService = require('../services/analyticsService');

exports.getProfile = async (req, res) => {
  try {
    const data = await analyticsService.getProfile(req.userId);
    res.json({ success: true, data, message: null });
  } catch (err) {
    const status = err.message.includes('ainda não gerado') ? 404 : 400;
    res.status(status).json({ success: false, data: null, message: err.message });
  }
};
