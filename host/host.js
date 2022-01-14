let gamecode = "???";

window.onload = function () {
	const ws = new WebSocket("ws://localhost:8080");

	ws.onmessage = function (event) {
		try {
			let msg = JSON.parse(event.data);

			switch (msg.packet) {
				case "hostNotice": {
					ws.send(
						JSON.stringify({
							packet: "HOSTgetGameCode",
							data: "",
						})
					);
					break;
				}
				case "gameCode": {
					gamecode = msg.data;
					document.getElementById("iddisplay").innerText = gamecode;
					break;
				}
				case "ping": {
					console.log("ping from server");
					break;
				}
			}
		} catch (err) {
			console.log("INVALID DATA: " + err);
		}
	};

	ws.onopen = function () {
		ws.send(
			JSON.stringify({
				packet: "nameChange",
				data: "HOST",
			})
		);

		ws.send(
			JSON.stringify({
				packet: "ELEVATE",
			})
		);
	};
	document
		.getElementById("setinput")
		.addEventListener("keypress", function () {
			ws.send(
				JSON.stringify({
					packet: "HOSTsendQuizletSet",
					data: document.getElementById("setinput").value,
				})
			);
			console.log("SENT QUIZLET SET");
		});
};
