const axios = require('axios');
const cookie = require('../config/cookie.json')
const config = require('../config/config.json')
const years = ["2026", "2025", "2024"]

async function manage_channels(data, bot, year, server, logs) {
    const today = new Date()
    today.setHours(0,0,0,0)
    const tmp = Math.abs(parseInt(year, 10) - today.getFullYear() - 2)

    for(let i in data.projects) {
        let start = new Date(data.projects[i].start)
        let end = new Date(data.projects[i].end)
        if (start.getTime() === today.getTime()) {
            let chan = server.channels.cache.find(channel => channel.name === data.projects[i].module.toLowerCase().replace(/ |\/|\./g, ""));
            console.log(data.projects[i].module.toLowerCase().replace(/ |\/|\./g, ""))
            if (!chan) {
                chan = await server.channels.create(data.projects[i].module.toLowerCase().replace(/ |\/|\./g, ""))
                const category = server.channels.cache.get(config.categories[tmp])
                if (category)
                    await chan.setParent(category)
            }
            logs.send(`Project ${data.projects[i].project} start today`)

        const thread = await chan.threads.create({
                name: `${data.projects[i].project.replace(/ |\/|\./g, "")}`,
                autoArchiveDuration: 24*60,
                reason: 'because',
            });
            console.log(`Created thread: ${thread.name}`);
            } else if (end.getTime() === today.getTime()) {
                logs.send(`Project ${data.projects[i].project} end today`)
                const channel = server.channels.cache.find(channel => channel.name === data.projects[i].module.toLowerCase().replace(/ |\/|\./g, ""));
                if (channel) {
                    const thread = channel.threads.cache.find(x => x.name === data.projects[i].project.replace(/ |\/|\./g, ""));
                    if (thread)
                        await thread.setArchived(true);
                }
            }

    }
}

async function channels(bot) {
    let flag = 0;
    const server = bot.guilds.cache.get(config.server)
    const channel = server.channels.cache.get(config.log_chan)

    axios.interceptors.request.use(
        config => {
            config.headers.cookie = `conect.sid=${cookie.cookie}`
            return config
        },
        error => {
            return Promise.reject(error)
        }
    )
    for (const i in years) {
        const data = await axios.get(`https://roslyn.epi.codes/${years[i]}/timeline/data.json`).then(res => res.data).catch(function (error) {
            if (error.response) {
                return channel.send(`Error: ${error.response.data.error}, code: ${error.response.status}`)
            }
        })
         if (!flag) {
            await manage_channels(data, bot, years[i], server, channel)
        }
    }
}

module.exports = {
    run: (bot) => {channels(bot)},
    name: 'channels'
}
