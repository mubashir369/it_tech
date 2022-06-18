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

  getNumberOfUsers: () => {
    return new Promise(async (resolve, reject) => {
      let usrCount = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .countDocuments();
      console.log("usrCount******************************");
      console.log(usrCount);
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
        console.log(totel[0].totel);
      } else {
        resolve({ totel: null });
      }
    });
  },
  getPendingAmt: () => {
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
      console.log("4444444444444444444444444444444444444444444444444444");
      console.log(totel[0].totel);
      resolve(totel[0].totel);
    });
  },
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
/*  getDayReport: () => {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0");
      var yyyy = today.getFullYear();
      var dt = new Date();
      var hours = dt.getHours();
      var AmOrPm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      var minutes = dt.getMinutes();
      var Time = hours + ":" + minutes + "-" + AmOrPm;
      today = mm + "/" + dd + "/" + yyyy;

      /*function Last7Days () {
        var result = [];
        for (var i=0; i<7; i++) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.push( formatDate(d) )
        }
        return(result.join(','));
    }*/
/*
      let totel = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { date: today } } ,
          { $group: { _id: null, date: "$date" } },
          {$project: {_id: 0, date: 1}},
        ])

      console.log(
        "**********************************************************day****"
      );
      console.log(totel);
      resolve(totel);
    });
  },*/
};
