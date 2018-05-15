//   #### ##    ## #### ######## ####    ###    ##       ####  ######     ###    ######## ####  #######  ##    ##
//    ##  ###   ##  ##     ##     ##    ## ##   ##        ##  ##    ##   ## ##      ##     ##  ##     ## ###   ##
//    ##  ####  ##  ##     ##     ##   ##   ##  ##        ##  ##        ##   ##     ##     ##  ##     ## ####  ##
//    ##  ## ## ##  ##     ##     ##  ##     ## ##        ##   ######  ##     ##    ##     ##  ##     ## ## ## ##
//    ##  ##  ####  ##     ##     ##  ######### ##        ##        ## #########    ##     ##  ##     ## ##  ####
//    ##  ##   ###  ##     ##     ##  ##     ## ##        ##  ##    ## ##     ##    ##     ##  ##     ## ##   ###
//   #### ##    ## ####    ##    #### ##     ## ######## ####  ######  ##     ##    ##    ####  #######  ##    ##

// AUDIO
var audioElt, audioCtx, analyser, source, frequency;
var audioName = "Nothing playing...";
var songIsLoading = false;

// THREE.JS ELEMENTS
var scene, camera, renderer, directionalLight, raycaster, mouse, intersects, controls;
var discSprite, starsGeometry, starsMaterial, starField, whiteFace, cubeGeometry, cubeMaterial, cube;

//////////////////
// DOM ELEMENTS //
//////////////////

var defaultSongBtn = document.querySelector("#play-default");
var userSongBtn = document.querySelector("#play-user");
var userSongInput = document.querySelector("#music-input");
var audioNameElt = document.querySelector("#audio-name");



//      ###    ##     ## ########  ####  #######
//     ## ##   ##     ## ##     ##  ##  ##     ##
//    ##   ##  ##     ## ##     ##  ##  ##     ##
//   ##     ## ##     ## ##     ##  ##  ##     ##
//   ######### ##     ## ##     ##  ##  ##     ##
//   ##     ## ##     ## ##     ##  ##  ##     ##
//   ##     ##  #######  ########  ####  #######

///////////
// SETUP //
///////////

// Set up audio element
audioElt = new Audio();
audioElt.loop = true;
audioElt.controls = true;
audioElt.autoplay = false;
audioElt.preload = "auto";

