const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");
require("colors");

//TODO: Change this back to 80
const wss = new WebSocketServer({ port: 8080 });

let gameCode = Math.random().toString().split(".")[1].substring(0, 5);
let cards = [];

setInterval(function () {
	wss.clients.forEach(function each(client) {
		client.send(
			JSON.stringify({
				packet: "ping",
				data: "pING",
			})
		);
		console.log("ping sent");
		// console.log(client);
	});
}, 1000);

wss.on("listening", () => {
	console.log("READY".green);
});

wss.on("connection", function connection(ws) {
	ws.id = uuidv4();
	ws.name = null;
	ws.type = "player";
	ws.score = 0;

	ws.on("message", (data) => {
		try {
			let message = JSON.parse(data);

			switch (message.packet) {
				case "nameChange": {
					changeNameOfUid(ws.id, message.data);
					break;
				}
				case "playerAnswer": {
					break;
				}
				case "ELEVATE": {
					elevateToHost(ws.id);
					break;
				}
				case "HOSTkickPlayer": {
					if (ws.type == "host")
						hostFunctions.kickPlayer(message.data);
					break;
				}
				case "HOSTgetGameCode": {
					if (ws.type == "host") hostFunctions.getGameCode();
					break;
				}
				case "HOSTstartGame": {
					if (ws.type == "host") console.log("Starting game");
					break;
				}
				case "HOSTsendQuizletSet": {
					if (ws.type == "host")
						hostFunctions.quizletUpdate(message.data);
				}
				default: {
					throw new Error("Invalid packet data!");
				}
			}
		} catch (error) {
			console.log("WARNING: CLIENT SENDING INVALID DATA".yellow);
			console.log(`${error}`.yellow);
		}
	});
});

function changeNameOfUid(id, newName) {
	// for (let i = 0; i < clients.length; i++) {
	// 	if (clients[i].uid == id) {
	// 		clients[i].name = newName;
	// 		console.log("client: " + id + " wants to change name to: " + newName);
	// 		return;
	// 	}
	// }
	wss.clients.forEach(function each(client) {
		if (client.id == id) {
			console.log(
				"client: " + id + " wants to change name to: " + newName
			);
			client.name = newName;
			return;
		}
	});
}

function elevateToHost(id) {
	//TODO: Search for existing host so you can't have two hosts
	wss.clients.forEach(function each(client) {
		if (client.id == id) {
			client.type = "host";
			client.send(
				JSON.stringify({
					packet: "hostNotice",
					data: "You became host of this lobby",
				})
			);
			console.log("client: " + id + " wants to elevate to host!".rainbow);
		}
	});
}

let hostFunctions = {
	kickPlayer: function (id) {
		wss.clients.forEach(function each(client) {
			if (client.id == id) {
				client.send(
					JSON.stringify({
						packet: "kickNotice",
						data: "Kicked by host RIP",
					})
				);
				client.close();
			}
		});
	},
	getGameCode: function () {
		wss.clients.forEach(function each(client) {
			if (client.type == "host") {
				console.log("sent game code");
				client.send(
					JSON.stringify({
						packet: "gameCode",
						data: gameCode,
					})
				);
				client.close();
			}
		});
	},
	quizletUpdate: function (set) {
		cards = set.trim().split("\n");
		console.log("CARDS UPDATED!");
	},
};

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function generateQuestion() {
	getRandomArbitrary(0, cards.length - 1);
}

function getQuestionFromCard(cardnum) {
	cards[cardnum].split("\t")[1];
}
function getAnswerFromCard(cardnum) {
	cards[cardnum].split("\t")[0];
}
