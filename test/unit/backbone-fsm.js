define(function (require) {
	var backboneFSM = require('src/backbone-fsm')

	QUnit.module('backboneFSM')


	QUnit.test('mixin Model', function (assert) {
		var Model = backboneFSM.mixin(Backbone.Model.extend({
			fsm: {
				initial: 'hide',
				events: [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				],
				callbacks: {
					onafteropen: function (event, from, to, msg) {
						assert.equal(this, model)
						assert.equal(msg, 'test')
					},
					onbeforeclose: function () {
						assert.equal(this, model)
					}
				}
			}
		}))

		var model = new Model
		model.open('test')
		model.close()
	})

	QUnit.test('mixin View', function (assert) {
		var count = 0
		var View = backboneFSM.mixinView(Backbone.View.extend({
			fsm: {
				initial: 'hide',
				hide: {
					'click': function () {
						count++
						this.$el.show()
					}
				},
				show: {
					'click': function () {
						count++
						this.$el.hide()
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
		assert.equal(count, 1)

		view.$el.click()
		assert.equal(count, 2)
	})
})