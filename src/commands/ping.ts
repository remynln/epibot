import { MessageEmbed } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';

@Discord()
class PingCommand {
	@SimpleCommand('ping')
	ping(command: SimpleCommandMessage): void {
		const time = Date.now();
		const embed = new MessageEmbed()
			.setTitle(`🏓 Pong`)
			.setImage('https://giphy.com/embed/xThuWtNFKZWG6fUFe8')
			.setDescription(`${Date.now() - time} ms`);
		command.message.channel.send({ embeds: [embed] });
	}

	@SimpleCommand('pong')
	pong(command: SimpleCommandMessage): void {
		command.message.channel.send(
			command.message.guild?.emojis.cache
				.get('919329964468367411')
				?.toString() ?? ''
		);
	}
}
