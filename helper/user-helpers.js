var db = require("../config/connection");
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const async = require("hbs/lib/async");
const { ObjectId } = require("mongodb");
const otpGenerator = Math.floor(1000 + Math.random() * 9000);
const Razorpay = require("razorpay");
require("dotenv");
var instance = new Razorpay({
  key_id: process.env.RZP_ID,
  key_secret: process.env.RZP_KEY,
});
let mysession = {};
mysession.OTP = otpGenerator;

module.exports = {
  //******************************************************OTP****************************** */
  userSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let ExistEmail = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ email: userData.email });
        let ExistUser = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ name: userData.name });
        if (ExistEmail) {
          resolve({ status: false, message: "Email already exist" });
        } else if (ExistUser) {
          resolve({ status: false, message: "Username already exist" });
        } else {
          userData.password = await bcrypt.hash(userData.password, 10);
          mysession.userData = userData;
          let name = userData.name;
          let email = userData.email;

          try {
            const mailTransporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              service: "gmail",
              port: 465,
              secure: true,
              auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAIL_PASS,
              },
              tls: {
                rejectUnauthorized: false,
              },
            });

            const mailDetails = {
              from: process.env.GMAIL,
              to: email,
              subject: "for user verification",
              text: "just random texts ",
              html: "<p>hi " + name + " your OTP is" + otpGenerator + "",
            };
            mailTransporter.sendMail(mailDetails, (err, Info) => {
              if (err) {
                console.log(err);
              } else {
                console.log("email has been sent ", Info.response);
              }
            });

            resolve({ status: true });
          } catch (error) {
            console.log(error.message);
          }
        }
      } catch {
        reject();
      }
    });
  },
  varifyMail: (otp) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (otp == mysession.OTP) {
          try {
            const user = await db
              .get()
              .collection(collection.USER_COLLECTION)
              .insertOne(mysession.userData);
            resolve({ user });
          } catch (error) {
            console.log(error.message);
          }
        } else {
          resolve({ user: false, userData: mysession.userData });
        }
      } catch {
        reject();
      }
    });
  },

  checkEmail: (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ email: email });
        if (user) {
          mysession.userData = user;

          try {
            const mailTransporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              service: "gmail",
              port: 465,
              secure: true,
              auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAIL_PASS,
              },
              tls: {
                rejectUnauthorized: false,
              },
            });

            const mailDetails = {
              from: process.env.GMAIL,
              to: email,
              subject: "for user verification",
              text: "just random texts ",
              html:
                "<p>hi " +
                " your Generate new Password OTP is " +
                mysession.OTP +
                "",
            };
            mailTransporter.sendMail(mailDetails, (err, Info) => {
              if (err) {
                console.log(err);
              } else {
                console.log("email has been sent ", Info.response);
              }
            });

            resolve({ status: true, user });
          } catch (error) {
            console.log(error.message);
          }
        } else {
          resolve({ user: false });
        }
      } catch {
        reject();
      }
    });
  },
  varifyMailForgot: (otp) => {
    return new Promise((resolve, reject) => {
      try {
        if (otp == mysession.OTP) {
          resolve({ user: mysession.userData });
        } else {
          resolve({ user: false, userData: mysession.userData });
        }
      } catch {
        reject();
      }
    });
  },
  CreateNewPassword: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.password = await bcrypt.hash(data.password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(data.userId) },
            { $set: { password: data.password } }
          )
          .then(() => {
            resolve();
          });
      } catch {
        reject();
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let loginStatus = false;
        let response = {};
        let user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ name: userData.name });
        if (user) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              resolve({ status: false });
            }
          });
        } else {
          resolve({ status: false });
        }
      } catch {
        reject();
      }
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let users = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find()
          .toArray();
        resolve(users);
      } catch {
        reject();
      }
    });
  },
  deleteUser: (usrId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .deleteOne({ _id: ObjectId(usrId) })
          .then((response) => {
            resolve(response);
          });
      } catch {
        reject();
      }
    });
  },
  getUser: (usrId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .findOne({ _id: ObjectId(usrId) })
          .then((user) => {
            resolve(user);
          });
      } catch {
        reject();
      }
    });
  },
  updateUser: (usrId, usr) => {
    return new Promise(async (resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(usrId) },
            {
              $set: {
                name: usr.name,
                fname: usr.fname,
                lname: usr.lname,
                email: usr.email,
                number: usr.number,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } catch {
        reject();
      }
    });
  },
  addToCart: async (proId, usrId) => {
    let totelobj = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(proId) });
    let pertotel = totelobj.price;
    pertotel = parseInt(pertotel);
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
      totel: pertotel,
    };

    return new Promise(async (resolve, reject) => {
      try {
        let totelobj = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: ObjectId(proId) });
        let pertotel = totelobj.price;
        let qtyobj = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(usrId) });

        let userCart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(usrId) });
        if (userCart) {
          if (qtyobj.products[0]) {
            let qty = qtyobj.products[0].quantity + 1;
            var totel = pertotel * qty;
          }

          let proExist = userCart.products.findIndex(
            (product) => product.item == proId
          );

          if (proExist != -1) {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: ObjectId(usrId), "products.item": ObjectId(proId) },
                {
                  $inc: { "products.$.quantity": 1 },
                  $set: { "products.$.totel": totel },
                }
              )
              .then(() => {
                resolve();
              });
          } else {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: ObjectId(usrId) },
                {
                  $push: {
                    products: proObj,
                  },
                }
              )
              .then((response) => {
                resolve();
              });
          }
        } else {
          let cartObj = {
            user: ObjectId(usrId),
            products: [proObj],
          };
          db.get()
            .collection(collection.CART_COLLECTION)
            .insertOne(cartObj)
            .then((response) => {
              resolve();
            });
        }
      } catch {
        reject();
      }
    });
  },
  getCartProducts: (usrId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: ObjectId(usrId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
                totel: "$products.totel",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                totel: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();

        resolve(cartItems);
      } catch {
        reject();
      }
    });
  },
  cartCount: (usrId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(usrId) });

        if (cart) {
          count = cart.products.length;
        }
        resolve(count);
      } catch {
        reject();
      }
    });
  },
  changeProductQty: async (detailes) => {
    detailes.quantity = parseInt(detailes.quantity);
    detailes.count = parseInt(detailes.count);
    let product = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(detailes.product) });
    let price = product.price;
    return new Promise((resolve, reject) => {
      try {
        if (detailes.count == -1 && detailes.quantity == 1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: ObjectId(detailes.cart) },
              {
                $pull: {
                  products: {
                    item: ObjectId(detailes.product),
                  },
                },
              }
            )
            .then((response) => {
              resolve({ removeProduct: true });
            });
        } else {
          if (detailes.count == 1) {
            let qty = detailes.quantity + 1;
            let totel = qty * price;
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                {
                  _id: ObjectId(detailes.cart),
                  "products.item": ObjectId(detailes.product),
                },
                {
                  $inc: { "products.$.quantity": detailes.count },
                  $set: { "products.$.totel": totel },
                }
              )
              .then((response) => {
                resolve({ status: true });
              });
          } else {
            let qty = detailes.quantity - 1;
            let totel = qty * price;
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                {
                  _id: ObjectId(detailes.cart),
                  "products.item": ObjectId(detailes.product),
                },
                {
                  $inc: { "products.$.quantity": detailes.count },
                  $set: { "products.$.totel": totel },
                }
              )
              .then((response) => {
                resolve({ status: true });
              });
          }
        }
      } catch {
        reject();
      }
    });
  },
  getTotelAmount: (usrId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(usrId) });
        if (cart) {
          let totel = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: ObjectId(usrId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
              {
                $group: {
                  _id: null,
                  totel: {
                    $sum: { $multiply: ["$quantity", "$product.price"] },
                  },
                },
              },
            ])
            .toArray();
          if (totel[0]) {
            let price = {
              subTotel: totel[0].totel,
              discount: Math.round((totel[0].totel * 5) / 100),
              gst: Math.round((totel[0].totel * 18) / 100),
            };
            resolve(price);
            //resolve(totel[0].totel);
          } else {
            resolve({ totel: null });
          }
        } else {
        }
      } catch {
        reject();
      }
    });
  },

  deleteCartProduct: (proId, usrId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: ObjectId(usrId) },
            {
              $pull: {
                products: {
                  item: ObjectId(proId),
                },
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } catch {
        reject();
      }
    });
  },
  deleteCart: (usrId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.CART_COLLECTION)
          .deleteOne({ user: ObjectId(usrId) })
          .then((response) => {
            resolve(response);
          });
      } catch {
        resolve();
      }
    });
  },
  placeOrder: (order, products) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(order, products);
        let status = "Pending";
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
        let orderList = new Date();
        let orderObj = {
          deliveryDetails: {
            fname: order.fname,
            lanme: order.lanme,
            phone: order.phone,
            address: order.address,
            landMark: order.town,
            pinCode: order.pinCode,
            email: order.email,
            state: order.state,
          },
          userId: ObjectId(order.userId),
          payment: order.payment,
          products: products,
          totelAmound: parseInt(order.subTotel),
          discound: parseInt(order.discount),
          gst: parseInt(order.gst),
          paymentStatus: "Not Paid",
          totel: parseInt(order.CartTotel),
          date: today,
          time: Time,
          sort: orderList,
          status: status,
        };
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .insertOne(orderObj)
          .then((orders) => {
            db.get()
              .collection(collection.CART_COLLECTION)
              .deleteOne({ user: ObjectId(order.userId) });
            resolve(orders);
          });
      } catch {
        reject();
      }
    });
  },
  getCartProductList: (usrId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(usrId) });
        if (cart) {
          resolve(cart.products);
        } else {
          resolve(null);
        }
      } catch {
        reject();
      }
    });
  },
  getUserOrders: (usrId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ userId: ObjectId(usrId) })
          .sort({ sort: -1 })
          .toArray();

        resolve(orders);
      } catch {
        reject();
      }
    });
  },
  orderData: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let order = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: ObjectId(orderId) });
        resolve(order);
      } catch {
        reject();
      }
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderItems = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: { _id: ObjectId(orderId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
                totel: "$products.totel",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                totel: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();

        resolve(orderItems);
      } catch {
        reject();
      }
    });
  },
  generateRazorpay: (orderId, totel) => {
    return new Promise((resolve, reject) => {
      try {
        instance.orders.create(
          {
            amount: totel * 100,
            currency: "INR",
            receipt: "" + orderId,
            notes: {
              key1: "value3",
              key2: "value2",
            },
          },
          function (err, order) {
            if (err) {
              console.log(err);
            }

            resolve(order);
          }
        );
      } catch {
        resolve();
      }
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        const { createHmac } = require("node:crypto");
        let hmac = createHmac("sha256", process.env.RZP_KEY);
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject();
        }
      } catch {
        reject();
      }
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(orderId) },
            {
              $set: {
                paymentStatus: "Paid",
              },
            }
          )
          .then(() => {
            resolve();
          });
      } catch {
        reject();
      }
    });
  },
  changePassword: (usrId, newPswData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        console.log(newPswData.oldpsw);
        console.log(usrId.password);

        bcrypt
          .compare(newPswData.oldpsw, usrId.password)
          .then(async (status) => {
            if (status) {
              newPswData.newpsw = await bcrypt.hash(newPswData.newpsw, 10);

              console.log(newPswData.newpsw);
              db.get()
                .collection(collection.USER_COLLECTION)
                .updateOne(
                  { _id: ObjectId(usrId._id) },
                  { $set: { password: newPswData.newpsw } }
                );

              response.user = usrId;
              response.status = true;
              resolve(response);
            } else {
              response.status = false;
              resolve(response);
            }
          });
      } catch {
        reject();
      }
    });
  },
  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .deleteOne({ _id: ObjectId(orderId) })
          .then(() => {
            resolve();
          });
      } catch {
        reject();
      }
    });
  },
};