// Set up audio context with source & analyser
function setupAudioCtx() {
  if (audioCtx !== undefined) { return; }
  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source = audioCtx.createMediaElementSource(audioElt);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

///////////////
// FUNCTIONS //
///////////////

// Error message
function showError(message = "Error", duration = 1000) {
  audioNameElt.classList.add("error");
  audioNameElt.innerHTML = message;
  setTimeout(function() {
    audioNameElt.innerHTML = audioName;
    audioNameElt.classList.remove("error");
  }, duration);
}

// Update the Audio Name
function updateAudioName(newAudioName) {
  audioName = newAudioName;
  audioNameElt.innerHTML = audioName;

}

// Change the audio source
function playAudio(filepath) {
  audioElt.pause();
  audioElt.src = filepath;
}

// Play/Stop the music
function toggleAudio(audio) {
  audio.paused ? audio.play() : audio.pause();
}


/////////////////////
// EVENT LISTENERS //
/////////////////////

// EventListener: Default song
defaultSongBtn.addEventListener("click", function(e) {
  e.preventDefault();
  setupAudioCtx();
  updateAudioName("AJR - Overture");
  playAudio("assets/sounds/AJR - Overture.mp3");
});

// EventListener: Choose music in Files
userSongBtn.addEventListener("click", function(e) {
  e.preventDefault();
  setupAudioCtx();
  userSongInput.click();
});

// EventListener: Music is loaded
audioElt.addEventListener("canplaythrough", function() {
  audioElt.play();
});

// EventListener: File Input value changed
userSongInput.addEventListener("change", function() {
  var file = userSongInput.files[0];
  if (!file.type.match(/^audio/)) {
    showError("Not an audio file", 2000);
    return;
  }
  var fileName = file.name.substring(0, file.name.lastIndexOf("."));
  updateAudioName(fileName);
  if (file !== undefined) {
    playAudio(URL.createObjectURL(file));
  }
});

// EventListener: When spacebar is pressed, toggle the audio
document.addEventListener("keydown", function(e) {
  if (e.key == " ") {
    toggleAudio(audioElt);
  }
});



//    ######   ######  ########       ##  ######     ###    ##     ##       ## ########  ######## ##    ##
//   ##    ## ##    ## ##            ##  ##    ##   ## ##   ###   ###      ##  ##     ## ##       ###   ##
//   ##       ##       ##           ##   ##        ##   ##  #### ####     ##   ##     ## ##       ####  ##
//    ######  ##       ######      ##    ##       ##     ## ## ### ##    ##    ########  ######   ## ## ##
//         ## ##       ##         ##     ##       ######### ##     ##   ##     ##   ##   ##       ##  ####
//   ##    ## ##    ## ##        ##      ##    ## ##     ## ##     ##  ##      ##    ##  ##       ##   ###
//    ######   ######  ######## ##        ######  ##     ## ##     ## ##       ##     ## ######## ##    ##

///////////
// SETUP //
///////////

// Set up scene with fog
scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

// Set up camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.z = 5;

// Set up renderer
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild(renderer.domElement);


/////////////////////
// EVENT LISTENERS //
/////////////////////

// EventListener: Window is resized
window.addEventListener("resize", function() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);



//    ######   #######  ##    ## ######## ########   #######  ##        ######
//   ##    ## ##     ## ###   ##    ##    ##     ## ##     ## ##       ##    ##
//   ##       ##     ## ####  ##    ##    ##     ## ##     ## ##       ##
//   ##       ##     ## ## ## ##    ##    ########  ##     ## ##        ######
//   ##       ##     ## ##  ####    ##    ##   ##   ##     ## ##             ##
//   ##    ## ##     ## ##   ###    ##    ##    ##  ##     ## ##       ##    ##
//    ######   #######  ##    ##    ##    ##     ##  #######  ########  ######

// Controls zoom-only
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableRotate = false;



//    ######  ########    ###    ########  ######## #### ######## ##       ########
//   ##    ##    ##      ## ##   ##     ## ##        ##  ##       ##       ##     ##
//   ##          ##     ##   ##  ##     ## ##        ##  ##       ##       ##     ##
//    ######     ##    ##     ## ########  ######    ##  ######   ##       ##     ##
//         ##    ##    ######### ##   ##   ##        ##  ##       ##       ##     ##
//   ##    ##    ##    ##     ## ##    ##  ##        ##  ##       ##       ##     ##
//    ######     ##    ##     ## ##     ## ##       #### ######## ######## ########

// Load a disc sprite
discSprite = new THREE.TextureLoader().load("assets/img/disc.png");

// Set up the geometry of the stars
starsGeometry = new THREE.Geometry();

for (i = 0 ; i < 10000 ; i++) {
  var star = new THREE.Vector3();

  star.x = THREE.Math.randFloatSpread(750);
  star.y = THREE.Math.randFloatSpread(750);
  star.z = THREE.Math.randFloatSpread(750);

  starsGeometry.vertices.push(star);
}

// Set up the material
starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, map: discSprite });

// Create the Points object & add it to the scene
starField = new THREE.Points(starsGeometry, starsMaterial);

scene.add(starField);



//   ########  ##     ## ########  #### ##    ## ####  ######      ######  ##     ## ########  ########
//   ##     ## ##     ## ##     ##  ##  ##   ##  #### ##    ##    ##    ## ##     ## ##     ## ##
//   ##     ## ##     ## ##     ##  ##  ##  ##    ##  ##          ##       ##     ## ##     ## ##
//   ########  ##     ## ########   ##  #####    ##    ######     ##       ##     ## ########  ######
//   ##   ##   ##     ## ##     ##  ##  ##  ##              ##    ##       ##     ## ##     ## ##
//   ##    ##  ##     ## ##     ##  ##  ##   ##       ##    ##    ##    ## ##     ## ##     ## ##
//   ##     ##  #######  ########  #### ##    ##       ######      ######   #######  ########  ########

// Set up the geometry
cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

// Load the white face texture
whiteFace = new THREE.TextureLoader().load("assets/img/white.png");

