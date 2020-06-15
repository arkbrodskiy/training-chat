const socket = io()

// Elements
const $msgForm = document.querySelector('form')
const $msgInput = $msgForm.querySelector('input')
const $msgBtn = $msgForm.querySelector('button')
const $sndLocBtn = document.querySelector('#send-location')
const $messagesDiv = document.querySelector('#messages')
const $sidebarDiv = document.querySelector('.chat__sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationLinkTemplate = document.querySelector('#location-link-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
	// New message element
	const $newMessage = $messagesDiv.lastElementChild

	// Heigth of the new messages
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
	
	// Visible height
	const visibleHeight = $messagesDiv.offsetHeight

	// Height of messages container
	const msgContHeight = $messagesDiv.scrollHeight

	// How far have user scrolled
	const scrollOffset = $messagesDiv.scrollTop + visibleHeight

	if (msgContHeight - newMessageHeight <= scrollOffset) {
		$messagesDiv.scrollTop = $messagesDiv.scrollHeight
	}
}

socket.on('message', (msg) => {
	const html = Mustache.render(messageTemplate, {
		username: msg.username,
		message: msg.text,
		createdAt: moment(msg.createdAt).format('h:mm a')
	})
	$messagesDiv.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('locationMessage', (linkObj) => {
	const html = Mustache.render(locationLinkTemplate, 
		{ username: linkObj.username, url: linkObj.url, createdAt: moment(linkObj.createdAt).format('h:mm a') })
	$messagesDiv.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, { room, users })
	$sidebarDiv.innerHTML = html
})

$msgForm.addEventListener('submit', (e) => {
	e.preventDefault()

	$msgBtn.setAttribute('disabled', 'disabled')

	const msg = e.target.elements.message.value
	socket.emit('sendMessage', msg, (error) => {
		$msgBtn.removeAttribute('disabled')
		$msgInput.value = ''
		$msgInput.focus()
		if(error) {
			return console.log(error)
		}
		// console.log('Message delivered')
	})
})

$sndLocBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser')
	}
	$sndLocBtn.setAttribute('disabled', 'disabled')
	navigator.geolocation.getCurrentPosition((position) => {
		const lat = position.coords.latitude
		const lon = position.coords.longitude
		socket.emit('sendLocation', {latitude: lat, longitude: lon }, ()=> {
			// console.log('Location shared')
			$sndLocBtn.removeAttribute('disabled')
		})
	})
	
})

socket.emit('join', { username, room }, (error) => {
	if(error) {
		alert(error)
		location.href = '/'
	}
})