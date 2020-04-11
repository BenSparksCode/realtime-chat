const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log("New connection made!");

    //when a new user joins a room from the client
    socket.on('join', ({ name, room }, callback) => {
        console.log(`${name} joined room ${room}`);

        const { err, user } = addUser({ id: socket.id, name, room })

        //Return the User is taken error to the callback to run on client
        if (err) return callback(err)

        

        //Send welcome message only to new user
        socket.emit('message', { user: 'Admin', text: `${user.name}, welcome to room ${user.room}.`});

        //Admin announces the user joining to the whole chat
        socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has joined the room! :D` })

        //Add user to room
        socket.join(user.room)

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    //when server receives a sendMessage emit from the client
    socket.on('sendMessage', (message, callback) => {
        console.log("SERVER - MESSAGE SENT");

        const user = getUser(socket.id)

        //publish message from user to user's room
        io.to(user.room).emit('message', { user: user.name, text: message })

        //Do something on frontend once message is sent
        callback()
    })
 
    //when a connected user disconnects (closes client)
    socket.on('disconnect', () => {
    
        const user = removeUser(socket.id)

        //Server logging
        if(user){
            console.log(`${user.name} left room ${user.room}`);
        } else {
            console.log("User left a room");
        }
        
        //Updating clients with 'user left' message and new users in room data
        if(user){
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} left the room :'(` })
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        }
    })
})

app.use(router)

server.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
})

// TODO:
// singing in as same person twice