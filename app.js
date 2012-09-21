// Generated by CoffeeScript 1.3.3
(function() {
  var COLLECTION_LOAD_DELAY,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (!kb.loadUrl) {
    kb.loadUrl = function(url) {
      return window.location.hash = url;
    };
    kb.loadUrlFn = function(url) {
      return function(vm, event) {
        kb.loadUrl(url);
        (!vm || !vm.stopPropagation) || (event = vm);
        !(event && event.stopPropagation) || (event.stopPropagation(), event.preventDefault());
      };
    };
  }

  ko.bindingHandlers['classes'] = {
    update: function(element, value_accessor) {
      var key, state, _ref;
      _ref = ko.utils.unwrapObservable(value_accessor());
      for (key in _ref) {
        state = _ref[key];
        $(element)[ko.utils.unwrapObservable(state) ? 'addClass' : 'removeClass'](key);
      }
    }
  };

  ko.bindingHandlers['spinner'] = {
    init: function(element, value_accessor) {
      element.spinner = new Spinner(ko.utils.unwrapObservable(value_accessor())).spin(element);
      return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        !element.spinner || (element.spinner.stop(), element.spinner = null);
      });
    }
  };

  ko.bindingHandlers['fadeIn'] = {
    update: function(element, value_accessor) {
      !ko.utils.unwrapObservable(value_accessor()) || $(element).hide().fadeIn(500);
    }
  };

  window.Thing = Backbone.RelationalModel.extend({
    url: function() {
      return "things/" + (this.get('id'));
    },
    relations: [
      {
        type: 'HasMany',
        key: 'my_things',
        includeInJSON: 'id',
        relatedModel: 'Thing',
        reverseRelation: {
          key: 'my_owner',
          includeInJSON: 'id'
        }
      }
    ]
  });

  window.ThingCollection = Backbone.Collection.extend({
    localStorage: new Store('things-knockback'),
    model: Thing
  });

  COLLECTION_LOAD_DELAY = 500;

  Backbone.history || (Backbone.history = new Backbone.History());

  window.ApplicationViewModel = (function() {

    function ApplicationViewModel() {
      var _this = this;
      window.app = this;
      _.bindAll(this, 'afterBinding');
      this.collections = {
        things: new ThingCollection()
      };
      this.things_links = kb.collectionObservable(app.collections.things, {
        view_model: ThingLinkViewModel,
        filters: this.id,
        sort_attribute: 'name'
      });
      this.deleteAllThings = function() {
        var model, _i, _len, _ref;
        _ref = _.clone(_this.collections.things.models);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          model.destroy();
        }
      };
      this.saveAllThings = function() {
        var model, _i, _len, _ref;
        _ref = _this.collections.things.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          model.save();
        }
      };
      _.delay((function() {
        return _this.collections.things.fetch();
      }), COLLECTION_LOAD_DELAY);
      this.active_url = ko.observable(window.location.hash);
      this.nav_items = ko.observableArray([
        {
          name: 'Welcome',
          url: '',
          goTo: function(vm) {
            return kb.loadUrl(vm.url);
          }
        }, {
          name: 'Manage Things',
          url: '#things',
          goTo: function(vm) {
            return kb.loadUrl(vm.url);
          }
        }
      ]);
      this.credits_is_opened = ko.observable(false);
      this.toggleCredits = function() {
        return _this.credits_is_opened(!_this.credits_is_opened());
      };
      this.mode_menu_is_opened = ko.observable(false);
      this.toggleModeMenu = function() {
        return _this.mode_menu_is_opened(!_this.mode_menu_is_opened());
      };
      this.statistics = new StatisticsViewModel();
      this.goToApplication = function() {
        if (window.location.pathname.search('index_navigators.html') >= 0) {
          return window.location.pathname = window.location.pathname.replace('index_navigators.html', 'index.html');
        }
      };
      this.goToNavigatorsApplication = function() {
        if (window.location.pathname.search('index.html') >= 0) {
          return window.location.pathname = window.location.pathname.replace('index.html', 'index_navigators.html');
        }
      };
    }

    ApplicationViewModel.prototype.afterBinding = function(vm, el) {
      var _this = this;
      this.router = this.createRouter(el);
      Backbone.history.bind('route', function() {
        return _this.active_url(window.location.hash);
      });
      this.router.route('no_app', null, function() {
        _this.loadPage(null);
        return Backbone.Relational.store.clear();
      });
      return Backbone.history.start({
        hashChange: true
      });
    };

    ApplicationViewModel.prototype.loadPage = function(el) {
      if (this.active_el) {
        ko.removeNode(this.active_el);
      }
      if (!(this.active_el = el)) {
        return;
      }
      $('.pane-navigator.page').append(el);
      return $(el).addClass('active');
    };

    ApplicationViewModel.prototype.createRouter = function() {
      var router,
        _this = this;
      router = new Backbone.Router();
      router.route('', null, function() {
        return _this.loadPage(kb.renderTemplate('home', {}));
      });
      router.route('things', null, function() {
        return _this.loadPage(kb.renderTemplate('things_page', new ThingsPageViewModel()));
      });
      router.route('things/:id', null, function(id) {
        var model;
        model = _this.collections.things.get(id) || new Backbone.ModelRef(_this.collections.things, id);
        return _this.loadPage(kb.renderTemplate('thing_page', new ThingViewModel(model)));
      });
      return router;
    };

    return ApplicationViewModel;

  })();

  window.ApplicationNavigatorsViewModel = (function(_super) {

    __extends(ApplicationNavigatorsViewModel, _super);

    function ApplicationNavigatorsViewModel() {
      return ApplicationNavigatorsViewModel.__super__.constructor.apply(this, arguments);
    }

    ApplicationNavigatorsViewModel.prototype.createRouter = function(el) {
      var page_navigator, router;
      page_navigator = new kb.PageNavigatorPanes($(el).find('.pane-navigator.page')[0]);
      router = new Backbone.Router();
      router.route('', null, page_navigator.dispatcher(function() {
        return page_navigator.loadPage({
          create: function() {
            return kb.renderTemplate('home', {});
          },
          transition: {
            name: 'FadeIn',
            duration: 1000
          }
        });
      }));
      router.route('things', null, page_navigator.dispatcher(function() {
        return page_navigator.loadPage({
          create: function() {
            return kb.renderTemplate('things_page', new ThingsPageViewModel());
          },
          transition: 'NavigationSlide'
        });
      }));
      router.route('things/:id', null, page_navigator.dispatcher(function(id) {
        var model;
        model = app.collections.things.get(id) || new Backbone.ModelRef(app.collections.things, id);
        return page_navigator.loadPage({
          create: function() {
            return kb.renderTemplate('thing_page', new ThingViewModel(model));
          },
          transition: 'CoverVertical'
        });
      }));
      return router;
    };

    return ApplicationNavigatorsViewModel;

  })(ApplicationViewModel);

  kb.untilTrueFn = function(stand_in, fn, model) {
    var was_true;
    was_true = false;
    if (model && ko.isObservable(model)) {
      model.subscribe(function() {
        return was_true = false;
      });
    }
    return function(value) {
      var f, result;
      if (!(f = ko.utils.unwrapObservable(fn))) {
        return false;
      }
      was_true |= !(result = f(value));
      return (was_true ? result : stand_in);
    };
  };

  kb.untilFalseFn = function(stand_in, fn, model) {
    return function(value) {
      return !kb.untilTrueFn(stand_in, fn, model)(value);
    };
  };

  kb.minLengthFn = function(length) {
    return function(value) {
      return !value || value.length < length;
    };
  };

  kb.uniqueAttributeFn = function(model, key, collection) {
    return function(value) {
      var c, k, m,
        _this = this;
      m = ko.utils.unwrapObservable(model);
      k = ko.utils.unwrapObservable(key);
      c = ko.utils.unwrapObservable(collection);
      if (!(m && k && c)) {
        return false;
      }
      return !!_.find(c.models, function(test) {
        return (test !== m) && test.get(k) === value;
      });
    };
  };

  kb.hasChangedFn = function(model) {
    var attributes, m;
    m = null;
    attributes = null;
    return function() {
      var current_model;
      if (m !== (current_model = ko.utils.unwrapObservable(model))) {
        m = current_model;
        attributes = (m ? m.toJSON() : null);
        return false;
      }
      if (!(m && attributes)) {
        return false;
      }
      return !_.isEqual(m.toJSON(), attributes);
    };
  };

  window.ThingViewModel = kb.ViewModel.extend({
    constructor: function(model, options) {
      var _this = this;
      _.bindAll(this, 'onSubmit', 'onDelete', 'onStartEdit', 'onCancelEdit');
      kb.ViewModel.prototype.constructor.call(this, null, {
        requires: ['id', 'name', 'caption', 'my_owner', 'my_things'],
        factories: {
          'my_owner': ThingLinkViewModel,
          'my_things': ThingCollectionObservable
        },
        options: _.defaults({
          no_share: true
        }, options)
      });
      this.selected_things = kb.collectionObservable(new Backbone.Collection(), app.things_links.shareOptions());
      this.edit_mode = ko.observable(!model);
      this.syncViewToModel = ko.computed(function() {
        var current_model;
        if (!(current_model = _this.model())) {
          return;
        }
        _this.start_attributes = current_model.toJSON();
        return _this.selected_things(current_model.get('my_things').models);
      });
      model || (model = new Thing());
      this.is_loaded = ko.observable(model && model.isLoaded());
      model.bindLoadingStates(function(model) {
        _this.model(model);
        if (_this.edit_mode()) {
          _this.onStartEdit();
        }
        return _this.is_loaded(true);
      });
    },
    onSubmit: function() {
      var model;
      this.edit_mode(false);
      if (!(model = this.model())) {
        return;
      }
      this.my_things(this.selected_things.collection().models);
      if (model.isNew()) {
        app.collections.things.add(model);
        this.model(new Thing());
      }
      return model.save(null, {
        success: function() {
          return _.defer(app.saveAllThings);
        }
      });
    },
    onDelete: function() {
      var model;
      if (!(model = this.model())) {
        return;
      }
      if (model.isNew()) {
        this.model(new Thing());
        return;
      }
      model.destroy({
        success: function() {
          return _.defer(app.saveAllThings);
        }
      });
      return kb.loadUrl('things');
    },
    onStartEdit: function() {
      this.edit_mode(true);
      return this.syncViewToModel();
    },
    onCancelEdit: function() {
      var model;
      this.edit_mode(false);
      if ((model = this.model())) {
        model.clear();
        model.set(this.start_attributes);
      }
      return this.syncViewToModel();
    }
  });

  window.ThingCollectionObservable = kb.CollectionObservable.extend({
    constructor: function(collection, options) {
      return kb.CollectionObservable.prototype.constructor.call(this, collection, {
        view_model: ThingViewModel,
        options: options
      });
    }
  });

  window.ThingLinkViewModel = kb.ViewModel.extend({
    constructor: function(model, options) {
      kb.ViewModel.prototype.constructor.call(this, model, {
        keys: ['name', 'id'],
        options: options
      });
    }
  });

  window.ThingsPageViewModel = function() {
    this.things = kb.collectionObservable(app.collections.things, {
      view_model: ThingViewModel
    });
    this.new_thing = new ThingViewModel();
  };

}).call(this);
