var express = require("express");
const { redirect } = require("express/lib/response");
const async = require("hbs/lib/async");
const { render } = require("../app");
var router = express.Router();
var productHelper = require("../helper/product-helpers");
var userHelper = require("../helper/user-helpers");
var emailstatus;
var accountAdded;
/* GET home page. */
router.get("/", async function (req, res, next) {
  let trending = {
    discription:
      "Mobile phones have become a salient part of our daily life. It has become a necessity in this digitally dominated World. Mobile phones were invented in 1973 fundamentally for communication purpose but now you can do kinds of stuff from calling to Shopping",
    image: "/images/p1.png",
  };
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.cartCount(req.session.user._id);
  }
  productHelper.getLatestProducts().then((product) => {
    let user = req.session.user;

    res.render("user/view-product", {
      product,
      trending,
      login: true,
      user,
      cartCount,
    });
  });
});
router.get("/login", (req, res) => {
  if (req.session.login) {
    res.redirect("/");
  } else {
    let added = accountAdded;

    res.render("user/login", {
      login: false,
      loginErr: req.session.loginErr,
      added,
    });
  }
});
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.login = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid username or password.";
      res.redirect("/login");
    }
  });
});
//otp***********************************OTP****************
let OTPmessage = {};
router.post("/signup", (req, res) => {
  userHelper.userSignUp(req.body).then((response) => {
    if (response.status) {
      OTPmessage.message = "OTP send to " + req.body.email;
      let send = OTPmessage.message;
      res.render("user/otp", { send });
    } else {
      res.render("user/signup", { message: response.message });
    }
  });
}),
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
router.get("/forgot-password-step1", (req, res) => {
  res.render("user/forgot-password-step1");
});
router.post("/forgot-password-step1", (req, res) => {
  userHelper.checkEmail(req.body.email).then((user) => {
    if (user.user) {
      res.render("user/forget-otp");
    } else {
      res.render("user/forgot-password-step1", {
        message: "This Email ID is Not Availeble",
      });
    }
  });
});
router.post("/forgot-otp", (req, res) => {
  userHelper.varifyMailForgot(req.body.otp).then((user) => {
    if (user.user) {
      res.render("user/create-new-password", { userId: user.user._id });
    } else {
      let send = OTPmessage.message;
      res.render("user/forget-otp", {
        message: "Invalid OTP or Check Your EmailID",
        uesr: user.userData,
        send,
      });
    }
  });
});
router.post("/create-new-password", (req, res) => {
  userHelper.CreateNewPassword(req.body).then(() => {
    res.redirect("/login");
  });
});

