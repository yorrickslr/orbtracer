#version 300 es

uniform highp vec2 Dimensions;
uniform highp float Ratio;
uniform highp float SinAnim;

out highp vec4 outColor;

// we are looking along the -z axis by GL default
// model of unit cube seen from top (along -y axis)
//
//              view plane
//                  |
//         origin   |
//     ______|______v
//    |      |    / |       coordinate system:
//    |      v  /   |           <-----
//    |      ./     |           z     |
//    |       \     |                 |
//    |         \   |               x v
//    |___________\_|
//            <---->
//         focal length

// we are using height as ground truth for fov
// hence, sourceRay.x is multiplied by Ratio
//         ______________________
//        |    :            :    | <-- y=1
//        |    :            :    |
//        |    :            :    |
//        |    :      .     :    | <-- y=0
//        |    :            :    |
//        |    :            :    |
//        |____:____________:____| <-- y=-1
//
//        ^    ^      ^     ^    ^
//        |    |      |     |    |
//        |  x=-1    x=0   x=1   |
//        |                      |
//     x=-ratio               x=ratio

struct Ray {
  highp vec3 pos;
  highp vec3 dir;
};

struct Sphere {
  highp vec3 pos;
  highp float r;
};

// https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
bool intersect(in Sphere s, in Ray r, out highp vec3 intersection) {
  highp vec3 L = s.pos - r.pos;
  highp float tca = dot(L, r.dir);
  if(tca < 0.0) return false;
  highp float d2 = dot(L, L) - tca * tca;
  highp float radius2 = s.r * s.r;
  if(d2 > radius2) return false;
  highp float thc = sqrt(radius2 - d2);
  intersection = r.pos + (tca - thc) * r.dir;
  return true;
}


void main(void) {
  highp float focalLength = 1.0;
  // highp vec3 origin = vec3(0.0, 0.0, 0.0);

  // init direction to view plane in world space coordinates
  highp vec3 direction = vec3(0.0, 0.0, -focalLength);
  direction.y = (gl_FragCoord.y / Dimensions.y) * 2.0 - 1.0;
  direction.x = (gl_FragCoord.x / Dimensions.x) * 2.0 - 1.0;
  direction.x *= Ratio;
  
  // bring direction to unit length (1.0)
  direction = normalize(direction);

  Ray eyeRay = Ray(vec3(0.0, 0.0, 0.0), direction);
  Sphere outerSphere = Sphere(vec3(0.0, (SinAnim * sin(SinAnim)) * 0.05, -3.0), 1.0);
  highp vec3 intersection;

  if(intersect(outerSphere, eyeRay, intersection)) {
    lowp vec3 color = vec3(SinAnim * 0.7, 0.2, 0.1);
    highp vec3 light_pos = vec3(SinAnim, -SinAnim * 3.0, -1.0);
    highp vec3 normal = normalize(intersection - outerSphere.pos);
    highp vec3 light_angle = normalize(light_pos - intersection);
    lowp float brightness = dot(light_angle, normal);

    outColor = vec4(color * brightness, 1.0);
  } else {
    outColor = vec4(0.0, 0.0, cos(SinAnim) * 0.1, 1.0);
  }
}
