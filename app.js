//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://kasemsun:Password@icepersonal.lbc5pt8.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

const itemsSchema = {
  name: String,

};
const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "Welcome"
});

const Item2 = new Item({
  name: "Hit the + to new item",
});

const Item3 = new Item({
  name: "Hit this for delete",
});

const defaultItems = [Item1,Item2,Item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);
// Item.insertMany(defaultItems).then(function(){
//   console.log("success db");
// }).catch(function(err){
// console.log(err);
// });


app.get("/", function(req, res) {

const day = date.getDate();

Item.find({})
  .then(function (foundItems) {
    
    if (foundItems.length ===0) {
      Item.insertMany(defaultItems).then(function(){
        console.log("success db");
      }).catch(function(err){
      console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }


    
  })
  .catch(function (err) {
    console.log(err);
  });

  //res.render("list", {listTitle: "Today", newListItems: Item});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else{
    console.log(listName);
    List.findOne({name:listName}).then(function(foundList){
      console.log("foundList",foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
    });
  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Delete" + checkedItemId + " success");
        res.redirect("/");
      })
      .catch(function (err) {
        console.log("Error", err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(function (foundList) {
        console.log("Delete" + checkedItemId + " success");
        res.redirect("/" + listName);
      })
      .then(function (err) {
        console.log(err);
      });
  }
});

app.get("/:paremeter", function(req,res){
 const customListName = _.capitalize(req.params.paremeter);

 List.findOne({
   name: customListName,
 }).then(function(result){
  if (!result) {
    console.log("Doesn't exist!");
    const list = new List({
      name: customListName,
      items: defaultItems,
    });
    list.save();
    res.redirect("/" + customListName);
  }
  else{
    console.log("exiting customer", result);
    res.render("list", { listTitle: result.name, newListItems: result.items });
  }
   
 }).catch(function(err){
  console.log(err);
 })


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
