define(function (require, exports) {
	require('backbone')
	var stateMachine = require('javascript-state-machine')
	var _ = require('underscore')


	var handleCallbacks = function (config, context) {
		for (var name in config.callbacks) {
			config.callbacks[name] = config.callbacks[name].bind(context)
		}
	}


	var clearArguments = function (args, event) {
		args = Array.prototype.slice.call(args, 3)
		Array.prototype.splice.call(args, 0, 0, event)
		return args
	}

	var addCallbacks = function (config) {
		config.callbacks = _.extend(config.callbacks, {
			onenterstate: function (event, from, to) {
				this.trigger.apply(this, clearArguments(arguments, 'to:' + to))
			},
			onafterevent: function (event) {
				this.trigger.apply(this, clearArguments(arguments, 'trans:' + event))
			}
		})
	}


	//// for Model
	//var mixinTransitions = function (config, fsm, context) {
	//	var transitions = _.map(config.events, function (transition) {
	//		return transition.name
	//	})
	//	transitions = _.uniq(transitions)
	//
	//	// bind all functions
	//	_.each(transitions, function (tran) {
	//		context[tran] = fsm[tran].bind(fsm)
	//	})
	//}


	// for View
	var mixinTransitions2 = function (config, fsm, context) {
		// store private properties
		context._fsmEvents = _.pick(config, function (value, key) {
			return ['initial', 'events'].indexOf(key) < 0
		})
		context._fsm = fsm

		// bind initial
		context.delegateEvents(context._fsmEvents[config.initial])
	}


	/** Only Model */
	exports.mixinModel = function (BackboneClass) {
		var oldInitialize = BackboneClass.prototype.initialize

		BackboneClass.prototype.initialize = function () {
			oldInitialize.apply(this, arguments)

			if (BackboneClass.prototype.fsm) {
				var config = BackboneClass.prototype.fsm
				addCallbacks(config, this)
				handleCallbacks(config, this)

				var fsm = stateMachine.create(config) // no change prototype
				//mixinTransitions(config, fsm, this)
				this._fsm = fsm
			}
		}

		BackboneClass.prototype.trans = function (name) {
			this._fsm[name].apply(this._fsm, Array.prototype.slice.call(arguments, 1))
		}

		BackboneClass.prototype.state = function () {
			return this._fsm.current
		}

		return BackboneClass
	}


	// View don't need callbacks
	/** Only View */
	exports.mixinView = function (BackboneView) {
		var oldInitialize = BackboneView.prototype.initialize
		var oldSetElement = BackboneView.prototype.setElement

		//BackboneView.prototype.initialize = function () {
		//	oldInitialize.apply(this, arguments)
		//}

		BackboneView.prototype.setElement = function () {
			oldSetElement.apply(this, arguments)

			if (BackboneView.prototype.fsm) {
				var config = BackboneView.prototype.fsm
				var fsm = stateMachine.create(config) // no change prototype
				mixinTransitions2(config, fsm, this)
			}
		}

		BackboneView.prototype.trans = function (name) {
			this.undelegateEvents(this._fsmEvents[this._fsm.current])
			this._fsm[name].apply(this._fsm, Array.prototype.slice.call(arguments, 1))
			this.delegateEvents(this._fsmEvents[this._fsm.current])
		}

		return BackboneView
	}
})