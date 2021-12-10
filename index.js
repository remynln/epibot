const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config/config.json')
const bot = new Discord.Client();

bot.commands = new Discord.Collection();

fs.readdir("./commands", (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const command = require(`./commands/${file}`)
        bot.commands.set(command.name, command)
    })
})

bot.on('ready', () => {
    console.log("epibot est connecté");
})

bot.on('message', (msg) => {
    if (msg.type != 'DEFAULT' || msg.author.bot) return;

    const args = msg.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (msg.channel.id === config.verify_chan) {
        if (!msg.content.endsWith("@epitech.eu")) return msg.channel.send("Error, please enter valid e-mail");
        const command = bot.commands.get("login");
        command.run(msg, args, bot);
        return;
    }
    if (!commandName.startsWith(config.prefix)) return;
    const command = bot.commands.get(commandName.slice(config.prefix.length))
    if (!command) {
        msg.react("❌")
        return
    }
    command.run(msg, args, bot)
})

bot.login(config.token)
