import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import {
	Discord,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';
import { Activity, Campus, CampusKey, _Campus } from '../type.js';
import groupBy from 'lodash.groupby';
import moment from 'moment';

const allowedFormat = ['D', 'D-M', 'D/M', 'D-M-YYYY', 'D/M/YYYY'];

@Discord()
class PlaningCommand {
	@SimpleCommand('schedule', {
		aliases: ['planing', 'planning'],
		description: 'Display your schedule for the day.'
	})
	async planing(
		@SimpleCommandOption('city', { type: 'STRING' })
		city: CampusKey | undefined,
		@SimpleCommandOption('start', { type: 'STRING' })
		start: string | moment.Moment | undefined,
		@SimpleCommandOption('end', { type: 'STRING' })
		end: string | moment.Moment | undefined,
		command: SimpleCommandMessage
	) {
		const time = Date.now();
		await command.message.channel.sendTyping();
		if (!city)
			city =
				_Campus[
					command.message.member?.roles.cache.find(
						(role) => !!_Campus[role.name]
					)?.name ?? ''
				];
		if (!city || !(city in Campus)) return command.sendUsageSyntax();

		if (!start) start = moment();
		if (typeof start == 'string') start = moment(start, allowedFormat);

		if (!end) end = moment();
		if (typeof end == 'string') end = moment(end, allowedFormat);

		axios.interceptors.request.use(
			(config) => {
				config.headers.cookie = `conect.sid=${process.env.ROSLYN_COOKIE ?? ''}`;
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		const data: Activity[] = (
			(await axios
				.get(
					`https://intra.epitech.eu/planning/load?format=json&location=${city}&start=${start.format(
						'YYYY-M-D'
					)}&end=${end.format('YYYY-M-D')}`
				)
				.then((res) => res.data)) as Activity[]
		)
			.filter(({ semester }) => semester < 7)
			.sort((a, b) => moment(a.start).diff(b.start));

		var embeds = Object.entries(
			groupBy(data, (_) => moment(_.start).format('MMMM Do YYYY'))
		).map(([date, data]) => {
			var embed = new MessageEmbed()
				.setColor('#4169E1')
				.setTimestamp()
				.setTitle(`Planing ${Campus[city]}`)
				.setDescription(date);

			data.forEach((data) => {
				embed.addField(
					`[${moment(data.start).format('HH:mm')} - ${moment(data.end).format(
						'HH:mm'
					)}]`,
					`${data.titlemodule} » ${data.acti_title} — ${
						data.room?.code?.split('/').pop() ?? 'no room asigned'
					}`,
					true
				);
			});

			return embed;
		});

		embeds.forEach((e) => e.setFooter(`(${Date.now() - time}ms)`));
		command.message.channel.send({ embeds });
	}
}
