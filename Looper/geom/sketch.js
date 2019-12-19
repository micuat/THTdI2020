var width = 640//1280;
var height = 480//720;

if (pgTapes == undefined) {
  var pgTapes = [];
  for (let i = 0; i < pApplet.numTapes; i++) {
    pgTapes[i] = { tape: [], count: 0, skipCountdown: 0 };
  }
  var pgOutlets = [];
  var pgInlets = [];
}

var s = function (p) {
  let index = 0;
  let lastT = 0;
  let startT = 0;

  let font;

  let setupDone = false;

  let videoCurrent, videoLast;

  p.setup = function () {
    if (p.fixedPgs == undefined) {
      p.fixedPgs = [];
    }
    startT = p.millis() * 0.001;

    p.createCanvas(width * 2, height * 2)
    p.frameRate(30);
    p.background(0);

    let pgCount = 0;
    let length = 600;
    for (let i = 0; i < pgTapes.length; i++) {
      pgTapes[i].count = 0;
    }
    for (let i = 0; i < pgTapes.length; i++) {
      pgTapes[i].tape = [];
      for (let j = 0; j < length; j++) {
        if(p.fixedPgs[pgCount] == undefined) {
          p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
        }
        pgTapes[i].tape.push(p.fixedPgs[pgCount]);
        pgCount++;
      }
    }

    for (let i = 0; i < p.numOutlets; i++) {
      if(p.fixedPgs[pgCount] == undefined) {
        p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
      }
      pgOutlets[i] = p.fixedPgs[pgCount];
      pgCount++;
    }
    for (let i = 0; i < p.numInlets; i++) {
      if(p.fixedPgs[pgCount] == undefined) {
        p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
      }
      pgInlets[i] = p.fixedPgs[pgCount];
      pgCount++;
    }
    print('using ' + pgCount + ' pgraphics');

    videoCurrent = p.createImage(width, height, p.RGB);
    videoLast = p.createImage(width, height, p.RGB);

    let self = this;
    var Thread = Java.type('java.lang.Thread');
    new Thread(function () {
      font = p.createFont('Verdana', 128);
      p.delay(1000);
      setupDone = true;
    }).start();
  }
  let jump = 0;
  let jumpTarget = 0;
  let jumpLast = 0;
  let jsonUi;
  let AVGX = 0, AVGY = 0;
  p.draw = function () {
    p.background(0);
    if (setupDone == false) return;
    jsonUi = JSON.parse(p.jsonUiString);

    if (jsonUi.sliderValues == undefined) {
      jsonUi.sliderValues = {
        background: 0,
        delayFrame: 599,
        debugMode: 'showVideo',
        frameMode: 'blendtwo',
        blendTint: 0.3,
        blendMode: 'lightest',
        jumpRate: 0.1,
        tUpdate: 5,
        fader0: 255,
        fader3: 255,
      }
    }

    let t = p.millis() * 0.001;

    for(let i = 0; i < p.receivers.length; i++) {
      p.receivers[i].receiveTexture(pgInlets[i]);
    }

    p.processCamera(pgTapes[0], pgInlets[0], false);
    // p.processCamera(pgTapes[1], pgInlets[1], false);
    // p.processCamera(pgTapes[2], pgInlets[2], false);

    p.renderVideoScale(pgTapes[0], pgOutlets[1], 0);
    p.renderVideoScale(pgTapes[1], pgOutlets[4], 1);
    p.renderVideoScale(pgTapes[1], pgOutlets[5], 1);
    // p.renderVideoScale(pgTapes[2], pgOutlets[6], 1);
    p.renderVideoScale(pgTapes[1], pgOutlets[2], 1);

    p.renderVideo(pgTapes[0], pgOutlets[3], 0, jsonUi.sliderValues.frameMode, jsonUi.sliderValues.fader3);
    p.renderVideo(pgTapes[0], pgOutlets[0], 0, 'fall', jsonUi.sliderValues.fader3);
    // p.renderVideo(pgTapes[0], pgOutlets[0], 1, 'delayStretch', jsonUi.sliderValues.fader0);

    // let fade = Math.sin(t * 0.1 * Math.PI) * 0.25 + 0.75
    // p.renderBlank(pgOutlets[0], 200 * fade, 200 * fade, 255 * fade);
    // fade = -Math.sin(t * 0.1 * Math.PI) * 0.25 + 0.75
    // p.renderBlank(pgOutlets[3], 200 * fade, 200 * fade, 255 * fade);
    p.renderBlank(pgOutlets[1]);
    p.renderBlank(pgOutlets[2]);
    // p.renderBlank(pgOutlets[3]);
    p.renderBlank(pgOutlets[4]);
    p.renderBlank(pgOutlets[5]);
    p.renderBlank(pgOutlets[6]);
    p.renderBlank(pgOutlets[7]);

    // p.renderNum(pgOutlets[0], 0);
    // p.renderNum(pgOutlets[1], 1);
    // p.renderNum(pgOutlets[2], 2);
    // p.renderNum(pgOutlets[3], 3);
    // let pg = pgOutlets[1];
    // let pgs = pgTapes[0].tape;
    // pg.beginDraw();
    // pg.translate(AVGX, AVGY);
    // pg.scale(2, 2);
    // pg.translate(-AVGX, -AVGY);
    // pg.image(videoCurrent, 0, 0)
    // pg.endDraw();

    for(let i = 0; i < pgOutlets.length; i++) {
      p.spouts[i].sendTexture(pgOutlets[i]);
    }

    let ncol = 4;
    let w = width * 2 / ncol;
    let h = height * 2 / ncol;
    for(let i = 0; i < pgInlets.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol) * h;
      p.image(pgInlets[i], x, y, w, h); // tape
      p.text("inlet " + p.str(i), x + 10, y + 10);
    }

    for(let i = 0; i < pgTapes.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol + 1) * h;
      p.image(pgTapes[i].tape[pgTapes[i].count], x, y, w, h); // tape
      p.text("tape " + p.str(i), x + 10, y + 10);
    }

    for(let i = 0; i < pgOutlets.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol + 2) * h;
      p.image(pgOutlets[i], x, y, w, h); // tape
      p.text("outlet " + p.str(i), x + 10, y + 10);
    }

    let T = jsonUi.sliderValues.tUpdate;
    if (Math.floor(t / 5) - Math.floor(lastT / 5) > 0) {
      print(p.frameRate());
    }
    if (Math.floor(t / T) - Math.floor(lastT / T) > 0) {
      if (jsonUi.sliderValues.frameMode == 'fall') {
        jumpLast = index;
      }
      else {
        jumpLast = jumpTarget;
      }
      jumpTarget = Math.floor(p.random(pgTapes[0].tape.length))
      jump = 0;
    }

    index = (index + 1) % pgTapes[0].tape.length;
    lastT = t;
  }

  p.processCamera = function (pgTape, capture, withMotion) {
    let pgs = pgTape.tape;
    if(withMotion) {
      // swap instead of copy for efficiency
      let temp = videoCurrent;
      videoCurrent = videoLast;
      videoLast = temp;
      videoCurrent.copy(capture, 0, 0, capture.width, capture.height, 0, 0, width, height);
    }
    else {
      videoCurrent = capture;
    }

    if (pgTape.count == 0 || !withMotion) {
    }
    else {
      videoCurrent.loadPixels();
      videoLast.loadPixels();
      let th = 150000;
      let total = 0;
      let roi = {x: 0, y: 0, w: width, h: height};
      let avgX = 0;
      let avgY = 0;
      let avgCount = 0;
      for (let i = roi.y; i < roi.h; i+=4) {
        for (let j = roi.x; j < roi.w; j+=4) {
          let loc = i * width + j;
          let pixc = videoCurrent.pixels[loc];
          let pixl = videoLast.pixels[loc];
          let diff = Math.abs(p.red(pixc) - p.red(pixl)) +
          Math.abs(p.green(pixc) - p.green(pixl)) +
          Math.abs(p.blue(pixc) - p.blue(pixl));
          total += diff;
          if(diff > 100) {
            avgX += j;
            avgY += i;
            avgCount++;
          }
        }
      }
      if(avgCount > 0) {
        AVGX = p.lerp(AVGX, avgX / avgCount, 0.02);
        AVGY = p.lerp(AVGY, avgY / avgCount, 0.02);
      }
      print(total)
      if (total < th) {
        pgTape.skipCountdown--;
        if (pgTape.skipCountdown <= 0) {
          return;
        }
      }
      else {
        pgTape.skipCountdown = 10;
      }
    }

    let pg = pgs[pgTape.count];
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);
    if (jsonUi.sliderValues.debugMode == 'showVideo') {
      pg.translate(pg.width / 2, pg.height / 2);
      pg.scale(1, 1.33333);
      pg.translate(-pg.width / 2, -pg.height / 2);

      pg.image(videoCurrent, 0, 0, width, height);
      pg.blendMode(p.ADD);
      pg.tint(255, 255)
      // pg.image(videoCurrent, 0, 0, width, height);
      // pg.image(capture, 0, 0, width, height);
      // pg.image(capture, 0, 0, width, height);
      pg.tint(255, 255)
    }
    else {
      pg.translate(pg.width / 2, pg.height / 2);
      pg.textFont(font);
      let x = p.map(Math.floor(pgTape.count / 10) * 10, 0, pgs.length, -200, 200);
      pg.text(("00000" + pgTape.count).slice(-4), x - 64, 0);
    }
    pg.endDraw();

    pgTape.count++;
    if (pgTape.count >= pgs.length) {
      pgTape.count = 0;
    }
  }

  p.renderBlank = function (render, r, g, b) {
    render.beginDraw();
    if(r == undefined) {
      render.background(0);
    }
    else {
      render.background(r, g, b);
    }
    render.endDraw();
  }

  p.renderNum = function (render, I) {
    render.beginDraw();
    render.background(255, 0, 0);
    render.push();
    render.fill(0);
    render.blendMode(p.BLEND);
    render.translate(render.width / 2, render.height / 2);
    render.textFont(font);
    render.text('' + I, -64, 0);
    render.pop();
    render.endDraw();
  }

  p.renderVideo = function (pgTape, render, I, mode, fader) {
    let pgs = pgTape.tape;
    let pg = pgs[index % Math.max(pgTape.count, 1)];
    render.beginDraw();
    // p.background(jsonUi.sliderValues.background);
    render.blendMode(p.BLEND);

    let delay = I * Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    jump += 1 / 30 / 5;//jsonUi.sliderValues.jumpRate;
    let jumpFader = 0;
    if (jump < 0.3) {
      jumpFader = EasingFunctions.easeInOutCubic(p.map(jump, 0, 0.3, 0, 1));
    }
    else if (jump < 0.7) {
      jumpFader = 1;
    }
    else if (jump < 1) {
      jumpFader = EasingFunctions.easeInOutCubic(p.map(jump, 0.7, 1, 1, 0));
    }
    else {
      jumpFader = 0;
    }

    let J = Math.floor(p.lerp(jumpLast, jumpTarget, p.constrain(jump, 0, 1)));
    if (isNaN(J) || J < 0) J = 0;
    render.push();
    render.tint(fader);

    let stretchT = 120;
    let delayStretch = Math.floor(599 * EasingFunctions.easeInOutCubic(p.constrain(p.map((p.millis() * 0.001 - startT), 0, stretchT, 0, 1), 0, 1)));
    switch (mode) {
      case 'delay':
        // delay
        render.image(pgs[(index + pgs.length - delay * (I + 1)) % pgs.length], 0, 0);
        break;

      case 'delayStretch':
        render.image(pgs[(index + pgs.length - delayStretch) % pgs.length], 0, 0);
        break;
  
      case 'random':
        // random
        render.image(p.random(pgs), 0, 0);
        break;

      case 'noise':
        // noise
        render.image(pgs[Math.floor(p.noise(t * 0.1, index * 0.0) * pgs.length)], 0, 0);
        break;

      case 'jump':
        // jump
        if (jump > 1) jump = 1;
        render.tint(fader, jsonUi.sliderValues.blendTint * 255);
        render.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
        break;

      case 'fall':
        // fall
        J = 150;
        render.background(0);
        render.blendMode(p.LIGHTEST);
        render.tint(fader);
        render.image(pgs[(index + pgs.length) % pgs.length], 0, 0);
        render.tint(fader * jumpFader);
        render.image(pgs[(index + pgs.length - J) % pgs.length], 0, 0);
        render.blendMode(p.BLEND);
        break;

      case 'blendtwo':
        // blend two
        J = 300;
        if (jsonUi.sliderValues.blendMode == 'blend') {
          render.tint(255, fader * jsonUi.sliderValues.blendTint * 128);
          render.image(pgs[(index + pgs.length - J) % pgs.length], 0, 0);
          render.image(pgs[(index + pgs.length) % pgs.length], 0, 0);
        }
        else if (jsonUi.sliderValues.blendMode == 'lightest') {
          render.background(0);
          render.blendMode(p.LIGHTEST);
          render.tint(fader);
          render.image(pgs[(index + pgs.length - J) % pgs.length], width*0.0, 0);
          render.image(pgs[(index + pgs.length) % pgs.length], 0, 0);
          render.blendMode(p.BLEND);
        }
        else if (jsonUi.sliderValues.blendMode == 'darkest') {
          render.background(255);
          render.blendMode(p.DARKEST);
          render.tint(fader);
          render.image(pgs[(index + pgs.length - J) % pgs.length], 0, 0);
          render.image(pgs[(index + pgs.length) % pgs.length], 0, 0);
          render.blendMode(p.BLEND);
        }
        break;

      case 'normal':
      default:
        // real-time
        render.image(pgs[(index + pgs.length) % pgs.length], 0, 0);
        break;
    }
    render.pop();
    render.endDraw();
  }

  
  p.renderVideoDelay = function (pgTape, render, fader) {
    let pgs = pgTape.tape;
    render.beginDraw();
    render.blendMode(p.BLEND);

    let delay = Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    render.push();

    render.tint(fader);
    // delay
    render.image(pgs[(index + pgs.length - delay) % pgs.length], 0, 0);

    render.pop();
    render.endDraw();
  }

  p.renderVideoScale = function (pgTape, render, dir) {
    let pgs = pgTape.tape;
    render.beginDraw();
    render.blendMode(p.BLEND);

    render.push();

    if(dir == 0) {
      render.image(pgs[(index) % pgs.length], 0, 0, width*2, height);
    }
    else if(dir == 1){
      render.image(pgs[(index) % pgs.length], -width, 0, width*3, height);
    }
    else if(dir == 2){
      render.translate(render.width/2, render.height/2)
      render.scale(2, 2);
      render.translate(-render.width/2, -render.height/2)
      render.image(pgs[(index) % pgs.length], 0, 0);
    }

    render.pop();
    render.endDraw();
  }

  p.keyPressed = function() {
    if(p.key == ' ') {
      // pgTapes[0].count = 0;
      startT = p.millis() * 0.001
    }
  }
};

var p001 = new p5(s);