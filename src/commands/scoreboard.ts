import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import {
	Discord,
	Guard,
	GuardFunction,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';
import groupBy from 'lodash.groupby';

enum Campus {
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
}

enum Courses {
	'bachelor/classic' = 'bachelor',
	'bachelor/tek1ed' = 'bachelor',
	'bachelor/tek2ed' = 'bachelor',
	'bachelor/tek3s' = 'bachelor',
	'digital' = 'digital',
	'premsc' = 'premsc'
}

declare type CampusKey = keyof typeof Campus;
declare type CoursesKey = keyof typeof Courses;
declare type Data = {
	city: CampusKey;
	course: CoursesKey;
	total: number;
};

const InProcess: GuardFunction<SimpleCommandMessage> = async (
	{ message },
	client,
	next
) => {
	if (!Scoreboard.processing) {
		message.react('✅');
		Scoreboard.processing = true;
		await next();
	} else message.react('❗');
};

@Discord()
class Scoreboard {
	static processing = false;

	async getData(
		campus: CampusKey[] = Object.keys(Campus) as CampusKey[],
		courses: CoursesKey[] = Object.keys(Courses) as CoursesKey[]
	): Promise<Data[]> {
		axios.interceptors.request.use(
			(config) => {
				config.headers.cookie = `conect.sid=${process.env.ROSLYN_COOKIE ?? ''}`;
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		return (
			await Promise.allSettled(
				(
					await Promise.allSettled(
						campus.flatMap((city) =>
							courses.map((course) =>
								axios
									.get(
										`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=all&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
									)
									.then((res) => ({
										city: city,
										course: course,
										total: res.data.count
									}))
									.catch((err) => err)
							)
						)
					)
				)
					.map((_) => (_.status === 'fulfilled' ? _.value : null))
					.filter((_) => _)
					.map(({ city, course, total }) => {
						if (total > 0)
							return axios
								.get(
									`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=out&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
								)
								.then((res) => ({
									city,
									course,
									total: total - res.data.count
								}))
								.catch((err) => err);
						return Promise.resolve({ city, course, total });
					})
			)
		)
			.map((_) => (_.status === 'fulfilled' ? _.value : null))
			.filter((_) => _);
	}

	groupByCity(data: Data[]) {
		return Object.values(
			groupBy(data, 'city') as {
				[key: string]: Data[];
			}
		)
			.map((group) =>
				group.reduce((p, n) => Object.assign(p, { total: p.total + n.total }))
			)
			.map(({ city, total }) => ({ city: Campus[city], total }))
			.filter(({ city }) => city);
	}

	@SimpleCommand('scoreboard')
	@Guard(InProcess)
	async board(command: SimpleCommandMessage) {
		const time = Date.now();
		const msg = command.message;

		let results = this.groupByCity(await this.getData());

		console.log(results);

		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle('Scoreboard');

		results.forEach(({ city, total }) => {
			let ascii_per = '';
			let percentage = '0';
			let role = msg.guild?.roles.cache.find((role) => role.name === `${city}`);

			if (role === undefined) {
				ascii_per = 'error';
				percentage = 'error';
			} else {
				percentage = ((role.members.size / total) * 100).toFixed(2);
				for (let n = 0; n < 10; n++) {
					if (
						parseInt(
							(parseInt(percentage, 10) / 10).toFixed(0).toString(),
							10
						) > n
					) {
						ascii_per = ascii_per + '=';
					}
				}
				for (let n = ascii_per.length; n < 10; n++) {
					ascii_per = ascii_per + '-';
				}
			}
			embed.addField(`${city}`, `\`[${ascii_per}]\`, ${percentage}%`, true);
		});

		Scoreboard.processing = false;
		command.message.channel.send({ embeds: [embed] });
		command.message.channel.send(`${Date.now() - time}`);
	}

	@SimpleCommand('score')
	@Guard(InProcess)
	async cityScore(
		@SimpleCommandOption('city', { type: 'STRING' }) city: string | undefined,
		command: SimpleCommandMessage
	) {
		if (!city || !(city in Campus))
			return command.message.channel.send('usage: ``!score <FR/...>``');

		let results = this.groupByCity(
			await this.getData([city as keyof typeof Campus])
		);

		const msg = command.message;
		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle(results[0].city ?? city);

		results.forEach(({ city, total }) => {
			let ascii_per = '';
			let percentage = '0';
			let role = msg.guild?.roles.cache.find((role) => role.name === `${city}`);

			if (role === undefined) {
				embed.setDescription('Error');
			} else {
				percentage = ((role.members.size / total) * 100).toFixed(2);
				for (let n = 0; n < 20; n++) {
					if (
						parseInt(
							(parseInt(percentage, 10) / 20).toFixed(0).toString(),
							10
						) > n
					) {
						ascii_per = ascii_per + '=';
					}
				}
				for (let n = ascii_per.length; n < 20; n++) {
					ascii_per = ascii_per + '-';
				}
				embed.setDescription(
					`${role.members.size} / ${total}\n\`[${ascii_per}]\`, ${percentage}%`
				);
			}
		});

		Scoreboard.processing = false;
		command.message.channel.send({ embeds: [embed] });
	}
}
