var tv4 = require('tv4'), jsonPointer = require('json-pointer');
var api = module.exports = {
	tv4: tv4,
	errorCodes: tv4.errorCodes,
	fixes: {},
	addFix: function (code, fixFunction) {
		if (typeof tv4.errorCodes[code] !== 'undefined') {
			code = tv4.errorCodes[code];
		}
		this.fixes[code] = this.fixes[code] || [];
		this.fixes[code].push(fixFunction);
		return this;
	},
	possibleSchemas: function (schema, dataPath) {
		var parts = dataPath.split('/').slice(1);
		var options = [schema];
		while (parts.length) {
			var part = parts.shift().replace(/~1/g, '/').replace(/~0/g, '~');
			// Expand all $refs, anyOf, allOf, oneOf
			var expandedOptions = [];
			while (options.length) {
				var option = options.shift();
				if (typeof option['$ref'] == 'string') {
					option = tv4.getSchema(option['$ref']);
				}
				if (expandedOptions.indexOf(option) !== -1) continue;
				if (option.allOf) {
					options = [].concat(option.allOf).concat(options);
				}
				if (option.anyOf) {
					options = [].concat(option.anyOf).concat(options);
				}
				if (option.oneOf) {
					options = [].concat(option.oneOf).concat(options);
				}
				expandedOptions.push(option);
			}

			var newOptions = [];
			while (expandedOptions.length) {
				var option = expandedOptions.shift();
				if (/^(0|[1-9][0-9]*)$/.test(part)) {
					if (Array.isArray(option.items)) {
						if (option.items[part]) {
							newOptions.push(option.items[part]);
						} else if (option.additionalItems) {
							newOptions.push(option.additionalItems);
						}
					} else if (option.items) {
						newOptions.push(option.items);
					}
				}
				if (option.properties && option.properties[part]) {
					newOptions.push(option.properties[part]);
				} else if (option.additionalProperties) {
					newOptions.push(option.additionalProperties);
				}
			}
			options = newOptions;
		}
		return options;
	},
	schemaFromPath: function(schema, path) {
		var parts = path.split('/').slice(1);
		while (parts.length) {
			if (typeof schema['$ref'] == 'string') {
				schema = tv4.getSchema(schema['$ref']);
			}
			var part = parts.shift().replace(/~1/g, '/').replace(/~0/g, '~');
			schema = schema[part];
		}
		return schema;
	},
	coerce: function (data, schema, checkRecursive, banUnknownProperties) {
		var seenErrors = {};
		var changes = 1;
		var result;
		while (changes) {
			changes = 0;
			result = tv4.validateMultiple(data, schema, checkRecursive, banUnknownProperties);
			result.data = data;
			result.schema = schema;
			for (var i = 0; i < result.errors.length; i++) {
				var error = result.errors[i];
				var signature = JSON.stringify([error.code, error.dataPath, error.schemaPath]);
				if (seenErrors[signature]) continue;
				
				changes++;
				seenErrors[signature] = true;
				var subData = jsonPointer.get(data, error.dataPath);
				var schemaValue = this.schemaFromPath(schema, error.schemaPath);
				var fixes = this.fixes[error.code] || [];
				for (var j = 0; j < fixes.length; j++) {
					var fixFunction = fixes[j];
					var fixedValue = fixFunction(subData, schemaValue, error, schema);
					if (typeof fixedValue !== 'undefined') {
						if (error.dataPath) {
							jsonPointer.set(data, error.dataPath, fixedValue);
						} else {
							data = fixedValue;
						}
						break;
					}
				}
			}
		}
		return result;
	}
};