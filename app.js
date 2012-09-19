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
        if (event && event.stopPropagation) {
          event.stopPropagation();
          return event.preventDefault();
        }
      };
    };
  }

  ko.bindingHandlers['classes'] = {
    update: function(element, value_accessor) {
      var key, state, _ref;
      _ref = ko.utils.unwrapObservable(value_accessor());
      for (key in _ref) {
        state = _ref[key];
        if (state) {
          $(element).addClass(key);
        } else {
          $(element).removeClass(key);
        }
      }
    }
  };

  ko.bindingHandlers['spinner'] = {
    init: function(element, value_accessor) {
      element.spinner = new Spinner(ko.utils.unwrapObservable(value_accessor())).spin(element);
      return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        if (element.spinner) {
          element.spinner.stop();
          return element.spinner = null;
        }
      });
    }
  };

  ko.bindingHandlers['fadeIn'] = {
    update: function(element, value_accessor) {
      if (!!ko.utils.unwrapObservable(value_accessor())) {
        return $(element).hide().fadeIn(500);
      }
    }
  };

  window.utils || (window.utils = {});

  window.utils.decrementClampedObservable = function(observable) {
    var value;
    value = observable();
    if (value > 0) {
      observable(--value);
    }
    return value;
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
      this.deleteAllThings = function() {
        var model, _i, _len, _ref, _results;
        _ref = _.clone(_this.collections.things.models);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(model.destroy());
        }
        return _results;
      };
      this.saveAllThings = function() {
        var model, _i, _len, _ref, _results;
        _ref = _this.collections.things.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(model.hasChanged() ? model.save() : void 0);
        }
        return _results;
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
          url: 'things',
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
        return _this.loadPage(kb.renderTemplate('thing_page', new ThingCellViewModel(model)));
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
            return kb.renderTemplate('thing_page', new ThingCellViewModel(model));
          },
          transition: 'CoverVertical'
        });
      }));
      return router;
    };

    return ApplicationNavigatorsViewModel;

  })(ApplicationViewModel);

  window.NewThingViewModel = kb.ViewModel.extend({
    constructor: function() {
      var model,
        _this = this;
      _.bindAll(this, 'onAdd', 'onClear');
      kb.ViewModel.prototype.constructor.call(this, model = new Thing(), {
        requires: ['id', 'name', 'caption'],
        excludes: ['my_things']
      });
      this.my_things_select = ko.observableArray();
      this.available_things = kb.collectionObservable(app.collections.things, {
        sort_attribute: 'name',
        view_model: ThingLinkViewModel
      });
      this.validations_filter_count = ko.observable(2);
      this.name_errors = ko.computed(function() {
        var errors, name;
        if (!(name = _this.name())) {
          errors = 'Things like names';
        } else if (_.find(app.collections.things.models, function(test) {
          return test.get('name') === name;
        })) {
          errors = "" + name + " already taken";
        }
        if (utils.decrementClampedObservable(_this.validations_filter_count)) {
          return '';
        } else {
          return errors;
        }
      });
    },
    onAdd: function() {
      var model;
      this.validations_filter_count(0);
      if (this.name_errors()) {
        return;
      }
      model = kb.utils.wrappedObject(this);
      model.get('my_things').reset(_.map(this.my_things_select(), function(vm) {
        return kb.utils.wrappedModel(vm);
      }));
      app.collections.things.add(model);
      model.save(null, {
        success: function() {
          return _.defer(app.saveAllThings);
        }
      });
      return this.onClear();
    },
    onClear: function() {
      this.validations_filter_count(3);
      this.my_things_select([]);
      return this.model(new Thing());
    }
  });

  window.ThingCellViewModel = kb.ViewModel.extend({
    constructor: function(model, options) {
      var _this = this;
      kb.ViewModel.prototype.constructor.call(this, model, {
        requires: ['id', 'name', 'caption', 'my_things', 'my_owner'],
        factories: {
          'my_things': ThingCellCollectionObservable,
          'my_owner': ThingLinkViewModel
        },
        options: options
      });
      this.my_things_select = ko.observableArray(this.my_things());
      this.my_things.subscribe(function(value) {
        return _this.my_things_select(value);
      });
      this.available_things = new ThingCellCollectionObservable(app.collections.things, {
        filters: this.id,
        sort_attribute: 'name',
        options: this.my_things.value().shareOptions()
      });
      this.sorted_thing_links = kb.collectionObservable(app.collections.things, {
        view_model: ThingLinkViewModel,
        sort_attribute: 'name'
      });
      this.edit_mode = ko.observable(false);
      this.name_errors = ko.computed(function() {
        var name;
        if (!(name = _this.name())) {
          return 'Things like names';
        } else if (_.find(app.collections.things.models, function(test) {
          return (test.get('name') === name) && (test.get('id') !== _this.id());
        })) {
          return "" + name + " already taken";
        }
      });
      this.my_model = model;
      this.is_loaded = ko.observable(model && model.isLoaded());
      this._onModelLoaded = function(m) {
        _this.start_attributes = m.toJSON();
        return _this.is_loaded(true);
      };
      !model || model.bindLoadingStates(this._onModelLoaded);
    },
    onEdit: function() {
      this.my_things_select(this.my_things());
      return this.edit_mode(true);
    },
    onDelete: function() {
      var model;
      if ((model = kb.utils.wrappedObject(this))) {
        model.destroy({
          success: function() {
            return _.defer(app.saveAllThings);
          }
        });
      }
      return kb.loadUrl('things');
    },
    onSubmit: function() {
      var model;
      if (this.name_errors()) {
        return;
      }
      if ((model = kb.utils.wrappedObject(this))) {
        model.get('my_things').reset(_.map(this.my_things_select(), function(vm) {
          return kb.utils.wrappedModel(vm);
        }));
        app.saveAllThings();
      }
      return this.edit_mode(false);
    },
    onCancel: function() {
      var model;
      if ((model = kb.utils.wrappedObject(this))) {
        model.set(this.start_attributes);
      }
      return this.edit_mode(false);
    }
  });

  window.ThingCellCollectionObservable = kb.CollectionObservable.extend({
    constructor: function(collection, options) {
      return kb.CollectionObservable.prototype.constructor.call(this, collection, {
        view_model: ThingCellViewModel,
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
    this.sorted_thing_links = kb.collectionObservable(app.collections.things, {
      view_model: ThingLinkViewModel,
      sort_attribute: 'name'
    });
    this.things = kb.collectionObservable(app.collections.things, {
      view_model: ThingCellViewModel
    });
    this.new_thing = new NewThingViewModel();
  };

}).call(this);
