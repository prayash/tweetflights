uniform sampler2D tEarth;
uniform sampler2D tClouds;
uniform float fTime;

varying vec2 vUv;
varying vec3 v_Normal;
varying vec3 v_Position;

void main() {

  // Access texture data from provided, and add offset according to fTime,
  // which is a uniform we pass from the main application
  vec4 earth = texture2D(tEarth, vec2(vUv.x + fTime * 0.5, vUv.y));
  vec4 clouds = texture2D(tClouds, vec2(vUv.x + fTime, vUv.y));

  // Blend the two textures
  vec4 diffuse = earth + clouds;

  // Manually add a light at the corresponding position vector
  vec3 v_LightPos = vec3(-200.0, 200.0, -50.0);
  vec3 light_vec = normalize(v_LightPos - v_Position);

  // Compute lighting using dot product of vertex normal and light vector
  float lightStrength = max(dot(v_Normal, light_vec), 0.3);

  // Final output is the blended texture map multiplied by light strength
  gl_FragColor = diffuse * lightStrength;
}
