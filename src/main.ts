import 'reflect-metadata';
import 'dotenv/config';
import { Intents, Interaction, Message } from 'discord.js';
import { Client } from 'discordx';
import { dirname, importx } from '@discordx/importer';

import config from './config.mjs';

/* eslint-disable import/first */
const client = new Client({
	simpleCommand: {
		prefix: config.prefix
	},
	intents: Object.values(Intents.FLAGS),
	// If you only want to use global commands only, comment this line
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
	silent: true
});

client.once('ready', async () => {
	// make sure all guilds are in cache
	await client.guilds.fetch();

	// init all application commands
	await client.initApplicationCommands({
		guild: { log: true },
		global: { log: true }
	});

	// init permissions; enabled log to see changes
	await client.initApplicationPermissions(true);

	// uncomment this line to clear all guild commands,
	// useful when moving to global commands from guild commands
	//  await client.clearApplicationCommands(
	//    ...client.guilds.cache.map((g) => g.id)
	//  );

	console.log('Bot started');
});

client.on('interactionCreate', (interaction: Interaction) => {
	client.executeInteraction(interaction);
});

client.on('messageCreate', (message: Message) => {
	client.executeCommand(message);
});

async function run() {
	// with cjs
	// await importx(__dirname + "/{events,commands}/**/*.{ts,js}");
	// with ems
	await importx(dirname(import.meta.url) + '/{events,commands}/**/*.{ts,js}');
	client.login(process.env.BOT_TOKEN ?? ''); // provide your bot token
}

run();
