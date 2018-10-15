"use strict";

var currentRoom = "Room1";
var localUsername = "";
var updateInterval;
var isSearching = false;

//Function that adds a new message onto the message board
//Parses the JSON object that it received from the ajax request and populates
//a p element with the user, message, and timestamp of the message.
var addToMessageBoard = function addToMessageBoard(obj) {
    var messageInfo = document.createElement('p');
    var newMessage = document.createElement('div');
    var user = JSON.stringify(obj.user).substring(1, JSON.stringify(obj.user).length - 1);
    var message = JSON.stringify(obj.message).substring(1, JSON.stringify(obj.message).length - 1);
    var timeStamp = JSON.stringify(obj.timeStamp).substring(1, JSON.stringify(obj.timeStamp).length - 1);
    messageInfo.textContent = user + " (" + timeStamp + ")";
    newMessage.textContent = message;
    var messageBoard = document.querySelector(".messageBoard");
    messageBoard.appendChild(messageInfo);
    messageBoard.appendChild(newMessage);
    messageBoard.appendChild(document.createElement('hr'));
};

//function to parse our response
var parseJSON = function parseJSON(xhr, content) {
    //parse response (obj will be empty in a 204 updated)
    var obj = JSON.parse(xhr.response);
    return obj;
};

//Function for updating messages
//Send get request for messages.
var update = function update(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader('Accept', 'Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        return handleResponse(xhr);
    };
    xhr.send();
    return false;
};

var updateScreen = function updateScreen(xhr, content) {
    var obj = JSON.parse(xhr.response);
    var messageBoard = document.querySelector(".messageBoard");
    while (messageBoard.hasChildNodes()) {
        messageBoard.removeChild(messageBoard.firstChild);
    }
    if (isSearching) {
        if (obj.messageLog.length == 0) {
            var messageInfo = document.createElement('p');
            messageInfo.textContent = "No matching results for search term";
            var _messageBoard = document.querySelector(".messageBoard");
            _messageBoard.appendChild(messageInfo);
        } else {
            for (var i = 0; i < obj.messageLog.length; i++) {
                addToMessageBoard(obj.messageLog[i]);
            }
        }
    } else {
        switch (currentRoom) {
            case "Room1":
                for (var i = 0; i < obj.messages.Room1.messageLog.length; i++) {
                    addToMessageBoard(obj.messages.Room1.messageLog[i]);
                }break;
            case "Room2":
                for (var i = 0; i < obj.messages.Room2.messageLog.length; i++) {
                    addToMessageBoard(obj.messages.Room2.messageLog[i]);
                }break;
            case "Room3":
                for (var i = 0; i < obj.messages.Room3.messageLog.length; i++) {
                    addToMessageBoard(obj.messages.Room3.messageLog[i]);
                }break;
        }
    }
};

var handleResponse = function handleResponse(xhr, parseResponse) {
    var content = document.querySelector('#content');
    var response = {};
    if (parseResponse) {
        response = parseJSON(xhr, content);
    }
    switch (xhr.status) {
        case 200:
            updateScreen(xhr, content);
            break;
        case 201:
            //if the JSON object has the necessary parameters, add to the message board.
            if (response.user && response.message && response.timeStamp) {
                addToMessageBoard(response);
            }
            break;
        case 204:
            window.alert("Changed username. Updating previous messages in room");
            break;
        case 400:
            if (response.id == "missingParams") {
                window.alert(response.message);
            }
            break;
        case 404:
            break;
        case 500:
            break;
        default:
            break;
    }
};

//Function that gets contents from username and password fields and submits a post request to add them to the message board.
var sendPost = function sendPost(e, messageForm) {
    var messageAction = messageForm.getAttribute('action');
    var messageMethod = messageForm.getAttribute('method');

    var nameField = messageForm.querySelector("#username");
    var messageField = messageForm.querySelector("#message");

    if (localUsername == "") {
        localUsername = nameField.value;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(messageMethod, messageAction);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
        return handleResponse(xhr, true);
    };

    var formData = "user=" + nameField.value + "&message=" + messageField.value + "&room=" + currentRoom;
    xhr.send(formData);

    e.preventDefault();
    return false;
};

//Method to change the user's current chatroom and send a get request to update the screen with messages from that room.
var changeRoom = function changeRoom(e, room) {
    currentRoom = room;
    document.querySelector('#roomName').textContent = "Room " + currentRoom.substring(4, 5);
    update('/getMessages');
    if (isSearching) {
        isSearching = false;
        updateInterval = setInterval(update, 1000, '/getMessages');
    }
};

//Helper method for assigning the room changing events onto the chatrooms fields.
var roomChangeEvent = function roomChangeEvent(value) {
    var changeEvent = function changeEvent(e) {
        return changeRoom(e, value);
    };
    return changeEvent;
};

//Function that sends a post request to the server for changing user's username and updating their past messages.
var changeUsername = function changeUsername(e) {
    var nameField = messageForm.querySelector("#username");

    var xhr = new XMLHttpRequest();
    xhr.open("post", "/updateUser");

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
        return handleResponse(xhr, false);
    };

    var formData = "oldUser=" + localUsername + "&newUser=" + nameField.value + "&room=" + currentRoom;
    xhr.send(formData);

    localUsername = nameField.value;
    e.preventDefault();
    return false;
};

//Function that sends a post request to the server to retrieved a json object of messages that contain the specified search term in the form.
var messageSearch = function messageSearch(e, searchForm) {
    //Sets searching boolean to true, and stops the screeen refreshing so the user can see the searched messages for as long as they like.
    isSearching = true;
    clearInterval(updateInterval);

    var messageAction = searchForm.getAttribute('action');
    var messageMethod = searchForm.getAttribute('method');

    var searchParam = searchForm.querySelector('#searchField');
    var searchType = searchForm.querySelector('#searchType');

    var xhr = new XMLHttpRequest();
    xhr.open(messageMethod, messageAction);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
        return handleResponse(xhr, true);
    };

    var formData = "type=" + searchType.value + "&searchParam=" + searchParam.value + "&room=" + currentRoom;
    xhr.send(formData);

    e.preventDefault();
    return false;
};

//Sets up event listeners for changing rooms and entering messages.
var init = function init() {
    var messageForm = document.querySelector('#messageForm');
    //Send a message if the user presses the enter key.
    messageForm.addEventListener('keydown', function (e) {
        var keyName = e.key;
        if (keyName === "Enter") {
            //Restarts the message refreshing if it was paused from previously displaying searched terms
            if (isSearching) {
                isSearching = false;
                update('/getMessages');
                updateInterval = setInterval(update, 1000, '/getMessages');
            }
            sendPost(e, messageForm);
            //If this user changed their username, update all of their previous messages to have the new username.
            if (localUsername !== messageForm.querySelector("#username").value && localUsername !== "") {
                changeUsername(e);
            }
        }
    });
    //Sets an interval to update the screen every second.
    updateInterval = setInterval(update, 1000, '/getMessages');

    //For loop to assign event listeners for changing into different chatrooms.
    var rooms = document.querySelector('#roomSelect');
    for (var i = 1; i < 4; i++) {
        var room = "Room";
        rooms.querySelector("#".concat(room, i.toString())).addEventListener('click', roomChangeEvent(room.concat(i.toString())));
    }

    //Sets up event listener for searching for messages with specifications.
    var searchForm = document.querySelector('#search');
    var searchEvent = function searchEvent(e) {
        return messageSearch(e, searchForm);
    };
    searchForm.addEventListener('submit', searchEvent);
};

window.onload = init;
