var osc1,osc2,osc3;
var start_t = 0;
var w = 0.005; // scale facter to map sound frequency to real time (slowing it down)
var fx;
var fy;
var fz;
var last_t;
var last_x;
var last_y;
var last_z;

function preload() {
}

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  colorMode(HSB);

  last_t = 0;
  last_x = 0;
  last_y = 0;
  last_z = 0;
  fx = 436;
  fy = 545;
  fz = 654;
  osc1 = new p5.Oscillator();
  osc2 = new p5.Oscillator();
  osc3 = new p5.Oscillator();
  osc1.amp(0.3);
  osc2.amp(0.3);
  osc3.amp(0.3);
  osc1.freq(fx);
  osc2.freq(fy);
  osc3.freq(fz);
}

function draw() {
  var now = Date.now();

  var delta_t = (now-start_t)/1000.0; // seconds since we began drawing this curve

  if( delta_t > 600 ) { // when starting off (start_t==0) or after a long time (10 minutes)
    background(0);
    start_t = now;
    last_t = 0;
    delta_t = 0;
    last_x = -1;
  }

  var xamp = width/2;
  var xoff = width/2;
  var yamp = height/2;
  var yoff = height/2;

  noFill();
  strokeWeight(4);

  var tstep = 0.01;
  if( (delta_t-last_t)/tstep > 50 ) {
    // just in case we can't keep up with real time, limit number of steps, to avoid long hangs
    delta_t = last_t+tstep*50;
  }
  for(var t=last_t+tstep; t<delta_t; t+=tstep) {
    var x = Math.sin(fx*w*t)*xamp + xoff;
    var y = Math.sin(fy*w*t)*yamp + yoff;
    var z = Math.sin(fz*w*t)*360/2 + 360/2;

    stroke(z,60,60);
    if( last_x > 0 ) {
      line(last_x,last_y,x,y);
    }

    last_x = x;
    last_y = y;
    last_z = z;
    last_t = t;
  }
}

// ============
// Window Resize
// ============
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  start_t=0;
}

// ============
// toggle input
// ============

// in p5, keyPressed is not case sensitive, but keyTyped is
function keyPressed() {
}

function mouseClicked() {
}

function mouseMoved() {
}
