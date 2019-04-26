const express = require('express');
const isAuth = require('../middleware/is-auth')
const adminController = require('../controllers/admin');
const {check, body} = require('express-validator/check')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',isAuth, [
check('title', 'the title is required').isString().isLength({min: 3}).trim(),
body('price', 'The price must numeric').isFloat(),
check('description', 'Description is required').isLength({min: 3, max: 200}).trim()]
,  adminController.postAddProduct);
// // edit product
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
// //post updated product
router.post('/edit-product', isAuth,
[check('title').isString().isLength({min: 3}).trim(),
body('price', 'The price must numeric').isFloat(),
check('description', 'Description is required').isLength({min: 3, max: 200}).trim()]
, adminController.postEditProduct)
// //delete product
router.post('/delete-product', isAuth, adminController.postDeleteProduct)

module.exports = router;

