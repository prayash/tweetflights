import React from 'react';
import * as THREE from 'three';
import TWEEN from 'tween.js';
import io from 'socket.io-client';
import TBControls from 'three-trackballcontrols';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { EffectComposer, RenderPass, MaskPass, ClearMaskPass } from "postprocessing";

import { effects } from '../lib/effects';
import { toWorld, map } from '../lib/utils';

/* eslint-disable */
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

let socket,
    controls,
    blurScene,
    blurMaskScene,
    blurComposer,
    sceneComposer;

let globe;
let boid, birds;

let startTime = new Date().getTime();

const EARTH_RADIUS = 50;
const BLUE = '#1DA1F2';
const RED = '#F21646'

let testData = {
  "text": "Hey @MarcosFlores85 we will be over to see you play borneo fc on the 14th of may",
  'from': {
    'lat': '40.014984',
    'lon': '-105.270546'
  },
  'to': {
    'lat': '27.700769',
    'lon': '85.300140'
  },
  'sentiment': 'pos'
};

// let testData = [{
//   "text": "@ChrisKirouac @RT_com B.S. American Airlines lost my luggage in Buffalo.", 
//   "fromLocation": "Opportunity, WA",
//   "toLocation": "Ontario, Canada"
// }, {
//   "text": "Hey @MarcosFlores85 we will be over to see you play borneo fc on the 14th of may",
//   "fromLocation": "Newcastle, New South Wales",
//   "toLocation": "Rosario, Argentina"
// }];

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
    this.setupSocket();
    // this.drawPathOfTweet(testData);
  }

  setupSocket = () => {
    console.log("Connecting to the node-kafka server...");
    socket = io.connect('ws://ec2-13-58-74-255.us-east-2.compute.amazonaws.com:1337');

    socket.on('tweet', (t) => {
      this.drawPathOfTweet(t);

      setTimeout(() => {
        socket.emit('ack');
    }, 2000);
    });
  }

  drawPathOfTweet = (tweet) => {
    console.log(tweet);
    const { from, to, sentiment } = tweet;

    let vF = toWorld(from.lat, from.lon, EARTH_RADIUS);
    let vT = toWorld(to.lat, to.lon, EARTH_RADIUS);
    var dist = vF.distanceTo(vT);

    var cvT = vT.clone();
    var cvF = vF.clone();

    var xC = (0.5 * (vF.x + vT.x));
    var yC = (0.5 * (vF.y + vT.y));
    var zC = (0.5 * (vF.z + vT.z));

    var mid = new THREE.Vector3(xC, yC, zC);

    var smoothDist = map(dist, 0, 10, 0, 15 / dist);
    
    mid.setLength(EARTH_RADIUS * smoothDist);
    
    cvT.add(mid);
    cvF.add(mid);
    
    cvT.setLength(EARTH_RADIUS * smoothDist);
    cvF.setLength(EARTH_RADIUS * smoothDist);

    var curve = new THREE.CubicBezierCurve3(vF, cvF, cvT, vT);
    var geometry2 = new THREE.Geometry();
    geometry2.vertices = curve.getPoints(50);

    var material2 = new THREE.LineBasicMaterial({ color: sentiment == 'pos' ? BLUE : RED, linewidth: 10, opacity: 0.0, transparent: true });

    // Create the final Object3d to add to the scene
    var curveObject = new THREE.Line(geometry2, material2);
    scene.add(curveObject);
    this.animatePath(0, 1, 2000, curveObject);
  }

  animatePath = (start, end, duration, obj) => {
    // console.log("Zooming from:", start, "to", end);
    console.log(obj.material.opacity);
    let o = { opacity: start };
    let oTarget = { opacity: end };
    let tween = new TWEEN.Tween(o)
      .to(oTarget, duration)
      .easing(TWEEN.Easing.Cubic.Out)
      .start()
      .onUpdate(() => {
        obj.material.opacity = o.opacity;
      });
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
    var mesh = new THREE.Mesh(line.geometry, material);
    mesh.scale.multiplyScalar(60);
    // scene.add(mesh);
  }

  setupCamera = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, width / height, 1, 2000);
    camera.position.z = 350;
  }

  setupRenderer = () => {
    renderer = new THREE.WebGLRenderer({ alpha: false, logarithmicDepthBuffer: true, antialias: true });
    renderer.setClearColor(0x1A1A1A, 1.0);
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
  }

  setupLights = () => {
    // scene.add(new THREE.AmbientLight(0xFFFFFF));

    // let light = new THREE.PointLight(0xFFFFFF, 1, 10000);
    // light.position.set(80, 80, 400);
    // scene.add(light);
  }

  rotateCamera = () => {
    camera.position.x += 0.1;
    camera.lookAt(scene.position);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    controls.update();
    TWEEN.update();

    // this.rotateCamera();
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
