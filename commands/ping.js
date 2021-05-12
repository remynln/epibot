const Discord = require('discord.js')

function hello(args, msg, bot) {
    const time = Date.now();
    const embed = new Discord.MessageEmbed()
    .setColor('#ss')
    .setTitle('Ping')
    .setDescription(`Api discord: ${Date.now() - time} ms`)
    msg.channel.send(embed)
}

module.exports = {
    run: (msg, args, bot) => {hello(args, msg, bot)},
    name: 'ping'
}