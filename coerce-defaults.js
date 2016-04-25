var api = require('./coerce.js');



api.addFix(api.errorCodes.OBJECT_REQUIRED, function (data, property, error, baseSchema) {
	var missingPath = error.dataPath + '/' + property.replace(/~/g, '~0').replace(/\//g, '~1'); // as JSON Pointer
	var possibleSchemas = api.possibleSchemas(baseSchema, missingPath);
	for (var i = 0; i < possibleSchemas.length; i++) {
		var schema = possibleSchemas[i];
		if ('default' in schema) {
			data[property] = schema['default'];
			return data;
		}
	}
});