import React from 'react';
import * as THREE from 'three';
import TWEEN from 'tween.js';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import TBControls from 'three-trackballcontrols';
import { EffectComposer, RenderPass, MaskPass, ClearMaskPass } from "postprocessing";

import DAT from '../lib/dat.globe';
import '../lib/effects';

// var sampleData = require('../lib/bunk.json');
import sampleData from '../lib/bunk.json';

// eslint-disable-next-line import/no-webpack-loader-syntax
import basic from 'raw!../shaders/basic.vert';
// eslint-disable-next-line import/no-webpack-loader-syntax
import earth from 'raw!../shaders/earth.frag';

import earthTexture from './../../assets/textures/earth_texture_2048.jpg';
import cloudsTexture from './../../assets/textures/clouds_texture_2048.jpg';
import earthBumps from './../../assets/textures/earth_bumps_2048.jpg';

// ********************************************************************************

const { innerWidth: width, innerHeight: height } = window;

let camera, scene, renderer;

let controls,
    blurScene,
    blurMaskScene,
    blurComposer,
    sceneComposer;

let globe;
let boid, birds;

let startTime = new Date().getTime();

const EARTH_RADIUS = 50;

let a = {
  lat: 40.014984,
  long: -105.270546
};

let b = {
  lat: 27.700769,
  long: 85.300140
};

function toWorld(lat, lng, radius) {
  var phi = (90 - lat) * Math.PI / 180;
  var theta = (180 - lng) * Math.PI / 180;

  let x = -1 * radius * Math.sin(phi) * Math.cos(theta);
  let y = radius * Math.cos(phi);
  let z = -1 * radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function map( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// var phiFrom = (a.lat) * Math.PI / 180;
// var thetaFrom = (a.long) * Math.PI / 180;
// var radius = 50;
// var xF = radius * Math.cos(phiFrom) * Math.sin(thetaFrom);
// var yF = radius * Math.sin(phiFrom);
// var zF = radius * Math.cos(phiFrom) * Math.cos(thetaFrom);
// var vF = new THREE.Vector3(xF, yF, zF);

let vF = toWorld(a.lat, a.long, EARTH_RADIUS);
let vT = toWorld(b.lat, b.long, EARTH_RADIUS);
var dist = vF.distanceTo(vT);

var cvT = vT.clone();
var cvF = vF.clone();

var xC = (0.5 * (vF.x + vT.x));
var yC = (0.5 * (vF.y + vT.y));
var zC = (0.5 * (vF.z + vT.z));

var mid = new THREE.Vector3(xC, yC, zC);

var smoothDist = map(dist, 0, 10, 0, 15/dist );
 
mid.setLength( EARTH_RADIUS * smoothDist );
 
cvT.add(mid);
cvF.add(mid);
 
cvT.setLength(EARTH_RADIUS * smoothDist);
cvF.setLength(EARTH_RADIUS * smoothDist);

var sphereG = new THREE.SphereGeometry(1, 32, 32);
var sphereM = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, shading: THREE.FlatShading});
var pMesh = new THREE.Mesh(sphereG, sphereM);
pMesh.position.set(vF.x, vF.y, vF.z);
console.log(pMesh.position);

// ********************************************************************************

class Globe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0.0
    };
  }

  componentDidMount = () => {
    this.setupCamera();
    this.setupRenderer();
    this.initControls();
    this.loadAndCreate();
    this.setupLights();
    this.bindEventListeners();
    this.renderMeshLine();
  }

  renderMeshLine = () => {
    var geometry = new THREE.Geometry();
    for (var j = 0; j < Math.PI * 2; j += 2 * Math.PI / 100) {
      var v = new THREE.Vector3(Math.cos(j), Math.sin(j), 0);
      geometry.vertices.push(v);
      // console.log(v);
    }


    var line = new MeshLine();
    line.setGeometry(geometry);

    // line.setGeometry(geometry, (p) => 4 * 2); // makes width 2 * lineWidth
    line.setGeometry(geometry, (p => 1 - p)); // makes width taper
    // line.setGeometry( geometry, function( p ) { return 2 + Math.sin( 50 * p ); } ); // makes width sinusoidal

    var material = new MeshLineMaterial();
    var mesh = new THREE.Mesh(line.geometry, material); // this syntax could definitely be improved!
    mesh.scale.multiplyScalar(60);
    scene.add(mesh);
  }

  setupCamera = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, width / height, 1, 2000);
    camera.position.z = 350;
  }

  setupRenderer = () => {
    renderer = new THREE.WebGLRenderer({ alpha: false, logarithmicDepthBuffer: true, antialias: true });
    renderer.setClearColor(0x1E1E1E, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.autoClear = true;
    this.refs.container.appendChild(renderer.domElement);
  }

  initControls = () => {
    controls = new TBControls(camera, renderer.domElement);
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1;
    controls.panSpeed = 1;
    controls.dampingFactor = 0.3;
    controls.minDistance = 300;
    controls.maxDistance = 500;
  }

  loadAndCreate = () => {
    let loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(cloudsTexture, (cloudsTexture) => {
      loader.load(earthTexture, (globeTexture) => {
        loader.load(earthBumps, (bumpTexture) => {
          const assets = { globeTexture, cloudsTexture, bumpTexture };
          this.createEarth(assets);
          this.animate();
        });
      });
    });
  }

  createEarth = (params) => {
    const { globeTexture, cloudsTexture, bumpTexture } = params;

    // This defines how the texture is wrapped horizontally and corresponds to U in UV mapping
    globeTexture.wrapS = globeTexture.wrapT = THREE.RepeatWrapping;
    cloudsTexture.wrapS = cloudsTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;

    let geometry = new THREE.SphereGeometry(EARTH_RADIUS, EARTH_RADIUS, EARTH_RADIUS);
    let material = new THREE.ShaderMaterial({
      uniforms: {
        tEarth:  { value: globeTexture },
        tClouds: { value: cloudsTexture },
        bumpMap: { value: bumpTexture },
        bumpScale: { value: 2.0 },
        fTime:   { value: 0.0 }
      },
      vertexShader: basic,
      fragmentShader: earth
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    scene.add(pMesh);
  }

  setupLights = () => {
    // scene.add(new THREE.AmbientLight(0xFFFFFF));

    // let light = new THREE.PointLight(0xFFFFFF, 1, 10000);
    // light.position.set(80, 80, 400);
    // scene.add(light);
  }

  rotateEarth = () => {
    let ticks = new Date().getTime() - startTime;
    globe.material.uniforms.fTime.value = ticks / 700000.0;
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    controls.update();

    this.rotateEarth();
    renderer.render(scene, camera);
  }

  render = () => {
    return <div ref='container' />
  }

  componentWillUnmount = () => {
    this.controls.dispose();
    delete this.controls;
  }

  bindEventListeners = () => {
    window.addEventListener('resize', () => {
      const { innerWidth: width, innerHeight: height } = window;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

};

export default Globe;
