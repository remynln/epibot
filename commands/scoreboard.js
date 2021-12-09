const Discord = require('discord.js')
const axios = require('axios');
const cookie = require('../config/cookie.json')
const config = require('../config/config.json')

String.prototype.replaceAt = function(index, replacement) {
	    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

async function send_scoreboard(results, full_city_name, msg) {
    let percentage = []
    var embed = new Discord.MessageEmbed()
    .setColor("#4169E1")
    .setTimestamp()
    .setTitle("Scoreboard")
    for (let i = 0; results[i]; i++){
    	let ascii_per = ""
	let role = msg.guild.roles.cache.find(role => role.name === `${full_city_name[i]}`)
	percentage[i] = ((role.members.size / parseInt(results[i], 10)) * 100).toFixed(2);
	for (n = 0; n < 10; n++) {
	    if (parseInt(((parseInt(percentage[i], 10))/10).toFixed(0).toString(), 10) > n){
		console.log("oui")
		ascii_per = ascii_per + "=";
	    }
	}
	for (n = ascii_per.length; n < 10; n++) {
	    ascii_per = ascii_per + "-"
	}
	embed.addField(`${full_city_name[i]}`, `\`[${ascii_per}]\`, ${percentage[i]}%`, true)
    }
    await msg.channel.send(embed)
}

async function scoreboard(args, msg, bot) {
    let flag = 0;
    let city = ["FR/BDX", "FR/LIL", "FR/LYN", "FR/MAR", "FR/MLH", "FR/MLN", "FR/MPL", "FR/NAN", "FR/NCE", "FR/NCY", "FR/PAR", "FR/REN", "FR/RUN", /*"FR/STG",*/ "FR/TLS"]
    let results = []
    let full_city_name = []
    axios.interceptors.request.use(
        config => {
            config.headers.cookie = `conect.sid=${cookie.cookie}`
            return config
        },
        error => {
            return Promise.reject(error)
        }
    )
    for (let i = 0; city[i]; i++) {
        const data = await axios.get(`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=all&filter[course]=all&filter[city]=${city[i]}&filter[group]=all`).then(res => res.data).catch(function (error) {
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
		full_city_name[i] = data.users[1].city
                results[i] = data.count
        }
	if (results.length === city.length) {
            send_scoreboard(results, full_city_name, msg)
	}
    }
}

module.exports = {
    run: (msg, args, bot) => {scoreboard(args, msg, bot)},
    name: 'scoreboard'
}
