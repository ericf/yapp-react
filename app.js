YUI({
    combine: false,
    filter : 'raw'
}).use('app-base', 'model', function (Y) {
    var ReactView = Y.Base.create('reactView', Y.View, [], {
        initializer: function () {
            // Auto-observe Models and ModelLists and render when they change.
            Y.Object.each(this.getAttrs(), function (val) {
                if (val && (val._isYUIModel || val._isYUIModelList)) {
                    val.after('change', this.render, this);
                }
            }, this);
        },

        render: function () {
            var component = this.get('component')(this.toJSON());
            React.renderComponent(component, this.get('container').getDOMNode());
            return this;
        },

        toJSON: function () {
            var data = {};

            Y.Object.each(this.getAttrs(), function (val, key) {
                if (val && typeof val.toJSON === 'function') {
                    val = val.toJSON();
                }

                data[key] = val;
            });

            return data;
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
