import { Message, MessageEmbed } from 'discord.js';
import {
	Discord,
	MetadataStorage,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';
import groupBy from 'lodash.groupby';

const except = ['login'];

@Discord()
class Helping {
	printHelp(msg: Message) {
		const commands = MetadataStorage.instance.simpleCommands.filter(
			({ name }) => !except.includes(name)
		);

		const embed = new MessageEmbed()
			.setTitle(`⁉   Help`)
			.setColor(Math.floor(Math.random() * 654321));

		Object.entries(
			groupBy(
				commands,
				({ classRef }) => (/class (.*) \{/.exec(`${classRef}`) ?? [])[1]
			)
		).forEach(([cls, cmds]) => {
			embed.addField(
				cls,
				cmds
					.map(({ name, description }) =>
						name === description ? name : `${name} - ${description}`
					)
					.join('\n'),
				false
			);
		});

		msg.channel.send({ embeds: [embed] });
	}

	@SimpleCommand('help', {
		aliases: ['h', 'aled']
	})
	async help(
		@SimpleCommandOption('cmd', { type: 'STRING' }) cmd: string | undefined,
		command: SimpleCommandMessage
	) {
		await command.message.channel.sendTyping();

		if (!cmd) return this.printHelp(command.message);

		var cmdInfo = MetadataStorage.instance.simpleCommands.find(
			({ name, aliases }) => name === cmd || aliases.includes(cmd)
		);
		if (!cmdInfo) return this.printHelp(command.message);

		const embed = new MessageEmbed()
			.setColor(Math.floor(Math.random() * 654321))
			.setTitle('Command Info')
			.addField('Name', cmdInfo.name)
			.addField('Description', cmdInfo.description);

		// add aliases
		if (cmdInfo.aliases.length) {
			embed.addField('Aliases', cmdInfo.aliases.join(', '));
		}
		// add syntax usage
		embed.addField(
			'Command Usage',
			'```' +
				'!' +
				cmdInfo.name +
				` ${cmdInfo.options
					.map((op) => `{${op.name}: ${op.type}}`)
					.join(' ')}` +
				'```'
		);
		// add options if available
		if (cmdInfo.options.length) {
			const maxLength = cmdInfo.options.reduce((a, b) =>
				a.name.length > b.name.length ? a : b
			).name.length;

			embed.addField(
				'Options',
				'```' +
					cmdInfo.options
						.map((op) => `${op.name.padEnd(maxLength + 2)}: ${op.description}`)
						.join('\n') +
					'```'
			);
		}
		return command.message.reply({ embeds: [embed] });
	}
}
