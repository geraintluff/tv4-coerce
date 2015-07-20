tv4-coerce
==========

Coercive validation based on tv4

## Usage

```javascript
var tv4coerce = require('tv4-coerce');

tv4coerce.coerce(data, schema);
```

## Adding new fixes

This module works by an iterative fix-and-recheck loop.

To add a new fix, register a function for the corresponding error code:

```javascript
api.addFix(api.errorCodes.INVALID_TYPE, function (value, type, error, baseSchema) {
  // If you can fix it
  return newValue;
  // If you can't, let it return undefined
});
```

You can register as many fixes for a given error code as you like.  They will be attempted in the order in which they are registered.

Some standard fixes are in `coerce-standard.js`, and can be used as examples.
