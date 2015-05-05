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
var mchammer = require('mchammer'),
	Foo = mchammer.Model()
```

or AMD

```js
define(['mchammer'], function (mchammer)
{
	var Foo = Model()
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
	name: 'Unknown',
	number_of_books: 0,
	something: 'Derp!',
	
	say_something: function ()
	{
		return this.something
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

## Inheritance

Existing models can be extended. This is simple prototypical inheritance but some records are kept so you can tell which models a given model was extended from.

```js
var Model = require('mchammer').Model

var Instrument = Model(
{
	sound: '...',
	
	play: function ()
	{
		return this.sound
	}
})

var Guitar = Model.extend(Instrument,
{
	sound: 'Twang Twang'
})

var Martin = Model.extend(Guitar)

var martin_guitar = new Martin()
martin_guitar.play() // 'Twang Twang'
martin_guitar.constructor == Martin // true
Model.is_instance(martin_guitar, Martin) // true
Model.is_instance(martin_guitar, Instrument) // true
```

## Versioning

You can turn on versioning for a model when you define it like so:

```js
var Roadrunner = Model(
{
	speed: 10,
	location: 'on the road'
}, true) // The second argument is the versioning flag
```

This does a few things. It gives each newly constructed instance a unique id and version

```js
var runner = new Roadrunner()
runner._id // "1-1"
runner._version // "1-1"
```

and each time the instance is updated, the version string changes

```js
var still_runner = runner.update({ speed: 0 })
still_runner._id // "1-1"
still_runner._version // "1-2"
```

This can improve the performance of things like diffing large structures or cache maintenance by avoiding deep comparisons between objects. That's how it's used in [baseline](http://github.com/cooper-software/baseline).

Version and ID strings are not universally unique. They are only guaranteed to be unique within the current interpreter.

## Comparisons

You can Deeply compare two `Model` instances like so

```js
var SweetMove = Model(
	{
		name: 'spin',
		danger_level: 1
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

Note that if you are comparing versioned objects and you specify a list of properties to compare, the version will not be considered unless it is in the property list.

## Contributing

If you see an open issue you want to tackle, be my guest. If you have a problem or feature suggestion, please create a new issue. Thanks!

[1]: https://badge.fury.io/js/mchammer.svg
[2]: https://badge.fury.io/js/mchammer
[3]: https://secure.travis-ci.org/cooper-software/mchammer.svg
[4]: https://travis-ci.org/rtfeldman/mchammer
[5]: http://img.shields.io/coveralls/cooper-software/mchammer.svg
[6]: https://coveralls.io/r/cooper-software/mchammer
