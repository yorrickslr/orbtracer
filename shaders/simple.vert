#version 300 es

in highp vec2 inPosition;



void main(void) {
  // we are providing the viewing plane
  // coordinates to the fragment shader
  float focalLength = 1.0;
  gl_Position = vec4(inPosition, 0.0, 1.0);
}