-router.get("/signup", (req, res) => {
  let email = emailstatus;
  if (email) {
    res.render("user/signup", { email });
  } else {
    res.render("user/signup");
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/product-detailes/:id", async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  let id = req.params.id;

  res.render("user/product-detiles", {
    product,
    user: req.session.user,
    fav: true,
  });
}),
  router.get("/cart", async (req, res) => {
    if (req.session.user) {
      let products = await userHelper.getCartProducts(req.session.user._id);
      if (products[0]) {
        //let perTotel= await userHelper.getPerTotelAmount(req.session.user._id)
        let totel = await userHelper.getTotelAmount(req.session.user._id);
        //let unitTotel=Object.keys(perTotel)
        res.render("user/cart", { user: req.session.user, products, totel });
      } else {
        res.render("user/empty-cart");
      }
    } else {
      res.redirect("/login");
    }
  });
router.get("/add-to-cart/:id", (req, res) => {
  let proId = req.params.id;
  let user = req.session.user;

  if (user) {
    userHelper.addToCart(proId, req.session.user._id).then(() => {
      res.redirect("/cart");
    });
  } else {
    res.redirect("/login");
  }
});
router.post("/change-product-Qty", (req, res, next) => {
  userHelper.changeProductQty(req.body).then(async (response) => {
    response.totel = await userHelper.getTotelAmount(req.body.user);
    /*response.perTotel = await userHelper.getPerTotelAmount(req.body);*/
    res.json(response);
  });
});

router.get("/delete-cart-product/:id", (req, res) => {
  let proId = req.params.id;
  let usrId = req.session.user._id;
  userHelper.deleteCartProduct(proId, usrId).then(() => {
    res.redirect("/cart");
  });
});
router.post("/clear-cart", (req, res) => {
  if (req.session.user) {
    userHelper.deleteCart(req.body.usrId).then(() => {
      res.redirect("/cart");
    });
  } else {
    redirect("/login");
  }
});
router.get("/place-order", async (req, res) => {
  if (req.session.user) {
    let totel = await userHelper.getTotelAmount(req.session.user._id);

    res.render("user/place-order", { totel, user: req.session.user });
  } else {
    res.redirect("/login");
  }
});
router.post("/place-order", async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId);
  let totel = await userHelper.getTotelAmount(req.session.user._id);
  userHelper.placeOrder(req.body, products).then((orderId) => {
    if (req.body.payment == "COD") {
      res.json({ cod: true });
    } else {
      userHelper
        .generateRazorpay(orderId.insertedId, totel)
        .then((response) => {
          res.json(response);
        });
    }
  });
});
router.get("/thankYou", (req, res) => {
  res.render("user/thankYou");
});
router.get("/fav/:id", (req, res) => {
  if (req.session.user) {
    let proId = req.params.id;

    userHelper.favProList(proId, req.session.user._id);
  } else {
    res.redirect("/login");
  }
});
router.get("/orders", async (req, res) => {
  if (req.session.user) {
    let Pending=false
    let Orders = await userHelper.getUserOrders(req.session.user._id);
    if(Orders.status=="Pending"){
      Pending=true
    }

    res.render("user/orders", {Orders,Pending});
  } else {
    res.redirect("/login");
  }
});
router.get("/user/view-order-product/:id", async (req, res) => {
  let products = await userHelper.getOrderProducts(req.params.id);
  let order;
  userHelper.orderData(req.params.id).then((orderData) => {
    order = orderData;
    let status = {
      Pending: null,
      Shipped: null,
      Delivered: null,
    };
    if (order.status == "Pending") {
      status.Pending = true;
    } else if (order.status == "Shipped") {
      status.Shipped = true;
    } else if (order.status == "Delivered") {
      status.Delivered = true;
    }
    res.render("user/view-order-products", { products, order, status });
  });
});
router.post("/verify-payment", (req, res) => {
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "" });
    });
});
router.get("/user-profile", async (req, res) => {
  if (req.session.user) {
    let user = await userHelper.getUser(req.session.user._id);
    res.render("user/user-profile", { user });
  } else {
    res.redirect("/login");
  }
});
router.get("/edit-user", async (req, res) => {
  if (req.session.user) {
    let user = await userHelper.getUser(req.session.user._id);
    res.render("user/edit-user", { user });
  } else {
    res.redirect("/login");
  }
});
router.post("/edit-user", (req, res) => {
 
  userHelper.updateUser(req.session.user._id, req.body).then((data) => {
      res.redirect("/user-profile");
  });
});
router.get("/change-password", (req, res) => {
  if (req.session.user) {
    res.render("user/change-password", { user: req.session.user });
  } else {
    res.redirect("/login");
  }
});
router.post("/change-password", (req, res) => {
  if (req.session.user) {
    userHelper
      .changePassword(req.session.user, req.body)
      .then((data) => {
        if (data.status) {
          res.redirect("/login");
        } else {
          let err = true;
          res.render("user/change-password", { status: err });
          err = false;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/login");
  }
});
router.get("/delete-user", (req, res) => {
  if (req.session.user) {
    userHelper.deleteUser(req.session.user._id).then((data) => {});
    req.session.destroy();
    res.redirect("/login");
  }
});
router.get("/all-products", (req, res) => {
  productHelper.getAllProducts().then((products) => {
    console.log(products);
    res.render("user/all-products", { products, login: true });
  });
});
router.post("/make-payment-now", (req, res) => {
  if (req.session.user) {
    console.log(req.body);
    userHelper
    .generateRazorpay(req.body.orderId,req.body.totel)
    .then((response) => {
      res.json(response);
    });
  } else {
    res.redirect("/login");
  }
});
router.get('/cancel-order/:id',async(req,res)=>{
  
  if(req.session.user){
    userHelper.cancelOrder(req.params.id).then(()=>{
      res.redirect('/orders')
    })
    
  }else{
    res.redirect('/login')
  }
})
module.exports = router;
