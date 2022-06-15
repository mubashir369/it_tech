$(document).ready(function () {
  $("#divv").validate({
    rules: {
      fname: {
        required: true,
        minlength: 2,
        maxlength: 15,
      },
      lname:{
          required:true,
          minlength:2,
          maxlength:15
      },
      address:{
          required:true,
      },
      town:{
          
      },
     
      pinCode:{
          required:true,
          minlength:6,
          maxlength:6,
          number: true

      },
      email:{
          required:true,
          email:true
      },
      phone:{
          required:true,
          number:true,
          maxlength:13,
          minlength:10
      },
      payment:{
        required:true
      }

    },
    messages: {
        phone: {
            number:"Please enter valid Phone number",
            maxlength: "Please enter valid Phone number",
            minlength: "Please enter valid Phone number",
        },
        pinCode:{
            number:"Please Enter Valid Pin Code",
            minlength:"Please Enter Valid Pin Code",
            maxlength:"Please Enter Valid Pin Code"
        },
        payment:{
            required:"Please Choose your Payment Method"
        }
    }

  });
   
});
