$().ready(function() {                 
  $("#addForm").validate({
      rules:{
          name:{
              required: true,
              minlength: 2,
              maxlength: 10,
          },
      },
      highlight: function (element) {
          $(element).closest('.form-group').addClass('has-error');
      },
      messages:{
          name:{
              required: "This field is required",
              minlength: "Name must be at least 2 characters",
              maxlength: "Maximum number of characters - 10",
          },
      },
      submitHandler: function(form) { 
            $.ajax({
                url:'addEmpl.php',
              type:'GET',
              dataType: 'html',
              success: function(data) {
                  $("#block").html(data);
              }
           });
           return false; // required to block normal submit since you used ajax
       }
   });
});