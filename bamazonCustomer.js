var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect(function(err){
    if(err) throw err;

    start();
    // console.log("Your connection id is: "+ connection.threadId);
});

function start() {
   connection.query("SELECT * FROM products", function(err, res){
       if(err) throw err;

       console.log("----------Products for sale on Bamazon----------")
       console.log("------------------------------------------------")

       for(var i = 0; i < res.length; i++){
           console.log("ID: " + res[i].item_id + " | " + "Product: " + res[i].product_name + " | " + "Price: " +"$"+ res[i].price);
           console.log("------------------------------------------------");
       }

       inquirer.prompt([
           {
               type: "input",
               name: "id",
               message: "What is the ID of the product you would like to purchase?",
               validate: function(value){
                   if(isNaN(value) === false && parseInt (value) <= res.length && parseInt(value) > 0){
                       return true;
                   } else {
                       return false;
                   }
               }
           },
           {
               type: "input",
               name: "qty",
               message: "How much would you like to buy?",
               validate: function(value){
                   if(isNaN(value)){
                       return false;
                   } else{
                       return true;
                   }
               }
           }
       ]).then(function(ans){
           var whatToBuy = (ans.id)-1;
           var howMuchToBuy = parseInt(ans.qty);
           var total = parseFloat(((res[whatToBuy].price) * howMuchToBuy).toFixed(2));

           if (res[whatToBuy].stock_quanity >= howMuchToBuy){
               connection.query("UPDATE products SET ? WHERE ?", [
                   {stock_quanity: (res[whatToBuy].stock_quanity - howMuchToBuy)},
                   {item_id: ans.id}
               ], function(err, res){
                   if (err) throw err;
                   console.log(" You have successfully purchased this item! Total: " + total.toFixed(2));
                   reprompt();
               });

           }else {
               console.log("Insufficient quantity!");

                reprompt();
           }

           
       })
   })
}

function reprompt(){
    inquirer.prompt([{
        type:"confirm",
        name: "reply",
        message: "Would you like to start over?"
    }]).then(function(ans){
        if(ans.reply){
            start();
        }else{
            console.log("Okay, bye!");
        }
    })
}

