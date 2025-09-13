// Categories routes: create and get-by-id with validation.
const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/categories.controller');

const router = express.Router();

router.post(
  '/category',
  body('name').isString().trim().notEmpty(),
  ctrl.createCategory
);

router.get(
  '/category/:id',
  param('id').isInt({ min: 1 }),
  ctrl.getCategoryById
);

module.exports = router;
