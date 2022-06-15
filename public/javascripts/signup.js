$(document).ready(function () {
  $("#sub-form").validate({
    rules: {
      name: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      fname: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      lname: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      number: {
        required: true,
        minlength: 10,
        maxlength: 10,
        number: true,
      },
      email: {
        required: true,
        email: true,
      },
      checkpassword: {
        required: true,
        minlength: 3,
        maxlength:8
      },
      password: {
        required: true,
        equalTo: "#checkpassword",
      },
    },
    messages: {
      number: {
        maxlength: "Please enter valid Phone number",
        minlength: "Please enter valid Phone number",
      },
      password: {
        equalTo: "Please Enter the same Password",
      },
    },
  });
});
$(document).ready(function () {
  $("#adminLogin").validate({
    rules: {
      name: {
        required: true,
      },
      password: {
        required: true,
      },
    },
  });
});
$(document).ready(function () {
  $("#userLogin").validate({
    rules: {
      name: {
        required: true,
      },
      password: {
        required: true,
      },
    },
  });
});
$(document).ready(function () {
  $("#addProduct").validate({
    rules: {
      name: {
        required: true,
      },
      brand: {
        required: true,
      },
      discription: {
        required: true,
      },
      ram: {
        required: true,
      },
      rom: {
        required: true,
      },
      price: {
        required: true,
        number: true,
      },
      color: {
        required: true,
      },
    },
  });
});
$(document).ready(function () {
  $("#addUser").validate({
    rules: {
      name: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      fname: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      lname: {
        required: true,
        minlength: 3,
        maxlength: 15,
      },
      number: {
        required: true,
        minlength: 10,
        maxlength: 10,
        number: true,
      },
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 5,
      },
    
    },
    messages: {
      number: {
        maxlength: "Please enter valid Phone number",
        minlength: "Please enter valid Phone number",
      },
      
    },
  });
});
$(document).ready(function () {
  $("#Createpsw").validate({
    rules: {
      setPassword: {
        required: true,
        minlength: 3,
        maxlength:8
      },
      password: {
        required: true,
        equalTo: "#setPassword",
      },
    },
  });
});
