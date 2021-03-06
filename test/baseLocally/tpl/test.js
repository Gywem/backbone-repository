var test = function(name, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = null;
  }
  require('tape')(name, options, function(t) {
    // Clear storage.
    Backbone.Repository.storage().clear();
    // Clear local cache.
    User.reset();
    Admin.reset();

    callback(t);
  });
};

test('Stores a model to Storage.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1,
    name: "Nacho"
  });

  // Using localStorage sync.
  user.save({}, {
    mode: "localStorage"
  });

  serialized = Backbone.Repository.storage().get(user.storage().key());

  t.same(serialized, user.storage().serialize(),
    "Model has been sucessfully saved in storage by a storage method.");

  Backbone.Repository.storage().clear();

  // Using manager method.
  user.save({}, {
    mode: "client",
    localStorage: true
  });

  var serialized = Backbone.Repository.storage().get(user.storage().key());

  t.same(serialized, user.storage().serialize(),
    "Model has been sucessfully saved in storage by a model manager method.");

});

test('Removes a model from Storage.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1,
    name: "Nacho"
  });

  user.save({}, {
    mode: "localStorage"
  });

  // Using storage method.
  user.destroy({
    mode: "localStorage"
  });

  var serialized = Backbone.Repository.storage().get(user.storage().key());

  t.ok(!serialized,
    "Model has been sucessfully remove from storage by a storage method.");

  user.save({}, {
    mode: "localStorage"
  });

  // Using manager method.
  user.destroy({
    mode: "client",
    localStorage: true
  });

  var serialized = Backbone.Repository.storage().get(user.storage().key());

  t.ok(!serialized,
    "Model has been sucessfully remove from storage by a manager method.");

});

test('Loads a model and all its state (dirtied, changed and previous attributes, etc) from Storage.', function (t) {
  t.plan(7);

  var user = User.create({
    id: 1
  });

  user.save({
    name: "Nacho"
  }, {
    mode: "client",
    localStorage: true
  });

  user.destroy({
    mode: "client"
  });

  // Forces being fetched.
  user._fetched = true;

  // Forces being destroyed remotely.
  user._destroyed = true;

  user.save({}, {
    mode: "localStorage"
  });

  // Saving state values
  var attributes = _.omit(user.attributes, "cid");
  var dirtied = _.omit(user.dirtiedAttributes(), "cid");
  var dirtiedDestroyed = user.isDirtyDestroyed();

  var changed = user.changedAttributes();
  delete changed.cid;

  var previous = _.omit(user.previousAttributes(), "cid");
  var fetched = user.isFetched();
  var destroyed = user.isDestroyed();

  // Clearing state values.
  user.clearDirtied();
  user.attributes = {};
  user.changed = {};
  user._previousAttributes = {};
  user._fetched = false;
  user._destroyed = false;

  user.fetch({
    mode: "localStorage"
  });

  t.same(user.attributes, attributes,
    "Attributes have been recovered rightly.");

  t.same(user.dirtiedAttributes(), dirtied,
    "Dirtied attributes have been recovered rightly.");

  t.same(user.isDirtyDestroyed(), dirtiedDestroyed,
    "Dirty destroy value has been recovered rightly.");

  t.same(user.changedAttributes(), changed,
    "Changed attributes have been recovered rightly.");

  t.same(user.previousAttributes(), previous,
    "Previous attributes have been recovered rightly.");

  t.same(user.isFetched(), fetched,
    "Fetched state has been recovered rightly.");

  t.same(user.isDestroyed(), destroyed,
    "Destroyed state has been recovered rightly.");

});

test('Saves locally and Fetches an instance from Storage.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1,
    name: "Nacho"
  });

  user.save({}, {
    mode: "client",
    localStorage: true,
    success: function (model, response, options) {
      User.register().remove(user);
      user.clearDirtied();

      user.fetch({
        mode: "client",
        localStorage: true,
        success: function (model, response, options) {
          t.ok(User.register().get(user),
            "Model has been loaded again from storage.");
          t.ok(user.hasDirtied("name"),
            "Model has loaded its dirtied attributtes again.");
        }
      });

    }
  });

});

test('Stores and loads a collection from Storage by storage method.', function (t) {
  t.plan(3);

  var user = User.create({
    id: 1
  });

  var user2 = User.create();

  var users = new Users([user, user2]);

  users.save({
    mode: "localStorage"
  });

  // Clears collection.
  users.reset();

  users.fetch({
    mode: "localStorage"
  });

  t.ok(users.get(user),
    "Model has been reloaded.");
  t.ok(users.get(user2),
    "Model has been reloaded.");

  t.same(User.register().length, 2,
    "Two models are still only created.");
});

