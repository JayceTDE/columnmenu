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
    mouseInOut.bind(self.el, 'mouseenter', self.deselect.bind(self));
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
 * Deselect selected menu items.
 *
 * @api private
 */

Menu.prototype.deselect = function () {
    var selected = query('.selected', this.el);
    selected && classes(selected).remove('selected');
};

/**
 * Bind keyboard events.
 *
 * @api private
 */

//Menu.prototype.bindKeyboardEvents = function(){
//  o(document).bind('keydown.menu', this.onkeydown.bind(this));
//  return this;
//};

/**
 * Unbind keyboard events.
 *
 * @api private
 */

//Menu.prototype.unbindKeyboardEvents = function(){
//  o(document).unbind('keydown.menu');
//  return this;
//};

/**
 * Handle keydown events.
 *
 * @api private
 */

/*
Menu.prototype.onkeydown = function(e){
  switch (e.keyCode) {
    // esc
    case 27:
      this.hide();
      break;
    // up
    case 38:
      e.preventDefault();
      this.move('prev');
      break;
    // down
    case 40:
      e.preventDefault();
      this.move('next');
      break;
  }
};
*/

/**
 * Focus on the next menu item in `direction`.
 *
 * @param {String} direction "prev" or "next"
 * @api public
 */

/*Menu.prototype.move = function(direction){
  var prev = this.el.find('.selected').eq(0);

  var next = prev.length
    ? prev[direction]()
    : this.el.find('li:first-child');

  if (next.length) {
    prev.removeClass('selected');
    next.addClass('selected');
    next.find('a').focus();
  }
};*/

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

Menu.prototype.add = function (text, value) {
    
    var self = this
      , slug
    ;
    
    if (typeof text === 'object') {
        for (var prop in text) {
            text.hasOwnProperty(prop) && self.add(prop, text[prop]);
        }
        return;
    }
    
    slug = createSlug(text);
    
    if (typeof value === 'object') {
        // Create submenu
        var sub = new Menu()
        sub.value = value.value;
        delete value.value;
        sub.add(value);
        sub._parent = self;
        sub.hide();
        document.body.appendChild(sub.el);
        value = sub;
    }
    
    var el = document.createElement('li');
    
    el.innerHTML = '<a href="#">' + text + '</a>';
    el.className = 'menu-item-' + slug;
    el.className += value instanceof Menu ? ' submenu' : '';
    this.el.appendChild(el);
    events.bind(el, 'click', function (e) {
        
        prevent(e);
        e.stopPropagation();
        
        clearTimeout(self._hoverTimer);
        
        self._current && self._current.hide();
        
        if (value instanceof Menu && typeof value.value === 'undefined') {
            var o = offset(el);
            value.moveTo(o.left + el.offsetWidth, o.top);
            value.show();
            self._current = value;
        } else {
            self.select(self.items[slug]);
        }
        
    });
    
    mouseInOut.bind(el, 'mouseenter', function (e) {
        
        clearTimeout(self._hoverTimer);
        
        self._hoverTimer = setTimeout(function () {
            
            self._current && self._current.hide();
            
            if (value instanceof Menu) {
                var o = offset(el);
                value.moveTo(o.left + el.offsetWidth, o.top);
                value.show();
                self._current = value;
            }
            
        }, 500);
        
    });

    self.items[slug] = { slug: slug, text: text, el: el, value: value };
    return self;
};

/**
 * Remove menu item with the given `slug`.
 *
 * @param {String} slug
 * @return {Menu}
 * @api public
 */

/*Menu.prototype.remove = function (slug) {
    slug = createSlug(slug);
    var item = this.items[slug];
    if (!item) throw new Error('no menu item named "' + slug + '"');
    this.emit('remove', slug);
    if (item._subs) {
        for (var i = 0, l = item._subs.length; i < l; i += 1) {
            item._subs[i].el.parentNode.removeChild(item._subs[i].el);
        }
    }
    item.el.parentNode.removeChild(item.el);
    delete this.items[slug];
    return this;
};*/

/**
 * Check if this menu has an item with the given `slug`.
 *
 * @param {String} slug
 * @return {Boolean}
 * @api public
 */

Menu.prototype.has = function (slug) {
    return !!this.items[createSlug(slug)];
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

/**
 * Generate a slug from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function createSlug(str) {
    return String(str)
        .toLowerCase()
        .replace(/ +/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}