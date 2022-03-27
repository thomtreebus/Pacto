const vagueTime = require("vague-time");

export const relativeTime = (time) => {
	return vagueTime.get({
		from: Date.now(),
		to: new Date(time),
	});
};
