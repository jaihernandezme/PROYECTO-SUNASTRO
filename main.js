import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import {names} from './Utils/FinalData.js';

const infoBox = document.getElementById('info-box');

//let camera, controls, scene, renderer;
let camera, controls, scene, renderer, raycaster, mouse, INTERSECTED;
let contador = 5;

function init() {
    
    // Se crea la escena y se definen algunas propiedades
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000);

    //Se crea el renderer 
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );

    //Se crea la cámara
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 200, - 400 );

    // Se definen los cotroles
    controls = new MapControls( camera, renderer.domElement );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    //Características de los controles
    controls.minDistance = 0.05;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;

    const gui = new GUI();
    gui.add( controls, 'zoomToCursor' );
    gui.add( controls, 'screenSpacePanning' );

    //Se crea el slider y la funcion que detecta cuando se actualiza
    const telescopeFolder = gui.addFolder("Telescope Instruments")
    const Slider = telescopeFolder.add({HWO_Diameter:contador}, "HWO_Diameter", 5, 15, 0.01)
    
    Slider.onChange(function(){
        
        contador = Slider.getValue();
        //Cada que se actualiza se recarga la mesh
        updateMesh();

    })

    // lights
    const dirLight1 = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288, 3 );
    dirLight2.position.set( -1, -1, -1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x555555 );
    scene.add( ambientLight );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    updateMesh();


}

function onMouseMove(event) {
    // Update the mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with the current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get the list of objects the ray intersects
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        if (INTERSECTED !== intersects[0].object) {
            INTERSECTED = intersects[0].object;

            // Display the name in the infoBox
            const objectData = INTERSECTED

            infoBox.innerHTML = `Name: ${objectData.name}, Radio of planet:${objectData.h}, Star radius:${objectData.b}`;
            infoBox.style.display = 'block';
            infoBox.style.left = `${event.clientX + 10}px`; // Adjust tooltip position
            infoBox.style.top = `${event.clientY + 10}px`;
        }
    } else {
        INTERSECTED = null;
        infoBox.style.display = 'none'; // Hide info box when not hovering over an object
    }
}

function updateMesh(){

    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    // Se define la geometría de cada punto a graficar
    const geometry = new THREE.SphereGeometry(0.1);
    
    for ( let i = 0; i < names.length; i ++ ) {
        const material = new THREE.MeshBasicMaterial( { color: parseInt(names[i].color)} );
        const mesh = new THREE.Mesh( geometry, material );
        
        //Notar que la posición de cada esfera viene dada por nuestro conjunto de datos
        mesh.name = names[i].name
        mesh.h = names[i].h
        mesh.b= names[i].b
        mesh.position.x = names[i].x;
        mesh.position.y = names[i].y;
        mesh.position.z = names[i].z;
        mesh.scale.x = 20;
        mesh.scale.y = 20
        mesh.scale.z = 20;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        if (contador>=names[i].w){
            scene.add( mesh ); 
        };
    }
    const geoearth = new THREE.SphereGeometry( 1, 32, 16 ); 
    const materialearth = new THREE.MeshBasicMaterial( { color: 0x239103 } ); 
    const spherearth = new THREE.Mesh( geoearth, materialearth ); scene.add( spherearth );
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {

    renderer.render( scene, camera );

}

init();