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


	exports.mixin = function (Model) {
		var oldInitialize = Model.prototype.initialize

		Model.prototype.initialize = function () {
			if (Model.prototype.fsm) {
				var config = Model.prototype.fsm
				handleCallbacks(config, this)

				var fsm = stateMachine.create(config) // no change prototype
				mixinTransitions(config, fsm, this)
			}

			oldInitialize.apply(this, arguments)
		}
	}

})