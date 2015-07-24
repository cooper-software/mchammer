"use strict"

var expect = require("chai").expect,
	Model = require('./mchammer').Model
	
describe("Model", function ()
{
	it('is immutable', function ()
	{
		var Foo = new Model({
				fields: { things: 'stuff' }
			}),
			foo = new Foo(),
			bad = function ()
			{
				foo.things = 'other stuff'
			}
		
		expect(bad).to.throw(TypeError, "Cannot assign to read only property 'things' of [object Object]")
	})
	
	it('can make an immutable copy', function ()
	{
		var Foo = new Model({
				fields: { things: 'stuff' },
				methods: { do_things: function () { return 'do ' + this.things } }
			}),
			foo = new Foo(),
			mutable_foo = Model.mutable_copy(foo)
		
		expect(Object.keys(mutable_foo)).to.deep.equal(['things'])
		mutable_foo.things = 'other stuff'
	})
	
	it('has no properties by default', function ()
	{
		var Foo = Model(),
			foo = new Foo()
		
		expect(Object.keys(foo)).to.eql([])
	})
	
	it('has the properties passed to the constructor and they are read-only', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			foo = new Foo()
		
		var bar_desc = Object.getOwnPropertyDescriptor(foo, 'bar')
		expect(bar_desc).to.be.defined
		expect(bar_desc.value).to.eql(23)
		expect(bar_desc.writable).to.be.false
	})
	
	it('can have default functions that generate default properties', function ()
	{
		var x = 0,
			Foo = Model({ fields: { bar: function () { return ++x } } }),
			foo1 = new Foo(),
			foo2 = new Foo()
		
		expect(foo1.bar).to.equal(1)
		expect(foo2.bar).to.equal(2)
	})
	
	it('overrides default properties', function ()
	{
		var Foo = Model({ fields: { a: 1, b: function (x) { return x || 2 } } }),
			foo = new Foo({ a: 666, b: 777 })
		
		expect(foo.a).equal(666)
		expect(foo.b).equal(777)
	})
	
	it('can perform non-destructive updates', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			foo = new Foo(),
			foo2 = foo.update({ bar: 77 })
		
		expect(foo).to.not.equal(foo2)
		expect(foo.bar).to.eql(23)
		expect(foo2.bar).to.eql(77)
	})
	
	it('is equal to itself', function ()
	{
		var Foo = Model(),
			foo = new Foo()
		
		expect(foo.equals(foo)).to.be.true
	})
	
	it('is not equal to a differently-typed object', function ()
	{
		var Foo = Model(),
			foo = new Foo(),
			bar = "bar"
			
		expect(foo.equals(bar)).to.not.be.true
	})
	
	it('is equal to a copy of itself', function ()
	{
		var Foo = Model(),
			foo = new Foo(),
			foo_copy = foo.update()
			
		expect(foo.equals(foo_copy)).to.be.true
	})
	
	it('is not equal to a copy of itself with different properties', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			foo = new Foo(),
			foo_copy = foo.update({ bar: 77 })
		
		expect(foo.equals(foo_copy)).not.to.be.true
	})
	
	it('is not equal to a different model with the same properties', function ()
	{
		var Foo = Model({ bar: 23 }),
			Bar = Model({ bar: 23 }),
			foo = new Foo(),
			bar = new Bar()
		
		expect(foo.equals(bar)).not.to.be.true
	})
	
	it('it looks inside arrays when comparing equality', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			foo = new Foo({ bar: [2,3] }),
			foo2 = new Foo({ bar: [2,3] }),
			foo3 = new Foo({ bar: [7,7] })
			
		expect(foo.equals(foo2)).to.be.true
		expect(foo.equals(foo3)).not.to.be.true
	})
	
	it('it looks inside objects when comparing equality', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			foo = new Foo({ bar: { 2: 3 } }),
			foo2 = new Foo({ bar: { 2: 3 } }),
			foo3 = new Foo({ bar: { 7: 7 } })
			
		expect(foo.equals(foo2)).to.be.true
		expect(foo.equals(foo3)).not.to.be.true
	})
	
	it('uses nested models\' equals() method when comparing equality', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			foo = new Foo({ bar: new Foo() }),
			foo2 = new Foo({ bar: new Foo() }),
			foo3 = new Foo({ bar: new Foo({ bar: 77 }) })
			
		expect(foo.equals(foo2)).to.be.true
		expect(foo.equals(foo3)).not.to.be.true
	})
	
	it('can only consider certain properties when comparing equality', function ()
	{
		var Foo = Model({ fields: { bar: 23, baz: 'skidoo' } }),
			foo = new Foo(),
			foo2 = foo.update({ bar: 77 })
		
		expect(foo.equals(foo2)).not.to.be.true
		expect(foo.equals(foo2, ['baz'])).to.be.true
	})
	
	it('throws an error if attempting to initialize with an unknown property', function ()
	{
		var Foo = Model({ fields: { bar: 23 } }),
			bad = function () { new Foo({ baz: 77 }) }
		
		expect(bad).to.throw('Unknown property "baz"')
	})
	
	it('allows extending from a parent model', function ()
	{
		var Foo = Model({ fields: { things: 23 } }),
			Bar = Model.extend(Foo, { methods: { stuff: function () { return this.things } } }),
			bar = new Bar()
			
		expect(bar.things).to.equal(23)
		expect(bar.stuff()).to.equal(23)
	})
	
	it('keeps parent methods and default fields when extending', function ()
	{
		var Foo = Model({ fields: { a: 1, b: function () { return 2 } }, methods: { d: function () { return 'yep' } } }),
			Bar = Model.extend(Foo, { fields: { c: 'stuff' } }),
			bar = new Bar()
		
		expect(bar.a).to.equal(1)
		expect(bar.b).to.equal(2)
		expect(bar.c).to.equal('stuff')
		expect(bar.d()).to.equal('yep')
	})
	
	it('allows checking if a model is an instance of another model', function ()
	{
		var Foo = Model({ fields: { things: 23 } }),
			Bar = Model.extend(Foo),
			Baz = Model.extend(Bar),
			Qux = Model(),
			foo = new Foo(),
			bar = new Bar(),
			baz = new Baz()
			
		expect(Model.is_instance(foo, Qux)).to.be.false
		expect(Model.is_instance(foo, Model)).to.be.true
		expect(Model.is_instance(bar, Qux)).to.be.false
		expect(Model.is_instance(bar, Model)).to.be.true
		expect(Model.is_instance(bar, Foo)).to.be.true
		expect(Model.is_instance(baz, Qux)).to.be.false
		expect(Model.is_instance(baz, Model)).to.be.true
		expect(Model.is_instance(baz, Foo)).to.be.true
		expect(Model.is_instance(baz, Bar)).to.be.true
	})
})