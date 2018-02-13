var audioElt, audioCtx, analyser, source, frequency;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

initAudio("assets/sounds/overture.mp3");

function initAudio(file) {
  if (audioElt === undefined) {
    audioElt = new Audio();
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source = audioCtx.createMediaElementSource(audioElt);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  } else {
    audioElt.pause();
  }
  audioElt.src = file;
  audioElt.loop = true;
  audioElt.controls = true;
  audioElt.autoplay = true;

  audioElt.play();
}

function toggleAudio(audio) {
  audio.paused ? audio.play() : audio.pause();
}

// SETUP

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
var cubeMaterials = [
    new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load("assets/img/blue.jpg"), side: THREE.DoubleSide }), // R
    new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load("assets/img/green.png"), side: THREE.DoubleSide }), // L
    new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load("assets/img/white.png"), side: THREE.DoubleSide }), // U
    new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load("assets/img/yellow.jpg"), side: THREE.DoubleSide }), // D
    new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load("assets/img/red.jpg"), side: THREE.DoubleSide }), // F
    new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load("assets/img/orange.jpg"), side: THREE.DoubleSide })  // B
];
var boxMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
var box = new THREE.Mesh(boxGeometry, boxMaterial);

box.callback = function() {
  toggleAudio(audioElt);
}

scene.add(box);

// FOG & LIGHT
scene.fog = new THREE.FogExp2( 0x000000, 0.0015 );
var ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

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

  box.rotation.x += 0.025;
  box.rotation.y += 0.025;

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