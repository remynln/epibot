import { MessageEmbed } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';

@Discord()
class PingCommand {
	@SimpleCommand('ping')
	ping(command: SimpleCommandMessage): void {
		const time = Date.now();
		const embed = new MessageEmbed()
			.setTitle(`🏓 Pong`)
			.setImage('https://media.giphy.com/media/xThuWtNFKZWG6fUFe8/giphy.gif')
			.setDescription(`${Date.now() - time} ms`);
		command.message.channel.send({ embeds: [embed] });
	}

	@SimpleCommand('pong')
	pong(command: SimpleCommandMessage): void {
		const random = Math.floor(
			Math.random() * (command.message.guild?.emojis.cache.size ?? 0)
		);
		const emoji = command.message.guild?.emojis.cache.at(random);

		command.message.channel.send(emoji?.toString() ?? 'bruh');
	}
}
