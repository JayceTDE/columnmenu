/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , query = require('query')
  , classes = require('classes')
  , events = require('event')
  , mouseInOut = require('mouse-inout')
  , prevent = require('prevent')
  , offset = require('offset')
;

//Events
//classes
//mouseinout

/**
 * Expose `Menu`.
 */

module.exports = Menu;

/**
 * Initialize a new `Menu`.
 *
 * Emits:
 *
 *   - "show" when shown
 *   - "hide" when hidden
 *   - "remove" with the item name when an item is removed
 *   - "select" (item) when an item is selected
 *   - * menu item events are emitted when clicked
 *
 * @api public
 */

function Menu() {
    var self = this;
    if (!(self instanceof Menu)) return new Menu;
    Emitter.call(self);
    self._current = null;
    self.items = {};
    self.el = document.createElement('ul');
    self.el.className = 'menu';
    mouseInOut.bind(self.el, 'mouseleave', function () {
        clearTimeout(self._hoverTimer);
    });
    events.bind(document.documentElement, 'click', self.hide.bind(self));
    //this.on('show', this.bindKeyboardEvents.bind(this));
    //this.on('hide', this.unbindKeyboardEvents.bind(this));
}

/**
 * Inherit from `Emitter.prototype`.
 */

Menu.prototype = new Emitter;

/**
 * Add menu item with the given `text` and optional callback `fn`.
 *
 * When the item is clicked `fn()` will be invoked
 * and the `Menu` is immediately closed. When clicked
 * an event of the name `text` is emitted regardless of
 * the callback function being present.
 *
 * @param {String} text
 * @param {Function} fn
 * @return {Menu}
 * @api public
 */

Menu.prototype.data = function (arr) {
    for (var i = 0, l = arr.length; i < l; i += 1) {
        this.add(arr[i]);
    }
};

Menu.prototype.add = function (obj) {
    
    var self = this
      , el = document.createElement('li')
      , sub
      , o
    ;
    
    el.innerHTML = '<a href="#">' + obj.name + '</a>';
    el.className = 'menu-item';
    
    self.el.appendChild(el);
    
    if (obj.children) {
        sub = new Menu();
        sub.data(obj.children);
        sub._parent = self;
        sub.hide();
        document.body.appendChild(sub.el);
        el.className += ' menu-parent';
    }
    
    events.bind(el, 'click', function (e) {
        prevent(e);
        e.stopPropagation();
        
        clearTimeout(self._hoverTimer);
        self._current && self._current.hide();
        
        self._current = null;
        
        self.select(obj);
        
        /*if (sub) {
            if (obj._id) return self.select(obj);
            o = offset(el);
            sub.moveTo(o.left + el.offsetWidth, o.top - 1);
            
            sub.show();
            self._current = sub;
        } else {
            self.select(obj);
        }*/
    });
    
    mouseInOut.bind(el, 'mouseenter', function (e) {
        clearTimeout(self._hoverTimer);
        self._hoverTimer = setTimeout(function () {
            self._current && self._current.hide();
            self._current = null;
            
            if (sub) {
                o = offset(el);
                sub.moveTo(o.left + el.offsetWidth, o.top - 1);
                
                sub.show();
                self._current = sub;
            }
        })
    });
    
    return self;
};

/**
 * Move context menu to `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Menu}
 * @api public
 */

Menu.prototype.moveTo = function (x, y) {
    this.el.style.top = y + 'px';
    this.el.style.left = x + 'px';
    return this;
};

/**
 * Show the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.show = function () {
    this.emit('show');
    classes(this.el).remove('hidden');
    return this;
};

/**
 * Hide the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.hide = function () {
    this._current && this._current.hide();
    this.emit('hide');
    classes(this.el).add('hidden');
    return this;
};

Menu.prototype.select = function (item) {
    this.hide();
    return this._parent ? this._parent.select(item) : this.emit('select', item);
};