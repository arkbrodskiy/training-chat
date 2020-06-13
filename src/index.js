const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
	console.log('New WebSocket Connection')
	socket.emit('message', 'Welcome to the chat!')

	socket.broadcast.emit('message', 'A new user has joined!')

	socket.on('sendMessage', (msg, callback) => {
		const filter = new Filter()
		if(filter.isProfane(msg)) {
			return callback('Profanity is not allowed!')
		}
		io.emit('message', msg)
		callback()
	})

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left')
	})

	socket.on('sendLocation', ({latitude, longitude}, callback) => {
		socket.broadcast.emit('message', `Location link: https://google.com/maps?q=${latitude},${longitude}`)
		callback()
	})
})

server.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
