import { Message } from 'discord.js';

export function LogError(msg: Message, error: any): any {
	if (error?.response.status >= 400 && error?.response.status < 500) {
		msg.channel.send(
			`***${error?.response.status}**: ${error?.response.statusText}*\nPlease update the token for ${error?.response.request.host}`
		);
		throw error;
	} else
		msg.channel.send(
			`***${error?.response.status}**: ${error?.response.statusText}*`
		);
	return error;
}
