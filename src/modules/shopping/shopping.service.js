const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError');
const { ShoppingListItem, PantryItem, GroceryCatalog } = require('../../database');

const listItems = async (householdId) => {
  return ShoppingListItem.findAll({
    where: { household_id: householdId, deleted_at: null },
    include: [{ model: GroceryCatalog, as: 'grocery' }],
    order: [['is_checked', 'ASC'], ['created_at', 'DESC']],
  });
};

const generateList = async (householdId) => {
  const pantry = await PantryItem.findAll({
    where: { household_id: householdId, deleted_at: null },
    include: [{ model: GroceryCatalog, as: 'grocery' }],
  });

  const itemsToAdd = [];

  for (const p of pantry) {
    if (p.low_stock_threshold && parseFloat(p.quantity) <= parseFloat(p.low_stock_threshold)) {
      itemsToAdd.push({
        household_id: householdId,
        grocery_catalog_id: p.grocery_catalog_id,
        reason: 'low_stock',
        quantity: p.low_stock_threshold,
        unit: p.unit,
      });
    }
    if (p.expiry_date) {
      const days = (new Date(p.expiry_date) - new Date()) / 86400000;
      if (days >= 0 && days <= 2) {
        itemsToAdd.push({
          household_id: householdId,
          grocery_catalog_id: p.grocery_catalog_id,
          reason: 'expiring',
          quantity: p.quantity,
          unit: p.unit,
        });
      }
    }
  }

  for (const item of itemsToAdd) {
    const exists = await ShoppingListItem.findOne({
      where: {
        household_id: householdId,
        grocery_catalog_id: item.grocery_catalog_id,
        is_checked: false,
        deleted_at: null,
      },
    });
    if (!exists) await ShoppingListItem.create(item);
  }

  return listItems(householdId);
};

const toggleItem = async (householdId, itemId, isChecked) => {
  const item = await ShoppingListItem.findOne({
    where: { id: itemId, household_id: householdId, deleted_at: null },
  });
  if (!item) throw new Error('Item not found');
  await item.update({ is_checked: isChecked, checked_at: isChecked ? new Date() : null });
  return item;
};

const deleteItem = async (householdId, itemId) => {
  const item = await ShoppingListItem.findOne({
    where: { id: itemId, household_id: householdId, deleted_at: null },
  });
  if (!item) throw ApiError.notFound('Item not found');
  await item.update({ deleted_at: new Date() });
};

module.exports = { listItems, generateList, toggleItem, deleteItem };
