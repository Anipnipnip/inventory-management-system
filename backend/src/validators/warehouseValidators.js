import { body, param } from 'express-validator';

export const warehouseIdValidator = [param('id').isMongoId().withMessage('Invalid warehouse id')];

export const createWarehouseValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Warehouse name must be between 2 and 100 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location must be at most 300 characters'),
];

export const updateWarehouseValidator = [
  param('id').isMongoId().withMessage('Invalid warehouse id'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Warehouse name must be between 2 and 100 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location must be at most 300 characters'),
];
