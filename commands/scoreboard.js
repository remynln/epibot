const Discord = require('discord.js')
const axios = require('axios');
const cookie = require('../config/cookie.json')
const config = require('../config/config.json')

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

async function send_scoreboard(results, msg) {
    var embed = new Discord.MessageEmbed()
    .setColor("#4169E1")
    .setTimestamp()
    .setTitle("Scoreboard")
    
    Object.entries(results).forEach((city, total) => {
        let ascii_per = ""
	let percentage = 0;
        let role = msg.guild.roles.cache.find(role => role.name === `${city[0]}`)
	if (role === undefined) {
	    ascii_per = "error"
            city = "error"
	    percentage = "error"
	} else {
            percentage = ((role.members.size / city[1]) * 100).toFixed(2);
            for (let n = 0; n < 10; n++) {
                if (parseInt(((parseInt(percentage, 10))/10).toFixed(0).toString(), 10) > n){
                    ascii_per = ascii_per + "=";
                }
            }
            for (let n = ascii_per.length; n < 10; n++) {
                ascii_per = ascii_per + "-"
            }
	}
        embed.addField(`${city[0]}`, `\`[${ascii_per}]\`, ${percentage}%`, true)
    })
    
    await msg.channel.send(embed)
}

async function scoreboard(args, msg, bot) {
    let flag = 0;
    let city = ["FR/BDX", "FR/LIL", "FR/LYN", "FR/MAR", "FR/MLH", "FR/MLN", "FR/MPL", "FR/NAN", "FR/NCE", "FR/NCY", "FR/PAR", "FR/REN", "FR/RUN", "FR/STG", "FR/TLS"]
    let course = ["bachelor/classic", "bachelor/tek1ed", "bachelor/tek2ed", "bachelor/tek3s", "digital"]
    let results = {}
    
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
        for (let j = 0; course[j]; j++) {
            const data = await axios.get(`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=all&filter[course]=${course[j]}&filter[city]=${city[i]}&filter[group]=all`).then(res => res.data).catch(function (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    flag = 1;
                    return msg.channel.send(`Error: ${error.response.data.error}, code: ${error.response.status}`).then(msg => {
                        setTimeout(() => msg.delete(), 5000);
                    })
                }
            })
            const drop_out = !data.count ? { count: 0 } : await axios.get(`https://roslyn.epi.codes/trombi/api.php?version=2&state=1634121466&action=search&q=&filter[promo]=out&filter[course]=${course[j]}&filter[city]=${city[i]}&filter[group]=all`).then(res => res.data).catch(function (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    flag = 1;
                    return msg.channel.send(`Error: ${error.response.data.error}, code: ${error.response.status}`).then(msg => {
                        setTimeout(() => msg.delete(), 5000);
                    })
                }
            })
            let total = (data?.count ?? 0) - (drop_out?.count ?? 0)
            console.log(city[i], course[j], total)
            if (!flag && total) {
                const full_city_name = data.users.filter(({ city }) => city)[0]?.city
		console.log("Coucou " + full_city_name)
                results[full_city_name] = (results[full_city_name] ?? 0) + total
            }
            flag = 0;
        }
    }
    send_scoreboard(results, msg)
}

module.exports = {
    run: (msg, args, bot) => {scoreboard(args, msg, bot)},
    name: 'scoreboard'
}
