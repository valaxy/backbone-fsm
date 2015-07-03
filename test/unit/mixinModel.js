define(function (require) {
	var Backbone = require('backbone')
	var backboneFSM = require('src/backbone-fsm')
	var sinon = require('sinon')

	QUnit.module('backboneFSM.mixinModel()')

	QUnit.test('same state', function (assert) {
		var c1 = sinon.spy()
		var c2 = sinon.spy()
		var Model = backboneFSM.mixinModel(Backbone.Model.extend({
			fsm: {
				initial: 'hide',
				events : [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'again', from: 'show', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				]
			},

			initialize: function () {
				this.listenTo(this, 'enter:show', function (str) {
					c1()
					assert.equal(str, 'abc')
				})
				this.listenTo(this, 'after:again', c2)
			}
		}))
		var m = new Model

		m.trans('open', 'abc')
		m.trans('again')
		m.trans('again')
		m.trans('close')
		assert.equal(c1.callCount, 1) // only trigger once
		assert.equal(c2.callCount, 2)
	})

	QUnit.test('cancel event', function (assert) {
		var c1 = sinon.spy()
		var c2 = sinon.spy()
		var Model = backboneFSM.mixinModel(Backbone.Model.extend({
			fsm: {
				initial: 'hide',
				events : [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'again', from: 'show', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'},

					{name: 'totest', from: 'hide', to: 'test'},
					{name: 'noexec', from: 'test', to: 'hide'}
				]
			},

			initialize: function () {
				this.listenTo(this, 'before:again', function (options) {
					options.cancel = true
				})
				this.listenTo(this, 'leave:test', function (options) {
					options.cancel = true
				})

				this.listenTo(this, 'after:again', c1)
				this.listenTo(this, 'after:noexec', c2)
			}
		}))
		var m = new Model

		m.trans('open')
		m.trans('again')
		m.trans('again')
		m.trans('close')

		m.trans('totest')
		m.trans('noexec')

		assert.equal(c1.callCount, 0)
		assert.equal(c2.callCount, 0)
		assert.equal(m.state(), 'test')
	})
})