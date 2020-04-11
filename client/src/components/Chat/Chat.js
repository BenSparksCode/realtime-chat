import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input'
import Messages from '../Messages/Messages'

import './Chat.css'

let socket;

const Chat = ({ location }) => {

    const [name, setName] = useState('')
    const [room, setRoom] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState('')


    const ENDPOINT = 'localhost:5000'

    //For users joining/leaving
    useEffect(() => {
        const { name, room } = queryString.parse(location.search)

        socket = io(ENDPOINT)

        setName(name)
        setRoom(room)

        socket.emit('join', { name, room }, (err) => {
            //callback fn passed to server goes here
            if(err){
                alert(err.error)
            }
        })

        return () => {
            console.log("CLIENT - DISCONNECTING");
            socket.emit('disconnect')
            socket.off()
        }

    }, [ENDPOINT, location.search])

    //For handling new messages received on backend
    useEffect(() => {
        socket.on('message', message => {
            //add new messages to array in state as received
            console.log("CLIENT - ADDING NEW MESSAGE TO ARRAY");
            setMessages(messages => [...messages, message])
        })

        socket.on("roomData", ({ users }) => {
            console.log("Users: ", users);
            setUsers(users);
          });
    }, [])


    //Send a message to the server
    const sendMessage = (e) => {
        e.preventDefault()

        if (message) {
            socket.emit('sendMessage', message, () => {
                console.log("CLIENT - SENDING MESSAGE");
                //Callback cleans message back to ''
                setMessage('')
            })
        }
    }

    return (
        <div className='outerContainer'>
            <div className='container'>
                <InfoBar room={room} />

                <Messages
                    messages={messages}
                    name={name} />

                <Input
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage} />
            </div>
        </div>
    )
}

export default Chat