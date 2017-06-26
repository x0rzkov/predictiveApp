$( document ).ready(function() {
    init();
});

function init () {

     $(".nav a").on("click", function(){
     $(".nav").find(".active").removeClass("active");
     $(this).parent().addClass("active");
    });
    
    //Hide the following divs
    $("#jumbotron").hide();
    $("#predApp").hide();
    $("#showError").hide();
    $("#showPredictions").hide();
   
    bindButtons();
}

function showPredApp() {
        $("#signinBtn").text("Sign in");
        $("#showPredictions").hide();
        $("#jumbotron").css("visibility", "visible");
        $("#customerName").css("visibility", "visible"); 
        $("#jumbotron").fadeIn(500);
     
}

function bindButtons() {

    $('#signinBtn').click(function(){
        if ($("#signinBtn").text().trim() == 'Sign in') {getPrediction(); }            
        else { showPredApp(); }
    });
    
    $('#predActive').click(function(){
        $(".nav").find(".active").removeClass("active");
        $(".lnk_predApp").parent().addClass("active");
    });
 
     $('.lnk_predApp').click(function(){
        $("#wlcm").hide();
        $("#articleTxt").fadeOut(200);
        $("#jumbotron").fadeIn(500);
        $("#predApp").fadeIn(500);
        $("#wlcm").html("Welcome to Healthy Food Store");
        $("#wlcm").fadeIn(1000);
        //prevent default from scrolling to top
        return false;
        });
    
     $('.lnk_home').click(function(){
        $("#wlcm").hide();
        $("#wlcm").html("Welcome");
        $("#jumbotron").fadeOut(200);
        $("#predApp").fadeOut(200);
        $("#articleTxt").fadeIn(500);
        $("#wlcm").fadeIn(1000);
        //prevent default from scrolling to top
        return false;
      });
}


function getPrediction() {
    $("#showPredictions").hide();
    $("#showError").hide();

    var customerName = $("#customerName").val();
    var herbs = parseFloat($("#herbs_param").val());
    var protein = parseFloat($("#protein_param").val());
    var tea = parseFloat($("#tea_param").val());

    var validForm = validateInput (customerName, herbs, protein, tea);
    if (validForm == true) { 
            var xhr = 	$.ajax({
                        type: 'POST',
                        url: '/prediction',
                        data: JSON.stringify({'herbs':herbs, 'protein':protein, 'tea':tea}), 
                        dataType: "json",                               //Converts the json String into a true json object
                        contentType: 'application/json',
                        success: function(data) {                    //returns two json objects (whch are python lists in js = array

                                                    var clusterObj = getClusterName(data[0]);
                                                    Recommended1 = data[1][0];
                                                    Recommended2 = data[1][1];
                                                    Recommended3 = data[1][2];
                                                    console.log('Success!');
                                                    var clusterText = customerName + ' belongs to segment <i>'+ clusterObj.clusterName + '</i>';
                                                    $("#clusterInfo").html("<i class='fa fa-check-circle fa-2x'" + 'aria-hidden="true"></i> <strong>&nbsp;</strong> ' + clusterText);
                                                    var recommendText =  'The follwing items are recommended to ' + customerName + ':<br><i>' + Recommended1 + '<br>'  + Recommended2 + '<br>'+ Recommended3 +'<i>'
                                                    $("#recommendInfo").html("<i class='fa fa-check-circle fa-2x'" + 'aria-hidden="true"></i> <strong>&nbsp; </strong> ' + recommendText);
                                                    
                                                    $("#signinBtn").text("Sign out");
                                                    $("#jumbotron").hide();
                                                    $("#customerName").hide();
                                                    $("#showPredictions").fadeIn(800);
                                    
                        },
                
                            error: function(data) { 
                            console.log("Error!");
                    
                            $("#showError").fadeIn(500);
                
                            }
                    });     //Ajax end
    
      }   
    //if form is not valid enter errormsg text in the html 
    else {
            console.log(validForm);
            $("#showError").fadeIn(500);
            $("#errorInfo").html("<i class='fa fa-exclamation-triangle fa-2x' 'aria-hidden'='true'></i> <strong>&nbsp; Error:</strong>" + validForm);
         }

} //End of function

function validateInput(customerName, herbs, protein, tea){
    var errormsg = "";
    
    var isValid = true;
    customerName = customerName.trim();

    if (customerName == "" ) {   
        errormsg += "Please enter a valid name";
        isValid = false;
    }
    
    else if ( herbs != "" && isNaN(herbs)) {
        errormsg += "Please enter an amount in € for Helthy Herbs";
        isValid = false;
    }
     
    else if ( protein != "" && isNaN(protein)) {
        errormsg += "Please enter an amount in € for Protein Bars";
        isValid = false;
    }
    
    else if ( tea != "" && isNaN(tea)) {
        errormsg += "Please enter an amount in € for Green Tea";
        isValid = false;
    }
    
    if (isValid == false) {
            return errormsg;
    }
    
    else  { // if isValid then return True 
            return true;  
    } 
}

function getClusterName(clusterNumber) {
    var clusterName;
    
if (clusterNumber == 0) { clusterName = "Energizers (in need of breaks)"}
    else if (clusterNumber == 1) { clusterName = "Tea sippers"}
    else if (clusterNumber == 2) { clusterName = "Healthy Herbs"}
    else  { clusterName = "No segment"}
    
    return {clusterName: clusterName};	//return an object

}
