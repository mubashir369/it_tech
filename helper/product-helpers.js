
const async = require("hbs/lib/async");
const { ObjectId } = require("mongodb");
const collection = require("../config/collection");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
module.exports = {
  addProduct: (product, callback) => {
  
    product.price = parseInt(product.price);
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
       
        callback(data.insertedId);
      });
  },
  addProductImage: (id) => {
    return new Promise((resolve, reject) => {
      let images=[
        "front_"+id+".jpg",
        "side_"+id+".jpg",
        "back_"+id+".jpg"
      ]
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne({
          _id: objectId(id),
        },
        {
          $set:{images:images}
        }
        );
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  getLatestProducts: () => {
    return new Promise((resolve, reject) => {
      let products = db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .limit(3)
        .toArray();
      resolve(products);
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(proId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updateProduct: (proId, product) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              name: product.name,
              brand: product.brand,
              discription: product.discription,
              rem: product.ram,
              rom: product.rom,
              price: product.price,
              color: product.color,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  productBrand:(brand)=>{
    return new Promise((resolve,reject)=>{
      if(brand=='ALL'){
        db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((data)=>{
          resolve(data)
        })
      }else{
        db.get().collection(collection.PRODUCT_COLLECTION).find({brand:brand}).toArray().then((data)=>{
          resolve(data)
         
        })

      }
    
    })
  }
};
