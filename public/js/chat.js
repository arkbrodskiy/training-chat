const socket = io()

// Elements
const $msgForm = document.querySelector('form')
const $msgInput = $msgForm.querySelector('input')
const $msgBtn = $msgForm.querySelector('button')
const $sndLocBtn = document.querySelector('#send-location')

socket.on('message', (msg) => {
	console.log(msg)
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
		console.log('Message delivered')
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
			console.log('Location shared')
			$sndLocBtn.removeAttribute('disabled')
		})
	})
	
})