import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'

import './Chat.css'

let socket;

const Chat = ({ location }) => {

    const [name, setName] = useState('')
    const [room, setRoom] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    const ENDPOINT = 'localhost:5000'

    //For users joining/leaving
    useEffect(() => {
        const { name, room } = queryString.parse(location.search)

        socket = io(ENDPOINT)

        setName(name)
        setRoom(room)

        socket.emit('join', { name, room }, () => {
            //callback fn passed to server goes here
        })

        return () => {
            socket.emit('disconnect')
            socket.off()
        }

    }, [ENDPOINT, location.search])

    //For handling new messages received on backend
    useEffect(() => {
        socket.on('message', (message) => {
            //add new messages to array in state as received
            setMessages([...messages, message])
        })
    }, [messages])


    //TODO: add function for sending messages

    return (
        <div className='outerContainer'>
            <h1>Chat</h1>
            <div className='container'>
                <input
                    type="text"
                    value={message}
                    onChange={e => {
                        setMessage(e.target.value)
                    }}
                    onKeyPress={e => {
                        if (e.key === 'Enter') sendMessage(e)
                    }} />
            </div>
        </div>
    )
}

export default Chat