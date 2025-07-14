import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';



const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 20, 30);
  
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enabled = false;
controls.target.set(0, 0, 0);
controls.enablePan = false;
controls.minDistance = 15;
controls.maxDistance = 300;
controls.zoomSpeed = 0.3;
controls.rotateSpeed = 0.3;  
controls.update();   
function createGlowMaterial(color, size = 128, opacity = 0.55) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture, 
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    return new THREE.Sprite(material);
}    
const centralGlow = createGlowMaterial('rgba(255,255,255,0.8)', 156, 0.25);
centralGlow.scale.set(8, 8, 1);
scene.add(centralGlow);

for (let i = 0; i < 15; i++) {
    const hue = Math.random() * 360;
    const color = `hsla(${hue}, 80%, 50%, 0.6)`;
    const nebula = createGlowMaterial(color, 256);
    nebula.scale.set(100, 100, 1);
    nebula.position.set(
        (Math.random() - 0.5) * 175,
        (Math.random() - 0.5) * 175,
        (Math.random() - 0.5) * 175
    );
    scene.add(nebula);
}        
   
// ---- Táº O THIĂN HĂ€ (GALAXY) ----
const galaxyParameters = {
    count: 100000,
    arms: 6,
    radius: 100,               
    spin: 0.5, 
    randomness: 0.2,
    randomnessPower: 20,
    insideColor: new THREE.Color(0xd63ed6),
    outsideColor: new THREE.Color(0x48b8b8),
    rippleSpeed: 40.0,
    rippleWidth: 20.0,   
};  
    
 const heartImages = [
    'img/avt4.jpg', 'img/avt5.jpg', 'img/avt6.jpg', 
    'img/avt5.jpg', 'img/avt7.jpg', 'img/avt7.jpg',
     'img/img4.jpg', 'img/img5.jpg', 'img/img4.jpg',  
];   
  
         
                    

const textureLoader = new THREE.TextureLoader();
const numGroups = heartImages.length;
 const maxDensity = 15000;
const minDensity = 4000;
const maxGroupsForScale = 9;

let pointsPerGroup;      

if (numGroups <= 1) {
    pointsPerGroup = maxDensity;
} else if (numGroups >= maxGroupsForScale) {
    pointsPerGroup = minDensity;
} else {
    const t = (numGroups - 1) / (maxGroupsForScale - 1);
    pointsPerGroup = Math.floor(maxDensity * (1 - t) + minDensity * t);
}

if (pointsPerGroup * numGroups > galaxyParameters.count) {
    pointsPerGroup = Math.floor(galaxyParameters.count / numGroups);
}

console.log(`Sá»‘ lÆ°á»£ng áº£nh: ${numGroups}, Äiá»ƒm má»—i áº£nh: ${pointsPerGroup}`);

const positions = new Float32Array(galaxyParameters.count * 3);
const colors = new Float32Array(galaxyParameters.count * 3);
let pointIdx = 0;

for (let i = 0; i < galaxyParameters.count; i++) {
    const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
    const branchAngle = (i % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
    const spinAngle = radius * galaxyParameters.spin;

    const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
    const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.5;
    const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
    const totalAngle = branchAngle + spinAngle;

    if (radius < 30 && Math.random() < 0.7) continue;

    const i3 = pointIdx * 3;
    positions[i3] = Math.cos(totalAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;

    const mixedColor = new THREE.Color(0x6A0DAD);
    mixedColor.lerp(new THREE.Color(0x66ffff), radius / galaxyParameters.radius);
    mixedColor.multiplyScalar(1.3);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    pointIdx++;
} 

const galaxyGeometry = new THREE.BufferGeometry();
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, pointIdx * 3), 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, pointIdx * 3), 3));

const galaxyMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 50.0 * renderer.getPixelRatio() },
        uRippleTime: { value: -1.0 },
        uRippleSpeed: { value: 40.0 },
        uRippleWidth: { value: 20.0 }
    },
    vertexShader: `
        uniform float uSize;
        uniform float uTime;
        uniform float uRippleTime;
        uniform float uRippleSpeed;
        uniform float uRippleWidth;

        varying vec3 vColor;

        void main() {
            // Láº¥y mĂ u gá»‘c tá»« geometry (giá»‘ng há»‡t vertexColors: true)
            vColor = color;

            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            // ---- LOGIC HIá»†U á»¨NG Gá»¢N SĂ“NG ----
            if (uRippleTime > 0.0) {
                float rippleRadius = (uTime - uRippleTime) * uRippleSpeed;
                float particleDist = length(modelPosition.xyz);

                float strength = 1.0 - smoothstep(rippleRadius - uRippleWidth, rippleRadius + uRippleWidth, particleDist);
                strength *= smoothstep(rippleRadius + uRippleWidth, rippleRadius - uRippleWidth, particleDist);

                if (strength > 0.0) {
                    vColor += vec3(strength * 2.0); // LĂ m mĂ u sĂ¡ng hÆ¡n khi sĂ³ng Ä‘i qua
                }
            }

            vec4 viewPosition = viewMatrix * modelPosition;
            gl_Position = projectionMatrix * viewPosition;
            // DĂ²ng nĂ y lĂ m cho cĂ¡c háº¡t nhá» hÆ¡n khi á»Ÿ xa, mĂ´ phá»ng hĂ nh vi cá»§a PointsMaterial
            gl_PointSize = uSize / -viewPosition.z;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        void main() {
            // LĂ m cho cĂ¡c háº¡t cĂ³ hĂ¬nh trĂ²n thay vĂ¬ hĂ¬nh vuĂ´ng
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true
});
const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);
  
function createNeonTexture(image, size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);

    // --- Vẽ hình trái tim (bo đều hơn, không kéo dài xuống dưới quá)
    ctx.save();
    ctx.beginPath();

    const x = size / 2;
    const y = size / 2;
    const r = size / 4;

    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + r, y - r, x + r * 1.5, y + r * 0.6, x, y + r * 1.2);
    ctx.bezierCurveTo(x - r * 1.5, y + r * 0.6, x - r, y - r, x, y);

    ctx.closePath();
    ctx.clip(); 

    // --- Vẽ ảnh thu nhỏ và dịch lên một chút
    const scale = 0.65; 
    const drawSize = size * scale;
    const offsetX = (size - drawSize) / 2;
    const offsetY = (size - drawSize) / 2 - size * 0.03;

    ctx.drawImage(image, offsetX, offsetY, drawSize, drawSize);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
}




 

// ---- Táº O CĂC NHĂ“M ÄIá»‚M HĂŒNH TRĂI TIM ----
for (let group = 0; group < numGroups; group++) {
    const groupPositions = new Float32Array(pointsPerGroup * 3);
    const groupColorsNear = new Float32Array(pointsPerGroup * 3);
    const groupColorsFar = new Float32Array(pointsPerGroup * 3);
    let validPointCount = 0;
    for (let i = 0; i < pointsPerGroup; i++) {
        const idx = validPointCount * 3;
        const globalIdx = group * pointsPerGroup + i;
        const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
        if (radius < 30) continue;
        const branchAngle = (globalIdx % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
        const spinAngle = radius * galaxyParameters.spin;
        const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
        const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.5;
        const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
        const totalAngle = branchAngle + spinAngle;
        groupPositions[idx] = Math.cos(totalAngle) * radius + randomX;
        groupPositions[idx + 1] = randomY;
        groupPositions[idx + 2] = Math.sin(totalAngle) * radius + randomZ;
  
        const colorNear = new THREE.Color(0xffffff);
        groupColorsNear[idx] = colorNear.r;
        groupColorsNear[idx + 1] = colorNear.g;
        groupColorsNear[idx + 2] = colorNear.b;

        const colorFar = galaxyParameters.insideColor.clone();
        colorFar.lerp(galaxyParameters.outsideColor, radius / galaxyParameters.radius);
        colorFar.multiplyScalar(0.7 + 0.3 * Math.random());
        groupColorsFar[idx] = colorFar.r;
        groupColorsFar[idx + 1] = colorFar.g;
        groupColorsFar[idx + 2] = colorFar.b;

        validPointCount++;
    }

    if (validPointCount === 0) continue;

    // Geometry cho tráº¡ng thĂ¡i gáº§n camera
    const groupGeometryNear = new THREE.BufferGeometry();
    groupGeometryNear.setAttribute('position', new THREE.BufferAttribute(groupPositions.slice(0, validPointCount * 3), 3));
    groupGeometryNear.setAttribute('color', new THREE.BufferAttribute(groupColorsNear.slice(0, validPointCount * 3), 3));

    // Geometry cho tráº¡ng thĂ¡i xa camera
    const groupGeometryFar = new THREE.BufferGeometry();
    groupGeometryFar.setAttribute('position', new THREE.BufferAttribute(groupPositions.slice(0, validPointCount * 3), 3));
    groupGeometryFar.setAttribute('color', new THREE.BufferAttribute(groupColorsFar.slice(0, validPointCount * 3), 3));

    // TĂ­nh toĂ¡n tĂ¢m cá»§a nhĂ³m Ä‘iá»ƒm vĂ  dá»‹ch chuyá»ƒn vá» gá»‘c tá»a Ä‘á»™
    const posAttr = groupGeometryFar.getAttribute('position');
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < posAttr.count; i++) {
        cx += posAttr.getX(i);
        cy += posAttr.getY(i);
        cz += posAttr.getZ(i);
    }
    cx /= posAttr.count;
    cy /= posAttr.count;
    cz /= posAttr.count;
    groupGeometryNear.translate(-cx, -cy, -cz);
    groupGeometryFar.translate(-cx, -cy, -cz);

    // Táº£i hĂ¬nh áº£nh vĂ  táº¡o váº­t thá»ƒ
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = heartImages[group];
    img.onload = () => {
        const neonTexture = createNeonTexture(img, 256);

        // Material khi á»Ÿ gáº§n
        const materialNear = new THREE.PointsMaterial({
            size: 4.8,        
            map: neonTexture,
            transparent: false, 
            alphaTest: 0.2,
            depthWrite: true,
            depthTest: true,
            blending: THREE.NormalBlending,
            vertexColors: true
        });  
   
        // Material khi á»Ÿ xa
        const materialFar = new THREE.PointsMaterial({
            size: 7.8,
            map: neonTexture, 
            transparent: true,
            alphaTest: 0.2,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        const pointsObject = new THREE.Points(groupGeometryFar, materialFar);
        pointsObject.position.set(cx, cy, cz); // Äáº·t láº¡i vá»‹ trĂ­ ban Ä‘áº§u trong scene

        // LÆ°u trá»¯ cĂ¡c tráº¡ng thĂ¡i Ä‘á»ƒ chuyá»ƒn Ä‘á»•i sau nĂ y
        pointsObject.userData.materialNear = materialNear;
        pointsObject.userData.geometryNear = groupGeometryNear;
        pointsObject.userData.materialFar = materialFar;
        pointsObject.userData.geometryFar = groupGeometryFar;

        scene.add(pointsObject);
    };
}




// ---- ĂNH SĂNG MĂ”I TRÆ¯á»œNG ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// ---- Táº O Ná»€N SAO (STARFIELD) ----
const starCount = 20000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 900;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 900;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 900;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
});
const starField = new THREE.Points(starGeometry, starMaterial);
starField.name = 'starfield';
starField.renderOrder = 999;
scene.add(starField);


// ---- Táº O SAO BÄ‚NG (SHOOTING STARS) ----
let shootingStars = [];

function createShootingStar() {
    const trailLength = 100;

    // Äáº§u sao bÄƒng
    const headGeometry = new THREE.SphereGeometry(2, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);

    // HĂ o quang cá»§a sao bÄƒng
    const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            uniform float time;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * (0.8 + sin(time * 5.0) * 0.2));
            }
        `,
        transparent: true,   
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide 
    });   

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    head.add(glow); 
           
    const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.05, 48, 48);
    // Tạo vật liệu cho bầu khí quyển
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(0xe0b3ff) }
        },        
        vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        } 
    `,
    
        fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            float alpha = intensity * 0.4; // giảm độ đậm để mờ hơn
    gl_FragColor = vec4(glowColor, alpha);
        }
    `,
        side: THREE.BackSide, // NhĂ¬n tá»« bĂªn trong
        blending: THREE.AdditiveBlending,
        transparent: true
        
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planet.add(atmosphere); // ThĂªm khĂ­ quyá»ƒn lĂ m con cá»§a hĂ nh tinh

    // ÄuĂ´i sao bÄƒng
    const curve = createRandomCurve();
    const trailPoints = [];
    for (let i = 0; i < trailLength; i++) {
        const progress = i / (trailLength - 1);
        trailPoints.push(curve.getPoint(progress));
    }
    const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trailMaterial = new THREE.LineBasicMaterial({
        color: 0x99eaff,
        transparent: true,
        opacity: 0.7,
        linewidth: 2
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);

    const shootingStarGroup = new THREE.Group();
    shootingStarGroup.add(head);
    shootingStarGroup.add(trail);
    shootingStarGroup.userData = {
        curve: curve,
        progress: 0,
        speed: 0.001 + Math.random() * 0.001,
        life: 0,
        maxLife: 300,
        head: head,
        trail: trail,
        trailLength: trailLength,
        trailPoints: trailPoints,
    };
    scene.add(shootingStarGroup);
    shootingStars.push(shootingStarGroup);
}

