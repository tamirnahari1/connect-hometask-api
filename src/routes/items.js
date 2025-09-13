// Items routes with validation.
const express = require('express');
const { body, query, param } = require('express-validator');
const ctrl = require('../controllers/items.controller');

const router = express.Router();

router.post(
  '/items',
  body('name').isString().trim().notEmpty(),
  body('categoryId').isInt({ min: 1 }),
  body('volumes').isArray({ min: 1 }),
  body('volumes.*.value').isString().trim().notEmpty(),
  body('volumes.*.price').isFloat({ gt: 0 }),
  ctrl.createOrUpdateItem
);

router.get('/items', ctrl.listItems);
router.get('/item/search', query('q').isString().trim().notEmpty(), ctrl.searchItemsAndCategories);
router.get('/item/:id', param('id').isInt({ min: 1 }), ctrl.getItemById);

module.exports = router;
