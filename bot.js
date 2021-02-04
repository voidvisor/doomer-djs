const Discord = require('discord.js');
const fs = require('fs');
const jsonname = './jsconfig.json'
const jsonname2 = './msg.json'

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    function resetWeekly() {
        var jsonfile = fs.readFileSync(jsonname);
        var obj = JSON.parse(jsonfile);
        let quotachannel = client.channels.cache.get("778312068164091974");
        var mainServer = client.guilds.cache.get("657255154273484801");
        var positivelist = []
        var negativelist = []
        var neutrallist = []
        var nolist = []
        async function analyzer() {
            for (var i = 0; i < obj.weekly.length; i++) {
                var username = obj.weekly[i].username
                var userid = obj.weekly[i].userid
                var printed = parseInt(obj.weekly[i].printed)
                function findIndex() {
                    for (var i = 0; i < obj.users.length; i++) {
                        if (userid == obj.users[i].userid) {
                            return i
                        }
                    }
                }
                var userIndex = findIndex()
                if (typeof userIndex == 'number') {
                    if (obj.users[userIndex].discordid != '' && typeof obj.users[userIndex].discordid == 'string' && obj.users[userIndex].discordid != 'undefined') {
                        var person = await mainServer.members.fetch(obj.users[userIndex].discordid)
                        function findLimit() {
                            for (var i = 0; i < obj.ranks.length; i++) {
                                if (person.roles.cache.some(role => role.name === obj.ranks[i].rank)) {
                                    return obj.ranks[i].quota;
                                } else {
                                    return 1
                                }
                            }
                        }
                        var needed = parseInt(findLimit())
                    } else {
                        var needed = parseInt("NaN")
                    }
                }
                if (typeof needed != 'undefined') {
                    var percent = printed / needed * 100
                    if (printed < needed || needed == 0) {
                        var bonus = 0
                    } else {
                        var bonus = (printed - needed) * 0.01
                    }
                }
                if (needed != 1) {
                    var toPush = `**${username}**(${userid})\n${printed}/${needed}$ (${percent}%)\nBonus: ${bonus}$\n`
                    if (needed == 0) {
                        nolist.push(toPush)
                    } else if (percent >= 100) {
                        positivelist.push(toPush)
                    } else if (printed > 0) {
                        neutrallist.push(toPush)
                    } else {
                        negativelist.push(toPush)
                    }
                }
                obj.weekly[i].printed = "0"
            }
            fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(JSON.stringify(obj));
                console.log('writing to ' + jsonname);
            });
            return {
                positive: positivelist.join(''),
                neutral: neutrallist.join(''),
                negative: negativelist.join(''),
                noquota: nolist.join('')
            }
        }
        console.log("Weekly reset initiated.")
        fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
            if (err) return console.log(err);
            console.log(JSON.stringify(obj));
            console.log('writing to ' + jsonname);
        });
        var analyze = analyzer()
        analyze.then(function (result) {
            quotachannel.send(`**Weekly Quota analysis**\n**Good Boys** Those who have completed their quota this week.\n${result.positive}\n**Meh Boys** Those who haven't completed their quota this week.\n${result.neutral}\n**Bad Boys** Those who are terrible bankers and ended the week with a negative quota.\n${result.negative}\n**No Quota** People who are exempt from the weekly quota.\n${result.noquota}`);
        })
    }
    function scheduleReset(time, triggerThis) {
        const hour = Number(time.split(':')[0]);
        const minute = Number(time.split(':')[1]);
        const startTime = new Date(); startTime.setHours(hour, minute);
        var now = new Date();
        var n = now.getDay();
        console.log(`Bot currently on ${n} day.`)
        if (n == 0) {
            startTime.setHours(startTime.getHours() + 24);
        } else if (n > 1) {
            var timeHours = (8 - n) * 24
            startTime.setHours(startTime.getHours() + timeHours);
        } else if (startTime.getTime() < now.getTime()) {
            startTime.setHours(startTime.getHours() + (7 * 24));
        }
        const firstTriggerAfterMs = startTime.getTime() - now.getTime();
        setTimeout(function () {
            triggerThis();
            setInterval(triggerThis, 7 * 24 * 60 * 60 * 1000);
        }, firstTriggerAfterMs);
    }
    scheduleReset("02:00", resetWeekly)
    let logchannel = client.channels.cache.get("669998643515883520"/*"693830200672387072"*/);
    async function lots_of_messages_getter(channel, limit = 6000) {
        const sum_messages = [];
        let last_id;

        while (true) {
            const options = { limit: 100 };
            if (last_id) {
                options.before = last_id;
            }

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) {
                break;
            }
            sum_messages.push(...messages.array());
            last_id = messages.last().id;

            if (messages.size != 100 || sum_messages.length >= limit) {
                break;
            }
        }

        return sum_messages;
    }
    function timeSinceReset() {
        var now = new Date();
        var n = now.getDay();
        var h = now.getHours();
        var time = now.getTime();
        if (n == 0) {
            var dayStamp = 86400 * 6 * 1000
        } else if (n > 1) {
            var dayStamp = 86400 * (n - 1) * 1000
        } else {
            var dayStamp = 0
        }
        if (h == 0) {
            var hourStamp = -3600 * 2 * 1000
        } else if (h > 2) {
            var hourStamp = 3600 * (h - 2) * 1000
        } else if (h == 1) {
            var hourStamp = -3600 * h * 1000
        }
        var totalStamp = hourStamp + dayStamp
        var finalStamp = time - totalStamp
        return finalStamp
    }
    if (typeof logchannel != 'undefined') {
        var messageData = lots_of_messages_getter(logchannel, 500)
        console.log(messageData);
        messageData.then(function (result) {
            console.log(result)
            var jsonfile = fs.readFileSync(jsonname);
            var obj = JSON.parse(jsonfile);
            var jsonfile2 = fs.readFileSync(jsonname2);
            var obj2 = JSON.parse(jsonfile2);
            obj2.messages = result
            fs.writeFile(jsonname2, JSON.stringify(obj2, undefined, 2), function writeJSON(err) {
                if (err) return console.log(err);
                //console.log(JSON.stringify(obj2));
                console.log('writing to ' + jsonname2);
            });
            if (obj.lastdata.messageid == obj2.messages[0].id) {
                console.log('no messages while bot was offline.')
                fs.writeFile(jsonname2, JSON.stringify(obj2, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj2));
                    console.log('writing to ' + jsonname2);
                });
            } else {
                for (var i = 0; i < obj2.messages.length; i++) {
                    let logchannel = client.channels.cache.get("669998643515883520"/*"693830200672387072"*/);
                    let logmessage = logchannel.messages.fetch(`${obj2.messages[i].id}`)
                    console.log(logmessage)
                    logmessage.then(function (result) {
                        if (typeof result != 'undefined') {
                            if (result.content.startsWith('**Worked** at the Bank and')) {
                                var parts1 = result.author.username.split("(")
                                var loguser = parts1[0]
                                var theid = parts1[1]
                                var logid = theid.slice(0, -1)
                                var parts2 = result.content.split(" ")
                                var moneh = parts2[7].split("$")
                                if (moneh[0].charAt(moneh[0].length - 1) == 'k') {
                                    var moneh = parts2[7].split("k")
                                    var realmoneh = parseFloat(moneh[0].substring(2)) * 1000
                                } else {
                                    var realmoneh = parseFloat(moneh[0].substring(2))
                                }
                                function findTotal() {
                                    for (var i = 0; i < obj.users.length; i++) {
                                        if (obj.users[i].userid == logid) {
                                            return obj.users[i].userid
                                        }
                                    }
                                }
                                function findTotal2() {
                                    for (var i = 0; i < obj.weekly.length; i++) {
                                        if (obj.weekly[i].userid == logid) {
                                            return obj.weekly[i].userid
                                        }
                                    }
                                }
                                var checker = findTotal()
                                var checker2 = findTotal2()
                                if (typeof checker == 'string' && typeof checker2 == 'string') {
                                    function findIndex() {
                                        for (var i = 0; i < obj.users.length; i++) {
                                            if (obj.users[i].userid == logid) {
                                                return i
                                            }
                                        }
                                    }
                                    function findIndex2() {
                                        for (var i = 0; i < obj.weekly.length; i++) {
                                            if (obj.weekly[i].userid == logid) {
                                                return i
                                            }
                                        }
                                    }
                                    var userindex = findIndex()
                                    var userindex2 = findIndex2()
                                    var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                                    var weeklyprint = parseInt(obj.weekly[userindex2].printed) + realmoneh
                                    var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                                    var myobj1 = JSON.parse(myjson1)
                                    obj.users[userindex] = myobj1;
                                    var resetTime = timeSinceReset()
                                    if (result.createdTimestamp > resetTime) {
                                        var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                                        console.log(`${myjson2} success.`)
                                        var myobj2 = JSON.parse(myjson2)
                                        obj.weekly[userindex2] = myobj2;
                                    }
                                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                                        if (err) return console.log(err);
                                        //console.log(JSON.stringify(obj));
                                        console.log('writing to ' + jsonname);
                                    });
                                } else if (typeof checker == 'string' && typeof checker2 != 'string') {
                                    function findIndex() {
                                        for (var i = 0; i < obj.users.length; i++) {
                                            if (obj.users[i].userid == logid) {
                                                return i
                                            }
                                        }
                                    }
                                    var userindex = findIndex()
                                    var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                                    var weeklyprint = realmoneh
                                    var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                                    var myobj1 = JSON.parse(myjson1)
                                    obj.users[userindex] = myobj1;
                                    var resetTime = timeSinceReset()
                                    if (result.createdTimestamp > resetTime) {
                                        var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                                        console.log(`${myjson2} failed.`)
                                        var myobj2 = JSON.parse(myjson2)
                                        obj.weekly[obj.weekly.length] = myobj2;
                                    }
                                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                                        if (err) return console.log(err);
                                        //console.log(JSON.stringify(obj));
                                        console.log('writing to ' + jsonname);
                                    });
                                } else {
                                    var totalprint = realmoneh
                                    var weeklyprint = realmoneh
                                    var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}"}`
                                    var myobj1 = JSON.parse(myjson1)
                                    obj.users[obj.users.length] = myobj1;
                                    var resetTime = timeSinceReset()
                                    if (result.createdTimestamp > resetTime) {
                                        var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                                        var myobj2 = JSON.parse(myjson2)
                                        obj.weekly[obj.weekly.length] = myobj2;
                                    }
                                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                                        if (err) return console.log(err);
                                        //console.log(JSON.stringify(obj));
                                        console.log('writing to ' + jsonname);
                                    });
                                }
                            } else if (result.content.startsWith('**Worked** at the Bank but')) {
                                var parts1 = result.author.username.split("(")
                                var loguser = parts1[0]
                                var theid = parts1[1]
                                var logid = theid.slice(0, -1)
                                var parts2 = result.content.split(" ")
                                var lostmoneh = parts2[6].split("$")
                                var realmoneh = parseInt(lostmoneh[0].substring(2))
                                function findTotal() {
                                    for (var i = 0; i < obj.users.length; i++) {
                                        if (obj.users[i].userid == logid) {
                                            return obj.users[i].userid
                                        }
                                    }
                                }
                                function findTotal2() {
                                    for (var i = 0; i < obj.weekly.length; i++) {
                                        if (obj.weekly[i].userid == logid) {
                                            return obj.weekly[i].userid
                                        }
                                    }
                                }
                                var checker = findTotal()
                                var checker2 = findTotal2()
                                if (typeof checker == 'string' && typeof checker2 == 'string') {
                                    function findIndex() {
                                        for (var i = 0; i < obj.users.length; i++) {
                                            if (obj.users[i].userid == logid) {
                                                return i
                                            }
                                        }
                                    }
                                    function findIndex2() {
                                        for (var i = 0; i < obj.weekly.length; i++) {
                                            if (obj.weekly[i].userid == logid) {
                                                return i
                                            }
                                        }
                                    }
                                    var userindex = findIndex()
                                    var userindex2 = findIndex2()
                                    var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                                    var weeklyprint = parseInt(obj.weekly[userindex2].printed) + realmoneh
                                    var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                                    var myobj1 = JSON.parse(myjson1)
                                    obj.users[userindex] = myobj1;
                                    var resetTime = timeSinceReset()
                                    if (result.createdTimestamp > resetTime) {
                                        var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                                        var myobj2 = JSON.parse(myjson2)
                                        obj.weekly[userindex2] = myobj2;
                                    }
                                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                                        if (err) return console.log(err);
                                        //console.log(JSON.stringify(obj));
                                        console.log('writing to ' + jsonname);
                                    });
                                } else if (typeof checker == 'string' && typeof checker2 != 'string') {
                                    function findIndex() {
                                        for (var i = 0; i < obj.users.length; i++) {
                                            if (obj.users[i].userid == logid) {
                                                return i
                                            }
                                        }
                                    }
                                    var userindex = findIndex()
                                    var userindex = findIndex()
                                    var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                                    var weeklyprint = realmoneh
                                    var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                                    var myobj1 = JSON.parse(myjson1)
                                    obj.users[userindex] = myobj1;
                                    var resetTime = timeSinceReset()
                                    if (result.createdTimestamp > resetTime) {
                                        var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                                        console.log(`${myjson2} failed.`)
                                        var myobj2 = JSON.parse(myjson2)
                                        obj.weekly[obj.weekly.length] = myobj2;
                                    }
                                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                                        if (err) return console.log(err);
                                        //console.log(JSON.stringify(obj));
                                        console.log('writing to ' + jsonname);
                                    });
                                } else {
                                    var totalprint = realmoneh
                                    var weeklyprint = realmoneh
                                    var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}"}`
                                    var myobj1 = JSON.parse(myjson1)
                                    obj.users[obj.users.length] = myobj1;
                                    var resetTime = timeSinceReset()
                                    if (result.createdTimestamp > resetTime) {
                                        var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                                        var myobj2 = JSON.parse(myjson2)
                                        obj.weekly[obj.weekly.length] = myobj2;
                                    }
                                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                                        if (err) return console.log(err);
                                        //console.log(JSON.stringify(obj));
                                        console.log('writing to ' + jsonname);
                                    });
                                }
                            }
                        }
                    })
                    if (obj2.messages[i + 1].id == obj.lastdata.messageid) {
                        var lastjson = `{"messageid":"${obj2.messages[0].id}"}`
                        var lastobj = JSON.parse(lastjson)
                        obj.lastdata = lastobj
                        fs.writeFile(jsonname2, JSON.stringify(obj2, undefined, 2), function writeJSON(err) {
                            if (err) return console.log(err);
                            //console.log(JSON.stringify(obj2));
                            console.log('writing to ' + jsonname2);
                        });
                        console.log('scan successful.')
                        break
                    }
                }
            }
        })
    }
});
client.on('message', msg => {
    var identifier = identifier
    var jsonfile = fs.readFileSync(jsonname);
    var obj = JSON.parse(jsonfile);
    var prefix = obj.prefix;
    if (msg.content.startsWith(prefix + 'prefix')) {
        if (msg.member.roles.cache.some(role => role.name === obj.manager)) {
            var parts = msg.content.split(" ");
            obj.prefix = parts[1];
            if (typeof obj.prefix == 'string') {
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
                var embed = new Discord.MessageEmbed()
                    .setTitle("**Prefix**")
                    .setDescription(`The prefix is now "${obj.prefix}"`)
                    .setTimestamp()
                    .setColor("0074F7");

                msg.channel.send(embed);
            } else {
                msg.reply('invalid prefix.')
            }
        } else {
            msg.reply('insufficient permissions.')
        }
    } else if (msg.content.startsWith(prefix + 'quota')) {
        var parts = msg.content.split(" ");
        var user = parts[1];
        if (typeof user == "undefined") {
            msg.reply("please input a username.")
        } else if (typeof user == "string") {
            function findIndex() {
                for (var i = 0; i < obj.users.length; i++) {
                    if (user == obj.users[i].username) {
                        return i
                    }
                }
            }
            var userIndex = findIndex()
            if (typeof userIndex == 'number') {
                if (obj.users[userIndex].discordid != '' && typeof obj.users[userIndex].discordid == 'string' && obj.users[userIndex].discordid != 'undefined') {
                    var person = msg.guild.members.fetch(obj.users[userIndex].discordid)
                    person.then(function (person) {
                        function findLimit() {
                            for (var i = 0; i < obj.ranks.length; i++) {
                                if (person.roles.cache.some(role => role.name === obj.ranks[i].rank)) {
                                    return obj.ranks[i].quota;
                                }
                            }
                        }
                        var quota = parseInt(findLimit())
                        function findPrinted() {
                            for (var i = 0; i < obj.weekly.length; i++) {
                                if (obj.weekly[i].username == user) {
                                    return obj.weekly[i].printed;
                                }
                            }
                        }
                        var numbah = findPrinted()
                        if (typeof numbah == 'string' && numbah != "0") {
                            var number = parseInt(numbah)
                            var percent = number / quota * 100
                            if (number < quota || quota == 0) {
                                var bonus = 0
                            } else {
                                var bonus = (number - quota) * 0.01
                            }
                            var embed = new Discord.MessageEmbed()
                                .setTitle('**Weekly Quota**')
                                .setDescription(`${number}/${quota}$`)
                                .addField('\u200B', `${percent}%`)
                                .addField('\u200B', `Bonus: ${bonus}$`)
                                .setTimestamp()
                                .setColor("0074F7");

                            msg.channel.send(embed);
                        } else {
                            var embed = new Discord.MessageEmbed()
                                .setTitle('**Weekly Quota**')
                                .setDescription(`No data this week.`)
                                .setTimestamp()
                                .setColor("0074F7");

                            msg.channel.send(embed);
                        }
                    })
                } else {
                    var embed = new Discord.MessageEmbed()
                        .setTitle('**Weekly Quota**')
                        .setDescription(`This user has not linked their Discord account.`)
                        .setTimestamp()
                        .setColor("0074F7");

                    msg.channel.send(embed);
                }
            } else {
                var embed = new Discord.MessageEmbed()
                    .setTitle('**Weekly Quota**')
                    .setDescription(`No data this week.`)
                    .setTimestamp()
                    .setColor("0074F7");

                msg.channel.send(embed);
            }
        }
    } else if (msg.content.startsWith(prefix + 'help') || msg.content.startsWith(prefix + 'cmds')) {
        var embed = new Discord.MessageEmbed()
            .setTitle('Doom Bank Bot | Help/Commands')
            .setThumbnail('https://cdn.discordapp.com/attachments/693830200672387072/803233472344358923/doomicon.png')
            .setDescription(`The prefix currently is: "${obj.prefix}"`)
            .addFields(
                { name: '**__Doom Bank Commands__**', value: 'For the regulars.' },
                { name: '`help/cmds`', value: 'I think you know what this does by now.', inline: true },
                { name: '`quota (username)`', value: 'Shows the amount of money the user printed this week.', inline: true },
                { name: '`printed (username)`', value: 'Shows the amount of money the user printed since joining the bank.', inline: true },
                { name: '`link (username)`', value: 'Links your Discord account to your ROBLOX account to determine quota.', inline: true },
                { name: '`unlink`', value: 'Unlinks your Discord account from your linked ROBLOX account so you can link a new one.', inline: true },
                { name: '**__Doom Bank Admin Commands__**', value: 'For the big boys.' },
                { name: '`prefix (newPrefix)`', value: 'Changes the current bot prefix.', inline: true },
                { name: '`manager (newRole)`', value: 'Changes the current manager role for the bot.', inline: true },
                { name: '`setquota (role) (quota)`', value: 'Changes the weekly quota for this role.', inline: true }
            )
            .setTimestamp()
            .setFooter('Doom Bank Doomer', 'https://cdn.discordapp.com/attachments/693830200672387072/803211117384040468/icon.png')
            .setColor("0074F7");

        msg.channel.send(embed);
    } else if (msg.content.startsWith(prefix + 'printed')) {
        var parts = msg.content.split(" ");
        var user = parts[1];
        if (typeof user == 'string') {
            function findPrinted() {
                for (var i = 0; i < obj.users.length; i++) {
                    if (obj.users[i].username == user) {
                        return obj.users[i].printed;
                    }
                }
            }
            var printed = findPrinted();
            if (typeof printed == 'string') {
                var embed = new Discord.MessageEmbed()
                    .setTitle('**Total Printed**')
                    .setDescription(`${printed}$`)
                    .setTimestamp()
                    .setColor("0074F7");

                msg.channel.send(embed);
            } else if (typeof printed == 'undefined') {
                var embed = new Discord.MessageEmbed()
                    .setTitle('**Total Printed**')
                    .setDescription('No records found for this user.')
                    .setTimestamp()
                    .setColor("0074F7");

                msg.channel.send(embed);
            }
        } else if (typeof user == 'undefined') {
            msg.reply('please enter a valid username!')
        }
    } else if (msg.content.startsWith(prefix + 'manager')) {
        if (msg.member.roles.cache.some(role => role.name === obj.manager)) {
            var parts = msg.content.split(" ");
            obj.manager = parts[1];
            if (typeof obj.manager == 'string') {
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
                var embed = new Discord.MessageEmbed()
                    .setTitle("**Manager Role**")
                    .setDescription(`The manager role is now "${obj.manager}"`)
                    .setTimestamp()
                    .setColor("0074F7");

                msg.channel.send(embed);
            } else {
                msg.reply('invalid role.')
            }
        } else {
            msg.reply('insufficient permissions.')
        }
    } else if (msg.content.startsWith(prefix + 'setquota')) {
        if (msg.member.roles.cache.some(role => role.name === obj.manager)) {
            var parts = msg.content.split(" ");
            var therank = parts[1].replace(/_/g, " ");
            var thequota = parseInt(parts[2]);
            if (typeof therank == 'string') {
                function findRank() {
                    for (var i = 0; i < obj.ranks.length; i++) {
                        if (obj.ranks[i].rank == therank) {
                            return obj.ranks[i].rank;
                        }
                    }
                }
                var checkrank = findRank()
                if (typeof checkrank == 'undefined' && typeof thequota == 'number') {
                    var myjson = `{"rank":"${therank}", "quota":"${thequota}"}`
                    var myobj = JSON.parse(myjson)
                    obj.ranks[obj.ranks.length] = myobj;
                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                        if (err) return console.log(err);
                        console.log(JSON.stringify(obj));
                        console.log('writing to ' + jsonname);
                    });
                    var embed = new Discord.MessageEmbed()
                        .setTitle("**Set Quota**")
                        .setDescription(`The quota for ${therank} is now ${thequota}$`)
                        .setTimestamp()
                        .setColor("0074F7");

                    msg.channel.send(embed);
                } else if (typeof checkrank == 'string' && typeof thequota == 'number') {
                    var myjson = `{"rank":"${therank}", "quota":"${thequota}"}`
                    var myobj = JSON.parse(myjson)
                    function findIndex() {
                        for (var i = 0; i < obj.ranks.length; i++) {
                            if (obj.ranks[i].rank == therank) {
                                return i
                            }
                        }
                    }
                    obj.ranks[findIndex()] = myobj;
                    fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                        if (err) return console.log(err);
                        console.log(JSON.stringify(obj));
                        console.log('writing to ' + jsonname);
                    });
                    var embed = new Discord.MessageEmbed()
                        .setTitle("**Set Quota**")
                        .setDescription(`The quota for ${therank} is now ${thequota}$`)
                        .setTimestamp()
                        .setColor("0074F7");

                    msg.channel.send(embed);
                } else {
                    msg.reply('invalid input.')
                }
            } else {
                msg.reply('invalid input.')
            }
        } else {
            msg.reply('insufficient permissions.')
        }
    } else if (msg.channel.id == "669998643515883520"/*msg.channel.id == "693830200672387072"*/) {
        function timeSinceReset() {
            var now = new Date();
            var n = now.getDay();
            var h = now.getHours();
            var time = now.getTime();
            if (n == 0) {
                var dayStamp = 86400 * 6 * 1000
            } else if (n > 1) {
                var dayStamp = 86400 * (n - 1) * 1000
            } else {
                var dayStamp = 0
            }
            if (h == 0) {
                var hourStamp = -3600 * 2 * 1000
            } else if (h > 2) {
                var hourStamp = 3600 * (h - 2) * 1000
            } else if (h == 1) {
                var hourStamp = -3600 * h * 1000
            }
            var totalStamp = hourStamp + dayStamp
            var finalStamp = time - totalStamp
            return finalStamp
        }
        if (msg.content.startsWith('**Worked** at the Bank and')) {
            var parts1 = msg.author.username.split("(")
            var loguser = parts1[0]
            var theid = parts1[1]
            var logid = theid.slice(0, -1)
            var parts2 = msg.content.split(" ")
            var moneh = parts2[7].split("$")
            if (moneh[0].charAt(moneh[0].length - 1) == 'k') {
                var moneh = parts2[7].split("k")
                var realmoneh = parseFloat(moneh[0].substring(2)) * 1000
            } else {
                var realmoneh = parseFloat(moneh[0].substring(2))
            }
            function findTotal() {
                for (var i = 0; i < obj.users.length; i++) {
                    if (obj.users[i].userid == logid) {
                        return obj.users[i].userid
                    }
                }
            }
            function findTotal2() {
                for (var i = 0; i < obj.weekly.length; i++) {
                    if (obj.weekly[i].userid == logid) {
                        return obj.weekly[i].userid
                    }
                }
            }
            var checker = findTotal()
            var checker2 = findTotal2()
            if (typeof checker == 'string' && typeof checker2 == 'string') {
                function findIndex() {
                    for (var i = 0; i < obj.users.length; i++) {
                        if (obj.users[i].userid == logid) {
                            return i
                        }
                    }
                }
                function findIndex2() {
                    for (var i = 0; i < obj.weekly.length; i++) {
                        if (obj.weekly[i].userid == logid) {
                            return i
                        }
                    }
                }
                var userindex = findIndex()
                var userindex2 = findIndex2()
                var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                var weeklyprint = parseInt(obj.weekly[userindex2].printed) + realmoneh
                var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                var myobj1 = JSON.parse(myjson1)
                obj.users[userindex] = myobj1;
                var resetTime = timeSinceReset()
                if (msg.createdTimestamp > resetTime) {
                    var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                    console.log(`${myjson2} success.`)
                    var myobj2 = JSON.parse(myjson2)
                    obj.weekly[userindex2] = myobj2;
                }
                var lastjson = `{"messageid":"${msg.id}"}`
                var lastobj = JSON.parse(lastjson)
                obj.lastdata = lastobj
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
            } else if (typeof checker == 'string' && typeof checker2 != 'string') {
                function findIndex() {
                    for (var i = 0; i < obj.users.length; i++) {
                        if (obj.users[i].userid == logid) {
                            return i
                        }
                    }
                }
                var userindex = findIndex()
                var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                var weeklyprint = realmoneh
                var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                var myobj1 = JSON.parse(myjson1)
                obj.users[userindex] = myobj1;
                var resetTime = timeSinceReset()
                if (msg.createdTimestamp > resetTime) {
                    var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                    console.log(`${myjson2} failed.`)
                    var myobj2 = JSON.parse(myjson2)
                    obj.weekly[obj.weekly.length] = myobj2;
                }
                var lastjson = `{"messageid":"${msg.id}"}`
                var lastobj = JSON.parse(lastjson)
                obj.lastdata = lastobj
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
            } else {
                var totalprint = realmoneh
                var weeklyprint = realmoneh
                var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}"}`
                var myobj1 = JSON.parse(myjson1)
                obj.users[obj.users.length] = myobj1;
                var resetTime = timeSinceReset()
                if (msg.createdTimestamp > resetTime) {
                    var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                    var myobj2 = JSON.parse(myjson2)
                    obj.weekly[obj.weekly.length] = myobj2;
                }
                var lastjson = `{"messageid":"${msg.id}"}`
                var lastobj = JSON.parse(lastjson)
                obj.lastdata = lastobj
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
            }
        } else if (msg.content.startsWith('**Worked** at the Bank but')) {
            var parts1 = msg.author.username.split("(")
            var loguser = parts1[0]
            var theid = parts1[1]
            var logid = theid.slice(0, -1)
            var parts2 = msg.content.split(" ")
            var lostmoneh = parts2[6].split("$")
            var realmoneh = parseInt(lostmoneh[0].substring(2))
            function findTotal() {
                for (var i = 0; i < obj.users.length; i++) {
                    if (obj.users[i].userid == logid) {
                        return obj.users[i].userid
                    }
                }
            }
            function findTotal2() {
                for (var i = 0; i < obj.weekly.length; i++) {
                    if (obj.weekly[i].userid == logid) {
                        return obj.weekly[i].userid
                    }
                }
            }
            var checker = findTotal()
            var checker2 = findTotal2()
            if (typeof checker == 'string' && typeof checker2 == 'string') {
                function findIndex() {
                    for (var i = 0; i < obj.users.length; i++) {
                        if (obj.users[i].userid == logid) {
                            return i
                        }
                    }
                }
                function findIndex2() {
                    for (var i = 0; i < obj.weekly.length; i++) {
                        if (obj.weekly[i].userid == logid) {
                            return i
                        }
                    }
                }
                var userindex = findIndex()
                var userindex2 = findIndex2()
                var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                var weeklyprint = parseInt(obj.weekly[userindex2].printed) + realmoneh
                var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                var myobj1 = JSON.parse(myjson1)
                obj.users[userindex] = myobj1;
                var resetTime = timeSinceReset()
                if (msg.createdTimestamp > resetTime) {
                    var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                    var myobj2 = JSON.parse(myjson2)
                    obj.weekly[userindex2] = myobj2;
                }
                var lastjson = `{"messageid":"${msg.id}"}`
                var lastobj = JSON.parse(lastjson)
                obj.lastdata = lastobj
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
            } else if (typeof checker == 'string' && typeof checker2 != 'string') {
                function findIndex() {
                    for (var i = 0; i < obj.users.length; i++) {
                        if (obj.users[i].userid == logid) {
                            return i
                        }
                    }
                }
                var userindex = findIndex()
                var userindex = findIndex()
                var totalprint = parseInt(obj.users[userindex].printed) + realmoneh
                var weeklyprint = realmoneh
                var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}", "discordid": "${obj.users[userindex].discordid}"}`
                var myobj1 = JSON.parse(myjson1)
                obj.users[userindex] = myobj1;
                var resetTime = timeSinceReset()
                if (msg.createdTimestamp > resetTime) {
                    var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                    console.log(`${myjson2} failed.`)
                    var myobj2 = JSON.parse(myjson2)
                    obj.weekly[obj.weekly.length] = myobj2;
                }
                var lastjson = `{"messageid":"${msg.id}"}`
                var lastobj = JSON.parse(lastjson)
                obj.lastdata = lastobj
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
            } else {
                var totalprint = realmoneh
                var weeklyprint = realmoneh
                var myjson1 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${totalprint}"}`
                var myobj1 = JSON.parse(myjson1)
                obj.users[obj.users.length] = myobj1;
                var resetTime = timeSinceReset()
                if (msg.createdTimestamp > resetTime) {
                    var myjson2 = `{"username":"${loguser}", "userid":"${logid}", "printed":"${weeklyprint}"}`
                    var myobj2 = JSON.parse(myjson2)
                    obj.weekly[obj.weekly.length] = myobj2;
                }
                var lastjson = `{"messageid":"${msg.id}"}`
                var lastobj = JSON.parse(lastjson)
                obj.lastdata = lastobj
                fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    //console.log(JSON.stringify(obj));
                    console.log('writing to ' + jsonname);
                });
            }
        }
    } else if (msg.content.startsWith(prefix + 'link')) {
        var parts = msg.content.split(" ");
        var username = parts[1]
        var disid = msg.author.id
        if (typeof username == "undefined") {
            msg.reply("please input a username.")
        } else if (typeof username == "string") {
            function findUser() {
                for (var i = 0; i < obj.users.length; i++) {
                    if (obj.users[i].username == username) {
                        return obj.users[i].username
                    }
                }
            }
            var checker = findUser()
            if (typeof checker == 'string') {
                function findIndex() {
                    for (var i = 0; i < obj.users.length; i++) {
                        if (obj.users[i].username == username) {
                            return i
                        }
                    }
                }
                var userIndex = findIndex()
                if (typeof obj.users[userIndex].discordid == 'undefined' || obj.users[userIndex].discordid == '' || obj.users[userIndex].discordid == 'undefined') {
                    function findDiscord() {
                        for (var i = 0; i < obj.users.length; i++) {
                            if (obj.users[i].discordid == msg.author.id) {
                                return obj.users[i].discordid
                            }
                        }
                    }
                    var disChecker = findDiscord()
                    if (typeof disChecker == 'undefined' || obj.users[userIndex].discordid == 'undefined') {
                        var userjson = `{"username": "${obj.users[userIndex].username}","userid": "${obj.users[userIndex].userid}","printed": "${obj.users[userIndex].printed}","discordid": "${disid}"}`
                        var userparse = JSON.parse(userjson)
                        obj.users[userIndex] = userparse
                        fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                            if (err) return console.log(err);
                            console.log(JSON.stringify(obj));
                            console.log('writing to ' + jsonname);
                        });
                        var embed = new Discord.MessageEmbed()
                            .setTitle("**Link Account**")
                            .setDescription(`You have linked your discord account to "${obj.users[userIndex].username}"`)
                            .setTimestamp()
                            .setColor("0074F7");

                        msg.channel.send(embed);
                    } else {
                        function findIndex() {
                            for (var i = 0; i < obj.users.length; i++) {
                                if (obj.users[i].discordid == msg.author.id) {
                                    return i
                                }
                            }
                        }
                        var userIndex = findIndex()
                        var embed = new Discord.MessageEmbed()
                            .setTitle("**Access Denied**")
                            .setDescription(`You have already linked your discord account to "${obj.users[userIndex].username}"`)
                            .setTimestamp()
                            .setColor("0074F7");

                        msg.channel.send(embed);
                    }
                } else if (msg.author.id == obj.users[userIndex].discordid) {
                    var embed = new Discord.MessageEmbed()
                        .setTitle("**Link Account**")
                        .setDescription(`Your Discord account is already linked to "${obj.users[userIndex].username}"`)
                        .setTimestamp()
                        .setColor("0074F7");

                    msg.channel.send(embed);
                } else {
                    if (obj.users[userIndex].discordid != '' || obj.users[userIndex].discordid == 'undefined') {
                        var embed = new Discord.MessageEmbed()
                            .setTitle("**Access Denied**")
                            .setDescription(`Only <@${obj.users[userIndex].discordid}> can manage their linked Discord account.`)
                            .setTimestamp()
                            .setColor("0074F7");

                        msg.channel.send(embed);
                    } else {
                        var embed = new Discord.MessageEmbed()
                            .setTitle("**Access Denied**")
                            .setDescription(`${username} doesn't have a Discord ccount linked.`)
                            .setTimestamp()
                            .setColor("0074F7");

                        msg.channel.send(embed);
                    }
                }
            } else {
                var embed = new Discord.MessageEmbed()
                    .setTitle("**Link Account**")
                    .setDescription(`Failed. No printing records for ${username}.`)
                    .setTimestamp()
                    .setColor("0074F7");

                msg.channel.send(embed);
            }
        }
    } else if (msg.content.startsWith(prefix + 'unlink')) {
        function findIndex() {
            for (var i = 0; i < obj.users.length; i++) {
                if (obj.users[i].discordid == msg.author.id) {
                    return i
                }
            }
        }
        var userIndex = findIndex()
        if (typeof userIndex == 'number') {
            obj.users[userIndex].discordid = ""
            fs.writeFile(jsonname, JSON.stringify(obj, undefined, 2), function writeJSON(err) {
                if (err) return console.log(err);
                console.log(JSON.stringify(obj));
                console.log('writing to ' + jsonname);
            });
            var embed = new Discord.MessageEmbed()
                .setTitle("**Unlink Account**")
                .setDescription(`Discord account unlinked from "${obj.users[userIndex].username}"`)
                .setTimestamp()
                .setColor("0074F7");

            msg.channel.send(embed);
        } else {
            var embed = new Discord.MessageEmbed()
                .setTitle("**Unlink Account**")
                .setDescription(`Discord account not linked to any ROBLOX account.`)
                .setTimestamp()
                .setColor("0074F7");

            msg.channel.send(embed);
        }
    } else if (msg.content.startsWith(prefix + 'suggest')) {
        function emptyIdentifier() {
            identifier = ''
        }
        if (identifier == '' || typeof  identifier == 'undefined') {
            identifier = msg.author.id
            console.log(msg.author.id)
            console.log(typeof msg.author.id)
            console.log(identifier)
            console.log(typeof identifier)
            msg.reply('listening to your suggestion.')
            var timeout = setTimeout(emptyIdentifier, 1000 * 60 * 10)
        } else {
            msg.reply('currently already taking a suggestion.')
        }
    } else if (msg.author.id == identifier) {
        console.log('taking suggestion')
        var coolchannel = client.channels.cache.get("806153108827668490")
        console.log(coolchannel)
        coolchannel.send(msg.content)
        console.log(msg.content)
        clearTimeout(timeout)
        emptyIdentifier()
        var embed = new Discord.MessageEmbed()
            .setTitle("**Suggestion**")
            .setDescription(`Your suggestion has been registered and will be read by the bot's developer.`)
            .setTimestamp()
            .setColor("0074F7");

        msg.channel.send(embed);
    }
});

client.login('ODAzMTgzNDE5NjI2MjI1NzA0.YA6E2Q.nlo5408FQSnTN2ffjtl0bxb7zLc');
