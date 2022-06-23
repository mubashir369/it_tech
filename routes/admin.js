const express = require("express");
const res = require("express/lib/response");

const async = require("hbs/lib/async");

var router = express.Router();
var adminHelper = require("../helper/admin-helpers");
var productHelper = require("../helper/product-helpers");
const userHelper = require("../helper/user-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/adminLogin", { admin: true, logErr: req.session.logErr });
  }
});
router.post("/", (req, res) => {
  console.log(req.body);
  adminHelper.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminlogin = true;
      req.session.admin = response.admin;
      res.redirect("/admin/dashboard");
    } else {
      req.session.logErr = "Invalid Username Or Password";
      console.log("admin log in filed");
      res.redirect("/admin");
    }
  });
});
router.get("/add-product", (req, res) => {
  if (req.session.admin) {
    res.render("admin/add-product", { admin: true });
  } else {
    res.redirect("/admin");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});
router.get("/view-product", (req, res) => {
  let admin = req.session.admin;
  if (admin) {
    productHelper.getAllProducts().then((product) => {
      console.log("products is kjdfhkjdf" + product);
      res.render("admin/view-product", {
        adminlogin: true,
        admin,
        product,
      });
    });
  } else {
    res.redirect("/admin");
  }
});
router.post("/add-product", function (req, res) {
  if (req.session.admin) {
    console.log(req.body);
    console.log(req.files.fimage);
    let product = req.body;

    productHelper.addProduct(req.body, (id) => {
      let fimage = req.files.fimage;
      fimage.mv("./public/product-image/front_" + id + ".jpg", (err, done) => {
        if (!err) {
          res.render("admin/add-product", { admin: true });
        }
        res.render("admin/add-product", { admin: true });
      });
      let simage = req.files.simage;
      simage.mv("./public/product-image/side_" + id + ".jpg");
      let bimage = req.files.bimage;
      bimage.mv("./public/product-image/back_" + id + ".jpg");
      productHelper.addProductImage(id).then(() => {});
    });
  }
});
router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  let admin = req.session.admin;
  if (admin) {
    res.render("admin/edit-product", { product, admin, adminlogin: true });
  } else {
    res.redirect("/admin");
  }
});
router.get("/all-users", (req, res) => {
  let admin = req.session.admin;
  if (admin) {
    userHelper.getAllUsers().then((users) => {
      res.render("admin/all-users", { adminlogin: true, admin, users });
    });
  } else {
    res.redirect("/admin");
  }
});
router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect("/admin/view-product");
  });
}),
  router.post("/edit-product/:id", (req, res) => {
    productHelper.updateProduct(req.params.id, req.body).then(() => {
      res.redirect("/admin/view-product");
      let id = req.params.id;
      let fimage = req.files.fimage;
      let simage = req.files.simage;
      let bimage = req.files.bimage;
      if (fimage) {
        fimage.mv("./public/product-image/front_" + id + ".jpg");
      } else if (simage) {
        simage.mv("./public/product-image/side_" + id + ".jpg");
      } else if (bimage) {
        bimage.mv("./public/product-image/back_" + id + ".jpg");
      }
    });
  });
router.get("/add-user", (req, res) => {
  if (req.session.admin) {
    res.render("admin/add-user", { admin: true, adminlogin: true });
  } else {
    res.redirect("/admin");
  }
});
/********************************OTP*************************************** */
let OTPmessage = {};
router.post("/add-user", (req, res) => {
  userHelper.userSignUp(req.body).then((response) => {
    if (response.status) {
      OTPmessage.message = "OTP send to " + req.body.email;
      let send = OTPmessage.message;
      res.render("user/otp", { send });
    } else {
      res.render("admin/add-user", {
        message: response.message,
        admin: true,
        adminlogin: true,
      });
    }
  });
});
router.post("/otp", (req, res) => {
  userHelper.varifyMail(req.body.otp).then((user) => {
    if (user.user) {
      res.redirect("/login");
    } else {
      let send = OTPmessage.message;
      res.render("user/otp", {
        message: "Invalid OTP or Check Your EmailID",
        uesr: user.userData,
        send,
      });
    }
  });
});
router.get("/delete-user/:id", (req, res) => {
  let usrId = req.params.id;
  userHelper.deleteUser(usrId).then((response) => {
    res.redirect("/admin/all-users");
  });
}),
  router.get("/edit-user/:id", async (req, res) => {
    let edituser = await userHelper.getUser(req.params.id);
    res.render("admin/edit-user", { edituser, admin: true, adminlogin: true });
  });
router.post("/edit-user/:id", (req, res) => {
  console.log(req.body);
  userHelper.updateUser(req.params.id, req.body).then(() => {
    res.redirect("/admin/all-users");
  });
});
router.get("/dashboard", async (req, res) => {
  if (req.session.admin) {
    // let totelSale = await adminHelper.getTotelSale();
    // let numberOfUsers = await adminHelper.getNumberOfUsers();
    // let pendingAmt = await adminHelper.getPendingAmt();
    // let penOrder = await adminHelper.getPenOrder();
    // let totelRecivedAmt = totelSale - pendingAmt;
    // //let dayReport=await adminHelper.getDayReport();
    // let latestOrders = await adminHelper.getLatestOrders();
    // console.log(latestOrders);
    // let dashboard = {
    //   usrcount: numberOfUsers,
    //   totelSale: totelSale,
    //   penAmt: pendingAmt,
    //   penOrder: penOrder,
    //   totelRecivedAmt: totelRecivedAmt,
    // };

    res.render("admin/dashboard", { admin: true,});
  } else {
    res.redirect("/admin");
  }
});
router.get("/view-orders", (req, res) => {
  if (req.session.admin) {
    adminHelper.getAllOrders().then((orders) => {
      res.render("admin/orderlist", { admin: true, orders });
    });
  } else {
    res.redirect("/admin");
  }
});
router.get("/view-order-detailes/:id", async (req, res) => {
  if (req.session.admin) {
    let products = await userHelper.getOrderProducts(req.params.id);
    adminHelper.getOrderDetails(req.params.id).then((order) => {
      res.render("admin/order-detailes", { admin: true, order, products });
    });
  } else {
    res.redirect("/admin");
  }
});
router.post("/changeStatus", (req, res) => {
  adminHelper.ChangeOrderStatus(req.body).then((response) => {
    res.json(response);
  });
});
router.post("/changePaymentStatus", (req, res) => {
  adminHelper.changePaymentStatus(req.body).then((response) => {
    res.json(response);
  });
});
module.exports = router;
