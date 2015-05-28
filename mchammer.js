"use strict"

function set_properties(obj, props, default_props)
{
	for (var k in props)
	{
		if (props.hasOwnProperty(k) && !default_props.hasOwnProperty(k))
		{
			throw new Error('Unknown property "'+k+'"')
		}
	}
	
	Object.keys(default_props).forEach(function (k)
	{
		Object.defineProperty(obj, k, 
		{
			configurable: false,
			enumerable: true,
			value: props[k] !== undefined ? props[k] : default_props[k],
			writable: false
		})
	})
}

var model_version = 0

var Model = function (default_props, versioned)
{
	var default_props = default_props || {},
		instance_version = 0,
		instance_id = 0
	
	if (versioned)
	{
		model_version++
		default_props._id = model_version + '-' + instance_id
		default_props._version = model_version + '-' + instance_version
	}
	
	default_props.update = function (props)
	{
		if (versioned)
		{
			props._version = model_version + '-' + ++instance_version
		}
		return new this.constructor(props, this)
	}
	
	var prop_equals = function (a, b, check_version)
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
		
		if (check_version && a._version != b._version)
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
				if (a.hasOwnProperty(k) && k != '_version')
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
	
	default_props.equals = function (other, only)
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
				if (!prop_equals(this[only[i]], other[only[i]]))
				{
					return false
				}
			}
		}
		else
		{
			for (var k in default_props)
			{
				if (default_props.hasOwnProperty(k))
				{
					if (!prop_equals(this[k], other[k]))
					{
						return false
					}
				}
			}
		}
		
		return true
	}
	
	var model = function (props, backup_props)
	{
		props = props || {}
		
		if (versioned && (!backup_props || !backup_props._id) && !props._id)
		{
			props._id = model_version + '-' + ++instance_id
			props._version = model_version + '-' + ++instance_version
		}
		
		set_properties(this, props || {}, backup_props || default_props)
	}
	model._parent = Model
	
	if (versioned)
	{
		model._version = model_version
	}
	
	return model
}

Model.extend = function (parent, props)
{
	var parent_inst = new parent(),
		new_props = {},
		props = props || {}
	
	Object.keys(parent_inst).forEach(function (k)
	{
		new_props[k] = parent_inst[k]
	})
	
	Object.keys(props).forEach(function (k)
	{
		new_props[k] = props[k]
	})
	
	var model = Model(new_props, typeof parent._version != "undefined")
	model._parent = parent
	return model
}

Model.is_instance = function (inst, model)
{
	var child = inst.constructor
	
	while (child._parent)
	{
		if (child._parent === model)
		{
			return true
		}
		
		child = child._parent
	}
	
	return false
}

Model.mutable_copy = function (inst)
{
	var mutable_inst = {}
	
	Object.keys(inst).forEach(function (k)
	{
		mutable_inst[k] = inst[k]
	})
	
	return mutable_inst
}

module.exports = 
{
	Model: Model
}