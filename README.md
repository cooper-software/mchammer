# MC Hammer

[![NPM version][1]][2] [![Build Status][3]][4] [![Coverage Status][5]][6]

This is a really simple library for creating sort-of-immutable data structures in Javascript. It's called "MC Hammer" because you "can't touch this". Why might you want to use it? Mainly because you are interested in referential transparency and want something to remind you about immutability.

This library does not provide deep immutability of built-ins like [seamless-immutable](seamless) or a rich API like [Immutable](https://github.com/facebook/immutable-js/). What it gives you is an easy way to create and (non-destructively) update objects that have read-only properties and methods.

## Installation

This library is available through NPM or Bower and it is packaged as a UMD bundle.

```sh
npm install mchammer
```

or

```sh
bower install mchammer
```

and if you are using node/commonjs

```js
var Model = require('mchammer').Model,
	Foo = Model()
```

or AMD

```js
define(['mchammer'], function (mchammer)
{
	var Foo = mchammer.Model()
})
```

or neither

```js
var Foo = mchammer.Model()
```

## Basics

You create a model by defining what properties are allowed and their defaults as well as any methods.

```js
var Model = require('mchammer').Model

var Writer = Model(
{
	fields: {
		name: 'Unknown',
		number_of_books: 0,
		something: 'Derp!'
	},
	
	methods: {
		say_something: function ()
		{
			return this.something
		}
	}
})
```

Then you can create instances of the new model, specifying only the properties that
have a value different from the defaults.

```js
var writer = new Writer(
{
	name: 'Stephen King',
	number_of_books: 54
})

console.log(writer.name) // "Stephen King"
console.log(writer.something) // "Derp!"
writer.say_something() // "Derp!"
```

You can't change any of the properties.

```js
writer.something = 'Boo!' // TypeError("Cannot assign to read only property 'something' of [object Object]")
```

But you can easily create a modified copy by specifying the properties you want to change

```js
var the_real_writer = writer.update({ something: 'Boo!' })
the_real_writer.say_something() // 'Boo!'
```

## Fields

To define the fields a Model has, use the `fields` options.

```js
var Foo = Model({ fields: { name: 'Steve' } }),
	foo = new Foo()
console.log(foo.name) // 'Steve'
```

Fields can also be functions, in which case they are transformers for whatever value is passed in during instantiation, including `undefined`.

```js
var Foo = Model({ fields: { name: function (x) { return (x ? 'Steve '+x : 'Nameless') } } }),
	foo1 = new Foo(),
	foo2 = new Foo({ name: 'Blobface' })

console.log(foo1.name) // 'Nameless'
console.log(foo2.name) // 'Steve Blobface'
```

Fields are immutable. Don't bother trying to set them.

```js
foo2.name = 'Andrea Blobface' // TypeError("Cannot assign to read only property 'name' of [object Object]")
```

Also, if you didn't define a field when you created the model, you can't do it later.

```js
var Foo = Model(),
	foo1 = new Foo(),
	foo2 = new Foo({ stuff: 'things' }) // Error('Unknown field "stuff"'),
	foo3 = foo1.update({ skidoo: 23 }) // Error('Unknown field "skidoo"')
```

## Inheritance

Existing models can be extended.
```js
var Model = require('mchammer').Model

var Instrument = Model(
{
	fields: {
		sound: '...'
	},
	
	methods: {
		play: function ()
		{
			return this.sound
		}
	}
})

var Guitar = Model.extend(Instrument,
{
	fields: {
		sound: 'Twang Twang'
	}
})

var Martin = Model.extend(Guitar)

var martin_guitar = new Martin()
martin_guitar.play() // 'Twang Twang'
martin_guitar.constructor == Martin // true
Model.is_instance(martin_guitar, Martin) // true
Model.is_instance(martin_guitar, Instrument) // true
```

## Comparisons

You can Deeply compare two `Model` instances like so

```js
var SweetMove = Model({
		fields: {
			name: 'spin',
			danger_level: 1
		}
	}),
	spin = new SweetMove(),
	twirl = new SweetMove(),
	cartwheel = new SweetMove({ name: 'cartwheel', danger_level: 5 })

spin.equals(twirl) // true
spin.equals(cartwheel) // false
```

You can also compare only based on a subset of properties, like this:

```js
var backbend = new SweetMove({ name: 'backbend', danger_level: 5 })
cartwheel.equals(backbend) // false
cartwheel.equals(backbend, ['danger_level']) // true
```

## Contributing

If you see an open issue you want to tackle, be my guest. If you have a problem or feature suggestion, please create a new issue. Thanks!

[1]: https://badge.fury.io/js/mchammer.svg
[2]: https://badge.fury.io/js/mchammer
[3]: https://secure.travis-ci.org/cooper-software/mchammer.svg
[4]: https://travis-ci.org/cooper-software/mchammer
[5]: http://img.shields.io/coveralls/cooper-software/mchammer.svg
[6]: https://coveralls.io/r/cooper-software/mchammer
