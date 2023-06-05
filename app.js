//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const toDo1 = new Item({name:"ma cac"});
const toDo2 = new Item({name:"ma pis"});
const toDo3 = new Item({name:"ma spal"});

const defaultItems = [toDo1, toDo2, toDo3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

async function addItems(){
const result = await Item.insertMany(defaultItems);
console.log(result);
}

async function addList(list){
  const result = await list.save();
  console.log(result);
}

async function deleteItem(id){
  await Item.findOneAndDelete({ _id: id });
}

Item.find({}).then(function(foundItems){
  if(foundItems.length===0){
    addItems();
  }
  });

app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems){
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  })
  .catch(function(err){
    console.log(err);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name:itemName});

  if (listName ==="Today"){
    const result = Item.create(item);
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save().then();
      res.redirect("/"+listName);
  });
}
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
  deleteItem(checkedItemId);
  res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
    });
    res.redirect("/"+listName);
  }
});


app.get("/:category", function(req,res){
  const customListname = _.capitalize(req.params.category);
  List.find({name: customListname}).then(function(foundItems){
    if(foundItems.length===1){
      res.render("list", { listTitle: customListname, newListItems: foundItems[0].items });
    }else{
      const list = new List({
        name: customListname,
        items: defaultItems
      });
    
      addList(list);
      res.redirect("/"+customListname);

    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
