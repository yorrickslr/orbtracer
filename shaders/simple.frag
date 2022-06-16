#version 300 es

uniform highp vec2 Dimensions;

out highp vec4 outColor;

void main(void) {
  outColor = vec4(gl_FragCoord.xy / Dimensions, 0.0, 1.0);
}
