const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);


io.on("connection", socket => {
    const x = socket.id;
    socket.emit("your_id", socket.id);
    socket.broadcast.emit("new_user", socket.id);
    socket.on("send message", body => {
        io.emit("message", body);

    });
    socket.on("room_request", roomObject => {
        io.to(roomObject.user_requested).emit("another_user_room_request", roomObject.sender);
    });
    
    socket.on("request_users", body => {
        const userObject = {
            sender: body,
            reciever: socket.id,
        };
        socket.broadcast.emit("request_users_to_oldusers", userObject);
    })
    
    socket.on("final_emit_to_server", finalID_package => {
        io.to(finalID_package.oldUser).emit("final_emit", finalID_package.joinedUser);
    })

    socket.on("disconnect", socket => {
        io.emit("remove_user_from_list", x);
    })

    socket.on("room_request_accepted", roomRequestObject => {
        const s = roomRequestObject.userWhoRequested;
        socket.broadcast.emit("users are in a room", roomRequestObject);
        socket.join(s);
        io.to(s).emit("room_joined_message + room_joined_logic", roomRequestObject);
    });

    socket.on("room message", messageObject => {
        io.to(messageObject.room).emit("room message finalized", messageObject);
    })

    socket.on("room request denied", roomRequestObject => {
        io.to(roomRequestObject.requestUser).emit("room request denied message", roomRequestObject.denyUser)
    })

    socket.on("leave room", leaveRoomObject => {
        socket.emit("leave room 1", leaveRoomObject);
    })

    socket.on("leave room 2", leaveRoomObject => {
        if (!(leaveRoomObject.room === leaveRoomObject.leaverID)) {
            socket.emit("set are_you_in_room to false");
            io.to(leaveRoomObject.room).emit("other user left room", leaveRoomObject.leaverID);
            socket.leave(leaveRoomObject.room);
        }
        else {
            socket.emit("set are_you_in_room to false");
            io.to(leaveRoomObject.leaverID).emit("other user left room", leaveRoomObject.room);
        }
        socket.broadcast.emit("new_user", leaveRoomObject.leaverID);
    })

});

server.listen(8000, () => console.log("Server is running on port 8000"));