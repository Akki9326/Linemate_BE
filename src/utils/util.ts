/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
	if (value === null) {
		return true;
	} else if (typeof value !== 'number' && value === '') {
		return true;
	} else if (typeof value === 'undefined' || value === undefined) {
		return true;
	} else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
		return true;
	} else {
		return false;
	}
};

export const filterArrayOfObject = array => {
	array.forEach(function (o) {
		Object.keys(o).forEach(function (k) {
			if (o[k] === null) {
				o[k] = '';
			}
		});
	});
	return array;
};

export const filterObject = object => {
	Object.keys(object).forEach(function (key) {
		if (object[key] === null) {
			object[key] = '';
		}
	});
	return object;
};

export const generateOtp = () => {
	const otp = Math.floor(100000 + Math.random() * 900000);

	return otp;
};
