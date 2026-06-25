const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError');
const {
  PantryItem,
  GroceryCatalog,
  PantryCategory,
  InventoryTransaction,
  sequelize,
} = require('../../database');
const { logActivity } = require('../../services/activityService');

const listPantry = async (householdId, { search, category_id, expiring_days = 7 }) => {
  const where = { household_id: householdId, deleted_at: null };
  const include = [{
    model: GroceryCatalog,
    as: 'grocery',
    include: [{ model: PantryCategory, as: 'category' }],
    where: {},
  }];

  if (search) {
    include[0].where.name = { [Op.iLike]: `%${search}%` };
  }
  if (category_id) {
    include[0].where.category_id = category_id;
  }

  const items = await PantryItem.findAll({ where, include, order: [['expiry_date', 'ASC NULLS LAST']] });

  const today = new Date();
  const expiringThreshold = new Date(today.getTime() + expiring_days * 86400000);

  return items.map((item) => {
    const json = item.toJSON();
    json.is_expiring_soon = item.expiry_date && new Date(item.expiry_date) <= expiringThreshold;
    json.is_low_stock = item.low_stock_threshold && parseFloat(item.quantity) <= parseFloat(item.low_stock_threshold);
    return json;
  });
};

const getInsights = async (householdId) => {
  const items = await PantryItem.findAll({ where: { household_id: householdId, deleted_at: null } });
  const total = items.length;
  const expiringSoon = items.filter((i) => {
    if (!i.expiry_date) return false;
    const days = (new Date(i.expiry_date) - new Date()) / 86400000;
    return days >= 0 && days <= 3;
  }).length;
  const lowStock = items.filter((i) => i.low_stock_threshold && parseFloat(i.quantity) <= parseFloat(i.low_stock_threshold)).length;

  return {
    total_items: total,
    expiring_soon: expiringSoon,
    low_stock: lowStock,
    pantry_utilization_percent: total > 0 ? Math.min(100, Math.round((total / 50) * 100)) : 0,
  };
};

const addItem = async (householdId, userId, data, req) => {
  const grocery = await GroceryCatalog.findByPk(data.grocery_catalog_id);
  if (!grocery || !grocery.is_active) throw ApiError.notFound('Grocery catalog item not found');

  return sequelize.transaction(async (t) => {
    const item = await PantryItem.create({
      household_id: householdId,
      added_by_user_id: userId,
      unit: data.unit || grocery.default_unit,
      ...data,
    }, { transaction: t });

    await InventoryTransaction.create({
      pantry_item_id: item.id,
      household_id: householdId,
      type: 'add',
      quantity_change: data.quantity,
      quantity_after: data.quantity,
      reason: 'Initial stock',
      created_by_user_id: userId,
    }, { transaction: t });

    await logActivity({ userId, householdId, action: 'pantry.add', entityType: 'pantry_item', entityId: item.id, req });
    return item;
  });
};

const updateItem = async (householdId, userId, itemId, data, req) => {
  const item = await PantryItem.findOne({ where: { id: itemId, household_id: householdId, deleted_at: null } });
  if (!item) throw ApiError.notFound('Pantry item not found');

  const oldQty = parseFloat(item.quantity);
  await item.update(data);

  if (data.quantity !== undefined && parseFloat(data.quantity) !== oldQty) {
    await InventoryTransaction.create({
      pantry_item_id: item.id,
      household_id: householdId,
      type: 'adjust',
      quantity_change: parseFloat(data.quantity) - oldQty,
      quantity_after: data.quantity,
      reason: 'Manual adjustment',
      created_by_user_id: userId,
    });
  }

  await logActivity({ userId, householdId, action: 'pantry.update', entityId: item.id, req });
  return item;
};

const deleteItem = async (householdId, userId, itemId, req) => {
  const item = await PantryItem.findOne({ where: { id: itemId, household_id: householdId, deleted_at: null } });
  if (!item) throw ApiError.notFound('Pantry item not found');
  await item.update({ deleted_at: new Date() });
  await logActivity({ userId, householdId, action: 'pantry.delete', entityId: item.id, req });
};

module.exports = { listPantry, getInsights, addItem, updateItem, deleteItem };
