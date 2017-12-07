var osc1,osc2,osc3;
var start_t = 0;
var w; // scale facter to map sound frequency to real time (slowing it down)
var tstep;
var fx;
var fy;
var fz;
var fx_name;
var fy_name;
var fz_name;
var fx_index;
var fy_index;
var fz_index;
var last_t;
var last_x;
var last_y;
var last_z;
var fx_up_button;
var fx_down_button;
var fy_up_button;
var fy_down_button;
var fz_up_button;
var fz_down_button;
var fx_label;
var fy_label;
var fz_label;
var scale_selector;
var play_button;
var mute_button;
var mute_timer = null;
var speed_up_button;
var slow_down_button;
var speed_label;
var bouncy_balls = true;
var ratio_label;
var reset_button;

function equal_step(n) {
  return Math.pow(2,n/12.0);
}
// compute C4 as the frequency that gives A4=440 in an equal tempered scale
var C4=440/equal_step(9);

var just_scale = [
  {f: C4,n: "C4"},
  {f: C4*9/8,n: "D4"},
  {f: C4*5/4,n: "E4"},
  {f: C4*4/3,n: "F4"},
  {f: C4*3/2,n: "G4"},
  {f: C4*5/3,n: "A4"},
  {f: C4*15/8,n: "B4"},
  {f: C4*2,n: "C5"},
  {f: C4*2*9/8,n: "D5"},
  {f: C4*2*5/4,n: "E5"},
  {f: C4*2*4/3,n: "F5"},
  {f: C4*2*3/2,n: "G5"},
  {f: C4*2*5/3,n: "A5"},
  {f: C4*2*15/8,n: "B5"},
  {f: C4*2*2,n: "C6"}
];
var equal_scale = [
  {f: C4,n: "C4"},
  {f: C4*equal_step(2),n: "D4"},
  {f: C4*equal_step(4),n: "E4"},
  {f: C4*equal_step(5),n: "F4"},
  {f: C4*equal_step(7),n: "G4"},
  {f: C4*equal_step(9),n: "A4"},
  {f: C4*equal_step(11),n: "B4"},
  {f: C4*equal_step(12),n: "C5"},
  {f: C4*equal_step(12+2),n: "D5"},
  {f: C4*equal_step(12+4),n: "E5"},
  {f: C4*equal_step(12+5),n: "F5"},
  {f: C4*equal_step(12+7),n: "G5"},
  {f: C4*equal_step(12+9),n: "A5"},
  {f: C4*equal_step(12+11),n: "B5"},
  {f: C4*equal_step(12+12),n: "C6"},
];
var well_scale = [
  {f: C4,n: "C4"},
  {f: C4*1.119771437,n: "D4"},
  {f: C4*1.253888072 ,n: "E4"},
  {f: C4*1.334745462,n: "F4"},
  {f: C4*1.496510232,n: "G4"},
  {f: C4*1.675749414,n: "A4"},
  {f: C4*1.878842233,n: "B4"},
  {f: C4*2,n: "C5"},
  {f: C4*2*1.119771437,n: "D5"},
  {f: C4*2*1.253888072 ,n: "E5"},
  {f: C4*2*1.334745462,n: "F5"},
  {f: C4*2*1.496510232,n: "G5"},
  {f: C4*2*1.675749414,n: "A5"},
  {f: C4*2*1.878842233,n: "B5"},
  {f: C4*2*2,n: "C6"}
];
var scale;

