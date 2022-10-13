// noinspection JSUnusedGlobalSymbols

const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const DEFAULT_MAX_OF_DIGITS = 11;
const UC_CODE = "doubleNumber.";

const Errors = Object.freeze({
  NOT_DECIMAL_NUMBER: {
    code: `${UC_CODE}e001`,
    message: "The value is not a valid decimal number."
  },
  MAX_NUMBER_OF_DIGITS_EXCEEDED: {
    code: `${UC_CODE}e002`,
    message: "The value exceeded maximum number of digits."
  },
  MAX_NUM_OF_DECIMAL_PLACES_EXCEEDED: {
    code: `${UC_CODE}e003`,
    message: "The value exceeded maximum number of decimal places."
  }
});

/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */
class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
  }

  match(value) {
    let validationResult = new ValidationResult();

    if (value != null) {
      let number;

      try {
        number = new Decimal(value);
      } catch (e) {
        validationResult.addInvalidTypeError(Errors.NOT_DECIMAL_NUMBER.code, Errors.NOT_DECIMAL_NUMBER.message);
        return validationResult;
      }

      validationResult = this.validateMaxNumberOfDigits(number, validationResult);

      if (this.shouldValidateDecimalPlaces()) {
        validationResult = this.validateMaxDecimalPlaces(number, validationResult);
      }
    }

    return validationResult;
  }

  validateMaxNumberOfDigits(number, validationResult) {
    const maximumOfDigits = this.params[0] ? this.params[0] : DEFAULT_MAX_OF_DIGITS;

    if (number.precision(true) > maximumOfDigits) {
      validationResult.addInvalidTypeError(Errors.MAX_NUMBER_OF_DIGITS_EXCEEDED.code, Errors.MAX_NUMBER_OF_DIGITS_EXCEEDED.message);
    }

    return validationResult;
  }

  validateMaxDecimalPlaces(number, validationResult) {
    if (number.decimalPlaces() > this.params[1]) {
      validationResult.addInvalidTypeError(Errors.MAX_NUM_OF_DECIMAL_PLACES_EXCEEDED.code, Errors.MAX_NUM_OF_DECIMAL_PLACES_EXCEEDED.message);
    }

    return validationResult;
  }

  shouldValidateDecimalPlaces() {
    return this.params.length === 2;
  }
}

module.exports = DecimalNumberMatcher;
