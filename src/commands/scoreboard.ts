import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import {
	Discord,
	SimpleCommand,
	SimpleCommandMessage,
	SimpleCommandOption
} from 'discordx';

const all_courses = [
	'bachelor/classic',
	'bachelor/tek1ed',
	'bachelor/tek2ed',
	'bachelor/tek3s',
	'digital',
	'premsc'
];
const all_cities = [
	'FR/BDX',
	'FR/LIL',
	'FR/LYN',
	'FR/MAR',
	'FR/MLH',
	'FR/MLN',
	'FR/MPL',
	'FR/NAN',
	'FR/NCE',
	'FR/NCY',
	'FR/PAR',
	'FR/REN',
	'FR/RUN',
	'FR/STG',
	'FR/TLS',
	'BJ/COT'
];

@Discord()
class Scoreboard {
	processing = false;

	async getData(cities: string[], courses: string[]): Promise<any[][][]> {
		axios.interceptors.request.use(
			(config) => {
				config.headers.cookie = `conect.sid=${process.env.ROSLYN_COOKIE ?? ''}`;
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		let datas = await Promise.allSettled(
			cities.map((city) =>
				Promise.allSettled(
					courses.map((course) =>
						Promise.allSettled([
							axios
								.get(
									`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=all&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
								)
								.then((res) => res.data)
								.catch((err) => err),
							axios
								.get(
									`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=out&filter[course]=${course}&filter[city]=${city}&filter[group]=all`
								)
								.then((res) => res.data)
								.catch((err) => err)
						])
					)
				)
			)
		);

		return datas.map((city) => {
			if (city.status == 'fulfilled')
				return city.value.map((course) => {
					if (course.status == 'fulfilled')
						return course.value.map((data) => {
							if (data.status == 'fulfilled') {
								return data.value;
							}
							return null;
						});
					return [];
				});
			return [];
		});
	}

	dataByCity(data: any[][][]) {
		return data
			.map((city) => {
				return city
					.map((course) => {
						return course.reduce((din, dout) => {
							const full_city_name = din.users.filter(
								({ city }: { city?: string }) => city
							)[0]?.city;
							return {
								city: full_city_name,
								count: (din.count ?? 0) - (dout.count ?? 0)
							};
						});
					})
					.reduce((p, c) => {
						return {
							city: p.city ?? c.city,
							count: p.count + c.count
						};
					});
			})
			.filter((o) => o.city);
	}

	@SimpleCommand('scoreboard')
	async board(command: SimpleCommandMessage) {
		const time = Date.now();
		const msg = command.message;

		if (this.processing) {
			msg.react('❗');
			return;
		}
		msg.react('✅');
		this.processing = true;

		let results = this.dataByCity(await this.getData(all_cities, all_courses));

		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle('Scoreboard');

		results.forEach(({ city, count }) => {
			let ascii_per = '';
			let percentage = '0';
			let role = msg.guild?.roles.cache.find((role) => role.name === `${city}`);

			if (role === undefined) {
				ascii_per = 'error';
				percentage = 'error';
			} else {
				percentage = ((role.members.size / count) * 100).toFixed(2);
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

		command.message.channel.send({ embeds: [embed] });
		this.processing = false;
	}

	@SimpleCommand('score')
	async cityScore(
		@SimpleCommandOption('city', { type: 'STRING' }) city: string | undefined,
		command: SimpleCommandMessage
	) {
		if (!city || !city.match(/^FR\/[A-Z]{3}$/))
			return command.message.channel.send('usage: ``!score <FR/...>``');

		let results = this.dataByCity(await this.getData([city], all_courses));

		const msg = command.message;
		const embed = new MessageEmbed()
			.setColor('#4169E1')
			.setTimestamp()
			.setTitle(results[0].city ?? city);

		results.forEach(({ city, count }) => {
			let ascii_per = '';
			let percentage = '0';
			let role = msg.guild?.roles.cache.find((role) => role.name === `${city}`);

			if (role === undefined) {
				embed.setDescription('Error');
			} else {
				percentage = ((role.members.size / count) * 100).toFixed(2);
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
					`${role.members.size} / ${count}\n\`[${ascii_per}]\`, ${percentage}%`
				);
			}
		});

		command.message.channel.send({ embeds: [embed] });
	}
}