// Set up the Phong material with textures & bumpMap to create some relief
cubeMaterial = [
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/blue.png"), side: THREE.DoubleSide, bumpMap: whiteFace }), // R
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/green.png"), side: THREE.DoubleSide, bumpMap: whiteFace }), // L
    new THREE.MeshPhongMaterial({ map: whiteFace, side: THREE.DoubleSide, bumpMap: whiteFace }), // U
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/yellow.png"), side: THREE.DoubleSide, bumpMap: whiteFace }), // D
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/red.png"), side: THREE.DoubleSide, bumpMap: whiteFace }), // F
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/orange.png"), side: THREE.DoubleSide, bumpMap: whiteFace })  // B
];

// Create the Mesh, set up the click callback & add it to the scene
cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.callback = function() {
  toggleAudio(audioElt);
}

scene.add(cube);

cube.scale.set(0.75, 0.75, 0.75);



//   ##       ####  ######   ##     ## ######## #### ##    ##  ######
//   ##        ##  ##    ##  ##     ##    ##     ##  ###   ## ##    ##
//   ##        ##  ##        ##     ##    ##     ##  ####  ## ##
//   ##        ##  ##   #### #########    ##     ##  ## ## ## ##   ####
//   ##        ##  ##    ##  ##     ##    ##     ##  ##  #### ##    ##
//   ##        ##  ##    ##  ##     ##    ##     ##  ##   ### ##    ##
//   ######## ####  ######   ##     ##    ##    #### ##    ##  ######

// Set up the directional light
directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.z = 5
scene.add(directionalLight);



//   ########     ###    ##    ##  ######     ###     ######  ######## ######## ########
//   ##     ##   ## ##    ##  ##  ##    ##   ## ##   ##    ##    ##    ##       ##     ##
//   ##     ##  ##   ##    ####   ##        ##   ##  ##          ##    ##       ##     ##
//   ########  ##     ##    ##    ##       ##     ##  ######     ##    ######   ########
//   ##   ##   #########    ##    ##       #########       ##    ##    ##       ##   ##
//   ##    ##  ##     ##    ##    ##    ## ##     ## ##    ##    ##    ##       ##    ##
//   ##     ## ##     ##    ##     ######  ##     ##  ######     ##    ######## ##     ##

// Set up the mouse vector & the raycaster
mouse = new THREE.Vector2();
raycaster = new THREE.Raycaster();

// EventListener: On mouse down, if cube is the target, call its callback
document.addEventListener("mousedown", function(e) {
  e.preventDefault();

  mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  intersects = raycaster.intersectObjects([cube]);

  if (intersects.length > 0) {
      intersects[0].object.callback();
  }
});



//      ###    ##    ## #### ##     ##    ###    ######## ########
//     ## ##   ###   ##  ##  ###   ###   ## ##      ##    ##
//    ##   ##  ####  ##  ##  #### ####  ##   ##     ##    ##
//   ##     ## ## ## ##  ##  ## ### ## ##     ##    ##    ######
//   ######### ##  ####  ##  ##     ## #########    ##    ##
//   ##     ## ##   ###  ##  ##     ## ##     ##    ##    ##
//   ##     ## ##    ## #### ##     ## ##     ##    ##    ########

// Loop function
function animate() {
  requestAnimationFrame(animate);
  render();
}

// Render
function render() {

  // Get a constant increasing value
  var time = Date.now() * 0.00005;

  // Animate starField : Rotation & Changing color
  for(var i = 0 ; i < scene.children.length ; i++ ) {
		var object = scene.children[i];
		if (object instanceof THREE.Points) {
			object.rotation.x = time * (i < 4 ? i+1 : -(i+1));
      object.rotation.y = time * (i < 4 ? i+1 : -(i+1));
      object.rotation.z = time * (i < 4 ? i+1 : -(i+1));
      h = ( 180 * ( 0.95 + time ) % 180 ) / 180;
			object.material.color.setHSL( h, 1, 0.5 );
		}
	}

  // Animate cube : Rotation if song isn't loading
  if (!songIsLoading) {
    cube.rotation.x += 0.04;
    cube.rotation.y += 0.025;
  }
  if (audioCtx !== undefined) {
    // Get current low frequency
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    frequency = dataArray[0];

    // Get new scale for the cube and set it
    var newScale = frequency/255 + 0.75;
    cube.scale.set(newScale, newScale, newScale);
  }

  // Finally render
  renderer.render(scene, camera);
}

// Start the magic
animate();
