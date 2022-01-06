import { MessageEmbed } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';

import { Message } from "discord.js";
import moment from "moment";

export const processTime = (msg: Message) => Math.abs(
	moment().diff(msg.createdTimestamp)
)

@Discord()
class Miscs {
	@SimpleCommand('ping')
	async ping(command: SimpleCommandMessage) {
		await command.message.channel.sendTyping();

		const embed = new MessageEmbed()
			.setTitle(`🏓 Pong`)
			.setImage('https://media.giphy.com/media/xThuWtNFKZWG6fUFe8/giphy.gif')
			.setDescription(`${processTime(command.message)} ms`);
		command.message.channel.send({ embeds: [embed] });
	}

	@SimpleCommand('pong')
	async pong(command: SimpleCommandMessage) {
		await command.message.channel.sendTyping();

		const random = Math.floor(
			Math.random() * (command.message.guild?.emojis.cache.size ?? 0)
		);
		const emoji = command.message.guild?.emojis.cache.at(random);

		command.message.channel.send(emoji?.toString() ?? 'bruh');
	}
}
