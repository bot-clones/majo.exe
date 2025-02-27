const { MessageEmbed, MessageAttachment } = require("discord.js");
const Canvas = require("canvas");
const moment = require("moment");
const sql = require("../../../utilities/database");

module.exports = async (client, member) => {
 try {
  await sql.query(`SELECT leaves as res, last_updated as ls from guild_stats WHERE guild_id = ${member.guild.id}`, async function (serror, sresults, sfields) {
   if (serror) console.log(serror);
   if (!sresults[0]) {
    const current_month = moment().daysInMonth();
    const stats = new Array();
    const empty_stats = new Array();
    for (let i = 0; i <= current_month; i++) {
     stats[i] = 0;
     empty_stats[i] = 0;
    }
    let current_day_in_week = moment().weekday();
    if (current_day_in_week == 1) {
     stats[0] = 1;
    } else {
     stats[current_day_in_week - 1] = 1;
    }
    console.log(stats.length);
    await sql.query(`INSERT INTO guild_stats (guild_id, joins, leaves, last_updated) VALUES ('${member.guild.id}', '${empty_stats}', '${stats}', '${moment(new Date()).format("YYYY-MM-DD")}')`, function (sserror, ssresults, ssfields) {
     if (sserror) console.log(sserror);
    });
   } else {
    let array_stats = sresults[0].res.split(",");
    let curr_stats = moment().weekday();
    const current_month = moment().daysInMonth();
    let last_updated = sresults[0].ls;
    if (!moment(last_updated).isSame(new Date(), "month")) {
     const empty_stats = new Array();
     for (let i = 0; i <= current_month; i++) {
      empty_stats[i] = 0;
     }
     sql.query(`UPDATE guild_stats SET leaves = '${empty_stats}', joins = '${empty_stats}', last_updated = '${moment(new Date()).format("YYYY-MM-DD")}' WHERE guild_id = ${member.guild.id}`, function (fixerror, fixresults, fixfields) {
      if (fixerror) console.log(fixerror);
     });
    }
    if (curr_stats == 1) {
     array_stats[0]++;
    } else {
     let day = curr_stats - 1;
     array_stats[day]++;
    }
    sql.query(`UPDATE guild_stats SET leaves = '${array_stats}', last_updated = '${moment(new Date()).format("YYYY-MM-DD")}' WHERE guild_id = ${member.guild.id}`, function (ferror, fresults, fields) {
     if (ferror) console.log(ferror);
    });
   }
  });
  const image = `${process.cwd()}/src/img/welcome-gray.png`;
  const sqlquery = "SELECT channelid AS res FROM `leave` WHERE guildid = " + member.guild.id;
  sql.query(sqlquery, function (error, results, fields) {
   if (error) console.log(error);
   if (!results || results.length == 0) {
    return;
   }
   (async () => {
    leavesetup = await results[0].res;
    await member.guild.channels.fetch();
    const channel = await member.guild.channels.cache.find((c) => c.id == leavesetup);
    if (!channel) return;
    if (!member.guild) return;
    Canvas.registerFont(`${process.cwd()}/src/fonts/quicksand-light.ttf`, {
     family: "Quicksand",
    });
    const canvas = Canvas.createCanvas(1772, 633);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(image);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#f2f2f2";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    var textString3 = `${member.user.username}`;
    if (textString3.length >= 14) {
     ctx.font = 'bold 150px "Quicksand"';
     ctx.fillStyle = "#f2f2f2";
     ctx.fillText(textString3, 720, canvas.height / 2 + 20); // User Name
    } else {
     ctx.font = 'bold 200px "Quicksand"';
     ctx.fillStyle = "#f2f2f2";
     ctx.fillText(textString3, 720, canvas.height / 2 + 25); // User Name
    }
    var textString2 = `#${member.user.discriminator}`;
    ctx.font = 'bold 40px "Quicksand"';
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(textString2, 730, canvas.height / 2 + 62); // User Tag
    var textString4 = `Member #${member.guild.memberCount}`;
    ctx.font = 'bold 60px "Quicksand"';
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(textString4, 720, canvas.height / 2 + 120); // Member Count
    var textString4 = `${member.guild.name}`;
    ctx.font = 'bold 70px "Quicksand"';
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(textString4, 720, canvas.height / 2 - 140); // Member Guild Name
    ctx.beginPath();
    ctx.arc(315, canvas.height / 2, 250, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    const avatar = await Canvas.loadImage(
     member.user.displayAvatarURL({
      format: "jpg",
      size: 2048,
     })
    );
    ctx.drawImage(avatar, 65, canvas.height / 2 - 250, 500, 500);
    const attachment = new MessageAttachment(canvas.toBuffer(), "leave-image.png");
    const embed = new MessageEmbed() // Prettier
     .setColor("RANDOM")
     .setTimestamp()
     .setFooter({
      text: `${member.guild.name}`,
      iconURL: member.user.displayAvatarURL({
       dynamic: true,
       format: "png",
       size: 2048,
      }),
     })
     .setTitle(
      `**${member.user.username} left the server!**`,
      member.guild.iconURL({
       dynamic: true,
       format: "png",
      })
     )
     .setDescription(":calendar_spiral: **User joined server at:** `" + moment(member.user.joinedAt).format("MMMM Do YYYY, h:mm:ss") + "` (" + moment(member.user.joinedAt).fromNow() + ")")
     .setImage("attachment://leave-image.png");
    await channel.send({ embeds: [embed], files: [attachment] });
   })();
  });
 } catch (err) {
  console.log(err);
 }
};
