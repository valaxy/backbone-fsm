define(function (require) {
	var backboneFSM = require('src/backbone-fsm')

	QUnit.module('backboneFSM')


	QUnit.test('mixin()', function (assert) {
		var Model = Backbone.Model.extend({
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
		})
		backboneFSM.mixin(Model)

		var model = new Model
		model.open('test')
		model.close()
	})
})