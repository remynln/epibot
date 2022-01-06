import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import {
	Discord,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';
import groupBy from 'lodash.groupby';
import moment from 'moment';
import { Activity, Campus, CampusKey } from '../type.js';
import { LogError } from './error.js';
import { processTime } from './ping.js';

const allowedFormat = ['D', 'D-M', 'D/M', 'D-M-YYYY', 'D/M/YYYY'];

@Discord()
class Schedule {
	@SimpleCommand('schedule', {
		aliases: ['planing', 'planning'],
		description: 'Display your schedule for the day.'
	})
	async schedule(
		@SimpleCommandOption('city', { type: 'STRING' })
		city: CampusKey | undefined,
		@SimpleCommandOption('start', { type: 'STRING' })
		start: string | moment.Moment | undefined,
		@SimpleCommandOption('end', { type: 'STRING' })
		end: string | moment.Moment | undefined,
		command: SimpleCommandMessage
	) {
		await command.message.channel.sendTyping();

		if (!city)
			// @ts-expect-error
			city = command.message.member?.roles.cache.find(
				(role) =>
					!!(Object.entries(Campus) as [CampusKey, Campus][]).find(
						([, v]) => v == role.name
					)
			)?.name;

		if (typeof city === 'string')
			city = ((Object.entries(Campus) as [CampusKey, Campus][]).find(
				// @ts-expect-error
				([k, v]) => v === city || k.split('/')[1] === city.toUpperCase()
			) ?? [])[0] as CampusKey;

		if (!city || !(city in Campus)) return command.sendUsageSyntax();

		if (!start) start = moment();
		if (typeof start == 'string') start = moment(start, allowedFormat);

		if (!end) end = moment();
		if (typeof end == 'string') end = moment(end, allowedFormat);

		axios.interceptors.request.use(
			(config) => {
				config.headers.cookie = process.env.ROSLYN_COOKIE;
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
				.catch((err) => LogError(command.message, err))
				.then((res) => (Array.isArray(res.data) ? res.data : []))) as Activity[]
		)
			.filter(({ semester }) => semester < 7)
			.sort((a, b) => moment(a.start).diff(b.start));

		var embeds = Object.entries(
			groupBy(data, (_) => moment(_.start).format('MMMM Do YYYY'))
		).map(([date, data]) => {
			var embed = new MessageEmbed()
				.setColor('#4169E1')
				.setTimestamp()
				// @ts-expect-error
				.setTitle(`Planing ${Campus[city]}`)
				.setDescription(date);

			data.forEach((data) => {
				embed.addField(
					`[${moment(data.start).format('HH:mm')} - ${moment(data.end).format(
						'HH:mm'
					)}]`,
					`${data.titlemodule} » ${data.acti_title} — ${data.room?.code?.split('/').pop() ?? 'no room asigned'
					}`,
					true
				);
			});

			return embed;
		});

		if (!embeds.length)
			embeds = [
				new MessageEmbed()
					.setColor('#4169E1')
					.setTimestamp()
					.setTitle(`Planing ${Campus[city]}`)
					.setDescription(
						`${moment().format('MMMM Do YYYY')}\n\n**No activities today**`
					)
			];
		console.log(embeds);
		embeds.forEach((e) => e.setFooter(`(${processTime(command.message)}ms)`));
		command.message.channel.send({ embeds });
	}
}
