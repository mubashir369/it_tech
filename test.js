changeColor(proId)
    {
        var proId = document.getElementById("proId").value;
        var status = document.getElementById("status"+proId).innerHTML;
        if(status=="Pending")
        {
            document.getElementById("status"+proId).style.color="red";
        }
        else if(status=="placed")
        {
            document.getElementById("status"+proId).style.color="green";
        }
        else if(status=="Cancelled")
        {
            document.getElementById("status"+proId).style.color="blue";
        }
        else if(status=="Delivered")
        {
            document.getElementById("status"+proId).style.color="green";
        }
    }
   