import { body } from 'express-validator';

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
