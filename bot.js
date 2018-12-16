//a rivescript telnet chatbot using nodejs

require("babel-polyfill");
var net        = require("net");
// lib not included into telnet-bot repo
var RiveScript = require("./lib/rivescript.js");

// Create the bot.
var bot = new RiveScript({ debug: false });
// brain not included into telnet-bot repo
bot.loadDirectory("./brain").then(success_handler).catch(error_handler);

function success_handler() {
	console.log("Bot loaded!");
	bot.sortReplies();

	// Start the TCP server.
	net.createServer(function (socket) {
		// Identify this client.
		socket.name = socket.remoteAddress + ":" + socket.remotePort;
		console.log("User '" + socket.name + "' has connected.\n");

		// Send a welcome message.
		socket.write("Hello " + socket.name + "! Welcome to telnet-chatbot\n"
			+ "Type /quit to disconnect.\n\n");

		// Send their prompt.
		socket.write("You> ");

		// Handle incoming messages.
		socket.on("data", function (data) {
			var message = "" + data;
			message = message.replace(/[\x0D\x0A]/g, "");

			if (message.indexOf("/quit") == 0) {
				console.log("User '" + socket.name + "' has quit via /quit.\n");
				socket.write("Good-bye!\n");
				socket.end();
				return;
			}

			bot.reply(socket.name, message).then(function(reply) {
				socket.write("Bot> " + reply + "\n");
				socket.write("You> ");

				// Log it for the server terminal to see!
				console.log("[" + socket.name + "] " + message);
				console.log("[Bot] " + reply + "\n");
			});
		});

		// Handle disconnects.
		socket.on("end", function () {
			console.log("User '" + socket.name + "' has disconnected.\n");
		});
	}).listen(2001);

	console.log("TCP server running on port 2001.\n");
}

function error_handler (err) {
	console.error(err);
}
