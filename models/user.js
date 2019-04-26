const mongoose = require('mongoose')
const Product = require('./product')
const Schema = mongoose.Schema
const userSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items:[{
            productId:{
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
            quantity: {
            type: Number,
            required: true
        }
    }]
    }
})
userSchema.methods = {
    addToCart(product){
        if(!this.cart){
            this.cart = {items: []}
         }
        const productIndex = this.cart.items.findIndex(index=>{
            return index.productId.toString() === product._id.toString()
        })             
        let newQuantity = 1
        const updatedcart = [...this.cart.items]
        if(productIndex >= 0){
           newQuantity = this.cart.items[productIndex].quantity + 1
           updatedcart[productIndex].quantity = newQuantity
           this.cart.items[productIndex].quantity
        }else{
        updatedcart.push({productId: 
           product._id,
            quantity: newQuantity})
            }
        const updateCart = {items: updatedcart}
        this.cart = updateCart
        return this.save()
    },
    getCart(){
        const productIds = this.cart.items.map(p=>{
                           return p.productId
                    })
                    return Product.find({_id: {$in: productIds}})
                    .then(products=>{
                        return products.map(p=>{
                            return{
                                ...p,
                                quantity: this.cart.items.find(elt=>{
                                    return elt.productId.toString() === p._id.toString()
                                }).quantity
                            }
                        })
                    }).catch(err=>console.log(err))     
    },
    deleteProductFronCart(id){
        const updatedCartItem = this.cart.items.filter(p=>{
                     return p.productId.toString() !== id.toString()
                 })
      this.cart.items = updatedCartItem
       return this.save()
    },
   clearCart() {
        this.cart = { items: [] };
        return this.save();
      }
}
const User = mongoose.model('User', userSchema)


module.exports = User