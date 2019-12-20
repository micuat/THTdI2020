var width = 640;
var height = 480;

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
  }
  let jump = 0;
  let jumpTarget = 0;
  let jumpLast = 0;
  let jumpStart = 0;
  let jsonUi;
  p.draw = function () {
    p.background(0);
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
        tUpdate: 30,
        fader0: 255,
        fader3: 255,
      }
    }

    let t = p.millis() * 0.001;

    for(let i = 0; i < p.receivers.length; i++) {
      p.receivers[i].receiveTexture(pgInlets[i]);
    }

    p.processCamera(pgTapes[0], pgInlets[0], false);

    p.renderVideoScale(pgTapes[0], pgOutlets[1], 0);
    p.renderVideoScale(pgTapes[1], pgOutlets[4], 1);
    p.renderVideoScale(pgTapes[1], pgOutlets[5], 1);
    // p.renderVideoScale(pgTapes[2], pgOutlets[6], 1);
    p.renderVideoScale(pgTapes[1], pgOutlets[2], 1);

    p.renderVideo(pgTapes[0], pgOutlets[3], 0, jsonUi.sliderValues.frameMode, jsonUi.sliderValues.fader3);
    p.renderVideo(pgTapes[0], pgOutlets[0], 0, 'fall', jsonUi.sliderValues.fader3);
    // p.renderVideo(pgTapes[0], pgOutlets[0], 1, 'delayStretch', jsonUi.sliderValues.fader0);

    // if (t % 60 < 30) {
    //   let fade = -Math.cos((t % 60) / 30 * 2 * Math.PI) * 0.5 + 0.5;
    //   p.renderBlank(pgOutlets[0], 0, 0, 0, fade * 255);
    // }
    // if ((t+30) % 60 < 30) {
    //   let fade = -Math.cos(((t+30) % 60) / 30 * 2 * Math.PI) * 0.5 + 0.5;
    //   p.renderBlank(pgOutlets[3], 0, 0, 0, fade * 255);
    // }
    {
      let fade = -Math.cos(t / 30 * 2 * Math.PI) * 0.25 + 0.75;
      p.renderBlank(pgOutlets[0]);
      p.renderBlank(pgOutlets[0], 200, 200, 255, fade * 255);
    }
    {
      let fade = Math.cos(t / 30 * 2 * Math.PI) * 0.25 + 0.75;
      p.renderBlank(pgOutlets[3]);
      p.renderBlank(pgOutlets[3], 200, 200, 255, fade * 255);
    }
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
      jumpStart = t;
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

  p.processCamera = function (pgTape, capture) {
    let pgs = pgTape.tape;
    let pg = pgs[pgTape.count];
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);
    if (jsonUi.sliderValues.debugMode == 'showVideo') {
      pg.translate(pg.width / 2, pg.height / 2);
      pg.scale(1, 1.33333);
      pg.translate(-pg.width / 2, -pg.height / 2);

      pg.image(capture, 0, 0, width, height);
      pg.blendMode(p.ADD);
      pg.tint(255, 255)
      // pg.image(capture, 0, 0, width, height);
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

  p.renderBlank = function (render, r, g, b, a) {
    render.beginDraw();
    render.push();
    if(r == undefined) {
      render.background(0);
    }
    else {
      render.fill(r, g, b, a);
      render.noStroke();
      render.rect(0, 0, width, height);
    }
    render.pop();
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
    jump = (p.millis() * 0.001 - jumpStart) / 30;//jsonUi.sliderValues.jumpRate;
    let jumpFader0 = 0;
    let jumpFader1 = 0;
    if (jump < 0.2) {
      jumpFader0 = EasingFunctions.easeInOutCubic(p.map(jump, 0, 0.2, 0, 1));
    }
    else if (jump < 0.8) {
      jumpFader0 = 1;
    }
    else if (jump < 1) {
      jumpFader0 = EasingFunctions.easeInOutCubic(p.map(jump, 0.8, 1, 1, 0));
    }
    else {
      jumpFader0 = 0;
    }

    jump = ((p.millis() * 0.001 - jumpStart + 15) % 30) / 30;//jsonUi.sliderValues.jumpRate;
    if (jump < 0.2) {
      jumpFader1 = EasingFunctions.easeInOutCubic(p.map(jump, 0, 0.2, 0, 1));
    }
    else if (jump < 0.8) {
      jumpFader1 = 1;
    }
    else if (jump < 1) {
      jumpFader1 = EasingFunctions.easeInOutCubic(p.map(jump, 0.8, 1, 1, 0));
    }
    else {
      jumpFader1 = 0;
    }

    let J = Math.floor(p.lerp(jumpLast, jumpTarget, p.constrain(jump, 0, 1)));
    if (isNaN(J) || J < 0) J = 0;
    render.push();
    render.tint(fader);

    let stretchT = 300;
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
        J = 599;
        render.background(0);
        render.blendMode(p.LIGHTEST);
        render.tint(fader * jumpFader0);
        render.image(pgs[(index + pgs.length) % pgs.length], 0, 0);
        render.tint(fader * jumpFader1);
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