import axios from 'axios';
import { GuildChannel, Message, MessageEmbed, TextChannel } from 'discord.js';
import {
	Client,
	Discord,
	On,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';
import type { ArgsOf } from 'discordx';

import config from '../config.mjs';

@Discord()
class Login {
	async give_role(data: any, msg: Message) {
		var city = msg.member?.guild.roles.cache.find(
			(role) => role.name === data.profile.city.name
		);
		var tmp = parseInt(data.profile.promo.id, 10);
		var promo = undefined;

		if (tmp < 2021)
			promo = msg.member?.guild.roles.cache.find(
				(role) => role.name === 'Boomers'
			);
		else
			promo = msg.member?.guild.roles.cache.find(
				(role) => role.name === `${tmp}`
			);
		var verif = msg.member?.guild.roles.cache.find(
			(role) => role.name === 'Verified'
		);

		if (
			data.profile.groups.filter((e: { id: string }) => e.id === 'AER').length >
			0
		) {
			var aer = msg.member?.guild.roles.cache.find(
				(role) => role.name === 'AER'
			);
			if (aer) msg.member?.roles.add(aer);
		}

		if (city) msg.member?.roles.add(city);
		if (promo) msg.member?.roles.add(promo);
		if (verif) msg.member?.roles.add(verif);
		msg.member?.send(
			`Vous avez été assigné à l'utilisateur **${data.profile.name}** avec succès.\nEn cas d'erreur veuillez contacter un admin`
		);
		var embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setThumbnail(msg.author.avatarURL() ?? '')
			.setTitle(`${msg.author.username} | ${data.profile.name}`)
			.setDescription(data.profile.id)
			.addField(
				'Grades:',
				`${data.profile.promo.id} | ${data.profile.city.name}`,
				true
			);
		const channel = await msg.member?.guild.channels.fetch(config.log_chan);
		if (channel?.type == 'GUILD_TEXT') channel.send({ embeds: [embed] });
	}

	@SimpleCommand('login')
	async login(
		@SimpleCommandOption('login', { type: 'STRING' }) login: string | undefined,
		command: SimpleCommandMessage
	) {
		if (!login) return;

		let flag = 0;
		const msg = command.message;

		axios.interceptors.request.use(
			(config) => {
				config.headers.cookie = process.env.ROSLYN_COOKIE;
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		const data = await axios
			.get(
				`https://roslyn.epi.codes/trombi/api.php?version=2&state=1615851442&action=profile&q=${login}`
			)
			.then((res) => res.data)
			.catch(function (error) {
				if (error.response) {
					console.log(error.response.data);
					console.log(error.response.status);
					flag = 1;
					return msg.channel
						.send(
							`Error: ${error.response.data.error}, code: ${error.response.status}`
						)
						.then((msg) => {
							setTimeout(() => msg.delete(), 5000);
						});
				}
			});

		if (!flag) {
			await msg.channel
				.send(
					`promo: ${data.profile.promo.id}\nville: ${data.profile.city.name}`
				)
				.then((msg) => {
					setTimeout(() => msg.delete(), 5000);
				});
			await this.give_role(data, msg);
		}
	}

	@On('messageCreate')
	private onMessage(
		[message]: ArgsOf<'messageCreate'>, // Type message automatically
		client: Client, // Client instance injected here,
		guardPayload: any
	) {
		if (message.type != 'DEFAULT' || message.author.bot) return;

		if (message.channel.id === config.verify_chan) {
			if (!message.content.endsWith('@epitech.eu')) {
				message.channel.send('Error, please enter valid e-mail');
				return;
			}
			message.content = `${config.prefix}login ${message.content}`;
		}
	}
}
