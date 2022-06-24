var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
module.exports = {
  adminSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      try {
        adminData.password = await bcrypt.hash(adminData.password, 10);
        db.get()
          .collection(collection.ADMIN)
          .insertOne(adminData)
          .then((data) => {
            resolve(data);
          });
      } catch {
        reject();
      }
    });
  },
  adminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch {
        reject();
      }
    });
  },
  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .find({})
          .toArray()
          .then((data) => {
            resolve(data);
          });
      } catch {
        reject();
      }
    });
  },
  getLatestOrders: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({})
          .sort({ date: -1 })
          .limit(4)
          .toArray();
        resolve(orders);
      } catch {
        reject();
      }
    });
  },
  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: objectId(orderId) })
          .then((data) => {
            resolve(data);
          });
      } catch {
        reject();
      }
    });
  },
  ChangeOrderStatus: (status) => {
    return new Promise((resolve, reject) => {
      try {
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

            resolve(order);
          });
      } catch {
        reject();
      }
    });
  },
  changePaymentStatus: (data) => {
    return new Promise((resolve, reject) => {
      try {
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
      } catch {
        reject();
      }
    });
  },

  getNumberOfUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let usrCount = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .countDocuments();

        resolve(usrCount);
      } catch {
        reject();
      }
    });
  },
  getTotelSale: () => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch {
        reject();
      }
    });
  },
  getPendingAmt: () => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch {
        reject();
      }
    });
  },
  getPenOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let penOrder = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ status: "Pending" })
          .count();

        resolve(penOrder);
      } catch {
        reject();
      }
    });
  },
};
