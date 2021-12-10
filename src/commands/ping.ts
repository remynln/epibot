import { MessageEmbed } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';

@Discord()
class PingCommand {
	@SimpleCommand('ping')
	pong(command: SimpleCommandMessage): void {
		const time = Date.now();
		const embed = new MessageEmbed()
			.setTitle(`🏓 Pong`)
			.setDescription(`Api discord: ${Date.now() - time} ms`);
		command.message.channel.send({ embeds: [embed] });
	}
}
