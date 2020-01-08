#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;

uniform vec2 texOffset;
varying vec4 vertColor;
varying vec4 vertTexCoord;

vec3 powv(vec3 v, float f) {
  return vec3(pow(v.x, f), pow(v.y, f), pow(v.z, f));
}

void main() {
  vec4 texColor = texture2D(texture, vertTexCoord.st).rgba;
  gl_FragColor = vec4(powv(texColor.rgb,0.5),1.0);
}