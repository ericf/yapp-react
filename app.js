YUI({
    combine: false,
    filter : 'raw'
}).use('app-base', 'model', 'json', function (Y) {
    var ReactView = Y.Base.create('reactView', Y.View, [Y.Model], {
        initializer: function () {
            var ownAttrs = this.getOwnAttrs();

            // Create and render the React component
            this.component = this.get('component')(ownAttrs);
            React.renderComponent(this.component, this.get('container').getDOMNode());

            this.after('*:change', this.render, this);
            this.after('change', this.updateObservers, this);

            // Auto-observe Models and ModelLists and render when they change.
            Y.Object.each(ownAttrs, this.observe, this);
        },

        observe: function (obj) {
            this.observed || (this.observed = {});

            if (obj && typeof obj.addTarget === 'function' &&
                    (obj._isYUIModel || obj._isYUIModelList)) {

                this.observed[Y.stamp(obj, true)] = obj.addTarget(this);
            }
        },

        unobserve: function (obj) {
            this.observed || (this.observed = {});
            var id = obj && Y.stamp(obj, true);

            if (obj && this.observed[id]) {
                obj.removeTarget(this);
                delete this.observed[id];
            }
        },

        updateObservers: function (e) {
            if (e.target !== this) { return; }

            Y.Object.each(e.changed, function (attrChange) {
                this.unobserve(attrChange.prevVal);
                this.observe(attrChange.newVal);
            }, this);
        },

        render: function () {
            this.component.setProps(this.getOwnAttrs());
            return this;
        },

        getOwnAttrs: function () {
            var attrs = this.getAttrs();

            // Prune view-specific attributes.
            delete attrs.initialized;
            delete attrs.destroyed;
            delete attrs.container;
            delete attrs.component;
            delete attrs.id;
            delete attrs.clientId;

            return attrs;
        }
    }, {
        ATTRS: {
            component: {writeOnce: true}
        }
    });

    // -------------------------------------------------------------------------

    var Home = React.createClass({
        render: function () {
            return React.DOM.div(null, [
                React.DOM.h2(null, 'Home!'),
                React.DOM.p(null, 'Time: ' + this.props.time.get('now')),
                React.DOM.p(null, 'Routed Count: ' + this.props.routed.get('count')),
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

    app.counter = 0;

    app.route('/', function () {
        this.showView('home', {
            component: Home,
            time     : app.time,
            routed   : new Y.Model({count: app.counter += 1})
        }, {
            update: true,
            render: true
        });
    });

    app.route('/about/', function () {
        this.showView('about', {component: About});
    });

    app.render().dispatch();
});
