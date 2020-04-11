const users = []

const addUser = ({ id, name, room }) => {
    //Ben Sparks = bensparks
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    const existingUser = users.find(user => user.room === room && user.name === name)

    console.log(existingUser);

    if (existingUser) {
        return { error: 'Username is taken' }
    }

    const user = { id, name, room }
    users.push(user)

    return { user }
}

const removeUser = (id) => {

    const index = users.findIndex(user => user.id === id)

    console.log("Index to remove:", index);

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => users.find((user) => user.id === id)

const getUsersInRoom = (room) => {
    return users.filter(user => {
        user.room === room
    })
}

const getAllUsers = () => {
    return users
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom, getAllUsers }