test('Removes a collection from Storage by storage method.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  var user2 = User.create();

  var users = new Users([user, user2]);

  users.save({}, {
    mode: "localStorage"
  });

  // Clears collection.
  users.reset();

  user.destroy({
    mode: "localStorage"
  });

  user.fetch({
    mode: "localStorage"
  });

  t.ok(!users.get(user),
    "Model is not longer in the collection.");
  t.ok(!users.get(user2),
    "Model is not longer in the collection.");
});

test('Set an empty collection to Storage by set method.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  var user2 = User.create();

  var users = new Users([user, user2]);

  users.save({}, {
    mode: "localStorage"
  });

  // Clears collection.
  users.reset();

  users.set([], {
    localStorage: true
  });

  user.fetch({
    mode: "localStorage"
  });

  t.ok(!users.get(user),
    "Model is not longer in the collection.");
  t.ok(!users.get(user2),
    "Model is not longer in the collection.");
});


test('Stores and loads a collection from Storage by manager method.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  var user2 = User.create();

  var users = new Users([user, user2]);

  users.save({
    mode: "client",
    localStorage: true
  });

  // Clears collection.
  users.reset({});

  users.fetch({
    mode: "client",
    localStorage: true
  });

  t.ok(users.get(user),
    "Model has been reloaded.");
  t.ok(users.get(user2),
    "Model has been reloaded.");
});

test('Removes a collection from Storage by manager method.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  var user2 = User.create();

  var users = new Users([user, user2]);

  users.save({
    mode: "client",
    localStorage: true
  });

  // Clears collection.
  users.reset();

  users.destroy({
    mode: "client",
    localStorage: true
  });

  users.fetch({
    mode: "client",
    localStorage: true
  });

  t.ok(!users.get(user),
    "Model is not longer in the collection.");
  t.ok(!users.get(user2),
    "Model is not longer in the collection.");
});

test('Stores a collection of local models to Storage and loads them back without creating new models.', function (t) {
  t.plan(3);

  var user = User.create();

  var user2 = User.create();

  var users = new Users([user, user2]);

  users.save({
    mode: "localStorage"
  });

  var users = new Users();

  users.fetch({
    mode: "localStorage"
  });

  t.ok(users.get(user),
    "Model has been reloaded.");
  t.ok(users.get(user2),
    "Model has been reloaded.");

  t.same(User.register().length, 2,
    "Two models are still only created.");
});

test('Fetches remotelly and then Fetches an instance from Storage.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  user.fetch({
    mode: "server",
    localStorage: true,
    success: function (model, response, options) {
      User.register().remove(user);

      // Clear fetch status.
      user._fetched = false;

      user.pull({
        mode: "server",
        localStorage: true,
        success: function (model, response, options) {
          t.ok(User.register().get(user),
            "Model has been loaded again from storage.");

          t.ok(model.isFetched(),
            "Model is marked as previously fetched.");
        },
        error: function (model, response, options) {
          t.fail();
        }
      });

    },
    error: function (model, response, options) {
      options.success();
    }
  });

});

test('Saves remotely and Fetches an instance from Storage. Wait option.', function (t) {
  t.plan(3);

  var user = User.create({
    id: 1
  });

  user.save({
    name: "Nacho"
  }, {
    mode: "server",
    localStorage: true,
    wait: true,
    success: function (model, response, options) {
      User.register().remove(user);

      user.fetch({
        mode: "client",
        localStorage: true,
        success: function (model, response, options) {
          t.ok(User.register().get(user),
            "Model has been loaded again from storage.");
          t.ok(!user.hasDirtied("name"),
            "Model has not dirtied attributtes.");
        }
      });

    },
    error: function (model, response, options) {
      User.register().remove(user);

      user.fetch({
        mode: "localStorage"
      });

      t.ok(!User.register().get(user),
        "Model has not been loaded from the storage as wait option.");

      options.success();
    }
  });

});

test('Saves remotely and Fetches an instance from Storage. No wait option.', function (t) {
  t.plan(4);

  var user = User.create({
    id: 1
  });

  user.save({
    name: "Nacho"
  }, {
    mode: "server",
    localStorage: true,
    wait: false,
    success: function (model, response, options) {
      User.register().remove(user);

      user.fetch({
        mode: "client",
        localStorage: true,
        success: function (model, response, options) {
          t.ok(User.register().get(user),
            "Model has been loaded again from storage.");
          t.ok(!user.hasDirtied(),
            "Model has not dirtied attributtes.");
        }
      });

    },
    error: function (model, response, options) {
      User.register().remove(user);

      user.fetch({
        mode: "localStorage"
      });

      t.ok(User.register().get(user),
        "Model has been loaded again from storage.");
      t.ok(user.hasDirtied("name"),
        "Model has dirtied attributtes.");

      options.success({
        surname: "Codoñer"
      });
    }
  });

});

