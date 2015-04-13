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
	var initView = function (config, fsm, context) {
		var fsmEvents = _.pick(config, function (value, key) {
			return ['initial', 'events'].indexOf(key) < 0
		})
		context._fsmInits = _.mapObject(fsmEvents, function (value) {
			if ('init' in value) {
				return value['init']
			} else {
				return null
			}
		})
		context._fsmEvents = _.mapObject(fsmEvents, function (value) {
			delete value['init']
			return value
		})
		context._fsm = fsm
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
		var oldSetElement = BackboneView.prototype.setElement
		var oldDelegateEvents = BackboneView.prototype.delegateEvents

		BackboneView.prototype.setElement = function () { // @todo
			var result = oldSetElement.apply(this, arguments)

			if (BackboneView.prototype.fsm) {
				var fsmConfig = BackboneView.prototype.fsm
				var fsm = stateMachine.create(fsmConfig)
				initView(fsmConfig, fsm, this)
			}

			return result
		}


		BackboneView.prototype.delegateEvents = function (events) {
			if (!(events)) { // no events
				events = _.result(this, 'events')
				return oldDelegateEvents.call(this, _.extend({}, events, this._fsmEvents[this._fsm.current]))
			} else {
				return oldDelegateEvents.apply(this, arguments)
			}
		}


		BackboneView.prototype.trans = function (name) {
			var args = Array.prototype.slice.call(arguments, 1)

			this._fsm[name].apply(this._fsm, args)
			this.delegateEvents()

			var newState = this._fsm.current
			this._fsmInits[newState] ? this._fsmInits[newState].call(this) : undefined
		}

		return BackboneView
	}
})