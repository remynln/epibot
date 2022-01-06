import axios from 'axios';
import { Message, MessageEmbed } from 'discord.js';
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
import { LogError } from './error.js';
import { processTime } from './ping.js';

const InProcess: GuardFunction<SimpleCommandMessage> = async (
	{ message },
	client,
	next
) => {
	if (!Scores.processing) {
		await message.channel.sendTyping();
		Scores.processing = true;
		await next();
		Scores.processing = false;
	} else {
		await message.channel.send("Calm down, I'm processing...");
		await message.channel.sendTyping();
	}
};

@Discord()
class Scores {
	static processing = false;
	static cache: Data[] = [];

	async getData(
		msg: Message,
		campus: CampusKey[] = Object.keys(Campus) as CampusKey[],
		courses: CoursesKey[] = Object.keys(Courses) as CoursesKey[]
	): Promise<Data[]> {
		axios.interceptors.request.use(
			(config) => {
				config.headers.cookie = process.env.ROSLYN_COOKIE;
				return config;
			},
			(error) => Promise.reject(error)
		);

		Scores.cache.push(
			...(
				await Promise.allSettled<Promise<Data>[]>(
					(
						await Promise.allSettled<Promise<Data>[]>(
							campus.flatMap((city) =>
								courses.map((course) => {
									if (
										Scores.cache.find(
											(_) => _.city === city && _.course === course
										)
									)
										return Promise.reject();

									return axios
										.get(
											`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=all&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
										)
										.then((res) => ({
											city: city,
											course: course,
											total: res.data.count
										}));
								})
							)
						)
					).map((_) => {
						if (_.status !== 'fulfilled') return Promise.reject(_.reason);
						let { city, course, total } = _.value;
						if (total < 1) return Promise.resolve({ city, course, total });

						return axios
							.get(
								`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=out&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
							)
							.then((res) => ({
								city: city,
								course: course,
								total: total - res.data.count
							}))
							.catch((err) => ({ city, course, total }));
					})
				)
			)
				.map((_) => {
					if (_.status !== 'fulfilled') {
						LogError(msg, _.reason);
						return null;
					}
					return _;
				})
				.filter((_) => _ != null)
				// @ts-expect-error
				.map(({ value }) => value)
		);

		return Scores.cache.filter(
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
				group.reduce((p, n) => ({ ...p, total: p.total + n.total }))
			)
			.map(({ city, total }) => ({ city: Campus[city], total }))
			.filter(({ city }) => city);
	}

	@SimpleCommand('leaderboard', {
		aliases: ['scoreboard']
	})
	@Guard(InProcess)
	async board(command: SimpleCommandMessage) {
		const msg = command.message;

		let results = this.groupByCity(await this.getData(msg));

		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle('Scoreboard');

		results
			.map(({ city, total }) => {
				let role = msg.guild?.roles.cache.find(
					(role) => role.name === `${city}`
				);
				if (role === undefined) return { city, percentage: 0 };
				return {
					city,
					percentage: (role.members.size / total) * 100
				};
			})
			.filter(({ percentage }) => percentage)
			.sort((a, b) => b.percentage - a.percentage)
			.forEach(({ city, percentage }) => {
				let ascii_per = '';
				for (let n = 0; n < 10; n++)
					if (percentage / 10 > n) ascii_per = ascii_per + '=';
				for (let n = ascii_per.length; n < 10; n++) ascii_per = ascii_per + '-';
				embed.addField(
					`${city}`,
					`\`[${ascii_per}]\`, ${percentage.toFixed(2)}%`,
					true
				);
			});

		embed.setFooter(`(${processTime(msg)}ms)`);
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
		const msg = command.message;

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

		let results = await this.getData(msg, [city]);

		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle(Campus[city]);

		this.groupByCity(results).forEach(async ({ city, total }) => {
			let ascii_per = '';
			let percentage = 0;
			let role = msg.guild?.roles.cache.find((role) => role.name === `${city}`);

			if (role === undefined) {
				embed.setDescription(`??? / ${total}\n\`[----------]\`, 0.00%`);
			} else {
				percentage = (role.members.size / total) * 100;
				for (let n = 0; n < 20; n++)
					if (percentage / 10 > n / 2) ascii_per = ascii_per + '=';
				for (let n = ascii_per.length; n < 20; n++) ascii_per = ascii_per + '-';
				embed.setDescription(
					`${role.members.size
					} / ${total}\n\`[${ascii_per}]\`, ${percentage.toFixed(2)}%`
				);
			}
		});

		embed.setFooter(`(${processTime(msg)}ms)`);
		command.message.channel.send({ embeds: [embed] });
	}
}
