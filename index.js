var Emitter = require('emitter')
  , classes = require('classes')
  , events = require('event')
  , prevent = require('prevent')

  , btnTemplate = document.createElement('span')
;

btnTemplate.className = 'sub-btn';
btnTemplate.innerHTML = '<span class="arrow"></span>';


module.exports = Menu;

function Menu() {
    var self = this;
    if (!(self instanceof Menu)) return new Menu();
    Emitter.call(self);
    self.el = document.createElement('ul');
    self.elClasses = classes(self.el).add('menu');
}

Menu.prototype = new Emitter();

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
      , subBtn
    ;
    
    el.innerHTML = '<a href="#">' + obj.name + '</a>';
    el.className = 'menu-item' + (obj.className ? ' ' + obj.className : '');
    
    self.el.appendChild(el);
    
    if (obj.children && obj.children.length) {
        
        sub = new Menu();
        
        sub.elClasses.add('child-menu');
        
        sub.data(obj.children);
        sub._parent = self;
        sub._parentArrowClasses = classes(el);
        sub.hide();
        
        subBtn = btnTemplate.cloneNode(true);
        
        events.bind(subBtn, 'click', function (e) {
            prevent(e);
            e.stopPropagation();
            
            sub.toggle();
        });
        
        self.el.insertBefore(sub.el, nextElementSibling(el));
        el.appendChild(subBtn);
        
        el.className += ' menu-parent';
        
    }
    
    if (!obj.noClick) {
    
        events.bind(el, 'click', function (e) {
            prevent(e);
            e.stopPropagation();
            
            self.select(obj);
            
        });
        
    }
    
    return self;
};

Menu.prototype.show = function () {
    this.emit('show');
    classes(this.el).remove('hidden');
    if (this._parentArrowClasses) this._parentArrowClasses.add('active');
    this._showing = true;
    return this;
};

Menu.prototype.hide = function () {
    this._current && this._current.hide();
    this.emit('hide');
    classes(this.el).add('hidden');
    if (this._parentArrowClasses) this._parentArrowClasses.remove('active');
    this._showing = false;
    return this;
};

Menu.prototype.toggle = function () {
    if (this._showing) return this.hide();
    return this.show();
};

Menu.prototype.select = function (item) {
    return this._parent ? this._parent.select(item) : this.emit('select', item);
};

function nextElementSibling(el) {
    do {
        el = el.nextSibling;
    } while ( el && el.nodeType !== 1 );
    return el;
}