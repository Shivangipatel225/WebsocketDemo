	
var ws;
function setConnected(connected) {
	$("#connect").prop("disabled", connected);
	$("#disconnect").prop("disabled", !connected);
	$("#register").prop("disabled", !connected);
	if (connected) {
		$("#conversation").show();
	} else {
		$("#conversation").hide();
	}
	$("#greetings").html("");
}

function connect() {
	//connect to stomp where stomp endpoint is exposed
	$.ajax({
         url: "https://"+$("#host").val()+"/generate-signed-url",
         type: "GET",
         beforeSend: function(xhr){
			xhr.setRequestHeader('X-Gw-Cookie-Path', 'websocket/ping');
         	xhr.setRequestHeader('X-Api-Key', $("#apikey").val());
         	xhr.setRequestHeader('Authorization', 'Bearer '+$("#token").val());
         	xhr.setRequestHeader('x-adobe-app-id', $("#appid").val());
         	//xhr.setRequestHeader('x-target-user-id', $("#name").val()+'@AdobeID');
         	//xhr.setRequestHeader('x-target-app-id', $("#appid").val());
         },
		// data: JSON.stringify({
		// 		'x-adobe-app-id': $("#appid").val(),
		// 		'x-target-user-id': $("#name").val()+'@AdobeID',
		// 		'x-target-app-id': $("#appid").val()
		// 	}),
         success: function(data, status) { 
         	
         	initiateWebSocketConnection(data.message);
         },
         error: function(xhr, status, text) {
         	alert("Generating signed URL failed");
         }
      });
	
	//initiateWebSocketConnection();
}

function initiateWebSocketConnection(signedURL)
{

	console.log("Connecting to signed URl "+ new Date().toISOString());
	var host = "wss://cgw-ans-team-ans.ethos02-stage-va6.ethos.adobe.net/websocket/ping";
	var socket = new WebSocket(signedURL);
	ws = Stomp.over(socket);
	
	ws.heartbeat.outgoing = 50000; // client will send heartbeats every 20000ms
    ws.heartbeat.incoming = 120000;  
	ws.connect({}, function(frame) {
		setConnected(true);

		ws.subscribe("/user/queue/errors", function(message) {
			alert("Error " + message.body);
		});

		ws.subscribe("/user/queue/reply", function(message) {
			showGreeting(message.body);
			console.log(message+" " + new Date().toISOString());
		});

		ws.subscribe("/user/queue/notification", function(message) {
			showNotifications(message.body);
			console.log(message+" " + new Date().toISOString());
		});

		ws.subscribe("/topic/message", function(message) {
			showGreeting(message.body);
			console.log(message+" " + new Date().toISOString());
		});
		
		console.log("After subscribing " + new Date().toISOString());
		setTimeout(function () { 
			registerUser();
		}, 2000);
	}, function(error) {
		alert("STOMP error " + error);
	});

}


function disconnect() {
	if (ws != null) {
		//ws.close();
		ws.disconnect();
	}
	showGreeting("Websocket connection disconnected for User "+$("#name").val()+'@AdobeID');
	console.log(new Date());
	setConnected(false);
}

function sendTimeline() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId' : $("#appid").val(),
//		'adobeDeviceId' : '',
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : 'TestApplicationId',
		'fromTimeStamp' : 0,
//	 	'toTimeStamp' : 1,
		'pageSize' : 10,
		'configVersion' : '1',
		'locale' : 'en_US',
//		'imsOrg' : '',
	})
	ws.send("/ans_server/timeline", {}, queryParams);
}

function sendSearch() {	
	var queryParams = JSON.stringify( {
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId' : $("#appid").val(),
//		'adobeDeviceId' : '',
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : $("#appid").val(),
//		'fromTimeStamp' : 0,
//	 	'toTimeStamp' : 1,
//		'pageSize' : 1,
//		'configVersion' : '1',
//		'locale' : 'en_US',
//		'imsOrg' : '',

	})

	ws.send("/ans_server/search", {}, queryParams);
}
	 
function sendUnreadCount() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId' : $("#appid").val(),
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : $("#appid").val()
//		'imsOrg' : '',

	})
	ws.send("/ans_server/unread_count", {}, queryParams);
}
	 
function sendClearUnreadCount() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId' : $("#appid").val(),
		'appId' : $("#appid").val(),
		'requestType' : 'SYNCHRONOUS',
		'clearUnreadCountRequest': {
			'userId' : $("#name").val()+'@AdobeID'
		}

	})
	ws.send("/ans_server/clear_unread_count", {}, queryParams);
}

