export default {
	/**
	 * Gets the "best" available name for the user, with the following priority:
	 * 1. Full name (<first> <last>)
	 * 2. First name only
	 * 3. Last name only
	 * 4. Username
	 * 5. ID
	 * @param  {object} user See https://core.telegram.org/bots/api#user
	 * @return {string}      The best available name
	 */
	get(user) {
		if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
		return user.first_name || user.last_name || user.username || user.id || '???';
	}
};
