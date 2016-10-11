Twitch.init({
	clientId: 'n24uex3hyhc96yamhjouibyp78m4khw',
	redirect_uri: 'http://polywhack.com/plinko/'
}, function(error, status) {
	if(status.authenticated){
		$('.twitch-connect').hide();
		var token = Twitch.getToken();
		var ws = null;
		Twitch.api({method: 'channel'}, function(error, channel){
			var id = channel._id;
			ws = listen(id, token);
		});

		PlinkoEngine.init();
	}
	else{
		$('.controls').hide();
	}
});

var listen = function(id, token){
	var ws = new WebSocket("wss://pubsub-edge.twitch.tv"); //establish connection to pubsub
	var nonce = CryptoJS.SHA1(id.toString()).words.join("").replace(/-/g, ""); //generate (fairly) unique nonce from id

    ws.onopen = function() {
    	pubsubping(ws); //set up ping/pong loop
        var msg = {
            type: "LISTEN",
            nonce: nonce,
            data: {
                topics: ["channel-bitsevents." + id],
                auth_token: token,
            }
        }
        //PlinkoEngine.spawnBit(1, "hi");
        ws.send(JSON.stringify(msg));
    }

    ws.onmessage = function(event) {
        var bitdata = $.parseJSON(event.data)
        if (bitdata.type == "MESSAGE") {
            var bitmessage = $.parseJSON(bitdata.data.message);
            //var msg = bitmessage.chat_message.replace(/\bcheer\S+/ig, ""); // clears out all the "cheer"s
            var amount = bitmessage.bits_used;
            var userName = bitmessage.user_name;

            PlinkoEngine.spawnBit(parseInt(amount), userName);
        }
        else{
        	console.log(bitdata);
        }
    }
    ws.onclose = function() {
        console.log("Connection closed.");
    }

    return ws; //not sure we actually do anything with the connection but im returning it for now anyways
}
 
function pubsubping(ws) {
   ws.send(JSON.stringify({ type: "PING" }));
   setTimeout(function () { pubsubping(ws) }, 240000);
}

$('.twitch-connect').click(function() {
    Twitch.login({
        scope: ['user_read', 'channel_read']
    });
})