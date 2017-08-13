uniform sampler2D tDiffuse;
uniform sampler2D tOverlay;

varying vec2 vUv;

void main() {
  vec4 regularScene = texture2D( tDiffuse, vUv );
  vec4 overlay = texture2D( tOverlay, vUv );

  float blurOpacity = 0.5;

  overlay.a *= blurOpacity;
  gl_FragColor = vec4(regularScene.rgb * (1.0 - overlay.a) +  overlay.rgb * overlay.a, 1.0);
}
