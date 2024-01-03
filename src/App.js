import './App.css';
import Clarifai from 'clarifai';
import Navigation from './Components/Navigaion/Navigation';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Logo from './Components/Logo/Logo';
import Rank from './Components/Rank/Rank';
import Particles from "react-particles";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import { Component } from "react";
import { loadSlim } from "tsparticles-slim";


//////////////////////Particles//////////////////////
const options={
    background: {
        color: {
            value: "#89cff0",
        },
    },
    fpsLimit: 120,
    interactivity: {
        events: {
            onClick: {
                enable: true,
                mode: "push",
            },
            onHover: {
                enable: true,
                mode: "repulse",
            },
            resize: true,
        },
        modes: {
            push: {
                quantity: 4,
            },
            repulse: {
                distance: 200,
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: "#ffffff",
        },
        links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
        },
        move: {
            direction: "none",
            enable: true,
            outModes: {
                default: "bounce",
            },
            random: false,
            speed: 6,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 80,
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: "circle",
        },
        size: {
            value: { min: 1, max: 5 },
        },
    },
    detectRetina: true,
}

const initParticles = async (engine) => {
    console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    //await loadFull(engine);
    await loadSlim(engine);
}

const particlesLoaded=(container)=> {
   console.log(container);
}
//////////////////////Particles//////////////////////

//////////////////////API//////////////////////
const app = new Clarifai.App({
    apiKey: 'a835ee536a4042f1802651a91753bb7c'
   });

const returnClarifaiRequestOptions=(imageUrl)=>{
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = '8585d6d7e7664f98a6f544cea2a56260';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'leonidasbozatzidis';       
    const APP_ID = 'my-first-application';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const IMAGE_URL = imageUrl;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const  requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };
    
   return requestOptions;
}

//////////////////////API//////////////////////


class App extends Component{
    constructor(){
        super();
        this.state = {
            input:'',
            imageUrl:'',
            box: {},
            route: 'signin',
            isSignedIn: false,
        }
    }

        calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
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

      onInputChange = (event) => {
        this.setState({input: event.target.value});
      }

      onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
           
        app.models.predict('face-detection', this.state.input)
          .then(response => {
            console.log('hi', response)
            if (response) {
              fetch('http://localhost:3000/image', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  id: this.state.user.id
                })
              })
                .then(response => response.json())
                .then(count => {
                  this.setState(Object.assign(this.state.user, { entries: count}))
                })
    
            }
            this.displayFaceBox(this.calculateFaceLocation(response))
          })
          .catch(err => console.log(err));
      }
    
      onRouteChange = (route) => {
        if (route === 'signout') {
          this.setState({isSignedIn: false})
        } else if (route === 'home') {
          this.setState({isSignedIn: true})
        }
        this.setState({route: route});
      }

    render() {
       const {isSignedIn, imageUrl, route, box} = this.state;
            return (
            <div className="App">
                    <Particles 
                        className='particles'
                        id="tsparticles"
                        options={options}
                        init={initParticles}
                        loaded={particlesLoaded}
                    />
                    <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                    {route === 'home' 
                    ?<div>
                        <Logo />
                        <Rank />
                        <ImageLinkForm 
                        onInputChange={this.onInputChange} 
                        onButtonSubmit={this.onButtonSubmit}/>       
                        <FaceRecognition box={box} imageUrl={imageUrl} />
                        </div>
                    : (
                                route === 'signin' 
                                ?<Signin onRouteChange={this.onRouteChange} />
                                :<Register onRouteChange={this.onRouteChange} />
                        )
                    } 
                </div>
            );
        }
   
}

export default App;