function preload() {
}

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);

  fx_up_button = createButton('&#8593;');
  fx_down_button = createButton('&#8595;');
  fx_up_button.mouseClicked(fxUp);
  fx_down_button.mouseClicked(fxDown);

  fy_up_button = createButton('&#8593;');
  fy_down_button = createButton('&#8595;');
  fy_up_button.mouseClicked(fyUp);
  fy_down_button.mouseClicked(fyDown);

  fz_up_button = createButton('&#8593;');
  fz_down_button = createButton('&#8595;');
  fz_up_button.mouseClicked(fzUp);
  fz_down_button.mouseClicked(fzDown);

  fx_label = createDiv();
  fy_label = createDiv();
  fz_label = createDiv();
  fx_label.class("label");
  fy_label.class("label");
  fz_label.class("label");

  scale_selector = createRadio();
  scale_selector.class("label");
  scale_selector.option("Just Scale","just");
  scale_selector.option("Equal Tempered Scale","equal");
  scale_selector.option("Well Tempered Scale","well");
  scale_selector.changed(newPlot);

  play_button = createButton('Play');
  play_button.mouseClicked(soundOn);

  mute_button = createButton('Mute');
  mute_button.mouseClicked(soundOff);
  mute_button.hide();

  speed_up_button = createButton('&#8593;');
  slow_down_button = createButton('&#8595;');
  speed_up_button.mouseClicked(speedUp);
  slow_down_button.mouseClicked(slowDown);
  speed_label = createDiv();
  speed_label.class("label");

  ratio_label = createDiv();
  ratio_label.class("label");

  reset_button = createButton("Reset");
  reset_button.mouseClicked(startOver);

  noStroke();
  colorMode(HSB);

  osc1 = new p5.Oscillator();
  osc2 = new p5.Oscillator();
  osc3 = new p5.Oscillator();
  osc1.amp(0.3);
  osc2.amp(0.3);
  osc3.amp(0.3);

  startOver();
}

function draw() {
  var plot_x0 = 2;
  var plot_x1 = width-200-plot_x0;
  var plot_y0 = 2;
  var plot_y1 = height-100;
  var xamp = (plot_x1-plot_x0)/2;
  var xoff = plot_x0+xamp;
  var yamp = (plot_y1-plot_y0)/2;
  var yoff = plot_y0+yamp;
  var bouncy_r = 4;

  var now = Date.now();
  var delta_t = (now-start_t)/1000.0; // seconds since we began drawing this curve

  if( delta_t > 600 ) { // reset when starting off (start_t==0) or after a long time (10 minutes)
    background(0);
    start_t = now;
    last_t = 0;
    delta_t = 0;
    last_x = -1;
    bouncy_balls = w <= 0.01;

    fx_up_button.position(20,plot_y1+bouncy_r*2+4);
    fx_down_button.position(20,fx_up_button.position().y+fx_up_button.size().height);
    fx_label.position(fx_up_button.position().x+fx_up_button.size().width+4,fx_up_button.position().y);
    fx_label.html("x frequency:<br>" + Math.round(fx) + " Hz (" + fx_name + ")");

    var lpanel_x0 = plot_x1+bouncy_r*2+4;

    fy_up_button.position(lpanel_x0,20);
    fy_down_button.position(lpanel_x0,fy_up_button.position().y+fy_up_button.size().height);
    fy_label.position(fy_up_button.position().x+fy_up_button.size().width+4,fy_up_button.position().y);
    fy_label.html("y frequency:<br>" + Math.round(fy) + " Hz (" + fy_name + ")");

    fz_up_button.position(lpanel_x0,fx_up_button.position().y);
    fz_down_button.position(lpanel_x0,fz_up_button.position().y+fz_up_button.size().height);
    fz_label.position(fz_up_button.position().x+fz_up_button.size().width+4,fz_up_button.position().y);
    fz_label.html("color frequency:<br>" + Math.round(fz) + " Hz (" + fz_name + ")");

    scale_selector.position(lpanel_x0,plot_y0 + (plot_y1-plot_y0)/2);

    play_button.position(lpanel_x0,scale_selector.position().y+scale_selector.size().height+10);
    mute_button.position(lpanel_x0,scale_selector.position().y+scale_selector.size().height+10);
    reset_button.position(lpanel_x0,scale_selector.position().y+scale_selector.size().height+reset_button.size().height*2);

    speed_up_button.position(plot_x0+(plot_x1-plot_x0)/2,fx_up_button.position().y);
    slow_down_button.position(plot_x0+(plot_x1-plot_x0)/2,speed_up_button.position().y+speed_up_button.size().height);
    speed_label.position(speed_up_button.position().x+speed_up_button.size().width+4,speed_up_button.position().y);
    speed_label.html("Drawing speed: " + (w/(2*Math.PI)).toPrecision(2));

    ratio_label.position(lpanel_x0,plot_y0+(plot_y1-plot_y0)/4);
    ratio_label.html("fx/fy: " + (fx/fy).toFixed(3) + "<br>fy/fx: " + (fy/fx).toFixed(3));
  }

  strokeWeight(4);

  if( last_x >= 0 && bouncy_balls ) {
    // erase bouncy balls on the x and y axes
    stroke(0,0,0);
    fill(0,0,0);
    ellipse(last_x,plot_y1+bouncy_r*2,bouncy_r+1);
    ellipse(plot_x1+bouncy_r*2,last_y,bouncy_r+1);
  }
  noFill();

  if( (delta_t-last_t)/tstep > 100 ) {
    // just in case we can't keep up with real time, limit number of steps, to avoid long hangs
    delta_t = last_t+tstep*100;
  }
  for(var t=last_t+tstep; t<delta_t; t+=tstep) {
    var x = Math.sin(fx*w*t)*xamp + xoff;
    var y = Math.sin(fy*w*t)*yamp + yoff;
    var z = Math.sin(fz*w*t)*360/2 + 360/2;

    stroke(z,60,60);
    if( last_x >= 0 ) {
      line(last_x,last_y,x,y);
    }

    last_x = x;
    last_y = y;
    last_z = z;
    last_t = t;
  }
  if( last_x >= 0 && bouncy_balls ) {
    // draw bouncy balls along the x and y axis
    stroke(last_z,60,60);
    ellipse(last_x,plot_y1+bouncy_r*2,bouncy_r);
    ellipse(plot_x1+bouncy_r*2,last_y,bouncy_r);
  }
}

