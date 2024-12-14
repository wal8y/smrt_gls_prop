const ViewerBG = '#eee';
const ViewerUI = {
	canvasWrapper: document.getElementById('viewerCanvasWrapper'),
	cubeWrapper: document.getElementById('orientCubeWrapper'),
	toggleZoom: document.getElementById('toggleZoom'),
	togglePan: document.getElementById('togglePan'),
	toggleOrbit: document.getElementById('toggleOrbit'),
	resetBtn: document.getElementById('resetBtn'),
	toggleModelBrowser: document.getElementById('toggleModelBrowser'),
	modelBrowser: document.getElementById('modelBrowser'),
	modelBrowserContent: document.getElementById('modelBrowserContent'),
	fileInput: document.getElementById('fileInput'),
	explodeSliderWrapper: document.getElementById('explodeSliderWrapper'),
	explodeSlider: document.getElementById('explodeSlider'),
	toggleExplode: document.getElementById('toggleExplode'),
	toggleShare: document.getElementById('toggleShare'),
	shareSidebar: document.getElementById('shareSidebar'),
	loader: document.getElementById('loader'),
	toggleMeasure: document.getElementById('toggleMeasure'),
	loaderInfo: document.getElementById('loaderInfo'),
	backToHome: document.getElementById('backToHome'),
	webglContainer: document.getElementById('webglContainer'),
	downloadScreen: document.getElementById('downloadScreen'),
	explodeFace: document.getElementById('explodeFace')
};

function setItemSelected(ele, bool) {
	if (bool) {
		ele.classList.add('item-selected');
	} else {
		ele.classList.remove('item-selected');
	}
}

function toggle(ele) {
	if (ele.getBoundingClientRect().height > 0) {
		ele.style.display = 'none';
		return false;
	} else {
		ele.style.display = 'block';
		return true;
	}
}

function toggleThrough(ele, through, cb, selected=true) {
	through.onclick = () => {
		let bool = toggle(ele);
		selected && setItemSelected(through, bool);
		cb && cb(bool);
	}
}

function show(ele) {
	ele.style.display = 'block';
}

function hide(ele) {
	ele.style.display = 'none';
}

class Viewer {
	constructor(canvasId) {
		this.canvasId = canvasId;
		this.init();
	}

	init() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById(this.canvasId).appendChild(this.renderer.domElement);

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.camera.position.z = 5;

		// Add lighting to the scene
		const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White directional light
		directionalLight.position.set(5, 5, 5).normalize();
		this.scene.add(directionalLight);

		// Set up download functionality
		const downloadScreen = document.getElementById('downloadScreen');
			downloadScreen.onclick = () => {
			const canvas = this.renderer.domElement;
			const image = canvas.toDataURL("image/png");
			const a = document.createElement("a");
			a.href = image.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			a.download = "image.png";
			a.click();
		};

		this.animate();
	}

	loadModel(modelPath) {
		const loader = new THREE.GLTFLoader();
		loader.load(modelPath, (gltf) => {
			const object = gltf.scene;

			// Calculate the bounding box of the loaded model
			const box = new THREE.Box3().setFromObject(object);
			const size = box.getSize(new THREE.Vector3()).length();
			const maxSize = 2; // Define a maximum size for the models

			// Calculate the scale factor to fit the model within the max size
			const scaleFactor = maxSize / size;

			// Scale the loaded model
			object.scale.set(scaleFactor, scaleFactor, scaleFactor);

			// Add the scaled model to the scene
			this.scene.add(object);

			// Log the loaded model size for debugging
			console.log("Model loaded:", object);
			console.log("Model size:", size, "Scale factor:", scaleFactor);

			// Center the camera on the loaded model
			const center = box.getCenter(new THREE.Vector3());
			this.camera.position.set(center.x, center.y, center.z + 2); // Adjust the camera position
			this.camera.lookAt(center);
		}, undefined, function (error) {
			console.error("Error loading model:", error);
		});
	}

	animate() {
		requestAnimationFrame(() => this.animate());
		this.renderer.render(this.scene, this.camera);
	}
}
