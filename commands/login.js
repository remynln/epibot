const Discord = require('discord.js')
const axios = require('axios');
const cookie = require('../config/cookie.json')
const config = require('../config/config.json')

async function give_role(data, msg, bot) {
    var city = msg.member.guild.roles.cache.find(role => role.name === data.profile.city.name);
    var tmp = parseInt(data.profile.promo.id, 10);
    var promo = undefined;

    if (tmp < 2021)
        promo = msg.member.guild.roles.cache.find(role => role.name === "Boomers");
    else
        promo = msg.member.guild.roles.cache.find(role => role.name === `${tmp}`);
    var verif = msg.member.guild.roles.cache.find(role => role.name === "Verified");
    
    if (data.profile.groups.filter(e => e.id === "AER").length > 0) {
        var aer = msg.member.guild.roles.cache.find(role => role.name === "AER");
        msg.member.roles.add(aer);
    }
    
    msg.member.roles.add(city)
    msg.member.roles.add(promo)
    msg.member.roles.add(verif)
    msg.member.send(`Vous avez été assigné à l'utilisateur **${data.profile.name}** avec succès.\nEn cas d'erreur veuillez contacter un admin`)
    //msg.member.setNickname(data.profile.name)
    var embed = new Discord.MessageEmbed()
    .setColor("#4169E1")
    .setTimestamp()
    .setThumbnail(msg.author.avatarURL())
    .setTitle(`${msg.author.username} | ${data.profile.name}`)
    .setDescription(msg.content)
    .addField("Grades:", `${data.profile.promo.id} | ${data.profile.city.name}`, true)
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
            await msg.channel.send(`promo: ${data.profile.promo.id}\nville: ${data.profile.city.name}`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            })
        await give_role(data, msg, bot)
    }
}

module.exports = {
    run: (msg, args, bot) => {login(args, msg, bot)},
    name: 'login'
}
