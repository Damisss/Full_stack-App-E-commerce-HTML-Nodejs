const Product = require('../models/product');
const {validationResult} = require('express-validator/check')
const  errorHandler  = require('../util/errorHandler')
const fileDeleteHelper = require('../util/file')
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: null,
    hasError: false,
    validationError: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/products',
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      product:{
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image',
      validationError:  []
    });
  }
  let errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/products',
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      product:{
        title: title,
        price: price,
        image: image,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationError:  errors.array()
    });
  }
  const imageUrl = image.path
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      res.redirect('/admin/products');
    })
    .catch(errorHandler(next));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationError: []
      });
    })
    .catch(errorHandler(next));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  let errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/products',
      editing: true,
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      product:{
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: 'Attached file is not an image',
      validationError:  []
    });
  }

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image){
        fileDeleteHelper.deleteFile(product.imageUrl)
        product.imageUrl = image.path;
      }
      return product.save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })
    
    .catch(errorHandler(next));
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(errorHandler(next));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product=>{
    if(!product){
      next(new Error('Product not found'))
    }
    fileDeleteHelper.deleteFile(product.imageUrl)
    return Product.deleteOne({_id: prodId, userId: req.user._id})
  })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(errorHandler(next));
};
