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
		var View = backboneFSM.mixin(Backbone.View.extend({
			fsm: {
				initial: 'hide',
				events: [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				],
				callbacks: {
					onafteropen: function (event, from, to, msg) {
						assert.equal(this, view)
						assert.equal(msg, 'test')
					},
					onbeforeclose: function () {
						assert.equal(this, view)
					}
				}
			}
		}))

		var view = new View
		view.open('test')
		view.close()
	})
})