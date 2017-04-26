// Globe: Vertex Shader
// Author(s): Tamim Shaban & Prayash Thapa

varying vec2 vUv;
varying vec3 v_Normal;
varying vec3 v_Position;

uniform sampler2D bumpTexture;
uniform float bumpScale;

void main() {
  // We pass the uv to varying so our .frag can access it
  vUv = uv;

  // Import bumpmap data from texture
  vec4 bumpData = texture2D(bumpTexture, vUv);

  // Fail displacement
  // float displacement = 5.0 * bumpData.r;

  // We can mutiply this position by displacement to create bumps
  vec3 newPosition = position + normal * 1.0;

  // The output uses uniforms provided by three.js to make projection easier
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Again, these are variables passed to the frag so it can compute lighting
  v_Normal = normalize(normalMatrix * normal);
  v_Position = vec3(mvPosition.xyz);
}
