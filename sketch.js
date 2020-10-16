var database;
var dogimg, happydogimg;
var dog, foodObj;
var feedbutton, addbutton;
var refoffood, foodS;
var fedTime, lastFed;
var gameState, readState;
var bedimg, gardimg, washimg;

function preload(){
  dogimg = loadImage("dogImg.png");
  happydogimg = loadImage("dogImg1.png");
  bedimg = loadImage("Bed Room.png");
  gardimg = loadImage("Garden.png");
  washimg = loadImage("Wash Room.png");
}

function setup() {
  database = firebase.database();

  createCanvas(1000, 500);
  foodObj = new Food();

  dog = createSprite(800, 150, 10, 10);
  dog.addImage("dog", dogimg);
  dog.scale = 0.3;

  feedbutton = createButton("Feed your dog!");
  feedbutton.position(700, 95)
  feedbutton.mousePressed(feedDog);

  addbutton = createButton("Buy food!");
  addbutton.position(800, 95)
  addbutton.mousePressed(addFood);

  refoffood = database.ref('Food');
  refoffood.on("value", readStock);

  readState = database.ref('gameState');
  readState.on("value", function (data) {
    gameState = data.val();
  })
}

function draw() {  
  background(46, 139, 87);

  if (gameState!=="Hungry") {
    feedbutton.hide();
    addbutton.hide();
    dog.remove();
  } else{
    feedbutton.show();
    addbutton.show();
    dog.addImage("dog", dogimg)
  }

  fill("white")
  text("Food Stock: "+ foodS, 100, 100);

  fedTime = database.ref('FeedTime')
  fedTime.on("value", function (data) {
    lastFed = data.val();
  })
  fill(255, 255, 254);
        textSize(15)
        if (lastFed>=12) {
            text("Last Fed: "+ lastFed%12 + "PM", 350, 30);
        } else if (lastFed === 0) {
            text("Last Fed: 12 AM", 350, 30);
        } else {
            text("Last Fed: "+ lastFed + "AM", 350, 30);
        }
  currentTime = hour();
  if (currentTime===(lastFed+1)) {
    update("Playing");
    foodObj.garden();
  } else if (currentTime===(lastFed+2)){
    update("Sleeping");
    foodObj.bedroom();
  } else if (currentTime>(lastFed+2)&&currentTime<(lastFed+4)){
    update("Bathing");
    foodObj.washroom();
  } else{
    update("Hungry");
    foodObj.display();
  }

  drawSprites();

}

function readStock(data) {
  foodS = data.val();
  foodObj.updateFoodStock(foodS)
}
function writeStock(x) {
  if(x<=0){
    x=0
  } else{
    x = x-1;
  }
  database.ref('/').update({
    Food:x
  })
}
function addFood() {
  foodS++
  database.ref('/').update({
    Food: foodS
  })
}
function feedDog(){
  dog.addImage("dog", happydogimg);
  if(foodS>0){
    foodObj.updateFoodStock(foodObj.getFoodStock()-1)
    database.ref('/').update({
      Food: foodObj.getFoodStock(),
      FeedTime:hour()
    })
  }
}
function update(state) {
  database.ref('/').update({
    gameState: state
  });
} 