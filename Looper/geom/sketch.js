var width = 640;
var height = 480;

if (pgTapes == undefined) {
  var pgTapes = [];
  for (let i = 0; i < pApplet.numTapes; i++) {
    pgTapes[i] = { tape: [], count: 0, skipCountdown: 0 };
  }
  var pgOutlets = [];
  var pgInlets = [];
  var pgInters = [];
}

var s = function (p) {
  let index = 0;
  let lastT = 0;
  let startT = 0;

  let font;

  let jsonUi;

  p.setup = function () {
    if (p.fixedPgs == undefined) {
      p.fixedPgs = [];
    }
    startT = p.millis() * 0.001;
    font = p.createFont('Verdana', 64);

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
        if (p.fixedPgs[pgCount] == undefined) {
          p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
        }
        pgTapes[i].tape.push(p.fixedPgs[pgCount]);
        pgCount++;
      }
    }

    for (let i = 0; i < p.numOutlets; i++) {
      if (p.fixedPgs[pgCount] == undefined) {
        p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
      }
      pgOutlets[i] = p.fixedPgs[pgCount];
      p.renderBlank(pgOutlets[i]);
      pgCount++;
    }
    for (let i = 0; i < p.numInlets; i++) {
      if (p.fixedPgs[pgCount] == undefined) {
        p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
      }
      pgInlets[i] = p.fixedPgs[pgCount];
      pgCount++;
    }
    for (let i = 0; i < p.numInters; i++) {
      if (p.fixedPgs[pgCount] == undefined) {
        p.fixedPgs[pgCount] = p.createGraphics(width, height, p.P3D);
      }
      pgInters[i] = p.fixedPgs[pgCount];
      p.renderBlank(pgInters[i]);
      pgCount++;
    }
    print('using ' + pgCount + ' pgraphics');
  }

  p.draw = function () {
    p.background(0);
    jsonUi = JSON.parse(p.jsonUiString);

    if (jsonUi.sliderValues == undefined) {
      jsonUi.sliderValues = {
        delayFrame: 599,
        debugMode: 'showVideo',
        frameMode0: 'delay',
        frameMode1: 'blendtwo',
        blendTint: 0.3,
        blendMode: 'lightest',
        tUpdate: 30,
        fader00: 255,
        fader01: 255,
        fader02: 255,
        fader03: 255,
        fader10: 255,
        fader11: 255,
        fader12: 255,
        fader13: 255,
      }
    }

    let t = p.millis() * 0.001;

    for (let i = 0; i < p.receivers.length; i++) {
      p.receivers[i].receiveTexture(pgInlets[i]);
    }

    p.processCamera(pgTapes[0], pgInlets[0], false);

    p.renderVideo(pgTapes[0], pgInters[0], 'normal', 255);
    p.renderVideo(pgTapes[0], pgInters[1], 'delay', 255);
    p.renderVideo(pgTapes[0], pgInters[2], 'fall', 255);
    p.renderVideo(pgTapes[0], pgInters[3], 'blendtwo', 255);

    for (let j = 0; j < 2; j++) {
      pgOutlets[j].beginDraw();
      pgOutlets[j].background(0);
      for (let i = 0; i < 4; i++) {
        pgOutlets[j].tint(255, jsonUi.sliderValues['fader' + j + i]);
        pgOutlets[j].image(pgInters[i], 0, 0);
      }
      pgOutlets[j].endDraw();
    }

    // black
    // if (t % 60 < 30) {
    //   let fade = -Math.cos((t % 60) / 30 * 2 * Math.PI) * 0.5 + 0.5;
    //   p.renderBlank(pgOutlets[0], 0, 0, 0, fade * 255);
    // }
    // if ((t+30) % 60 < 30) {
    //   let fade = -Math.cos(((t+30) % 60) / 30 * 2 * Math.PI) * 0.5 + 0.5;
    //   p.renderBlank(pgOutlets[3], 0, 0, 0, fade * 255);
    // }

    // cool white
    // {
    //   let fade = -Math.cos(t / 30 * 2 * Math.PI) * 0.25 + 0.75;
    //   p.renderBlank(pgOutlets[0]);
    //   p.renderBlank(pgOutlets[0], 200, 200, 255, fade * 255);
    // }
    // {
    //   let fade = Math.cos(t / 30 * 2 * Math.PI) * 0.25 + 0.75;
    //   p.renderBlank(pgOutlets[3]);
    //   p.renderBlank(pgOutlets[3], 200, 200, 255, fade * 255);
    // }

    // for(let i = 0; i < pgOutlets.length; i++) {
    //   p.renderNum(pgOutlets[i], i);
    // }

    for (let i = 0; i < pgOutlets.length; i++) {
      p.spouts[i].sendTexture(pgOutlets[i]);
    }

    // p.scale(4/6, 4/6);
    let ncol = 6;
    let w = width * 2 / ncol;
    let h = height * 2 / ncol;
    for (let i = 0; i < pgInlets.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol) * h;
      p.image(pgInlets[i], x, y, w, h); // tape
      p.text("inlet " + p.str(i), x + 10, y + 10);
    }

    for (let i = 0; i < pgTapes.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol + 1) * h;
      p.image(pgTapes[i].tape[pgTapes[i].count], x, y, w, h); // tape
      p.text("tape " + p.str(i), x + 10, y + 10);
    }

    let names = ['normal', 'delay', 'fall', 'blendtwo'];
    for (let i = 0; i < pgInters.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol + 2) * h;
      p.image(pgInters[i], x, y, w, h); // tape
      p.text("inter " + names[i], x + 10, y + 10);
    }

    for (let i = 0; i < pgOutlets.length; i++) {
      let x = (i % ncol) * w;
      let y = Math.floor(i / ncol + 3) * h;
      p.image(pgOutlets[i], x, y, w, h); // tape
      p.text("outlet " + p.str(i), x + 10, y + 10);
    }

    let T = jsonUi.sliderValues.tUpdate;
    if (Math.floor(t / 5) - Math.floor(lastT / 5) > 0) {
      print(p.frameRate());
    }
    if (Math.floor(t / T) - Math.floor(lastT / T) > 0) {
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
    if (r == undefined) {
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
    render.background(100, 0, 0);
    render.push();
    render.fill(255);
    render.blendMode(p.BLEND);
    render.translate(render.width / 2, render.height / 2);
    render.textFont(font);
    render.textSize(240);
    render.text('' + I, -64, 0);
    render.pop();
    render.endDraw();
  }

  function jumpFader(offset) {
    let T = jsonUi.sliderValues.tUpdate;
    let jump = ((p.millis() * 0.001 + offset) % T) / T;
    let jumpFader = 0;
    let fadeT = T / 4;
    let fadeR = fadeT / T;
    if (jump < fadeR) {
      jumpFader = EasingFunctions.easeInOutCubic(p.map(jump, 0, fadeR, 0, 1));
    }
    else if (jump < 1 - fadeR) {
      jumpFader = 1;
    }
    else if (jump < 1) {
      jumpFader = EasingFunctions.easeInOutCubic(p.map(jump, 1 - fadeR, 1, 1, 0));
    }
    else {
      jumpFader = 0;
    }
    return jumpFader;
  }

  p.renderVideo = function (pgTape, render, mode, fader) {
    let pgs = pgTape.tape;
    render.beginDraw();
    render.blendMode(p.BLEND);

    let delay = Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    let jumpFader0 = jumpFader(0);
    let jumpFader1 = jumpFader(jsonUi.sliderValues.tUpdate / 2);

    let J = 0;
    render.push();
    render.tint(fader);

    let stretchT = 300;
    let delayStretch = Math.floor(599 * EasingFunctions.easeInOutCubic(p.constrain(p.map((p.millis() * 0.001 - startT), 0, stretchT, 0, 1), 0, 1)));
    switch (mode) {
      case 'delay':
        // delay
        render.image(pgs[(index + pgs.length - delay) % pgs.length], 0, 0);
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
          render.image(pgs[(index + pgs.length - J) % pgs.length], width * 0.0, 0);
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
        render.image(pgs[index], 0, 0);
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

    if (dir == 0) {
      render.image(pgs[(index) % pgs.length], 0, 0, width * 2, height);
    }
    else if (dir == 1) {
      render.image(pgs[(index) % pgs.length], -width, 0, width * 3, height);
    }
    else if (dir == 2) {
      render.translate(render.width / 2, render.height / 2)
      render.scale(2, 2);
      render.translate(-render.width / 2, -render.height / 2)
      render.image(pgs[(index) % pgs.length], 0, 0);
    }

    render.pop();
    render.endDraw();
  }

  p.keyPressed = function () {
    if (p.key == ' ') {
      // pgTapes[0].count = 0;
      startT = p.millis() * 0.001
    }
  }
};

var p001 = new p5(s);