define(function (require) {
	var Backbone = require('backbone')
	var backboneFSM = require('src/backbone-fsm')
	var sinon = require('sinon')

	QUnit.module('backboneFSM.mixinView()')

	QUnit.test('trans()/state()', function (assert) {
		var View = backboneFSM.mixinView(Backbone.View.extend({
			fsm: {
				initial: 's0',
				s0     : {
					click: function () {
						this.trans('01')
					}
				},
				s1     : {
					click: function () {
						this.trans('12')
					}
				},
				s2     : {
					click: function () {
						this.trans('20')
					}
				},
				events : [
					{name: '01', from: 's0', to: 's1'},
					{name: '12', from: 's1', to: 's2'},
					{name: '20', from: 's2', to: 's0'}
				]
			}
		}))

		var v = new View
		assert.equal(v.state(), 's0')

		v.$el.click()
		assert.equal(v.state(), 's1')

		v.$el.click()
		assert.equal(v.state(), 's2')

		v.$el.click()
		assert.equal(v.state(), 's0')

		v.$el.click()
		assert.equal(v.state(), 's1')
	})

	QUnit.test('a full complete example', function (assert) {
		var hideSpy = sinon.spy()
		var showSpy = sinon.spy()
		var clickWhenHide = sinon.spy()
		var clickWhenShow = sinon.spy()
		var clickAll = sinon.spy()
		var View = backboneFSM.mixinView(Backbone.View.extend({
			events: {
				click: function () {
					clickAll()
				}
			},
			fsm   : {
				initial: 'hide',
				hide   : {
					init : function () {
						hideSpy()
					},
					click: function () {
						this.trans('open')
						clickWhenHide()
					}
				},
				show   : {
					init : function () {
						showSpy()
					},
					click: function () {
						this.trans('close')
						clickWhenShow()
					}
				},
				events : [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				]
			}
		}))

		var view = new View
		view.$el.click()
		view.$el.click()

		assert.equal(clickAll.callCount, 2)
		assert.ok(clickWhenHide.calledOnce)
		assert.ok(clickWhenShow.calledOnce)
		assert.ok(showSpy.calledOnce)
		assert.equal(hideSpy.callCount, 2)
	})

	QUnit.test('setElement before initialize', function (assert) {
		var spy = sinon.spy()
		var View = backboneFSM.mixinView(Backbone.View.extend({
			fsm: {
				initial: 'hide',
				hide   : {
					click: function (e) {
						spy()
						assert.equal($(e.currentTarget).text(), 'test me')
					}
				},
				events : [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				]
			}
		}))

		var view = new View({
			el: $('<div>test me</div>')
		})
		view.$el.click()
		assert.ok(spy.calledOnce)
	})

	QUnit.test('setElement after initialize', function (assert) {
		var spy = sinon.spy()
		var View = backboneFSM.mixinView(Backbone.View.extend({
			fsm: {
				initial: 'hide',
				hide   : {
					click: function (e) {
						spy()
						assert.equal($(e.currentTarget).text(), 'test me')
					}
				},
				events : [
					{name: 'open', from: 'hide', to: 'show'},
					{name: 'close', from: 'show', to: 'hide'}
				]
			}
		}))

		var view = new View
		view.setElement($('<div>test me</div>'))
		view.$el.click()
		assert.ok(spy.calledOnce)
	})
})