const Discord = require('discord.js')
const axios = require('axios');
const cookie = require('../config/cookie.json')
const config = require('../config/config.json')

async function give_role(data, msg, bot) {
    var tmp = parseInt(data.profile.promo.id, 10)
    var promo = undefined;
    if (Math.abs(tmp - 2026) > 5)
        promo = msg.member.guild.roles.cache.find(role => role.id === "838097040545153065");
    else
        promo = msg.member.guild.roles.cache.find(role => role.name === `Tek ${Math.abs(tmp - 2026)}`);
    msg.member.roles.add(promo)
    msg.member.send(`Vous avez été assigné au role **${promo.name}**, et à l'utilisateur ${data.profile.name} avec succes.\nEn cas d'erreur veuillez contacter un admin`)
    msg.member.setNickname(data.profile.name)
    var embed = new Discord.MessageEmbed()
    .setColor(promo.hexColor)
    .setTimestamp()
    .setThumbnail(msg.author.avatarURL())
    .setTitle(`${msg.author.username}`)
    .setDescription(msg.content)
    .addField("Grades:", `${promo.name}`, true)
    const channel = msg.member.guild.channels.cache.find(channel => channel.id === config.log_chan);
    channel.send(embed)
}

async function login(args, msg, bot) {
    let flag = 0;

    axios.interceptors.request.use(
        config => {
            config.headers.cookie = `conect.sid=${cookie.cookie}`
            return config
        },
        error => {
            return Promise.reject(error)
        }
    )
    const data = await axios.get(`https://roslyn.epi.codes/trombi/api.php?version=2&state=1615851442&action=profile&q=${msg.content}`).then(res => res.data).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            flag = 1;
            return msg.channel.send(`Error: ${error.response.data.error}, code: ${error.response.status}`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
              })
        }})
        console.log(data)
        if (!flag) {
            await give_role(data, msg, bot)
    }
}

module.exports = {
    run: (msg, args, bot) => {login(args, msg, bot)},
    name: 'login'
}
