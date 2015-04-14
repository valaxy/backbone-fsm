define(function (require) {
	var Backbone = require('backbone')
	var backboneFSM = require('src/backbone-fsm')
	var StateMachine = require('javascript-state-machine')
	var sinon = require('sinon')

	QUnit.module('backboneFSM.mixinModel()')

	QUnit.test('same state', function (assert) {
		var c1 = 0
		var c2 = 0
		var fsm = StateMachine.create({
			initial: 'hide',
			events: [
				{name: 'open', from: 'hide', to: 'show'},
				{name: 'again', from: 'show', to: 'show'},
				{name: 'close', from: 'show', to: 'hide'}
			],
			callbacks: {
				onentershow: function () {
					c1++
				},
				onafteragain: function () {
					c2++
				}
			}
		})
		fsm.open()
		fsm.again()
		fsm.again()
		fsm.close()
		assert.equal(c1, 1)
		assert.equal(c2, 2)
	})

	QUnit.test('mixinModel()', function (assert) {
		var c1 = 0
		var c2 = 0
		var Model = backboneFSM.mixinModel(Backbone.Model.extend({
			fsm: {
				initial: 'hide',
				events: [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'again', from: 'show', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				],
				callbacks: {
					onclose: function () {
						c1++
					},
					onopen: function () {
						c2++
					}
				}
			}
		}))

		var model = new Model
		var enterShowCount = 0
		model.listenTo(model, 'to:show', function () {
			enterShowCount++
			assert.equal(this, model)
		})
		var transCloseCount = 0
		model.listenTo(model, 'trans:close', function (msg) {
			assert.equal(this, model)
			assert.equal(msg, 'test')
			transCloseCount++
		})

		assert.equal(model.state(), 'hide')

		model.trans('open')
		assert.equal(model.state(), 'show')

		model.trans('again')
		model.trans('again')
		assert.equal(model.state(), 'show')

		model.trans('close', 'test')
		assert.equal(model.state(), 'hide')

		assert.equal(enterShowCount, 1)
		assert.equal(transCloseCount, 1)
		assert.equal(c1, 1)
		assert.equal(c2, 1)
	})
})