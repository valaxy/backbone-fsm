> This is under development, but you can check what this module can do

Backbone-fsm is a plugin of Backbone which mixin fsm(finite state machine) to design a UI component, it's AMD module.

# Introduction
setup `bower install valaxy/backbone-fsm --save`

```javascript
requirejs.config({
    paths: {
        'jquery':                   'bower_components/jquery/dist/jquery.min',
        'underscore':               'bower_components/underscore/underscore-min',
        'backbone':                 'bower_components/backbone/backbone',
        'javascript-state-machine': 'bower_components/javascript-state-machine/state-machine',
        'backbone-fsm':             'bower_components/backbone-fsm/src/backbone-fsm'
    }
})

```

```javascript
require('backbone')
var backboneFSM = require('backbone-fsm')

// mixin Model
var Model = Backbone.Model.extend({ ... })
backboneFSM.mixin(Model)

// mixin View
var View = backboneFSM.mixin(Backbone.View.extend({
	events: {
		click: function () { // events will be override by fsm, so use fsm instead of events
			clickAll()
		}
	},
	fsm: {
		initial: 'hide',
		hide: {
			init: function () {
				// do something for state `hide`
			},
			click: function () {
				this.trans('open')
			}
		},
		show: {
			init: function () {
				// do something for state `show`
			},
			click: function () {
				this.trans('close')
			}
		},
		events: [
			{name: 'open', from: 'hide', to: 'show'},
			{name: 'close', from: 'show', to: 'hide'}
		]
	}
}))
```

## Details
I'm too lazy to write the document, please check the unit test to study what `backbone-fsm` can do