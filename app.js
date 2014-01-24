YUI({
    combine: false,
    filter : 'raw'
}).use('app-base', 'model', 'json', function (Y) {
    var ReactView = Y.Base.create('reactView', Y.View, [], {
        initializer: function () {
            // Create and render the React component
            this.component = this.get('component')(this.getProps());
            React.renderComponent(this.component, this.get('container').getDOMNode());

            // Auto-observe Models and ModelLists and render when they change.
            Y.Object.each(this.getAttrs(), function (val) {
                if (val && (val._isYUIModel || val._isYUIModelList)) {
                    val.after('change', this.render, this);
                }
            }, this);
        },

        render: function () {
            this.component.setProps(this.getProps());
            return this;
        },

        getProps: function () {
            var attrs = this.getAttrs();

            // Prune view-specific attributes.
            delete attrs.initialized;
            delete attrs.destroyed;
            delete attrs.container;
            delete attrs.component;

            // Poor-mans clone which calls `toJSON()` on Models and ModelLists.
            return Y.JSON.parse(Y.JSON.stringify(attrs));
        }
    });

    var Home = React.createClass({
        render: function () {
            return React.DOM.div(null, [
                React.DOM.h2(null, 'Home!'),
                React.DOM.p(null, 'Time: ' + this.props.time.now),
                React.DOM.a({href: '/about/'}, 'about')
            ]);
        }
    });

    var About = React.createClass({
        render: function () {
            return React.DOM.div(null, [
                React.DOM.h2(null, 'About!'),
                React.DOM.a({href: '/'}, 'home')
            ]);
        }
    });

    var app = new Y.App({
        serverRouting: false,
        viewContainer: '#content',

        views: {
            home: {
                type    : ReactView,
                preserve: true
            },

            about: {
                type    : ReactView,
                preserve: true
            }
        }
    });

    app.time = new Y.Model({now: Date.now()});
    setInterval(function () {
        app.time.set('now', Date.now());
    }, 1000);

    app.route('/', function () {
        this.showView('home', {
            component: Home,
            time     : app.time
        });
    });

    app.route('/about/', function () {
        this.showView('about', {component: About});
    });

    app.render().dispatch();
});