function createRandomCurve() {
    const points = [];
    const startPoint = new THREE.Vector3(-200 + Math.random() * 100, -100 + Math.random() * 200, -100 + Math.random() * 200);
    const endPoint = new THREE.Vector3(600 + Math.random() * 200, startPoint.y + (-100 + Math.random() * 200), startPoint.z + (-100 + Math.random() * 200));
    const controlPoint1 = new THREE.Vector3(startPoint.x + 200 + Math.random() * 100, startPoint.y + (-50 + Math.random() * 100), startPoint.z + (-50 + Math.random() * 100));
    const controlPoint2 = new THREE.Vector3(endPoint.x - 200 + Math.random() * 100, endPoint.y + (-50 + Math.random() * 100), endPoint.z + (-50 + Math.random() * 100));

    points.push(startPoint, controlPoint1, controlPoint2, endPoint);
    return new THREE.CubicBezierCurve3(startPoint, controlPoint1, controlPoint2, endPoint);
}


// ---- Táº O HĂ€NH TINH TRUNG TĂ‚M ----

// HĂ m táº¡o texture cho hĂ nh tinh
function createPlanetTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Ná»n gradient
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size / 8, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, '#ffe0f0'); // hồng nhạt
    gradient.addColorStop(0.3, '#e0aaff'); // tím pastel
    gradient.addColorStop(0.9, '#c080e6'); // tím đậm hơn
    gradient.addColorStop(1.0, '#4a1a6d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);       
  
    // CĂ¡c Ä‘á»‘m mĂ u ngáº«u nhiĂªn
    const spotColors = ['#f8bbd0', '#f8bbd0', '#f48fb1', '#f48fb1', '#f06292', '#f06292', '#ffffff', '#e1aaff', '#a259f7'];
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 30 + Math.random() * 120;
        const color = spotColors[Math.floor(Math.random() * spotColors.length)];
        const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        spotGradient.addColorStop(0, color + 'cc'); // 'cc' lĂ  alpha
        spotGradient.addColorStop(1, color + '00');
        ctx.fillStyle = spotGradient;
        ctx.fillRect(0, 0, size, size);
    }

    // CĂ¡c Ä‘Æ°á»ng cong (swirls)
    for (let i = 0; i < 8; i++) {          
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
ctx.clip();     
        ctx.moveTo(Math.random() * size, Math.random() * size);
        ctx.bezierCurveTo(Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size);
        ctx.strokeStyle = 'rgba(180, 120, 200, ' + (0.12 + Math.random() * 0.18) + ')';
        ctx.lineWidth = 8 + Math.random() * 18;
        ctx.stroke();
    }

    // Ăp dá»¥ng blur
    if (ctx.filter !== undefined) {
        ctx.filter = 'blur(2px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    }

    return new THREE.CanvasTexture(canvas);
}
 
