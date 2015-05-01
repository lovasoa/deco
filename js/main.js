var corners = ["left", "top", "right", "bottom"];

function Sentence(txts, answers){
  this.txts = txts;
  this.answers = answers;
};
Sentence.prototype.shuffle = function() {
  //Get shuffled answers
  var res = Array.prototype.slice.call(this.answers);
  for(var i=res.length-1; i>0; i--) {
    var j = Math.floor(Math.random() * i);
    var tmp = res[j];
    res[j] = res[i];
    res[i] = tmp;
  }
  this.shuffled = res;
};
Sentence.prototype.display = function display() {
  this.shuffle();
  for(var i=0; i<this.shuffled.length; i++) {
    $("#answer-"+corners[i]).text(this.shuffled[i]);
  }
  $("#question-0").text(this.txts[0]);
  if(this.txts.length > 1) {
    $("#question-1").text(this.txts[1]);
  }
};
Sentence.prototype.isCorrect = function isCorrect(num) {
  return this.shuffled[num] === this.answers[0];
};

function Game(sentences) {
  this.sentences = sentences;
  this.score = 0;
  this.current = -1;
  this.next();
};
Game.prototype.currentSentence = function() {
  return this.sentences[this.current];
};
Game.prototype.next = function() {
  this.current = (this.current + 1) % this.sentences.length;
  this.display();
  this.timeStarted = Date.now();
};
Game.prototype.play = function(num) {
  if (this.currentSentence().isCorrect(num)) {
    $(".answer").removeClass("incorrect");
    this.playSound("right");
    this.winPoints(1 + 5000 / (50 + Date.now() - this.timeStarted));
    this.next();
  } else {
    $("#answer-"+corners[num]).addClass("incorrect");
    this.playSound("wrong");
    this.winPoints(-10);
  }
};
Game.prototype.winPoints = function(points) {
  this.score = Math.max(0, this.score + Math.round(points))
  this.displayScore();
};
Game.prototype.display = function() {
  this.currentSentence().display();
  this.displayScore();
};
Game.prototype.displayScore = function() {
  $("#score").text(this.score);
};
Game.prototype.playSound = function(s) {
  var snd = $("#snd-"+s)[0];
  snd.fastSeek(0);
  snd.play();
};
Game.load = function(url) {
  $.ajax(url).done(function(res){
    var sentences = res
     .split("\n")
     .filter(function(x){
       return x.replace(/\s/g,"").length>0 && x[0] != '#';
     })
     .map(function(str){
      var opening = str.indexOf("(");
      var closing = str.indexOf(")");
      var txts = [str.slice(0, opening), str.slice(closing+1)];
      var answers = str.slice(opening+1,closing).split(",");
      return new Sentence(txts, answers);
    });
    game = new Game(sentences);
  });
}

var game; //Global game variable
Game.load("questions/test.txt");

window.onkeydown = function handleKeyDown(evt) {
  //Keybord arrows keycodes are 37, 38, 39 and 40
  var num = evt.keyCode - 37;
  if(0<= num && num < corners.length) {
    game.play(num);
  }
};
