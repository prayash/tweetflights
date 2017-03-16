varying vec2 vUv;
varying vec3 v_Normal;
varying vec3 v_Position;

uniform sampler2D bumpTexture;
uniform float bumpScale;

void main() {
  vUv = uv;

  vec4 bumpData = texture2D(bumpTexture, vUv);

  // float displacement = 1.0 * bumpData.r;
  vec3 newPosition = position + normal * 1.0;
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  v_Normal = normalize(normalMatrix * normal);
  v_Position = vec3(mvPosition.xyz);
}
