define(function (require) {
	var backboneFSM = require('src/backbone-fsm')

	QUnit.module('backboneFSM')


	QUnit.test('mixin Model', function (assert) {
		var c1 = 0
		var c2 = 0
		var Model = backboneFSM.mixinModel(Backbone.Model.extend({
			fsm: {
				initial: 'hide',
				events: [
					{name: 'open', from: 'hide', to: 'show'},
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
		model.trans('open')
		model.trans('close', 'test')
		assert.equal(enterShowCount, 1)
		assert.equal(transCloseCount, 1)
		assert.equal(c1, 1)
		assert.equal(c2, 1)
	})

	QUnit.test('mixin View', function (assert) {
		var count = 0
		var View = backboneFSM.mixinView(Backbone.View.extend({
			fsm: {
				initial: 'hide',
				hide: {
					'click': function () {
						this.trans('open')
						count += 10
						this.$el.show()
					}
				},
				show: {
					'click': function () {
						this.trans('close')
						this.$el.hide()
						count += 1
					}
				},
				events: [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				]
			}
		}))

		var view = new View
		view.$el.click()
		assert.equal(count, 10)

		view.$el.click()
		assert.equal(count, 11)
	})
})