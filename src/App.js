//External app imports...
import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

//Internal app imports...
import './App.css';
import Signin from './components/signin/Signin';
import Register from './components/register/Register';
import Navbar from './components/layouts/Navbar';
import Logo from './components/layouts/Logo';
import Rank from './components/rank/Rank';
import ImageLinkForm from './components/imageComponents/ImageLinkForm';
import FaceRecognition from './components/faceComponents/FaceRecognition';


/**
 * Configurations or external configurations goes here...
 * ======================================================
 */
//Using clarifai face detection api here....
const app = new Clarifai.App({
 apiKey: '7cf799bdfb2649fc8546d589852541c6'
});

//using react-particles-js here...
const particlesOptions = {
	polygon: {
		number: {
			value: 100,
			density: {
				enable: true,
				value_area: 1000
			} 
		}
	}
}



/**
 * Main App starts here......
 * =================================
 */
class App extends Component {
	constructor() {
		super();
		this.state = {
			input: '',
			imageUrl: '',
			box: {},
			route: 'signin',
			isSignedIn: false,
			user: {
				id: '',
				name: '',
				email: '',
				entries: 0,
				joined: ''
			}
		}
	}


	/**
	 * Connecting FaceRecognitionAPI here to the frontend...
	 * =====================================================
	 */
	componentDidMount() {
		fetch('https://faceRecognitionAPI.geetechlab.repl.co')
		.then(response => response.json())
		.then(console.log) //or .then(data => console.log(data))
	}

	
	loadUser = (data) => {
		this.setState({user: {
			id: data.id,
			name: data.name,
			email: data.email,
			entries: data.entries,
			joined: data.joined
		}})
	}

	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById("inputImage");
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - (clarifaiFace.right_col * width),
			bottomRow: height - (clarifaiFace.bottom_row * height)
		}
	}

	displayFaceBox = (box) => {
		this.setState({box: box});
	}

	//Adding input event listner for input state
	onInputChange = (event) => {
		// this.setState({input: event.target.value});
		console.log(event.target.value);
	}

	//Adding an event listener for detect button
	onButtonSubmit = () => {
		this.setState({imageUrl: this.state.input});
		app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
			.then(response => {
				if (response) {
					fetch('https://faceRecognitionAPI.geetechlab.repl.co/image', {
						method: 'put',
						headers: {'Content-Type': 'application/json'},
						body: JSON.stringify({
							id: this.state.user.id
						})
					}).then(response => response.json())
					.then(count => {
						// this.setState({user: {
						// 		entries: count
						// }})

						//To readup on <Object.assign>
						this.setState(Object.assign(this.state.user, {entries: count}))
					})
				}
				this.displayFaceBox(this.calculateFaceLocation(response))
			})
			.catch(err => console.log(err));
	}

	onRouteChange = (route) => {
		if (route === 'signout') {
			this.setState({isSignedIn: false});
		} else if (route === 'home') {
			this.setState({isSignedIn: true});
		}
		this.setState({route: route});
	}

	render() {
		return (
			<div className="App">
				<Particles className="particles" params={particlesOptions} />
				<Navbar isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
				{ 
					this.state.route === 'home'
					? <div>
						<Logo />
						<Rank />
						<ImageLinkForm 
							onInputChange={this.onInputChange} 
							onButtonSubmit={this.onButtonSubmit}/>
						<FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
					</div>
					: (
						this.state.route === 'signin'
						? <Signin onRouteChange={this.onRouteChange}/>
						: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
					)
				}
			</div>
		)
	}
}

export default App;
