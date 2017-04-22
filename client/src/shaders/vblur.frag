uniform sampler2D tDiffuse;
uniform float v;

varying vec2 vUv;

void main() {
  vec4 sum = vec4( 0.0 );

  vec4 originalSample = texture2D( tDiffuse, vUv );

  sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.2307 * v ) ) * 0.0702;
  sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.3846 * v ) ) * 0.3162;
  sum += originalSample * 0.2270270270;
  sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.3846 * v ) ) * 0.3162;
  sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.2307 * v ) ) * 0.0702;

  gl_FragColor = sum;
}
