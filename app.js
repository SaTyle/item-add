//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static( "public"));
                          //
    mongoose.set('strictQuery', false);
    mongoose.connect("mongodb+srv://AjeeT:Test123@cluster0.9smghzn.mongodb.net/test",
    {useNewUrlParser:true},{useUnifiedTopology:true})
    .then(() => console.log('Connected Successfully'))
    .catch((err) => { console.error(err); });
                          //
// mongoose.connect("mongodb://localhost:21017/todolistDB",{useNewUrlParser:true});
// START

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const i1 = new Item({
  name:"Welcome to-do list"
});
const i2 = new Item({
  name : "Hit + to add items"
});
const i3 = new Item({
  name:"<-- hit this to delete item"
});
const deafaultItems = [i1,i2,i3]; 
const listSchema ={
  name:String,
  items:[itemSchema]
};
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
 
    Item.find({}).then(foundItems => {
      if(foundItems.length === 0){
          Item.insertMany(deafaultItems).then(function(){
          console.log("Successfully saved defult items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
      }else{
        // console.log(foundItems);
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      });
    });


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list ;
  
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    .catch(function(err){
      console.log(err);
    }); 
  }
});

app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkbox ;
  const listName = req.body.listName ;
  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId)
  .then(function () {
    console.log("Sucesfully Removed checked item")
  })
  .catch(function (err) {
    console.log(err);
  });
  res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
      .then(function(foundList){
        res.redirect("/"+listName);
      })
      .catch(function(err){
        console.log(err);
      });
  }
  
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName})
    .then(function(foundList){
      if(!foundList){
        const list = new List({
          name : customListName,
          items: deafaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }      
    })
    .catch(function(err){
      console.log(err);
    });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



