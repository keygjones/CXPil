// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Stats = new Meteor.Collection("mystats");

if (Meteor.isClient) {

  Template.newPlayer.events({
	'click #newPlayerBtn':function(){
    el = document.getElementById("newPlayerName");
		var playerName = el.value;
    if(playerName){
		  Players.insert({name: playerName});	
      el.className ="form-control pull-left";
    }else{
      el.className = el.className + " error";
    }
	}
  });

  Template.deleteAll.events({
    'click #deleteAllBtn' : function () {
      if (confirm('Er du sikker på å du vill starte nytt spill? All info om forrige spill blir slettet.'))
      Meteor.call('removeAllPosts');
    }
    });

  Template.leaderboardMax.playersMax = function () {
    console.log('playersMax');
    return Players.find({maxScore: { $gt: 2 }}, {sort: {maxScore: -1, name: 1},limit:5});
  };

  Template.leaderboardMin.playersMin = function () {
    console.log('playersMin');
    maxPlayer = getMaxPlayer();
    if(typeof maxPlayer != 'undefined'){
      return Players.find({minScore: { $gt: 2},_id: {$not: maxPlayer._id}}, {sort: {minScore: 1, name: 1},limit:5});
    }
    return false;
  };

  function getMaxPlayer(){
    console.log('getMaxPlayer');
    return Players.findOne({maxScore: { $gt: 2 }}, {sort: {maxScore: -1, name: 1},limit:1});
  }

  Template.leaderboardCloseTofifty.playersFifty = function () {
    console.log('leaderboardCloseTofifty');
    maxPlayer = getMaxPlayer();
    minPlayer = Players.findOne({minScore: { $gt: 2}}, {sort: {minScore: 1, name: 1},limit:1});
    if(typeof maxPlayer != 'undefined' || typeof minPlayer != 'undefined'){
    if(minPlayer._id == maxPlayer._id) {
      console.log('same max and min');
      minPlayer = Players.findOne({minScore: { $gt: 2}}, {sort: {minScore: 1, name: 1},limit:2,skip:1});
    }
    
    console.log('min:'+ minPlayer.name);
    console.log('max:'+ maxPlayer.name);
    return Players.find({closeTofifty: {$type : 1},_id: {$nin: [maxPlayer._id,minPlayer._id]}}, {sort: {closeTofifty: 1, name: 1},limit:5});
    } else return false;
  };

  Template.leaderboard.players = function () {
    console.log('players');
    return Players.find();
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.playerMax.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
    var msg = new SpeechSynthesisUtterance('MAX for the win. Have some wine.');
    window.speechSynthesis.speak(msg);

  };

  Template.playerMin.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
      var msg = new SpeechSynthesisUtterance('Oh no that is so low.');
      window.speechSynthesis.speak(msg);
  };

  Template.playerFifty.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
        var msg = new SpeechSynthesisUtterance('Close to the best round number! Fair and square.');
        window.speechSynthesis.speak(msg);

  };


  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    },
    'click #deletePlayerBtn' : function () {
      console.log('About to remove player');
      var player = Session.get("selected_player");
      Players.remove(player);
    },
	'blur input#score1': function(event){
    var player = Session.get("selected_player");
    var new_value = event.currentTarget.value;
		Players.update(player, {$set:{score1:parseInt(new_value)}});
    recalculateMaxMin(player);
	},
	'blur input#score2': function(event){
		var player = Session.get("selected_player");
    var new_value = event.currentTarget.value;
    Players.update(player, {$set:{score2:parseInt(new_value)}});
    recalculateMaxMin(player);
	},
	'blur input#score3': function(event){
		var player = Session.get("selected_player");
    var new_value = event.currentTarget.value;
    Players.update(player, {$set:{score3:parseInt(new_value)}});
    recalculateMaxMin(player);
	}
  });
}

function recalculateMaxMin(player){
  var score1 = Players.findOne(player).score1;
  var score2 = Players.findOne(player).score2;
  var score3 = Players.findOne(player).score3;
  if(isNaN(score1)){score1=0;}
  if(isNaN(score2)){score2=0;}
  if(isNaN(score3)){score3=0;}
  console.log(score1 + ' - ' + score2 + ' - ' + score3);

  
  Players.update(player, {$set:{maxScore:Math.max(Math.abs(score1),Math.abs(score2),Math.abs(score3))}});
  
  //Uffff 
  if(score1>2&&score2>2&&score3>2){
    Players.update(player, {$set:{minScore:Math.min(score1,score2,score3)}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score1),Math.abs(50-score2),Math.abs(50-score3))}});
  }else if(score1>2&&score2>2){
    Players.update(player, {$set:{minScore:Math.min(score1,score2)}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score1),Math.abs(50-score2))}});
  }else if(score2>2&&score3>2){
    Players.update(player, {$set:{minScore:Math.min(score2,score3)}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score2),Math.abs(50-score3))}});
  }else if(score1>2&&score3>2){
    Players.update(player, {$set:{minScore:Math.min(score1,score3)}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score1),Math.abs(50-score3))}});
  }else if(score1>2){
    Players.update(player, {$set:{minScore:score1}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score1))}});
  }else if(score2>2){
    Players.update(player, {$set:{minScore:score2}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score2))}});
  }else if(score3>2){
    Players.update(player, {$set:{minScore:score3}});
    Players.update(player, {$set:{closeTofifty:Math.min(Math.abs(50-score3))}});
  }else{
	Players.update(player, {$set:{minScore:"NA"}});
        Players.update(player, {$set:{closeTofifty:"NA"}});
	}
  
}

