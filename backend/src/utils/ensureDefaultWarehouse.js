import Warehouse from '../models/Warehouse.js';

// Runs once at server startup. If no warehouse exists yet, creates a
// "Main Warehouse" marked as default -- so a business with a single
// location never has to think about warehouses at all: stock in/out
// just works without specifying one (Phase 1, assumption A1).
export const ensureDefaultWarehouse = async () => {
  const existingDefault = await Warehouse.findOne({ isDefault: true });
  if (existingDefault) return;

  const anyWarehouse = await Warehouse.findOne();
  if (anyWarehouse) {
    // Warehouses exist but none is marked default (shouldn't normally
    // happen) -- promote the first one instead of creating a duplicate.
    anyWarehouse.isDefault = true;
    await anyWarehouse.save();
    return;
  }

  await Warehouse.create({ name: 'Main Warehouse', isDefault: true });
  console.log('Created default warehouse: Main Warehouse');
};