test('Saves locally, Destroys locally and Fetches an instance from Storage.', function (t) {
  t.plan(1);

  var user = User.create({
    id: 1
  });

  user.save({
    name: "Nacho"
  }, {
    mode: "client",
    localStorage: true
  });

  user.destroy({
    mode: "client",
    localStorage: true,
    success: function (model, response, options) {
      User.register().remove(user);

      user.pull({
        mode: "server",
        localStorage: true,
        success: function (model, response, options) {
          t.fail();
        },
        error: function (model, response, options) {
          t.ok(!User.register().get(user),
            "Model has been removed from storage.");
        }
      });

    },
    error: function (model, response, options) {
      t.fail();
    }
  });

});

test('Saves locally, Destroys remotely and Fetches an instance from Storage. Wait option.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  user.save({
    name: "Nacho"
  }, {
    mode: "client",
    localStorage: true
  });

  user.destroy({
    mode: "server",
    localStorage: true,
    wait: true,
    success: function (model, response, options) {
      User.register().remove(user);

      user.fetch({
        mode: "client",
        localStorage: true,
        success: function (model, response, options) {
          t.ok(!User.register().get(user),
            "Model has been removed from storage.");
        }
      });

    },
    error: function (model, response, options) {
      User.register().remove(user);

      user.fetch({
        mode: "localStorage"
      });

      t.ok(User.register().get(user),
        "Model is still in the storage.");

      options.success();

    }
  });

});

test('Saves locally, Destroys remotely and Fetches an instance from Storage. No wait option.', function (t) {
  t.plan(2);

  var user = User.create({
    id: 1
  });

  user.save({
    name: "Nacho"
  }, {
    mode: "client",
    localStorage: true
  });

  user.destroy({
    mode: "server",
    localStorage: true,
    wait: false,
    success: function (model, response, options) {
      User.register().remove(user);

      user.pull({
        mode: "server",
        localStorage: true,
        success: function (model, response, options) {
          t.fail();
        },
        error: function (model, response, options) {
          t.ok(!User.register().get(user),
            "Model has been removed from storage.");
        }
      });

    },
    error: function (model, response, options) {
      User.register().remove(user);

      user.pull({
        mode: "server",
        localStorage: true,
        success: function (model, response, options) {
          t.fail();
        },
        error: function (model, response, options) {
          t.ok(!User.register().get(user),
            "Model has been removed from storage.");
        }
      });

      options.success();
    }
  });

});

test('Saves, fetches and destroys a local model.', function (t) {
  t.plan(2);

  var user = User.create();

  user.save({
    name: "Nacho"
  }, {
    mode: "client",
    localStorage: true
  });

  User.register().remove(user);

  user.fetch({
    mode: "client",
    localStorage: true,
    success: function (model, response, options) {
      t.ok(User.register().get(user),
        "Model has been loaded again from storage.");

      user.destroy({
        mode: "client",
        localStorage: true
      });

      // Forces clear the model in the local cache.
      User.register().remove(user);

      user.fetch({
        mode: "client",
        localStorage: true,
        success: function (model, response, options) {
          t.ok(!User.register().get(user),
            "Model has been removed from storage.");
        }
      });
    },
    error: function (model, response, options) {
      t.fail();
    }
  });

});

test('Stores and reloads local cache from Storage.', function (t) {
  t.plan(2);

  // Models are created.
  var user = User.create();
  var admin = Admin.create();

  // Saving local cache to Storage.

  User.register().save({
    mode: "localStorage"
  });
  Admin.register().save({
    mode: "localStorage"
  });

  // Resets local cache.
  User.register().reset();
  Admin.register().reset();

  // Reloads models from Storage.
  User.register().fetch({
    mode: "localStorage"
  });

  t.ok(User.register().at(0).sid === user.sid &&
    User.register().at(0).cid !== user.cid,
    "user has been reloaded. Different cid.");

  Admin.register().fetch({
    mode: "localStorage"
  });

  t.ok(Admin.register().at(0).sid === admin.sid &&
    Admin.register().at(0).cid !== admin.cid,
    "admin has been reloaded. Different cid.");
});
