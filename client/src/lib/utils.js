import * as THREE from 'three';

export const toWorld = (lat, lng, radius) => {
  var phi = (90 - lat) * Math.PI / 180;
  var theta = (180 - lng) * Math.PI / 180;

  let x = -1 * radius * Math.sin(phi) * Math.cos(theta);
  let y = radius * Math.cos(phi);
  let z = -1 * radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

export const map = (x, in_min, in_max, out_min, out_max) => {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}