function newPlot() {
  start_t=0;

  var scale_name = scale_selector.value();
  if( scale_name == "well" ) {
    scale = well_scale;
  } else if( scale_name == "equal" ) {
    scale = equal_scale;
  } else {
    scale = just_scale;
  }

  fx = scale[fx_index].f;
  fy = scale[fy_index].f;
  fz = scale[fz_index].f;
  fx_name = scale[fx_index].n;
  fy_name = scale[fy_index].n;
  fz_name = scale[fz_index].n;
  osc1.freq(fx);
  osc2.freq(fy);
  osc3.freq(fz);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  newPlot();
}

function fxUp() {
  if( fx_index+1 >= scale.length ) return;
  fx_index += 1;
  newPlot();
}

function fxDown() {
  if( fx_index <= 0 ) return;
  fx_index -= 1;
  newPlot();
}

function fyUp() {
  if( fy_index+1 >= scale.length ) return;
  fy_index += 1;
  newPlot();
}

function fyDown() {
  if( fy_index <= 0 ) return;
  fy_index -= 1;
  newPlot();
}

function fzUp() {
  if( fz_index+1 >= scale.length ) return;
  fz_index += 1;
  newPlot();
}

function fzDown() {
  if( fz_index <= 0 ) return;
  fz_index -= 1;
  newPlot();
}

function soundOn() {
  osc1.start();
  osc2.start();
  osc3.start();
  play_button.hide();
  mute_button.show();

  if( mute_timer != null ) {
    window.clearTimeout(mute_timer);
  }
  // automatically turn off the sound after 2 minutes to avoid being annoying
  mute_timer = window.setTimeout(soundOff,2*60*1000);
}

function soundOff() {
  osc1.stop();
  osc2.stop();
  osc3.stop();
  play_button.show();
  mute_button.hide();
  if( mute_timer != null ) {
    window.clearTimeout(mute_timer);
    mute_timer = null;
  }
}

function speedUp() {
  if( w > 10 ) return;
  w *= 2;
  tstep /= 2;
  newPlot();
}
function slowDown() {
  if( w < 0.0001 ) return;
  w /= 2;
  tstep *= 2;
  newPlot();
}

function startOver() {
  scale_selector.value("just");
  scale = just_scale;
  fx_index = 4;
  fy_index = 7;
  fz_index = 0;
  w = 0.005;
  tstep = 0.01;
  soundOff();
  newPlot();
}
