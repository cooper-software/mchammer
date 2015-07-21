"use strict"

// Compare two model properties for equality
var prop_equals = function (a, b)
{
	if (a === b)
	{
		return true
	}
	
	if (typeof b === "undefined" || typeof a === "undefined" ||
		b === null || a === null)
	{
		return a == b
	}
	
	if (a.constructor != b.constructor)
	{
		return false
	}
	
	if (a.equals)
	{
		return a.equals(b)
	}
	else if (b.equals)
	{
		return b.equals(a)
	}
	else if (a.constructor == Array)
	{
		if (a.length != b.length)
		{
			return false
		}
		for (var i=0; i<a.length; i++)
		{
			if (!prop_equals(a[i], b[i]))
			{
				return false
			}
		}
		return true
	}
	else if (a instanceof Object)
	{
		for (var k in a)
		{
			if (a.hasOwnProperty(k))
			{
				if (!prop_equals(a[k], b[k]))
				{
					return false
				}
			}
		}
		return true
	}
	else
	{
		return a == b
	}
}

// Base prototype for all models

var ModelPrototype = {}

Object.defineProperty(
	ModelPrototype,
	'update',
	{
		configurable: false,
		enumerable: false,
		value: function (props)
		{
			return new this.constructor(props, this)
		},
		writable: false
	}
)

Object.defineProperty(
	ModelPrototype,
	'equals',
	{
		configurable: false,
		enumerable: false,
		value: function (other, only)
		{
			if (this === other)
			{
				return true
			}
			
			if (this.constructor !== other.constructor)
			{
				return false
			}
			
			if (only)
			{
				for (var i=0; i<only.length; i++)
				{
					if (this.field_names.indexOf(only[i]) < 0)
					{
						throw new Error("Unknown field '"+only[i]+"'")
					}
					
					if (!prop_equals(this[only[i]], other[only[i]]))
					{
						return false
					}
				}
			}
			else
			{
				return this.field_names.every(function (k)
				{
					return prop_equals(this[k], other[k])
				}.bind(this))
			}
			
			return true
		},
		writable: false
	}
)

// Create a new model type
function Model (options)
{
	options = options || {}
	var raw_default_fields = options.fields || {},
		field_names = Object.keys(raw_default_fields),
		default_fields = {}
	
	field_names.forEach(function (k)
	{
		var v = raw_default_fields[k]
		
		if (typeof v == "function")
		{
			default_fields[k] = v
		}
		else
		{
			default_fields[k] = function () { return v }
		}
	})
	
	var ModelInst = function (props, backup_props)
	{
		props = props || {}
		backup_props = backup_props || {}
		
		for (var k in props)
		{
			if (props.hasOwnProperty(k) && !default_fields.hasOwnProperty(k))
			{
				throw new Error('Unknown property "'+k+'"')
			}
		}
		
		field_names.forEach(function (k)
		{
			var v = props[k] !== undefined ? props[k] : (backup_props[k] !== undefined ? backup_props[k] : default_fields[k]())
			
			Object.defineProperty(
				this, 
				k, 
				{
					configurable: false,
					enumerable: true,
					value: v,
					writable: false
				}
			)
		}.bind(this))
		
		Object.defineProperty(
			this, 
			'field_names', 
			{
				configurable: false,
				enumerable: false,
				value: field_names,
				writable: false
			}
		)
	}
	ModelInst.prototype = Object.create(ModelPrototype)
	ModelInst.prototype.constructor = ModelInst
	ModelInst.parent = Model
	ModelInst.field_names = field_names
	ModelInst.default_fields = default_fields
	
	var methods = options.methods || {},
		method_names = Object.keys(methods)
	
	method_names.forEach(function (k)
	{
		Object.defineProperty(
			ModelInst.prototype,
			k,
			{
				configurable: false,
				enumerable: false,
				value: methods[k],
				writable: false
			}
		)
	})
	
	Object.defineProperty(
		ModelInst.prototype,
		'method_names',
		{
			configurable: false,
			enumerable: false,
			value: method_names,
			writable: false
		}
	)
	
	ModelInst.method_names = method_names
	
	return ModelInst
}

Model.extend = function (parent, raw_options)
{
	raw_options = raw_options || {}
	var raw_fields = raw_options.fields || {},
		raw_methods = raw_options.methods || {},
		options = { fields: {}, methods: {} }
		
	Object.keys(parent.default_fields).forEach(function (k)
	{
		options.fields[k] = parent.default_fields[k]
	})
	
	Object.keys(raw_fields).forEach(function (k)
	{
		options.fields[k] = raw_fields[k]
	})
	
	Object.keys(parent.method_names).forEach(function (k)
	{
		options.methods[k] = parent.prototype[k]
	})
	
	Object.keys(raw_methods).forEach(function (k)
	{
		options.methods[k] = raw_methods[k]
	})
	
	var model = Model(options)
	model.parent = parent
	return model
}

Model.is_instance = function (inst, model)
{
	var child = inst.constructor
	
	while (child.parent)
	{
		if (child.parent === model)
		{
			return true
		}
		
		child = child.parent
	}
	
	return false
}

Model.mutable_copy = function (inst)
{
	var mutable_inst = {}
	
	inst.field_names.forEach(function (k)
	{
		mutable_inst[k] = inst[k]
	})
	
	return mutable_inst
}

module.exports = Model