if (Meteor.isServer) {

  Meteor.startup(function() {

    return Meteor.methods({

      removeAllPosts: function() {

        return Players.remove({});

      }

    });

  });

}