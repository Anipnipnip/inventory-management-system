import { body, param } from 'express-validator';

export const supplierIdValidator = [param('id').isMongoId().withMessage('Invalid supplier id')];

const optionalContactRules = [
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person must be at most 100 characters'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('email').optional().trim().isEmail().withMessage('Please provide a valid email'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Address must be at most 300 characters'),
];

export const createSupplierValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Supplier name must be between 2 and 100 characters'),

  ...optionalContactRules,
];

export const updateSupplierValidator = [
  param('id').isMongoId().withMessage('Invalid supplier id'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Supplier name must be between 2 and 100 characters'),

  ...optionalContactRules,
];
