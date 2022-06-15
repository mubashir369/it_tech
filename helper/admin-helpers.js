var db = require("../config/connection");
var collection = require("../config/collection");
const async = require("hbs/lib/async");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { reject } = require("bcrypt/promises");
var objectId = require("mongodb").ObjectID;
module.exports = {
  adminSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      adminData.password = await bcrypt.hash(adminData.password, 10);
      db.get()
        .collection(collection.ADMIN)
        .insertOne(adminData)
        .then((data) => {
          resolve(data);
        });
    });
  },
  adminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let adminLoginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN)
        .findOne({ name: adminData.name });
      console.log("admin data " + admin);
      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            console.log("admin log i success");
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            console.log("log in failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("admin username failed");
        resolve({ status: false });
      }
    });
  },
  getAllOrders:()=>{
    return new Promise(async(resolve, reject) => {
      let orders=await db.get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .toArray()
        .then((data)=>{
          resolve(data)
        })
        
      
    });
  },
  getOrderDetails:(orderId)=>{
    return new Promise((resolve,reject)=>{
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({_id:objectId(orderId)})
        .then((data)=>{
          resolve(data)
        })

    })

  },
};
