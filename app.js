let scene, camera, renderer, raycaster, mouse;
let selectedObject = null;
let isDragging = false;
let dragPlane, dragOffset = new THREE.Vector3();
const objects = [];

const canvas2d = document.getElementById('canvas2d');
const ctx = canvas2d.getContext('2d');

const role = localStorage.getItem('role') || 'Guest';
document.getElementById('userRole').textContent = role;

if (role.toLowerCase().includes("customer")) {
  document.getElementById("adminTools").style.display = "none";
}

// 🟦 Draw 2D
function draw2D() {
  ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
  objects.forEach(obj => {
    const x = (obj.position.x + 10) * 20;
    const z = (obj.position.z + 10) * 15;

    ctx.fillStyle =
      obj.userData.type === "chair" ? "#2196F3" :
      obj.userData.type === "table" ? "#4CAF50" :
      "#FFC107";

    if (obj.userData.type === "chair") {
      ctx.fillRect(x - 10, z - 10, 20, 20);
    } else if (obj.userData.type === "table") {
      ctx.beginPath();
      ctx.arc(x, z, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.userData.type === "lamp") {
      ctx.beginPath();
      ctx.moveTo(x, z - 10);
      ctx.lineTo(x - 10, z + 10);
      ctx.lineTo(x + 10, z + 10);
      ctx.closePath();
      ctx.fill();
    }
  });
}

// 🟥 Add item
function addItem(type) {
  let geometry, color;
  if (type === 'chair') {
    geometry = new THREE.BoxGeometry(1, 1, 1);
    color = 0x2196F3;
  } else if (type === 'table') {
    geometry = new THREE.CylinderGeometry(1, 1, 0.4, 32);
    color = 0x4CAF50;
  } else if (type === 'lamp') {
    geometry = new THREE.ConeGeometry(0.7, 1.2, 20);
    color = 0xFFC107;
  }

  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(Math.random() * 8 - 4, 0.5, Math.random() * 8 - 4);
  mesh.userData.type = type;

  scene.add(mesh);
  objects.push(mesh);
  draw2D();
}

// 💾 Save
function saveLayout() {
  const layout = objects.map(obj => ({
    type: obj.userData.type,
    x: obj.position.x,
    z: obj.position.z,
    rotation: obj.rotation?.y || 0
  }));
  localStorage.setItem("roomLayout", JSON.stringify(layout));
  alert("Layout saved!");
}

// 🔁 Load
function loadLayout() {
  const raw = localStorage.getItem("roomLayout");
  if (!raw) return;

  const data = JSON.parse(raw);
  data.forEach(item => {
    let geometry, color;

    if (item.type === 'chair') {
      geometry = new THREE.BoxGeometry(1, 1, 1);
      color = 0x2196F3;
    } else if (item.type === 'table') {
      geometry = new THREE.CylinderGeometry(1, 1, 0.4, 32);
      color = 0x4CAF50;
    } else if (item.type === 'lamp') {
      geometry = new THREE.ConeGeometry(0.7, 1.2, 20);
      color = 0xFFC107;
    }

    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(item.x, 0.5, item.z);
    mesh.rotation.y = item.rotation;
    mesh.userData.type = item.type;

    scene.add(mesh);
    objects.push(mesh);
  });

  draw2D();
}

// 3D setup
function init3D() {
  const container = document.getElementById("canvas3d");
  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#eeeeee");

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 12, 15);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(10, 20, 10);
  scene.add(ambient, light);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0xdddddd })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  animate();
  setupDragging();
}

// 🔁 Render
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// 🧲 Drag
function setupDragging() {
  renderer.domElement.addEventListener("mousedown", (event) => {
    mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
      selectedObject = intersects[0].object;
      dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersect);
      dragOffset.copy(intersect).sub(selectedObject.position);
      isDragging = true;
    }
  });

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (!isDragging || !selectedObject) return;

    mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, intersect)) {
      selectedObject.position.x = intersect.x - dragOffset.x;
      selectedObject.position.z = intersect.z - dragOffset.z;
      draw2D();
    }
  });

  renderer.domElement.addEventListener("mouseup", () => {
    isDragging = false;
    selectedObject = null;
  });
}

// 🗑️ Clear
function clearLayout() {
  objects.forEach(obj => scene.remove(obj));
  objects.length = 0;
  draw2D();
}

// ✅ Fixed logout
function logout() {
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

// INIT
init3D();
draw2D();
loadLayout(); // ✅ loads saved layout for everyone
