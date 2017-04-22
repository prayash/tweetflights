import React from 'react';
import * as THREE from 'three';
import TWEEN from 'tween.js';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import TBControls from 'three-trackballcontrols';
import { EffectComposer, RenderPass, MaskPass, ClearMaskPass } from "postprocessing";

import DAT from '../lib/dat.globe';
import '../lib/effects';

var data = require('../lib/bunk.json');

// eslint-disable-next-line import/no-webpack-loader-syntax
import basic from 'raw!../shaders/basic.vert';
// eslint-disable-next-line import/no-webpack-loader-syntax
import earth from 'raw!../shaders/earth.frag';

import earthTexture from './../../assets/textures/earth_texture_2048.jpg';
import cloudsTexture from './../../assets/textures/clouds_texture_2048.jpg';
import earthBumps from './../../assets/textures/earth_bumps_2048.jpg';

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

    var years = ['1990','1995','2000'];
    // var container = document.getElementById('container');
    var globe = new DAT.Globe(this.refs.container);
    var tweens = [];

    // var settime = function(globe, t) {
    //   return function() {
        let globeTween = new TWEEN.Tween(globe)
          .to({time: 2/years.length}, 500)
          .easing(TWEEN.Easing.Cubic.EaseOut)
          .start();
    //     var y = document.getElementById('year'+years[t]);
    //     if (y.getAttribute('class') === 'year active') {
    //       return;
    //     }
    //     var yy = document.getElementsByClassName('year');
    //     for(i=0; i<yy.length; i++) {
    //       yy[i].setAttribute('class','year');
    //     }
    //     y.setAttribute('class', 'year active');
    //   };
    // };

    // for(var i = 0; i<years.length; i++) {
    //   var y = document.getElementById('year'+years[i]);
    //   y.addEventListener('mouseover', settime(globe,i), false);
    // }

    // var data = JSON.parse(responseText);
    // window.data = data;
    for (var i = 0; i < data.length ; i++) {
      globe.addData(data[i][1], { format: 'magnitude', name: data[i][0], animated: true });
    }

    globe.createPoints();
    // settime(globe,0)();
    globe.animate();
  }

  renderMeshLine = () => {
    var geometry = new THREE.Geometry();
    for (var j = 0; j < Math.PI; j += 2 * Math.PI / 100) {
      var v = new THREE.Vector3(Math.cos(j), Math.sin(j), 0);
      geometry.vertices.push(v);
    }

    var line = new MeshLine();
    line.setGeometry(geometry);

    // line.setGeometry(geometry, (p) => 4 * 2); // makes width 2 * lineWidth
    line.setGeometry( geometry, function( p ) { return 1 - p; } ); // makes width taper
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

    let geometry = new THREE.SphereGeometry(50, 50, 50);
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

  rotateEarth = () => {
    let ticks = new Date().getTime() - startTime;
    globe.material.uniforms.fTime.value = ticks / 70000.0;
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
