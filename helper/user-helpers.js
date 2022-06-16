var db = require("../config/connection");
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const async = require("hbs/lib/async");
const { ObjectId } = require("mongodb");
const { reject } = require("bcrypt/promises");
const { CART_COLLECTION } = require("../config/collection");
const { log } = require("handlebars");
const { response, route } = require("../app");
const { status } = require("express/lib/response");
const otpGenerator = Math.floor(1000 + Math.random() * 9000);
const Razorpay = require("razorpay");
const { resolve } = require("node:path");
var instance = new Razorpay({
  key_id: "rzp_test_jUspqW6Y2QXpgt",
  key_secret: "SkbvbAXD9jYzaqaluLNZdxIk",
});
let mysession = {};
mysession.OTP = otpGenerator;

module.exports = {
  //******************************************************OTP****************************** */
  userSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
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
              user: "meuse685@gmail.com",
              pass: "rzpwououaupnbjac",
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const mailDetails = {
            from: "meuse685@gmail.com",
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
    });
  },
  varifyMail: (otp) => {
    return new Promise(async (resolve, reject) => {
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
    });
  },

  checkEmail: (email) => {
    return new Promise(async (resolve, reject) => {
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
              user: "meuse685@gmail.com",
              pass: "rzpwououaupnbjac",
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const mailDetails = {
            from: "meuse685@gmail.com",
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
    });
  },
  varifyMailForgot: (otp) => {
    return new Promise((resolve, reject) => {
      if (otp == mysession.OTP) {
        console.log("OTP is " + mysession.OTP);
        console.log("otp matched");
        resolve({ user: mysession.userData });
      } else {
        console.log("otp not matched");
        console.log("OTP is " + mysession.OTP);
        resolve({ user: false, userData: mysession.userData });
      }
    });
  },
  CreateNewPassword: (data) => {
    return new Promise(async (resolve, reject) => {
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
    });
  },
  //******************************************************OTP****************************** */

  /* doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      let email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      let response = {};
      console.log("email is " + email);
      if (email) {
        response.status = false;
        response.emailErr = true;
        resolve(response);
      } else {
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((status) => {
            response.status = true;
            response.emailErr = false;
            resolve(response);
          });
      }
    });
  }*/
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ name: userData.name });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("log in sucsess");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("filisdskdksdjk");
        resolve({ status: false });
      }
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  deleteUser: (usrId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: ObjectId(usrId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getUser: (usrId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(usrId) })
        .then((user) => {
          resolve(user);
        });
    });
  },
  updateUser: (usrId, usr) => {
    return new Promise(async (resolve, reject) => {
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
    });
  },
  addToCart: async (proId, usrId) => {
    let totelobj = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(proId) });
    let pertotel = totelobj.price;
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
      totel: pertotel,
    };

    return new Promise(async (resolve, reject) => {
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
        console.log("proexist is@@@@@" + proExist);
        if (proExist != -1) {
          console.log("totelobj is #############" + totelobj);

          console.log("totel is #############" + totel);

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
    });
  },
  getCartProducts: (usrId) => {
    return new Promise(async (resolve, reject) => {
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
    });
  },
  cartCount: (usrId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(usrId) });
      console.log("user id is@@@@@@@@" + usrId);
      console.log("cart is@@@@@@@@@@@" + cart);
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
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
    });
  },
  getTotelAmount: (usrId) => {
    return new Promise(async (resolve, reject) => {
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
                totel: { $sum: { $multiply: ["$quantity", "$product.price"] } },
              },
            },
          ])
          .toArray();
        if (totel[0]) {
          resolve(totel[0].totel);
        } else {
          resolve({ totel: null });
        }
      } else {
      }
    });
  },

  deleteCartProduct: (proId, usrId) => {
    return new Promise((resolve, reject) => {
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
    });
  },
  deleteCart: (usrId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ user: ObjectId(usrId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  placeOrder: (order, products) => {
    return new Promise((resolve, reject) => {
      console.log(order, products);
      let status = order.payment == "COD" ? "Shipped" : "Pending";

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
      let oldTotel = parseInt(order.CartTotel);
      let discound = (order.CartTotel * 5) / 100;
      let gst = (order.CartTotel * 18) / 100;
      let Totel = order.CartTotel - discound + gst;
      let roudOff = Math.round(Totel);
      let newTotel = roudOff;
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
        totelAmound: oldTotel,
        discound: discound,
        gst: gst,
        paymentStatus:"Not Paid",
        totel: newTotel,
        date: today,
        time: Time,

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
    });
  },
  getCartProductList: (usrId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(usrId) });
      if (cart) {
        resolve(cart.products);
      } else {
        resolve(null);
      }
    });
  },

  getUserOrders: (usrId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(usrId) })
        .toArray();

      resolve(orders);
    });
  },
  orderData: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(order);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
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
    });
  },
  generateRazorpay: (orderId, totel) => {
    return new Promise((resolve, reject) => {
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
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const { createHmac } = require("node:crypto");

      let hmac = createHmac("sha256", "SkbvbAXD9jYzaqaluLNZdxIk");
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
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status:"Shipped",
              paymentStatus:"Paid"
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  changePassword: (usrId, newPswData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      console.log(newPswData.oldpsw);
      console.log(usrId.password);

      bcrypt.compare(newPswData.oldpsw, usrId.password).then(async (status) => {
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
    });
  },
  cancelOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:ObjectId(orderId)}).then(()=>{
        resolve()
      })
    })
  }
};
