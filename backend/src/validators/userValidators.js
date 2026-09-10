import { param, body } from 'express-validator';

export const userIdValidator = [param('id').isMongoId().withMessage('Invalid user id')];

export const changeRoleValidator = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('role').isIn(['admin', 'staff']).withMessage("Role must be 'admin' or 'staff'"),
];
