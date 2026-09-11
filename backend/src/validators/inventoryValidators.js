import { body, query } from 'express-validator';

// Shared by stock-in and stock-out. Quantity must be a positive whole
// number -- Phase 1 business rule: "Quantity on stock operations must
// be a positive integer".
export const stockOperationValidator = [
  body('productId').isMongoId().withMessage('A valid product id is required'),

  body('warehouseId').optional().isMongoId().withMessage('Invalid warehouse id'),

  body('quantity')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a whole number greater than 0'),

  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be at most 500 characters'),
];

export const transferValidator = [
  body('productId').isMongoId().withMessage('A valid product id is required'),

  body('fromWarehouseId').isMongoId().withMessage('A valid source warehouse id is required'),

  body('toWarehouseId')
    .isMongoId()
    .withMessage('A valid destination warehouse id is required')
    .custom((value, { req }) => value !== req.body.fromWarehouseId)
    .withMessage('Source and destination warehouse must be different'),

  body('quantity')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a whole number greater than 0'),

  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be at most 500 characters'),
];

export const historyQueryValidator = [
  query('product').optional().isMongoId().withMessage('Invalid product id'),
  query('warehouse').optional().isMongoId().withMessage('Invalid warehouse id'),
  query('type')
    .optional()
    .isIn(['in', 'out', 'transfer-in', 'transfer-out'])
    .withMessage('Invalid transaction type'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];
