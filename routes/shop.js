const express = require('express');
const isAuth = require('../middleware/is-auth')

const shopController = require('../controllers/shop');

const router = express.Router();
// //get all product
router.get('/', shopController.getIndex);
// //get all product
router.get('/products', shopController.getProducts);
// //get all details
router.get('/products/:productId', shopController.getProduct);
// // //get all card
 router.get('/cart', isAuth, shopController.getCart);
// // //put product to card
router.post('/cart', isAuth, shopController.postCart);
// // //get all order
// router.get('/orders', shopController.getorders);
// // //delete product on cart
router.post('/cart-delete-item',isAuth, shopController.postDeleteCartProduct)
// // //post order
router.post('/create-order', isAuth, shopController.postOrder);
router.get('/orders', isAuth, shopController.getOrders)
//invoice
router.get('/orders/:orderId',isAuth, shopController.getInvoice)
module.exports = router;
