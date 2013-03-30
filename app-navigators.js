// Generated by CoffeeScript 1.4.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ApplicationNavigatorsViewModel = (function(_super) {

    __extends(ApplicationNavigatorsViewModel, _super);

    function ApplicationNavigatorsViewModel() {
      return ApplicationNavigatorsViewModel.__super__.constructor.apply(this, arguments);
    }

    ApplicationNavigatorsViewModel.prototype.createRouter = function(el) {
      var clearFilter, page_navigator, router,
        _this = this;
      page_navigator = new kb.PageNavigatorPanes($(el).find('.pane-navigator.page')[0]);
      clearFilter = ko.computed(function() {
        var _ref;
        if (((_ref = page_navigator.activePage()) != null ? _ref.url : void 0) === 'things') {
          app.things_links.filters(null);
        }
        return _this.loadApp(!!page_navigator.activePage());
      });
      router = new Backbone.Router();
      router.route('', null, page_navigator.dispatcher(function() {
        return page_navigator.loadPage({
          create: function() {
            return kb.renderTemplate('home', {});
          },
          transition: {
            name: 'FadeIn',
            slow: true
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
        return page_navigator.loadPage({
          create: function() {
            var model, view_model;
            model = app.collections.things.get(id) || new Backbone.ModelRef(app.collections.things, id);
            view_model = new ThingViewModel(model);
            app.things_links.filters(view_model.id);
            return kb.renderTemplate('thing_page', view_model);
          },
          transition: 'CoverVertical'
        });
      }));
      router.route('no_app', null, function() {
        return page_navigator.clear();
      });
      return router;
    };

    return ApplicationNavigatorsViewModel;

  })(ApplicationViewModel);

}).call(this);
