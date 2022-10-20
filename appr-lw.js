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
	
	
	initiateWebSocketConnection();
}

function initiateWebSocketConnection(csrf) /*signedURL*/
{
	var signedURL = "ws://localhost:8080/anonymous/websocket/ping?csrf-token=5f4f849d-64a8-4829-a09c-d65906a9f035&ip-address=110.56.12.11";
	var socket = new WebSocket(signedURL);
	ws = Stomp.over(socket);

	ws.heartbeat.outgoing = 50000; // client will send heartbeats every 20000ms
    ws.heartbeat.incoming = 120000;  
	ws.connect({}, function(frame) {
		setConnected(true);
		showGreetingInBold("---New connection established for User ");

		console.log("Connected");
		console.log(new Date());
		ws.subscribe("/user/queue/errors", function(message) {
			alert("Error " + message.body);
		});

		ws.subscribe("/user/queue/reply", function(message) {
			showGreeting(message.body);
			console.log(message);
		});

		ws.subscribe("/user/queue/notification", function(message) {
			showNotifications(message.body);
			console.log(message);
		});

		ws.subscribe("/topic/message", function(message) {
			showGreeting(message.body);
			console.log(message);
		});

		ws.subscribe("/user/notifications/query", function (message) {
			showGreeting("List of all notifications received.");
			console.log(message);
			showNotifications(message.body);
		})

		ws.subscribe("/user/notifications/query_by_id", function (message) {
			showGreeting("get Notification By ID API response is received.");
			console.log(message);
			showNotifications(message.body);
		})

		ws.subscribe("/user/notifications/timeline", function (message) {
			showGreeting("Timeline API response is received.");
			showGreeting(message.body);
			console.log(message);
		})

		ws.subscribe("/user/notifications/search", function (message) {
			showGreeting("Search API response is received.");
			showGreeting(message.body);
			console.log(message);
		})

		ws.subscribe("/user/notifications/unread_count", function (message) {
			showGreeting("Unread count API response is received.");
			showGreeting(message.body);
			console.log(message);
		})

		ws.subscribe("/user/notifications/clear_unread_count", function (message) {
			showGreeting("Clear Unread count API response is received.");
			showNotifications(message.body);
			console.log(message);
		})

		ws.subscribe("/user/notifications/update_notifications", function (message) {
			showGreeting("Notification "+$("#notificationID").val() +" is marked as READ");
			console.log(message);
		})

		ws.subscribe("/user/notifications/delete_notifications", function (message) {
			showGreeting("Delete Notification API response is received.");
			showGreeting(message.body);
			console.log(message);
		})

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
		'authorization' : 'Fake ans1@AdobeID',
		'adobeAppId' : 'ANSAppId',
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
		'authorization' : 'Fake ans1@AdobeID',
		'adobeAppId' : 'ANSAppId',
//		'adobeDeviceId' : '',
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : 'ANSAppID',
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
		'authorization' : 'Fake ans1@AdobeID',
		'adobeAppId' : 'ANSAppId',
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : 'ANSAppID'
//		'imsOrg' : '',

	})
	ws.send("/ans_server/unread_count", {}, queryParams);
}
	 
function sendClearUnreadCount() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Fake ans1@AdobeID',
		'adobeAppId' : 'ANSAppId',
		'appId' : 'ANSAppID',
		'requestType' : 'SYNCHRONOUS',
		'clearUnreadCountRequest': {
			'userId' : $("#name").val()+'@AdobeID'
		}

	})
	ws.send("/ans_server/clear_unread_count", {}, queryParams);
}

function sendUpdateNotifications() {
	var queryParams = JSON.stringify( {
		'authorization' : 'Fake ans1@AdobeID',
		'adobeAppId' : 'ANSAppId',
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : 'ANSAppID',
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
		'authorization' : 'Fake ans1@AdobeID',
		'adobeAppId' : 'ANSAppId',
		'userId' : $("#name").val()+'@AdobeID',
		'appId' : 'ANSAppID',
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
	'authorization' : 'Fake ans1@AdobeID',
	'adobeAppId' : 'ANSAppID',
//		'adobeDeviceId' : '',
	'userId' : $("#name").val()+'@AdobeID',
	'appId' : 'ANSAppID',
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
    'authorization' : 'Fake '+$("#name").val()+'@AdobeID',
    'adobeAppId'    : 'ANSAppId',
    'locale'        : 'en_US',
    'notificationIds': [$("#notificationID").val()],
    'imsOrg'        : ''
})


showGreeting("Query by ID API invoked by User "+$("#name").val()+'@AdobeID'+" for notification ID: "+$("#notificationID").val());
ws.send("/ans_server/query_by_id", {}, queryByIdParams);

}

function registerUser() {
	var data = JSON.stringify({
		'channelId'    : $("#name").val(),
		'fromTimeStamp': '1652429394665'
	})
	ws.send("/ans_server/anonymous/notifications", {}, data);
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
