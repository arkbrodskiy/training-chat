const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationLink } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room })
		if (error) {
			return callback(error)
		}
		socket.join(user.room)
		console.log('New WebSocket Connection')
		socket.emit('message', generateMessage('Admin', `Welcome to the chat, ${user.username}!`))
		socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})
		callback()
	}) 

	socket.on('sendMessage', (msg, callback) => {
		const filter = new Filter()
		if(filter.isProfane(msg.text)) {
			return callback('Profanity is not allowed!')
		}
		const user = getUser(socket.id)
		io.to(user.room).emit('message', generateMessage(user.username, msg))
		callback()
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id)
		if(user) {
			io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
			io.to(user.room).emit('roomData', {
				users: getUsersInRoom(user.room),
				room: user.room
			})
		}
		
	})

	socket.on('sendLocation', ({latitude, longitude}, callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('locationMessage',
		generateLocationLink(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
		callback()
	})
})

server.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
