import axios, { AxiosResponse } from 'axios';
import { GuildChannel, Message, MessageEmbed, TextChannel } from 'discord.js';
import {
	Client,
	Discord,
	On,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';
import moment from 'moment';

declare type Activity = {
	titlemodule: string;
	acti_title: string;
	start: string;
	end: string;
	semester: number;
	room: {
		code: string;
	};
};

declare type CampusKey = keyof typeof Campus;
const enum Campus {
	'FR/BDX' = 'Bordeaux',
	'FR/LIL' = 'Lille',
	'FR/LYN' = 'Lyon',
	'FR/MAR' = 'Marseille',
	'FR/MLH' = 'Mulhouse',
	// 'FR/MLN' = "Moulin",
	'FR/MPL' = 'Montpellier',
	'FR/NAN' = 'Nantes',
	'FR/NCE' = 'Nice',
	'FR/NCY' = 'Nancy',
	'FR/PAR' = 'Paris',
	'FR/REN' = 'Rennes',
	'FR/RUN' = 'La Réunion',
	'FR/STG' = 'Strasbourg',
	'FR/TLS' = 'Toulouse',
	'BJ/COT' = 'Cotonou'
};

@Discord()
class PlaningCommand {
	@SimpleCommand('planing')
	async planing(
		@SimpleCommandOption('city', { type: 'STRING' })
		city: CampusKey | undefined,
		@SimpleCommandOption('start', { type: 'STRING' })
		start: string | moment.Moment | undefined,
		@SimpleCommandOption('end', { type: 'STRING' })
		end: string | moment.Moment | undefined,
		command: SimpleCommandMessage
	) {
		if (!city || !(city in Campus))
			return command.sendUsageSyntax()

		if (!start) start = moment().startOf('day');
		if (typeof start == 'string')
			start = moment(start, 'DD-MM-YYYY').startOf('day');

		if (!end) end = moment(start);
		if (typeof end == 'string') end = moment(end, 'DD-MM-YYYY').startOf('day');

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
						'YYYY-MM-DD'
					)}&end=${end.format('YYYY-MM-DD')}`
				)
				.then((res) => res.data)) as Activity[]
		)
			.filter(({ semester }) => semester < 7)
			.sort((a, b) => moment(a.start).diff(b.start));

		var embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle(`Planing ${Campus[city]}`)
			.setDescription(start.format('MMMM Do, YYYY'));

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

		command.message.channel.send({ embeds: [embed] });
	}
}
