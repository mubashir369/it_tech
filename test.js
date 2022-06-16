function payment(id,amount){
    amount=parseInt(amound)
    $.ajax({
      url:'/make-payment-now',
      method:'post',
      data:{
        orderId:id,
        totel:amount
      },
      success:function(data){
        console.log(data)}
    })
  }
