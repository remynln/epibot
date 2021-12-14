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
import { Campus, CampusKey, Courses, CoursesKey, Data } from '../type.js';

const InProcess: GuardFunction<SimpleCommandMessage> = async (
	{ message },
	client,
	next
) => {
	if (!Scoreboard.processing) {
		message.react('👍');
		await message.channel.sendTyping();
		Scoreboard.processing = true;
		await next();
		Scoreboard.processing = false;
		message.reactions.removeAll();
	} else message.react('❗');
};

@Discord()
class Scoreboard {
	static processing = false;
	static cache: Data[] = [];

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

		Scoreboard.cache.push(
			...(
				await Promise.allSettled(
					(
						await Promise.allSettled(
							campus.flatMap((city) =>
								courses.map((course) => {
									if (
										Scoreboard.cache.find(
											(_) => _.city === city && _.course === course
										)
									) {
										return Promise.resolve(null);
									}
									return axios
										.get(
											`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=all&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
										)
										.then((res) => ({
											city: city,
											course: course,
											total: res.data.count
										}))
										.catch((err) => err);
								})
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
				.filter((_) => _)
		);

		return Scoreboard.cache.filter(
			(_) => campus.includes(_.city) && courses.includes(_.course)
		);
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

		embed.setFooter(`(${Date.now() - time}ms)`);
		command.message.channel.send({ embeds: [embed] });
	}

	@SimpleCommand('score', {
		description: 'Display detail for city score'
	})
	@Guard(InProcess)
	async cityScore(
		@SimpleCommandOption('city', { type: 'STRING' })
		city: CampusKey | undefined,
		command: SimpleCommandMessage
	) {
		const time = Date.now();
		const msg = command.message;

		if (!city || !(city in Campus)) return command.sendUsageSyntax();

		let results = await this.getData([city]);

		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle(Campus[city]);

		this.groupByCity(results).forEach(async ({ city, total }) => {
			let ascii_per = '';
			let percentage = '0';
			let role = msg.guild?.roles.cache.find((role) => role.name === `${city}`);

			if (role === undefined) {
				embed.setDescription(`??? / ${total}\n\`[----------]\`, 0.00%`);
			} else {
				percentage = ((role.members.size / total) * 100).toFixed(2);
				for (let n = 0; n < 20; n++) {
					if (parseInt(percentage, 10) / 10 > n / 2) {
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

		embed.setFooter(`(${Date.now() - time}ms)`);
		command.message.channel.send({ embeds: [embed] });
	}
}
