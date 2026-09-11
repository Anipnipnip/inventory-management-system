import { body, param, query } from 'express-validator';

export const productIdValidator = [param('id').isMongoId().withMessage('Invalid product id')];

const ALLOWED_SORT_FIELDS = ['name', 'sku', 'costPrice', 'sellingPrice', 'createdAt'];

export const productQueryValidator = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term is too long'),
  query('category').optional().isMongoId().withMessage('Invalid category id'),
  query('supplier').optional().isMongoId().withMessage('Invalid supplier id'),
  query('sortBy')
    .optional()
    .isIn(ALLOWED_SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}`),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage("sortOrder must be 'asc' or 'desc'"),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

const priceRules = [
  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a number greater than or equal to 0'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a number greater than or equal to 0'),
];

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('SKU must be between 2 and 30 characters'),

  body('category').isMongoId().withMessage('A valid category id is required'),

  body('supplier').optional().isMongoId().withMessage('Invalid supplier id'),

  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required')
    .isLength({ max: 20 })
    .withMessage('Unit must be at most 20 characters'),

  ...priceRules,

  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a whole number greater than or equal to 0'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product id'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('SKU must be between 2 and 30 characters'),

  body('category').optional().isMongoId().withMessage('A valid category id is required'),

  body('supplier').optional().isMongoId().withMessage('Invalid supplier id'),

  body('unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Unit must be at most 20 characters'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a number greater than or equal to 0'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a number greater than or equal to 0'),

  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a whole number greater than or equal to 0'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
];