function sendUpdateNotifications() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId' : $("#appid").val(),
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : $("#appid").val(),
		'updateNotificationRequest': {
			"notifications": {
				"notification": [
					{
						"notificationId": $("#notificationID").val(),
						"state": "READ",
					}
				]
			}
		}
	})

	ws.send("/ans_server/update_notifications", {}, queryParams);
}

function sendDeleteNotifications() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId' : $("#appid").val(),
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : $("#appid").val(),
		'requestType': 'SYNCHRONOUS',
		'deleteNotificationRequest': {
			'notifications': {
				'notification': [
				{
				'notificationId': '213343'
				}
				]
			}
		}
	})

	ws.send("/ans_server/delete_notifications", {}, queryParams);
}

function sendQuery() {
var queryParams = JSON.stringify( {
	'authorization' : 'Bearer '+$("#token").val(),
	'adobeAppId' : $("#appid").val(),
//		'adobeDeviceId' : '',
	'userId' : $("#name").val()+'@AdobeID',
	'appId' : $("#appid").val(),
	'fromTimeStamp' : 0,
//	 	'toTimeStamp' : 1,
	'pageSize' : 1,
//		'configVersion' : '1',
	'locale' : 'en_US',
//		'imsOrg' : '',

})

showGreeting("Query API invoked by User "+$("#name").val()+'@AdobeID');
ws.send("/ans_server/query", {}, queryParams);
}

function sendQueryById() {

var queryByIdParams = JSON.stringify({
    'authorization' : 'Bearer '+$("#token").val(),
    'adobeAppId'    : $("#appid").val(),
    'locale'        : 'en_US',
    'notificationIds': [$("#notificationID").val()],
    'imsOrg'        : ''
})


showGreeting("Query by ID API invoked by User "+$("#name").val()+'@AdobeID'+" for notification ID: "+$("#notificationID").val());
ws.send("/ans_server/query_by_id", {}, queryByIdParams);

}

function registerUser() {
	var data = JSON.stringify({
		'authorization' : 'Bearer '+$("#token").val(),
		'adobeAppId'    : $("#appid").val(),
		//'userId': $("#name").val()+'@AdobeID',
		//'appId': $("#appid").val(),
		'fromTimeStamp': $("#fromT").val()
	})
	ws.send("/ans_server/registerUser", {}, data);
	showGreetingInBold("Registration complete for User "+$("#name").val()+'@AdobeID');
	//ws.send("/message", {}, data);
}

function showGreeting(message) {
	$("#greetings").append("<tr><td style='word-wrap: break-word'> " + message + "</td></tr>");
}

function showGreetingInBold(message) {
	$("#greetings").append("<tr><td style='font-weight:bold'> " + message + "</td></tr>");
}
function showNotifications(message) {
	const obj = JSON.parse(message);
	if(obj.notifications.notification != null){
		for(var n = 0; n < obj.notifications.notification.length; n++) {
			$("#greetings").append("<tr><td> { Id: " + obj.notifications.notification[n].notificationId + " , Message : "+obj.notifications.notification[n].payload + " }</td></tr>");
		};
	}
}

function sendName() {
	var data = JSON.stringify({
		'name' : $("#name").val()+'@AdobeID'
	})
	ws.send("/ans_server/message", {}, data);
	
	console.log(new Date());
	//ws.send("/message", {}, data);
}

$(function() {
	$("form").on('submit', function(e) {
		e.preventDefault();
	});
	$("#connect").click(function() {
		connect();
	});
	$("#disconnect").click(function() {
		disconnect();
	});
	$("#send").click(function() {
		sendName();
	});
	$("#register").click(function() {
		registerUser();
	});
	$("#query").click(function() {
		sendQuery();
	});
	$("#queryById").click(function() {
		sendQueryById();
	});
	$("#timeline").click(function() {
		sendTimeline();
	});
	$("#search").click(function() {
		sendSearch();
	});
	$("#unread_count").click(function() {
		sendUnreadCount();
	});
	$("#clear_unread_count").click(function() {
		sendClearUnreadCount();
	});
	$("#update_notifications").click(function() {
		sendUpdateNotifications();
	});
	$("#update_notifications").click(function() {
		sendDeleteNotifications();
	});
});
