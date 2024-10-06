import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import {names} from "./Utils/FinalData.js"

let camera, controls, scene, renderer;
let contador = 0;

function init() {
    
    // Se crea la escena y se definen algunas propiedades
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000);
    scene.fog = new THREE.Fog( 0xFF0000, -1000);

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
    controls.minDistance = 0.0005;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    const gui = new GUI();
    gui.add( controls, 'zoomToCursor' );
    gui.add( controls, 'screenSpacePanning' );

    //Se crea el slider y la funcion que detecta cuando se actualiza
    const telescopeFolder = gui.addFolder("Telescope Instruments")
    const Slider = telescopeFolder.add({Value:contador}, "Value", 0, 10, 0.01)
    
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

    window.addEventListener( 'resize', onWindowResize );

    updateMesh();

}


function updateMesh(){


    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    // Se define la geometría de cada punto a graficar
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshPhongMaterial( { color: 0xFF0000, flatShading: false } );
    
    for ( let i = 0; i < names.length; i ++ ) {
        
        const mesh = new THREE.Mesh( geometry, material );
        
        //Notar que la posición de cada esfera viene dada por nuestro conjunto de datos
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




			

			
