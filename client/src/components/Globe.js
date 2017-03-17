import * as THREE from 'three';
import React from 'react';
import TBControls from 'three-trackballcontrols';
import { EffectComposer, RenderPass, MaskPass, ClearMaskPass } from "postprocessing";

// import effects from '../effects';

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
  }

  setupCamera = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, width / height, 1, 2000);
    camera.position.z = 350;
  }

  setupRenderer = () => {
    renderer = new THREE.WebGLRenderer({
      alpha: false,
      logarithmicDepthBuffer: true,
      antialias: true
    });
    renderer.setClearColor(0x222222, 0.55);
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
    // let light = new THREE.PointLight(0xff0000, 1, 10000);
    // light.position.set(80, 80, 400);
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    controls.update();
    let ticks = new Date().getTime() - startTime;
    globe.material.uniforms.fTime.value = ticks / 70000.0;

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
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

};

export default Globe;
