varying vec2 vUv;
varying vec3 v_Normal;
varying vec3 v_Position;

void main() {
  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  v_Normal = normalize(normalMatrix * normal);
  v_Position = vec3(mvPosition.xyz);
}
