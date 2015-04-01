> This is under development, and API may change

backbone-fsm is a plugin of Backbone for and only for AMD module

## Config
`bower install valaxy/backbone-fsm --save`

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

## Use
```javascript
require('backbone')
var backboneFSM = require('backbone-fsm')

// mixin Model
var Model = Backbone.Model.extend({ ... })
backboneFSM.mixin(Model)

// mixin View
var View = backboneFSM.mixin(Backbone.View.extend({ ... }))
```

## Callbacks

## Events