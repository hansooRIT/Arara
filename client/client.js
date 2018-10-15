var currentRoom = "Room1";
var localUsername = "";
var updateInterval;
var isSearching = false;

//Function that adds a new message onto the message board
//Parses the JSON object that it received from the ajax request and populates
//a p element with the user, message, and timestamp of the message.
const addToMessageBoard = (obj) => {
    const messageInfo = document.createElement('p');
    const newMessage = document.createElement('div');
    const user = JSON.stringify(obj.user).substring(1, JSON.stringify(obj.user).length - 1);
    const message = JSON.stringify(obj.message).substring(1, JSON.stringify(obj.message).length - 1);
    const timeStamp = JSON.stringify(obj.timeStamp).substring(1, JSON.stringify(obj.timeStamp).length - 1);
    messageInfo.textContent = user + " (" + timeStamp + ")";
    newMessage.textContent = message;
    const messageBoard = document.querySelector(".messageBoard");
    messageBoard.appendChild(messageInfo);
    messageBoard.appendChild(newMessage);
    messageBoard.appendChild(document.createElement('hr'));
}

//function to parse our response
const parseJSON = (xhr, content) => {
  //parse response (obj will be empty in a 204 updated)
  const obj = JSON.parse(xhr.response);
  return obj;
};

//Function for updating messages
//Send get request for messages.
const update = (url) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader('Accept', 'Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = () => handleResponse(xhr);
    xhr.send();
    return false;
}

//Function that clears the screen of all messages, then repopulates them based 
//on the contents of the xhr.
const updateScreen = (xhr, content) => {
    const obj = JSON.parse(xhr.response);
    const messageBoard = document.querySelector(".messageBoard");
    //Clears message board of all old messages.
    while (messageBoard.hasChildNodes()) {   
        messageBoard.removeChild(messageBoard.firstChild);
    }
    //If the user is using the search functionality...
    if (isSearching) {
        //If the search yielded no matches
        if (obj.messageLog.length == 0) {
            //Create a singular message stating that nothing matched the value.
            const messageInfo = document.createElement('p');
            messageInfo.textContent = "No matching results for search term";
            const messageBoard = document.querySelector(".messageBoard");
            messageBoard.appendChild(messageInfo);
        }
        //Otherwise, populate the message baord with the filtered messages.
        else {
            for (var i = 0; i < obj.messageLog.length; i++) addToMessageBoard(obj.messageLog[i]);    
        }
    }
    //Otherwise...
    else {
        //Populate the message board from messages from the chatroom the user is currently in.
        switch (currentRoom) {
            case "Room1":
                for (var i = 0; i < obj.messages.Room1.messageLog.length; i++) addToMessageBoard(obj.messages.Room1.messageLog[i]);
                break;
            case "Room2":
                for (var i = 0; i < obj.messages.Room2.messageLog.length; i++) addToMessageBoard(obj.messages.Room2.messageLog[i]);
                break;
            case "Room3":
                for (var i = 0; i < obj.messages.Room3.messageLog.length; i++) addToMessageBoard(obj.messages.Room3.messageLog[i]);
                break;  
        }
    }
}

//Helper function that redirects to different functions depending on the received status code.
const handleResponse = (xhr, parseResponse) => {
  const content = document.querySelector('#content');
  var response = {};
  if (parseResponse) {
      response = parseJSON(xhr, content);
  }
  switch(xhr.status) {
      case 200:
      //The request was a success, so update the screen with whatever was done. 
        updateScreen(xhr, content);
        break;
      case 201:
      //if the JSON object has the necessary parameters, add to the message board.
        if (response.user && response.message && response.timeStamp) {
            addToMessageBoard(response);
        }
        break;
      case 204:
      //Only case for a 204 is if a user changes their username.
      //Alerts the user that all of their previous messages will be updated.
        window.alert("Changed username. Updating previous messages in room");
        break;
      case 400:
      //Alerts the user of what they messed up with.
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
const sendPost = (e, messageForm) => {
    const messageAction = messageForm.getAttribute('action');
    const messageMethod = messageForm.getAttribute('method');

    const nameField = messageForm.querySelector("#username");
    const messageField = messageForm.querySelector("#message");

    if (localUsername == "") {
        localUsername = nameField.value;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open(messageMethod, messageAction);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = () => handleResponse(xhr, true);

    const formData = `user=${nameField.value}&message=${messageField.value}&room=${currentRoom}`;
    xhr.send(formData);

    e.preventDefault();
    return false;
};

//Method to change the user's current chatroom and send a get request to update the screen with messages from that room.
const changeRoom = (e, room) => {
    currentRoom = room;
    document.querySelector('#roomName').textContent = "Room " + currentRoom.substring(4, 5);
    update('/getMessages');
    if (isSearching) {
        isSearching = false;
        updateInterval = setInterval(update, 1000, '/getMessages');
    }
};

//Helper method for assigning the room changing events onto the chatrooms fields.
const roomChangeEvent = (value) => {
    var changeEvent = (e) => changeRoom(e, value);
    return changeEvent;
};

//Function that sends a post request to the server for changing user's username and updating their past messages.
const changeUsername = (e) => {
    const nameField = messageForm.querySelector("#username");
    
    const xhr = new XMLHttpRequest();
    xhr.open("post", "/updateUser");
    
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = () => handleResponse(xhr, false);

    const formData = `oldUser=${localUsername}&newUser=${nameField.value}`;
    xhr.send(formData);

    localUsername = nameField.value;
    e.preventDefault();
    return false;
};

//Function that sends a post request to the server to retrieved a json object of messages that contain the specified search term in the form.
const messageSearch = (e, searchForm) => {
    //Sets searching boolean to true, and stops the screeen refreshing so the user can see the searched messages for as long as they like.
    isSearching = true;
    clearInterval(updateInterval);
    
    const messageAction = searchForm.getAttribute('action');
    const messageMethod = searchForm.getAttribute('method');

    const searchParam = searchForm.querySelector('#searchField');
    const searchType = searchForm.querySelector('#searchType');
    
    const xhr = new XMLHttpRequest();
    xhr.open(messageMethod, messageAction);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = () => handleResponse(xhr, true);

    const formData = `type=${searchType.value}&searchParam=${searchParam.value}&room=${currentRoom}`;
    xhr.send(formData);

    e.preventDefault();
    return false;
};

//Sets up event listeners for changing rooms and entering messages.
const init = () => {
    const messageForm = document.querySelector('#messageForm');
    //Send a message if the user presses the enter key.
    messageForm.addEventListener('keydown', (e) =>  {
        const keyName = e.key;
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
    const rooms = document.querySelector('#roomSelect');
    for (var i = 1; i < 4; i++) {
        var room = "Room";
        rooms.querySelector("#".concat(room, i.toString())).addEventListener('click', roomChangeEvent(room.concat(i.toString())));
    }
    
    //Sets up event listener for searching for messages with specifications.
    const searchForm = document.querySelector('#search');
    const searchEvent = (e) => messageSearch(e, searchForm);
    searchForm.addEventListener('submit', searchEvent);
};

window.onload = init;