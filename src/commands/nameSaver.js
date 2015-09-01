import namesRepo from '../namesRepo';
import names from '../names';

export default function(message, next) {
	namesRepo.set(message.from.id, message.from.username, message.from.first_name, message.from.last_name).then(next);
};
