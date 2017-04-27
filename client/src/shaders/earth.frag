// Globe: Fragment Shader
// Author(s): Tamim Shaban & Prayash Thapa

uniform sampler2D tEarth;
uniform sampler2D tClouds;
uniform sampler2D tNight;
uniform sampler2D tMask;
uniform float fTime;

varying vec2 vUv;
varying vec3 v_Normal;
varying vec3 v_Position;

const vec3 specColor = vec3(1.0, 1.0, 1.0);

void main() {
 // Access texture data from provided, and add offset according to fTime,
 // which is a uniform we pass from the main application
 vec4 earth = texture2D(tEarth, vec2(vUv.x + fTime * 0.5, vUv.y));
 vec4 clouds = texture2D(tClouds, vec2(vUv.x + fTime, vUv.y));
 vec4 night = texture2D(tNight, vec2(vUv.x + fTime * 0.5, vUv.y));
 vec4 mask = texture2D(tMask, vec2(vUv.x + fTime * 0.5, vUv.y));
 
 // Blend the two textures
 vec4 diffuse = earth;
 // Manually add a light at the corresponding position vector
 vec3 v_LightPos = vec3(-200.0, 200.0, -50.0);
 vec3 light_vec = normalize(v_LightPos - v_Position);
 // Phone shader
 vec3 normal = normalize(v_Normal);
 float lambertian = max(dot(light_vec,normal), 0.0);
 float specular = 0.0;
 if (lambertian > 0.0) {
   vec3 reflectDir = reflect(-1.0 * light_vec, normal);
   vec3 viewDir = normalize(-1.0 * v_Position);
   float specAngle = max(dot(reflectDir, viewDir), 0.0);
   specular = 0.3 * pow(specAngle, 4.0);
 }

 // Compute lighting using dot product of vertex normal and light vector
 float lightStrength = max(dot(v_Normal, light_vec), 0.05);
 diffuse = (lightStrength) * earth + (1.0 - lightStrength)*night;
 // Final output is the blended texture map multiplied by light strength
 gl_FragColor = diffuse + (vec4(1,1,1,1) - mask) * vec4(specular * specColor, 1.0) + vec4(0.1,0.1,0.1,0.1);
 //gl_FragColor = diffuse;
}