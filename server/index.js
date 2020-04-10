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
        console.log(name, room);

        const { err, user } = addUser({ id: socket.id, name, room })

        //Return the User is taken error to the callback to run on client
        if (err) { return callback(err) }

        //Admin announces the user joining to the whole chat
        socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has joined the room! :D` })

        //Add user to room
        socket.join(user.room)

        //TODO: maybe move join to above the announcement?

        callback()
    })

    //when server receives a sendMessage emit from the client
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        //publish message from user to user's room
        io.to(user.room).emit('message', { user: user.name, text: message })

        //Do something on frontend once message is sent
        callback()
    })

    //when a connected user disconnects (closes client)
    socket.on('disconnect', () => {
        console.log("User just left!");
    })
})

app.use(router)

server.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
})