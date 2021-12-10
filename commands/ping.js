const Discord = require('discord.js')

function hello(args, msg, bot) {
    const embed = new Discord.MessageEmbed()
    .setColor('#ss')
    .setTitle('Ping')
    .setDescription(`${Date.now() - msg.createdTimestamp} ms`)
    msg.channel.send(embed)
}

module.exports = {
    run: (msg, args, bot) => {hello(args, msg, bot)},
    name: 'ping'
}