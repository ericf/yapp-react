YUI({
    combine: false,
    filter : 'raw'
}).use('app-base', function (Y) {
    var ReactView = Y.Base.create('reactView', Y.View, [], {
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
                instance: new ReactView({component: Home}),
                preserve: true
            },

            about: {
                instance: new ReactView({component: About}),
                preserve: true
            }
        }
    });

    app.route('/', function () {
        this.showView('home', {}, {render: true});
    });

    app.route('/about/', function () {
        this.showView('about', {}, {render: true});
    });

    app.render().dispatch();
});
