define(function (require, exports) {
	require('backbone')
	var stateMachine = require('javascript-state-machine')
	var _ = require('underscore')


	var buildArguments = function (args, event, options) {
		args = Array.prototype.slice.call(args, 3)
		Array.prototype.splice.call(args, 0, 0, event)
		if (options !== undefined) {
			args.push(options)
		}
		return args
	}

	var addCallbacks = function (config) {
		config.callbacks = {
			onbeforeevent: (function (event) {
				var options = {cancel: false}
				this.trigger.apply(this, buildArguments(arguments, 'before:' + event, options))
				return !options.cancel
			}.bind(this)),
			onafterevent : (function (event) {
				this.trigger.apply(this, buildArguments(arguments, 'after:' + event))
			}).bind(this),
			onleavestate : (function (event, from, to) {
				var options = {cancel: false}
				this.trigger.apply(this, buildArguments(arguments, 'leave:' + from, options))
				return !options.cancel
			}).bind(this),
			onenterstate : (function (event, from, to) {
				this.trigger.apply(this, buildArguments(arguments, 'enter:' + to))
			}).bind(this)
		}
		return config
	}

	var delegateEventSplitter = /^(\S+)\s*(.*)$/


	// this is totally same with prototype.delegateEvents
	var delegateEvents = function (events) {
		for (var key in events) {
			var method = events[key]
			if (!_.isFunction(method)) method = this[events[key]]
			if (!method) continue

			var match = key.match(delegateEventSplitter)
			var eventName = match[1], selector = match[2]
			method = _.bind(method, this)
			eventName += '.delegateEvents' + this.cid
			if (selector === '') {
				this.$el.on(eventName, method)
			} else {
				this.$el.on(eventName, selector, method)
			}
		}
	}

	// for View
	var initView = function (config, fsm) {
		var fsmEvents = _.pick(config, function (value, key) {
			return ['initial', 'events'].indexOf(key) < 0
		})
		this._fsmInits = _.mapObject(fsmEvents, function (value) { // @todo 将这3个私有变量保存起来不太好
			if ('init' in value) {
				return value['init']
			} else {
				return null
			}
		})
		this._fsmEvents = _.mapObject(fsmEvents, function (value) {
			delete value['init']
			return value
		})
		this._fsm = fsm
	}


	var callInit = function (state) {
		this._fsmInits[state] ? this._fsmInits[state].call(this) : undefined
	}


	var bindCallbacks = function (config) {
		if (config.callbacks) {
			var c = config.callbacks
			for (var key in c) {
				c[key] = c[key].bind(this)
			}
		}
		return config
	}


	/** mixin any Backbone.View */
	exports.mixinView = function (BackboneView) {
		var oldSetElement = BackboneView.prototype.setElement
		var oldDelegateEvents = BackboneView.prototype.delegateEvents

		BackboneView.prototype.setElement = function () {
			var result = oldSetElement.apply(this, arguments)

			if (BackboneView.prototype.fsm) {
				var fsmConfig = BackboneView.prototype.fsm
				var fsm = stateMachine.create(bindCallbacks.call(this, fsmConfig))
				initView.call(this, fsmConfig, fsm)
				callInit.call(this, this._fsm.current)
			}

			return result
		}


		BackboneView.prototype.delegateEvents = function (events) {
			this.undelegateEvents() // always undelegate no matter `events` exist
			var result = oldDelegateEvents.apply(this, arguments)
			if (!events) { // no events
				delegateEvents.call(this, this._fsmEvents[this._fsm.current])
			}
			return result
		}


		BackboneView.prototype.trans = function (name) {
			var args = Array.prototype.slice.call(arguments, 1)
			this._fsm[name].apply(this._fsm, args)

			this.delegateEvents()

			var newState = this._fsm.current
			this._fsmInits[newState] ? this._fsmInits[newState].call(this) : undefined
		}


		BackboneView.prototype.state = function () {
			return this._fsm.current
		}

		return BackboneView
	}

	/** mixin any Backbone.Model */
	exports.mixinModel = function (BackboneModel) {
		var oldInitialize = BackboneModel.prototype.initialize

		BackboneModel.prototype.initialize = function () {
			var result = oldInitialize.apply(this, arguments)

			if (BackboneModel.prototype.fsm) {
				var fsmConfig = addCallbacks.call(this, BackboneModel.prototype.fsm)
				var fsm = stateMachine.create(fsmConfig)
				this._fsm = fsm
			}

			return result
		}

		BackboneModel.prototype.trans = function (name) {
			this._fsm[name].apply(this._fsm, Array.prototype.slice.call(arguments, 1))
		}

		BackboneModel.prototype.state = function () {
			return this._fsm.current
		}

		return BackboneModel
	}
})