var db = require("../config/connection");
var collection = require("../config/collection");
const async = require("hbs/lib/async");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { reject } = require("bcrypt/promises");
const { log } = require("handlebars");
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
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },
  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  ChangeOrderStatus: (status) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(status.orderId) },
          {
            $set: {
              status: status.value,
            },
          }
        )
        .then(async () => {
          let order = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .findOne({ _id: objectId(status.orderId) });
          console.log("data is..........");
          console.log(order);
          resolve(order);
        });
    });
  },
  changePaymentStatus: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(data.orderId) },
          {
            $set: {
              paymentStatus: data.value,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },
  getTotalSale: () => {
    return new Promise(async(resolve, reject) => {
      let totelSale =await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([{
          $group: {
              _id: '',
              totel: { $sum: '$totel' }
          }
       }, {
          $project: {
              _id: 0,
              totel: '$totel'
          }
      }])
      console.log("totelsale******************************");
      console.log(totelSale);
    });
  },
};
