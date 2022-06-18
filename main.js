// meta vars
let gl;
let canvas;
let frame;

// shaders and programs
let vertShader;
let fragShader;
let shader;

// resources
let screenQuadGeometry;
let screenQuadBuffer;

// initShaders and initGeometry are asynchronous functions;
// however, the subsequent lines depend on these functions;
// therefore we AWAIT these functions and have to declare
// the init() function as ASYNC, too
async function init() {
  // init DOM elements and WebGL
  canvas = document.querySelector("canvas");
  // gl = canvas.getContext("webgl"); // for WebGL1
  gl = canvas.getContext("webgl2"); // for WebGL2
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  await initShaders();
  initGeometry();

  // initial resize of canvas and viewport
  resizeCallback();

  // initiate the browser-controlled rendering loop
  start();
}

// loadShader returns a PROMISE whose result we have to AWAIT
// in order to compile the shader; therefore the function is
// declared as ASYNC
async function initShaders() {
  vertShader = await loadShader("shaders/simple.vert");
  fragShader = await loadShader("shaders/simple.frag");

  shader = gl.createProgram();
  gl.attachShader(shader, vertShader);
  gl.attachShader(shader, fragShader);
  gl.linkProgram(shader);

  if(!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
    console.error("could not link shader");
  }
}

// loadObj returns a PROMISE whose result we have to AWAIT
// in order to upload the geometry; therefore the function is
// declared as ASYNC
function initGeometry() {
  gl.useProgram(shader);

  screenQuadGeometry = new Float32Array([
    -1.0, -1.0,
    -1.0, 1.0,
    1.0, -1.0,

    1.0, 1.0,
    1.0, -1.0,
    -1.0, 1.0,
  ]);

  // upload screen quad geometry to array buffer
  screenQuadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, screenQuadGeometry, gl.STATIC_DRAW);
}

// main rendering function that is looped by browser
function draw() {
  frame = window.requestAnimationFrame(draw);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.useProgram(shader);

  // bind screen quad buffer to array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadBuffer);
  // define the vertex layout for the position attachment
  let positionLocation = gl.getAttribLocation(shader, "inPosition");
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * 2, 0);
  gl.enableVertexAttribArray(positionLocation);

  let sinAnim = Math.sin(Date.now() / 1000);
  let sinAnimLoc = gl.getUniformLocation(shader, "SinAnim");
  gl.uniform1f(sinAnimLoc, sinAnim);

  gl.drawArrays(gl.TRIANGLES, 0, screenQuadGeometry.length / 2);
};

// request browser-controlled rendering loop for draw()
function start() {
  frame = window.requestAnimationFrame(draw);
}

// this function cancels the browser-controlled rendering loop
// and can be useful for debugging; is not needed for deploy
function stop() {
  window.cancelAnimationFrame(frame);
}

// handles the adjustment of the canvas resolution
function resizeCallback() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  let dimensionsLoc = gl.getUniformLocation(shader, "Dimensions");
  gl.uniform2f(dimensionsLoc, canvas.width, canvas.height);
  let ratioLoc = gl.getUniformLocation(shader, "Ratio");
  gl.uniform1f(ratioLoc, (canvas.width / canvas.height));
}

// register init() for execution when the content of the HTML file is ready
document.addEventListener("DOMContentLoaded", init);

//register the resizeCallback() for when the browser window is resized
window.addEventListener("resize", resizeCallback);

// get rid of the WebGL context when tab is closed or reloaded
window.addEventListener("beforeunload", event => {
  gl.getExtension('WEBGL_lose_context').loseContext();
});
