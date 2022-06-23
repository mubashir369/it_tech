var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
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
  getLatestOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .sort({ date: -1 })
        .limit(4)
        .toArray();
      resolve(orders);
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

  getNumberOfUsers: () => {
    return new Promise(async (resolve, reject) => {
      let usrCount = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .countDocuments();

      resolve(usrCount);
    });
  },
  getTotelSale: () => {
    return new Promise(async (resolve, reject) => {
      let totel = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              totel: { $sum: "$totel" },
            },
          },
        ])
        .toArray();

      if (totel[0]) {
        resolve(totel[0].totel);
      } else {
        resolve({ totel: null });
      }
    });
  },
/*  getPendingAmt: () => {
    return new Promise(async (resolve, reject) => {
      let totel = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { status: "Pending" } },
          {
            $group: {
              _id: null,
              totel: { $sum: "$totel" },
            },
          },
        ])
        .toArray();

      resolve(totel[0].totel);
    });
  },*/
  getPenOrder: () => {
    return new Promise(async (resolve, reject) => {
      let penOrder = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ status: "Pending" })
        .count();

      resolve(penOrder);
    });
  },
};
