var audioElt, audioCtx, analyser, source, frequency;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var songIsLoading = false;
var defaultSongBtn = document.querySelector("#play-default");
var userSongBtn = document.querySelector("#play-user");
var userSongInput = document.querySelector("#music-input");

function setupAudioAPI() {
  audioElt = new Audio();
  audioElt.loop = true;
  audioElt.controls = true;
  audioElt.autoplay = false;
  audioElt.preload = "auto";

  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source = audioCtx.createMediaElementSource(audioElt);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  defaultSongBtn.addEventListener("click", function(e) {
    e.preventDefault();
    playAudio("assets/sounds/overture.mp3");
  });

  userSongBtn.addEventListener("click", function(e) {
    e.preventDefault();
    userSongInput.click();
  });

  audioElt.addEventListener("canplaythrough", function() {
    audioElt.play();
  });

  userSongInput.addEventListener("change", function() {
    var file = userSongInput.files[0];
    if (file !== undefined) {
      audioElt.pause();
      audioElt.src = URL.createObjectURL(file);
    }
  });
}

function playAudio(file) {
  audioElt.pause();
  audioElt.src = file;
}

function toggleAudio(audio) {
  audio.paused ? audio.play() : audio.pause();
}

// SETUP

setupAudioAPI();

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.z = 5;


var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild(renderer.domElement);

controls = new THREE.OrbitControls(camera, renderer.domElement);

document.addEventListener("resize", function() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);

// STARS

var starsGeometry = new THREE.Geometry();

var discSprite = new THREE.TextureLoader().load("assets/img/disc.png");

for (var i = 0 ; i < 10000 ; i++) {
  var star = new THREE.Vector3();

  star.x = THREE.Math.randFloatSpread(750);
  star.y = THREE.Math.randFloatSpread(750);
  star.z = THREE.Math.randFloatSpread(750);

  starsGeometry.vertices.push(star);
}

var starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, map: discSprite });
var starField = new THREE.Points(starsGeometry, starsMaterial);

scene.add(starField);

// BOX

var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
var boxMaterial = [
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/blue.png"), side: THREE.DoubleSide, bumpMap: new THREE.TextureLoader().load("assets/img/white.png") }), // R
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/green.png"), side: THREE.DoubleSide, bumpMap: new THREE.TextureLoader().load("assets/img/white.png") }), // L
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/white.png"), side: THREE.DoubleSide, bumpMap: new THREE.TextureLoader().load("assets/img/white.png") }), // U
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/yellow.png"), side: THREE.DoubleSide, bumpMap: new THREE.TextureLoader().load("assets/img/white.png") }), // D
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/red.png"), side: THREE.DoubleSide, bumpMap: new THREE.TextureLoader().load("assets/img/white.png") }), // F
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("assets/img/orange.png"), side: THREE.DoubleSide, bumpMap: new THREE.TextureLoader().load("assets/img/white.png") })  // B
];
var test = new THREE.MeshFaceMaterial(boxMaterial);
var box = new THREE.Mesh(boxGeometry, test);

box.callback = function() {
  toggleAudio(audioElt);
}

scene.add(box);

// FOG & LIGHT
scene.fog = new THREE.FogExp2( 0x000000, 0.0015 );
var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.z = 5
scene.add(directionalLight);

// ANIMATE

var animate = function() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  var time = Date.now() * 0.00005;

  // Animate starField
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

  if (!songIsLoading) {
    box.rotation.x += 0.05;
    box.rotation.y += 0.025;
  }

  // Get current low frequency
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  frequency = dataArray[0];
  var newScale = frequency/255 + 0.75;

  box.scale.set(newScale, newScale, newScale);

  renderer.render(scene, camera);
}

animate();

function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects([box]);

    if (intersects.length > 0) {
        intersects[0].object.callback();
    }
}

document.addEventListener("mousedown", onDocumentMouseDown);

document.addEventListener("keydown", function(e) {
  if (e.key == " ") {
    toggleAudio(audioElt);
  }
});
