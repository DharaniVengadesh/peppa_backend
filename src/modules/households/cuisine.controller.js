const asyncHandler = require('../../utils/asyncHandler');
const { CuisineType } = require('../../database');

const list = asyncHandler(async (_req, res) => {
  const data = await CuisineType.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
  res.json({ success: true, data });
});

module.exports = { list };
