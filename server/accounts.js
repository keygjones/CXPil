if (Meteor.isServer) {

  Meteor.startup(function() {

    return Meteor.methods({

      removeAllPosts: function() {
	var thisGame = Players.find();
	var count = 0;
		thisGame.forEach(function (player) {
  			console.log("player nr " + count + ": " + player.name);
  			Stats.insert(player);
 		 	count += 1;
	});

        return Players.remove({});

      }

    });

  });

}