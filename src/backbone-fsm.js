define(function (require, exports) {
	require('backbone')
	var stateMachine = require('javascript-state-machine')
	var _ = require('underscore')


	var handleCallbacks = function (config, context) {
		for (var name in config.callbacks) {
			config.callbacks[name] = config.callbacks[name].bind(context)
		}
	}

	var mixinTransitions = function (config, fsm, context) {
		var transitions = _.map(config.events, function (transition) {
			return transition.name
		})
		transitions = _.uniq(transitions)

		// bind all functions
		_.each(transitions, function (tran) {
			context[tran] = fsm[tran].bind(fsm)
		})
	}

	var mixinTransitions2 = function (config, fsm, context) {
		// store private properties
		context._fsmEvents = _.pick(config, function (value, key) {
			return ['initial', 'events'].indexOf(key) < 0
		})
		context._fsm = fsm

		// bind initial
		context.delegateEvents(context._fsmEvents[config.initial])
	}

	exports.mixin = function (BackboneClass) {
		var oldInitialize = BackboneClass.prototype.initialize

		BackboneClass.prototype.initialize = function () {
			if (BackboneClass.prototype.fsm) {
				var config = BackboneClass.prototype.fsm
				handleCallbacks(config, this)

				var fsm = stateMachine.create(config) // no change prototype
				mixinTransitions(config, fsm, this)
			}

			oldInitialize.apply(this, arguments)
		}

		return BackboneClass
	}


	// View don't need callbacks
	exports.mixinView = function (BackboneView) {
		var oldInitialize = BackboneView.prototype.initialize

		BackboneView.prototype.initialize = function () {
			if (BackboneView.prototype.fsm) {
				var config = BackboneView.prototype.fsm
				var fsm = stateMachine.create(config) // no change prototype
				mixinTransitions2(config, fsm, this)
			}

			oldInitialize.apply(this, arguments)
		}

		BackboneView.prototype.trans = function (name) {
			this.undelegateEvents(this._fsmEvents[this._fsm.current])
			this._fsm[name].apply(this._fsm, arguments)
			this.delegateEvents(this._fsmEvents[this._fsm.current])
		}

		return BackboneView
	}
})