// Shader cho hiá»‡u á»©ng bĂ£o trĂªn bá» máº·t hĂ nh tinh
const stormShader = {
    uniforms: {
        time: { value: 0.0 },
        baseTexture: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform sampler2D baseTexture;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv;
            float angle = length(uv - vec2(0.5)) * 3.0;
            float twist = sin(angle * 3.0 + time) * 0.1;
            uv.x += twist * sin(time * 0.5);
            uv.y += twist * cos(time * 0.5);
            vec4 texColor = texture2D(baseTexture, uv);
            float noise = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.1;
            texColor.rgb += noise * vec3(0.8, 0.4, 0.2);
            gl_FragColor = texColor;
        }
    `
};

// Táº¡o váº­t thá»ƒ hĂ nh tinh
const planetRadius = 10;
const planetGeometry = new THREE.SphereGeometry(planetRadius, 48, 48);
const planetTexture = createPlanetTexture();
const planetMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        baseTexture: { value: planetTexture }
    },
    vertexShader: stormShader.vertexShader,
    fragmentShader: stormShader.fragmentShader
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(0, 0, 0);
scene.add(planet);

// ---- Táº O CĂC VĂ’NG CHá»® QUAY QUANH HĂ€NH TINH --- -
const ringTexts = [
   '💜 Duy Đức Đz 💜 Duy Đức Đz 💜 Duy Đức Đz 💜',   
]; 
 
function createTextRings() {
    const numRings = ringTexts.length;
    const baseRingRadius = planetRadius * 1.1;
    const ringSpacing = 5;
    window.textRings = [];
 
    for (let i = 0; i < numRings; i++) {
        const text = ringTexts[i % ringTexts.length] + '   '; // ThĂªm khoáº£ng tráº¯ng
        const ringRadius = baseRingRadius + i * ringSpacing;
  
        // ---- Logic phĂ¢n tĂ­ch vĂ  Ä‘iá»u chá»‰nh kĂ­ch thÆ°á»›c font chá»¯ (Ä‘Æ°á»£c giá»¯ nguyĂªn) ----
        function getCharType(char) {
            const charCode = char.charCodeAt(0);
            if ((charCode >= 0x4E00 && charCode <= 0x9FFF) || // CJK
                (charCode >= 0x3040 && charCode <= 0x309F) || // Hiragana
                (charCode >= 0x30A0 && charCode <= 0x30FF) || // Katakana
                (charCode >= 0xAC00 && charCode <= 0xD7AF)) { // Korean
                return 'cjk';
            } else if (charCode >= 0 && charCode <= 0x7F) { // Latin
                return 'latin';
            }
            return 'other';
        }

        let charCounts = { cjk: 0, latin: 0, other: 0 };
        for (let char of text) {
            charCounts[getCharType(char)]++;
        }

        const totalChars = text.length;
        const cjkRatio = charCounts.cjk / totalChars;

        let scaleParams = { fontScale: 0.75, spacingScale: 1.1 };

        if (i === 0) {
            scaleParams.fontScale = 0.55;
            scaleParams.spacingScale = 0.9;
        } else if (i === 1) {
            scaleParams.fontScale = 0.65;
            scaleParams.spacingScale = 1.0;
        }

        if (cjkRatio > 0) {
            scaleParams.fontScale *= 0.9;
            scaleParams.spacingScale *= 1.1;
        }
        // ---- Káº¿t thĂºc logic phĂ¢n tĂ­ch font ----

        // ---- Táº¡o texture chá»¯ Ä‘á»™ng ----
        const textureHeight = 300;  
        const fontSize = Math.max(220, 1.0 * textureHeight);  

        // Äo chiá»u rá»™ng cá»§a text Ä‘á»ƒ láº·p láº¡i
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
        let singleText = ringTexts[i % ringTexts.length];
        const separator = '   ';
        let repeatedTextSegment = singleText + separator;

        let segmentWidth = tempCtx.measureText(repeatedTextSegment).width;
        let textureWidthCircumference = 2 * Math.PI * ringRadius * 180; // Heuristic value
        let repeatCount = Math.ceil(textureWidthCircumference / segmentWidth);

        let fullText = '';
        for (let j = 0; j < repeatCount; j++) {
            fullText += repeatedTextSegment;
        }

        let finalTextureWidth = segmentWidth * repeatCount;
        if (finalTextureWidth < 1 || !fullText) {
            fullText = repeatedTextSegment;
            finalTextureWidth = segmentWidth;
        }

        // Váº½ text lĂªn canvas chĂ­nh
        const textCanvas = document.createElement('canvas');
        textCanvas.width = Math.ceil(Math.max(1, finalTextureWidth));
        textCanvas.height = textureHeight;
        const ctx = textCanvas.getContext('2d');

        ctx.clearRect(0, 0, textCanvas.width, textureHeight);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left'; 
        ctx.textBaseline = 'alphabetic';

        // Hiá»‡u á»©ng glow cho chá»¯
        ctx.shadowColor = '#e0b3ff';
        ctx.shadowBlur = 24;
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#0077b6';
        ctx.strokeText(fullText, 0, textureHeight * 0.8);

        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 16;
        ctx.fillText(fullText, 0, textureHeight * 0.8);

        const ringTexture = new THREE.CanvasTexture(textCanvas);
        ringTexture.wrapS = THREE.RepeatWrapping;
        ringTexture.repeat.x = finalTextureWidth / textureWidthCircumference;
        ringTexture.needsUpdate = true;

        const ringGeometry = new THREE.CylinderGeometry(ringRadius, ringRadius, 1, 128, 1, true);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.01
        });

        const textRingMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        textRingMesh.position.set(0, 0, 0);
        textRingMesh.rotation.y = Math.PI / 2;

        const ringGroup = new THREE.Group();
        ringGroup.add(textRingMesh);
        ringGroup.userData = {
            ringRadius: ringRadius,
            angleOffset: 0.15 * Math.PI * 0.5,
            speed: 0.008, // Tá»‘c Ä‘á»™ quay
            tiltSpeed: 0, rollSpeed: 0, pitchSpeed: 0, // Tá»‘c Ä‘á»™ láº¯c
            tiltAmplitude: Math.PI / 3, rollAmplitude: Math.PI / 6, pitchAmplitude: Math.PI / 8, // BiĂªn Ä‘á»™ láº¯c
            tiltPhase: Math.PI * 2, rollPhase: Math.PI * 2, pitchPhase: Math.PI * 2, // Pha láº¯c
            isTextRing: true
        };

        const initialRotationX = i / numRings * (Math.PI / 1);
        ringGroup.rotation.x = initialRotationX;
        scene.add(ringGroup);
        window.textRings.push(ringGroup);
    }
}
function createGlowRing(radius, count = 350) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = 0;
        const z = Math.sin(angle) * radius;

        positions.push(x, y, z);
        sizes.push(5 + Math.random() * 5); // kích thước hạt
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const sprite = createGlowTexture(); 
    const material = new THREE.PointsMaterial({
        map: sprite,
        size: 2,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: new THREE.Color('#ffbbff'),
    }); 
 

     const starMaterial = new THREE.SpriteMaterial({
    map: createStarTexture2(),
    color: new THREE.Color('#00ffff'), // 💠 màu sao
    transparent: true,
    blending: THREE.AdditiveBlending, 
    depthWrite: false
});

 
    const points = new THREE.Points(geometry, material);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);
 
    // === Hạt sao bay ra và biến mất ===
    const stars = [];
    const texture = createStarTexture2();

    function spawnStar() {
        const material = new THREE.SpriteMaterial({
            map: texture,
            color: 0xffccff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
 
        const sprite = new THREE.Sprite(material);
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 2; 

        sprite.position.set(x, y, z);
        const scale = 1.5 + Math.random() * 2;  
        sprite.scale.set(scale, scale, 1); 

        const dir = new THREE.Vector3(x, y, z).normalize().multiplyScalar(0.05 + Math.random() * 0.001);

        stars.push({ sprite, velocity: dir, life: 0 });
        group.add(sprite);
    }
   
    // Spawn ban đầu
    for (let i = 0; i < 100; i++) {
        spawnStar();
    }

   function animateRing() { 
    group.rotation.z += 0.003;

    // Tỏa sao ra ngoài và mờ dần
    for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.sprite.position.add(s.velocity);
        s.life++;
  
        const alpha = 1.0 - s.life / 100;
        s.sprite.material.opacity = Math.max(0, alpha);

        // Nếu hết tuổi thọ thì xoá và tạo lại ngay lập tức
        if (s.life > 100) {
            group.remove(s.sprite);
            stars.splice(i, 1);
            spawnStar(); // 🔥 Spawn ngay khi 1 sao biến mất
        }
    }

    requestAnimationFrame(animateRing);
}


    animateRing();
}

function createStarsBurstFromRing(centerRadius, starCount = 50) {
    const stars = [];
    const texture = createStarTexture();

    for (let i = 0; i < starCount; i++) {
        const material = new THREE.SpriteMaterial({
            map: texture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);
        const scale = 3 + Math.random() * 2;
        sprite.scale.set(scale, scale, 1);

        // Gốc xuất phát trên vòng
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * centerRadius;
        const z = Math.sin(angle) * centerRadius;
        const y = (Math.random() - 0.5) * 4;

        sprite.position.set(x, y, z);

        // Vector bay chếch ra ngoài
        const dir = new THREE.Vector3(x, y, z).normalize().multiplyScalar(0.5 + Math.random() * 1.5);

        stars.push({ sprite, velocity: dir, startPos: new THREE.Vector3(x, y, z), life: 0 });
        scene.add(sprite);
    }

    function animateBurstingStars() {
        for (let star of stars) {
            star.sprite.position.add(star.velocity);
            star.life += 1;

            // Khi bay ra xa hoặc đủ thời gian → reset lại
            const dist = star.sprite.position.distanceTo(star.startPos);
            if (dist > 40 || star.life > 300) {
                star.sprite.position.copy(star.startPos);
                star.life = 0;
            }
        }

        requestAnimationFrame(animateBurstingStars);
    }

    animateBurstingStars();
}

function createGlowTexture() {
    const size = 128; 
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
     gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');   // tâm siêu sáng
    gradient.addColorStop(0.1, 'rgba(255, 128, 255, 0.6)');     // hồng sáng
    gradient.addColorStop(0.5, 'rgba(200, 100, 255, 0.2)');  // tím mờ
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');  // ngoài trong suốt

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
 
    const texture = new THREE.CanvasTexture(canvas);
    return texture;  
}
  function createStarTexture() { 
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,192,255,0.8)');
    gradient.addColorStop(0.6, 'rgba(255,128,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
} 
function createStarTexture2() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
 
    const center = size / 2;

    // 💥 Vẽ 1 chấm trắng sắc nét ở giữa, không viền, không gradient
    ctx.beginPath();
    ctx.arc(center, center, size * 0.05, 0, Math.PI * 2);  // 👈 tăng size nếu muốn rõ hơn
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // trắng rõ
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

    

 
    

 function createFlyingStar(radius) {
    const material = new THREE.SpriteMaterial({
        map: createStarTexture(),
        color: 0xffc0ff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const star = new THREE.Sprite(material);
    star.scale.set(8, 8, 1); // kích thước ngôi sao
    scene.add(star);

    // Cập nhật vị trí bay tròn
    function animate() {
        const time = performance.now() * 0.001; // giây
        const angle = time * 0.6; // tốc độ
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(time * 1.2) * 5; // dao động nhẹ lên xuống
        star.position.set(x, y, z);
        requestAnimationFrame(animate);
    } 
    animate();
}

createGlowRing(planetRadius * 1.4,250);  // vòng glow
createFlyingStar(planetRadius * 1.4);
createTextRings();  
createGlowRing(planetRadius * 1.5);




 
function updateTextRingsRotation() {
    if (!window.textRings || !camera) return;

    window.textRings.forEach((ringGroup, index) => {
        ringGroup.children.forEach(child => {
            if (child.userData.initialAngle !== undefined) {
                const angle = child.userData.initialAngle + ringGroup.userData.angleOffset;
                const x = Math.cos(angle) * child.userData.ringRadius;
                const z = Math.sin(angle) * child.userData.ringRadius;
                child.position.set(x, 0, z);

                const worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);

                const lookAtVector = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
                const rotationY = Math.atan2(lookAtVector.x, lookAtVector.z);
                child.rotation.y = rotationY;
            }
        });
    });
}

function animatePlanetSystem() {
    if (window.textRings) {
        const time = Date.now() * 0.001;
        window.textRings.forEach((ringGroup, index) => {
            const userData = ringGroup.userData;
            userData.angleOffset += userData.speed;

            // Chuyá»ƒn Ä‘á»™ng láº¯c lÆ°
            const tilt = Math.sin(time * userData.tiltSpeed + userData.tiltPhase) * userData.tiltAmplitude;
            const roll = Math.cos(time * userData.rollSpeed + userData.rollPhase) * userData.rollAmplitude;
            const pitch = Math.sin(time * userData.pitchSpeed + userData.pitchPhase) * userData.pitchAmplitude;

            ringGroup.rotation.x = (index / window.textRings.length) * (Math.PI / 1) + tilt;
            ringGroup.rotation.z = roll;
            ringGroup.rotation.y = userData.angleOffset + pitch;

            const verticalBob = Math.sin(time * (userData.tiltSpeed * 0.7) + userData.tiltPhase) * 0.3;
            ringGroup.position.y = verticalBob;

            const pulse = (Math.sin(time * 1.5 + index) + 1) / 2; // giĂ¡ trá»‹ tá»« 0 Ä‘áº¿n 1
            const textMesh = ringGroup.children[0];
            if (textMesh && textMesh.material) {
                // Thay Ä‘á»•i Ä‘á»™ má» tá»« 0.7 Ä‘áº¿n 1.0
                textMesh.material.opacity = 0.7 + pulse * 0.3;
            }
        });
        updateTextRingsRotation();
    }
}


// ---- VĂ’NG Láº¶P ANIMATE ----
let fadeOpacity = 0.1;
let fadeInProgress = false;

// =======================================================================
// ---- THĂM HIá»†U á»¨NG Gá»¢I Ă NHáº¤N VĂ€O TINH Cáº¦U (HINT ICON) ----
// =======================================================================

let hintIcon;
let hintText;
/**
 * Táº¡o icon con trá» chuá»™t 3D Ä‘á»ƒ gá»£i Ă½ ngÆ°á»i dĂ¹ng.
 * PHIĂN Báº¢N HOĂ€N CHá»ˆNH: Con trá» mĂ u tráº¯ng Ä‘á»“ng nháº¥t vĂ  Ä‘Æ°á»£c Ä‘áº·t á»Ÿ vá»‹ trĂ­
 * xa hÆ¡n so vá»›i quáº£ cáº§u trung tĂ¢m.
 */
function createHintIcon() {
    hintIcon = new THREE.Group();
    hintIcon.name = 'hint-icon-group';
    scene.add(hintIcon);

    const cursorVisuals = new THREE.Group();

    // --- 1. Táº O HĂŒNH Dáº NG CON TRá» (Giá»¯ nguyĂªn) ---
    const cursorShape = new THREE.Shape();
    const h = 1.5;
    const w = h * 0.5;

    cursorShape.moveTo(0, 0);
    cursorShape.lineTo(-w * 0.4, -h * 0.7);
    cursorShape.lineTo(-w * 0.25, -h * 0.7);
    cursorShape.lineTo(-w * 0.5, -h);
    cursorShape.lineTo(w * 0.5, -h);
    cursorShape.lineTo(w * 0.25, -h * 0.7);
    cursorShape.lineTo(w * 0.4, -h * 0.7);
    cursorShape.closePath();

    // --- 2. Táº O CON TRá» MĂ€U TRáº®NG ---

    // Lá»›p ná»n (trÆ°á»›c lĂ  viá»n Ä‘en, giá» lĂ  ná»n tráº¯ng)
    const backgroundGeometry = new THREE.ShapeGeometry(cursorShape);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // THAY Äá»”I: Chuyá»ƒn viá»n thĂ nh mĂ u tráº¯ng
        side: THREE.DoubleSide
    });
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

    // Lá»›p tráº¯ng bĂªn trong (giá» khĂ´ng cáº§n thiáº¿t nhÆ°ng giá»¯ láº¡i Ä‘á»ƒ Ä‘áº£m báº£o Ä‘á»™ dĂ y)
    const foregroundGeometry = new THREE.ShapeGeometry(cursorShape);
    const foregroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Giá»¯ mĂ u tráº¯ng
        side: THREE.DoubleSide
    });
    const foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);

    foregroundMesh.scale.set(0.8, 0.8, 1);
    foregroundMesh.position.z = 0.01;

    cursorVisuals.add(backgroundMesh, foregroundMesh);
    cursorVisuals.position.y = h / 2;
    cursorVisuals.rotation.x = Math.PI / 2;

    // --- 3. Táº O VĂ’NG TRĂ’N BAO QUANH (Giá»¯ nguyĂªn) ---
    const ringGeometry = new THREE.RingGeometry(1.8, 2.0, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    hintIcon.userData.ringMesh = ringMesh;

    // --- 4. HOĂ€N THIá»†N ICON ---
    hintIcon.add(cursorVisuals);
    hintIcon.add(ringMesh);

    // THAY Äá»”I: Äáº·t icon á»Ÿ vá»‹ trĂ­ xa hÆ¡n
    hintIcon.position.set(1.5, 1.5, 15); // TÄƒng giĂ¡ trá»‹ Z tá»« 12 lĂªn 20

    hintIcon.scale.set(0.8, 0.8, 0.8);
    hintIcon.lookAt(planet.position);
    hintIcon.userData.initialPosition = hintIcon.position.clone();
}

/**
 * Animate icon gá»£i Ă½.
 * @param {number} time - Thá»i gian hiá»‡n táº¡i.
 */
function animateHintIcon(time) {
    if (!hintIcon) return;

    if (!introStarted) {
        hintIcon.visible = true;

        // Hiá»‡u á»©ng "nháº¥n" tá»›i lui
        const tapFrequency = 2.5;
        const tapAmplitude = 1.5;
        const tapOffset = Math.sin(time * tapFrequency) * tapAmplitude;

        // Di chuyá»ƒn icon tá»›i lui theo hÆ°á»›ng nĂ³ Ä‘ang nhĂ¬n
        const direction = new THREE.Vector3();
        hintIcon.getWorldDirection(direction);
        hintIcon.position.copy(hintIcon.userData.initialPosition).addScaledVector(direction, -tapOffset);

        // Hiá»‡u á»©ng "sĂ³ng" cho vĂ²ng trĂ²n
        const ring = hintIcon.userData.ringMesh;
        const ringScale = 1 + Math.sin(time * tapFrequency) * 0.1;
        ring.scale.set(ringScale, ringScale, 1);
        ring.material.opacity = 0.5 + Math.sin(time * tapFrequency) * 0.2;
         // Xá»­ lĂ½ vÄƒn báº£n gá»£i Ă½ (thĂªm hiá»‡u á»©ng má»›i)
        if (hintText) {
            hintText.visible = true;
            hintText.material.opacity = 0.7 + Math.sin(time * 3) * 0.3;
            hintText.position.y = 15 + Math.sin(time * 2) * 0.5;
            hintText.lookAt(camera.position);
        }
    } else {
        // áº¨n icon Ä‘i khi intro Ä‘Ă£ báº¯t Ä‘áº§u
        if (hintIcon) hintIcon.visible = false;

        if (hintText) hintText.visible = false;
    }
}

// ---- CHá»ˆNH Sá»¬A VĂ’NG Láº¶P ANIMATE ----
// Báº¡n cáº§n thay tháº¿ hĂ m animate() cÅ© báº±ng hĂ m Ä‘Ă£ Ä‘Æ°á»£c chá»‰nh sá»­a nĂ y.
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;

    // Cáº­p nháº­t icon gá»£i Ă½
    animateHintIcon(time);

    controls.update();
    planet.material.uniforms.time.value = time * 0.5;

    // Logic fade-in sau khi báº¯t Ä‘áº§u
    if (fadeInProgress && fadeOpacity < 1) {
        fadeOpacity += 0.025;
        if (fadeOpacity > 1) fadeOpacity = 1;
    }

    if (!introStarted) {
        // Tráº¡ng thĂ¡i trÆ°á»›c khi intro báº¯t Ä‘áº§u
        fadeOpacity = 0.1;
        scene.traverse(obj => {
            if (obj.name === 'starfield') {
                if (obj.points && obj.material.opacity !== undefined) {
                    obj.material.transparent = false;
                    obj.material.opacity = 1;
                }
                return;
            }
            if (obj.userData.isTextRing || (obj.parent && obj.parent.userData && obj.parent.userData.isTextRing)) {
                if (obj.material && obj.material.opacity !== undefined) {
                    obj.material.transparent = false;
                    obj.material.opacity = 1;
                }
                if (obj.material && obj.material.color) {
                    obj.material.color.set(0xffffff);
                }
            } else if (obj !== planet && obj !== centralGlow && obj !== hintIcon && obj.type !== 'Scene' && !obj.parent.isGroup) {
                 if (obj.material && obj.material.opacity !== undefined) {
                    obj.material.transparent = true;
                    obj.material.opacity = 0.1;
                }
            }
        });
        planet.visible = true;
        centralGlow.visible = true;
    } else {
        // Tráº¡ng thĂ¡i sau khi intro báº¯t Ä‘áº§u
        scene.traverse(obj => {
            if (!(obj.userData.isTextRing || (obj.parent && obj.parent.userData && obj.parent.userData.isTextRing) || obj === planet || obj === centralGlow || obj.type === 'Scene')) {
                if (obj.material && obj.material.opacity !== undefined) {
                    obj.material.transparent = true;
                    obj.material.opacity = fadeOpacity;
                }
            } else {
                if (obj.material && obj.material.opacity !== undefined) {
                    obj.material.opacity = 1;
                    obj.material.transparent = false;
                }
            }
            if (obj.material && obj.material.color) {
                obj.material.color.set(0xffffff);
            }
        });
    }

    // Cáº­p nháº­t sao bÄƒng
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.userData.life++;

        let opacity = 1.0;
        if (star.userData.life < 30) {
            opacity = star.userData.life / 30;
        } else if (star.userData.life > star.userData.maxLife - 30) {
            opacity = (star.userData.maxLife - star.userData.life) / 30;
        }

        star.userData.progress += star.userData.speed;
        if (star.userData.progress > 1) {
            scene.remove(star);
            shootingStars.splice(i, 1);
            continue;
        }

        const currentPos = star.userData.curve.getPoint(star.userData.progress);
        star.position.copy(currentPos);
        star.userData.head.material.opacity = opacity;
        star.userData.head.children[0].material.uniforms.time.value = time;

        const trail = star.userData.trail;
        const trailPoints = star.userData.trailPoints;
        trailPoints[0].copy(currentPos);
        for (let j = 1; j < star.userData.trailLength; j++) {
            const trailProgress = Math.max(0, star.userData.progress - j * 0.01);
            trailPoints[j].copy(star.userData.curve.getPoint(trailProgress));
        }
        trail.geometry.setFromPoints(trailPoints);
        trail.material.opacity = opacity * 0.7;
    }

    if (shootingStars.length < 3 && Math.random() < 0.02) {
        createShootingStar();
    }

    // Logic chuyá»ƒn Ä‘á»•i material cho cĂ¡c nhĂ³m Ä‘iá»ƒm trĂ¡i tim
    scene.traverse(obj => {
        if (obj.isPoints && obj.userData.materialNear && obj.userData.materialFar) {
            const positionAttr = obj.geometry.getAttribute('position');
            let isClose = false;
            for (let i = 0; i < positionAttr.count; i++) {
                const worldX = positionAttr.getX(i) + obj.position.x;
                const worldY = positionAttr.getY(i) + obj.position.y;
                const worldZ = positionAttr.getZ(i) + obj.position.z;
                const distance = camera.position.distanceTo(new THREE.Vector3(worldX, worldY, worldZ));
                if (distance < 10) {
                    isClose = true;
                    break;
                }
            }
            if (isClose) {
                if (obj.material !== obj.userData.materialNear) {
                    obj.material = obj.userData.materialNear;
                    obj.geometry = obj.userData.geometryNear;
                }
            } else {
                if (obj.material !== obj.userData.materialFar) {
                    obj.material = obj.userData.materialFar;
                    obj.geometry = obj.userData.geometryFar;
                }
            }
        }
    });  

    // Cáº­p nháº­t camera

    planet.lookAt(camera.position);
    animatePlanetSystem();

    if (starField && starField.material && starField.material.opacity !== undefined) {
        starField.material.opacity = 1.0;
        starField.material.transparent = false;
    }

    renderer.render(scene, camera);
}
function createHintText() {
    const canvasSize = 512; 
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;
    const context = canvas.getContext('2d');
    const fontSize = 50; 
    const text = 'Cháº¡m VĂ o Tinh Cáº§u';
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = '#ffb3de';
    context.shadowBlur = 5;
    context.lineWidth = 2;
    context.strokeStyle = 'transparent'; // Không cÃ³ mÃ u ná»n
    context.strokeText(text, canvasSize / 2, canvasSize / 2);
    context.shadowColor = '#e0b3ff';
    context.shadowBlur = 5;
    context.lineWidth = 2;
    context.strokeStyle = 'transparent'; // Không cÃ³ mÃ u ná»n
    context.strokeText(text, canvasSize / 2, canvasSize / 2);
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.fillStyle = 'transparent'; // Không cÃ³ mÃ u ná»n
    context.fillText(text, canvasSize / 2, canvasSize / 2);
    const textTexture = new THREE.CanvasTexture(canvas);
    textTexture.needsUpdate = true;
    const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide 

    });

    const planeGeometry = new THREE.PlaneGeometry(16, 8); 
    hintText = new THREE.Mesh(planeGeometry, textMaterial);
    hintText.position.set(0, 15, 0);
    scene.add(hintText);
}    
   
// ---- CĂC HĂ€M Xá»¬ LĂ Sá»° KIá»†N VĂ€ KHá»I Äá»˜NG ----
createShootingStar();
createHintIcon(); // Gá»i hĂ m táº¡o icon
createHintText();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.target.set(0, 0, 0);
    controls.update();
});
function startCameraAnimation() { 
    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const midPos1 = { x: startPos.x, y: 0, z: startPos.z };
    const midPos2 = { x: startPos.x, y: 0, z: 160 };
    const endPos = { x: -40, y: 100, z: 100 };
    const duration1 = 0.2;
    const duration2 = 0.55; 
    const duration3 = 0.4;
    let progress = 0;
    function animatePath() {
        progress += 0.001010;
        let newPos;
        if (progress < duration1) {
            let t = progress / duration1;
            newPos = {
                x: startPos.x + (midPos1.x - startPos.x) * t,
                y: startPos.y + (midPos1.y - startPos.y) * t,
                z: startPos.z + (midPos1.z - startPos.z) * t,
            };
        } else if (progress < duration1 + duration2) {
            let t = (progress - duration1) / duration2;
            newPos = {
                x: midPos1.x + (midPos2.x - midPos1.x) * t,
                y: midPos1.y + (midPos2.y - midPos1.y) * t,
                z: midPos1.z + (midPos2.z - midPos1.z) * t,
            };
        } else if (progress < duration1 + duration2 + duration3) {
            let t = (progress - duration1 - duration2) / duration3;
            let easedT = 0.5 - 0.5 * Math.cos(Math.PI * t); // Ease-in-out
            newPos = {
                x: midPos2.x + (endPos.x - midPos2.x) * easedT,
                y: midPos2.y + (endPos.y - midPos2.y) * easedT,
                z: midPos2.z + (endPos.z - midPos2.z) * easedT,
            };
        } else {
            camera.position.set(endPos.x, endPos.y, endPos.z);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();
            controls.enabled = true;
            return;
        }


        camera.position.set(newPos.x, newPos.y, newPos.z);
        camera.lookAt(0, 0, 0);
        requestAnimationFrame(animatePath);
    }
    controls.enabled = false;
    animatePath();
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let introStarted = false;

// Giá»›i háº¡n sá»‘ lÆ°á»£ng sao hiá»ƒn thá»‹ ban Ä‘áº§u
const originalStarCount = starGeometry.getAttribute('position').count;
if (starField && starField.geometry) {
    starField.geometry.setDrawRange(0, Math.floor(originalStarCount * 0.1));
}

function requestFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}
function onCanvasClick(event) {
    if (introStarted) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(planet);
   
         
    // === THÊM ẢNH TRONG SUỐT ===
 
    if (intersects.length > 0) {

        // requestFullScreen();
        introStarted = true;
        fadeInProgress = true;
        document.body.classList.add('intro-started');
        startCameraAnimation();

        // --- LOGIC Sá»¬A Lá»–I AUTOPLAY ---
        if (window.musicManager) {
            // Cá»‘ gáº¯ng phĂ¡t nháº¡c ngay láº­p tá»©c
            window.musicManager.play().catch(error => {
                // Náº¿u trĂ¬nh duyá»‡t cháº·n (lá»—i NotAllowedError), khĂ´ng cáº§n lĂ m gĂ¬ á»Ÿ Ä‘Ă¢y.
                // NĂºt togglePlayback sáº½ xá»­ lĂ½ viá»‡c nĂ y sau.
                console.warn("Autoplay bá»‹ cháº·n, ngÆ°á»i dĂ¹ng cáº§n tÆ°Æ¡ng tĂ¡c vá»›i nĂºt Ă¢m thanh.", error);
                
                // Quan trá»ng: ÄĂ¡nh dáº¥u ráº±ng ngÆ°á»i dĂ¹ng Ä‘Ă£ cĂ³ Ă½ Ä‘á»‹nh báº­t nháº¡c.
                // Äiá»u nĂ y giĂºp nĂºt toggle hoáº¡t Ä‘á»™ng Ä‘Ăºng ngay láº§n nháº¥n Ä‘áº§u tiĂªn.
                if (window.musicManager.audio) {
                    // ChĂºng ta khĂ´ng thá»±c sá»± táº¯t, chá»‰ cáº­p nháº­t UI Ä‘á»ƒ nĂ³ trĂ´ng nhÆ° bá»‹ táº¯t
                    // vĂ  chá» ngÆ°á»i dĂ¹ng nháº¥n nĂºt.
                    window.musicManager.audio.muted = true; // Táº¡m thá»i táº¯t tiáº¿ng
                    window.musicManager.updateUI();      // Cáº­p nháº­t icon
                }
            });
        } else {
            console.error("musicManager chÆ°a Ä‘Æ°á»£c khá»Ÿi táº¡o!");
        }
        // --- Káº¾T THĂC LOGIC Sá»¬A Lá»–I ---

        if (starField && starField.geometry) {
            starField.geometry.setDrawRange(0, originalStarCount);
        }
    } else if (introStarted) {
        const heartIntersects = raycaster.intersectObjects(heartPointClouds);
        if (heartIntersects.length > 0) {
            const targetObject = heartIntersects[0].object;
            controls.target.copy(targetObject.position);
        }
    }
}

renderer.domElement.addEventListener('click', onCanvasClick);

animate();

planet.name = 'main-planet';
centralGlow.name = 'main-glow';

// ---- CĂC THIáº¾T Láº¬P CHO GIAO DIá»†N VĂ€ MOBILE ----
function setFullScreen() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    const container = document.getElementById('container');
    if (container) {
        container.style.height = `${window.innerHeight}px`;
    }
}

window.addEventListener('resize', setFullScreen);
window.addEventListener('orientationchange', () => {
    setTimeout(setFullScreen, 300);
});
setFullScreen();

const preventDefault = event => event.preventDefault();
document.addEventListener('touchmove', preventDefault, { passive: false });
document.addEventListener('gesturestart', preventDefault, { passive: false });

const container = document.getElementById('container');
if (container) {
    container.addEventListener('touchmove', preventDefault, { passive: false });
}


// =======================================================================
// ---- KIá»‚M TRA HÆ¯á»NG MĂ€N HĂŒNH Äá»‚ HIá»‚N THá» Cáº¢NH BĂO ----
// =======================================================================

function checkOrientation() {
    // Kiá»ƒm tra náº¿u chiá»u cao lá»›n hÆ¡n chiá»u rá»™ng (mĂ n hĂ¬nh dá»c trĂªn Ä‘iá»‡n thoáº¡i)
    // ThĂªm má»™t Ä‘iá»u kiá»‡n nhá» Ä‘á»ƒ khĂ´ng kĂ­ch hoáº¡t trĂªn mĂ n hĂ¬nh desktop háº¹p.
    const isMobilePortrait = window.innerHeight > window.innerWidth && 'ontouchstart' in window;

    if (isMobilePortrait) {
        document.body.classList.add('portrait-mode');
    } else {
        document.body.classList.remove('portrait-mode');
    }
}

// Láº¯ng nghe cĂ¡c sá»± kiá»‡n Ä‘á»ƒ kiá»ƒm tra láº¡i hÆ°á»›ng mĂ n hĂ¬nh
window.addEventListener('DOMContentLoaded', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {
    // ThĂªm Ä‘á»™ trá»… Ä‘á»ƒ trĂ¬nh duyá»‡t cáº­p nháº­t kĂ­ch thÆ°á»›c chĂ­nh xĂ¡c
    setTimeout(checkOrientation, 200); 
});