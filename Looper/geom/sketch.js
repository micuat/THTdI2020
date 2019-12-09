var width = 640//1280;
var height = 480//720;

if (pgTapes == undefined) {
  var pgTapes = [];
  for (let i = 0; i < 4; i++) {
    pgTapes[i] = { render: undefined, tape: [] };
  }
}

var s = function (p) {
  let index = 0;
  let lastT = 0;

  let font;

  let setupDone = false;

  let videoTapingCount = 0;

  p.setup = function () {
    if (fixedPgs == undefined) {
      var fixedPgs = [];
      for (let i = 0; i < 2500; i++) {
        fixedPgs[i] = p001.createGraphics(width, height, p001.P3D);
      }
    }
    
    p.createCanvas(width * 2, height * 2)
    p.frameRate(30);
    p.background(0);

    let pgCount = 0;
    for (let i = 0; i < pgTapes.length; i++) {
      let length = 600;
      if (pgTapes[i].length != length) {
        pgTapes[i] = {
          render: fixedPgs[pgCount++],
          tape: []
        };
        for (let j = 0; j < length; j++) {
          pgTapes[i].tape.push(fixedPgs[pgCount++]);
          pgTapes[i].tape.push(fixedPgs[pgCount++]);
          // pgTapes[i].tape.beginDraw();
          // pgTapes[i].tape.background(0, 255, 255);
          // pgTapes[i].tape.endDraw();
        }
      }
    }

    let self = this;
    var Thread = Java.type('java.lang.Thread');
    new Thread(function () {
      font = p.createFont('Verdana', 128);
      setupDone = true;
    }).start();
  }
  let jump = 0;
  let jumpTarget = 0;
  let jumpLast = 0;
  let jsonUi;
  p.draw = function () {
    if (setupDone == false) return;
    jsonUi = JSON.parse(p.jsonUiString);

    if (jsonUi.sliderValues == undefined) {
      jsonUi.sliderValues = {
        background: 0,
        delayFrame: 30,
        debugMode: 'showVideo',
        frameMode: 'normal',
        blendTint: 0.3,
        blendMode: 'blend',
        jumpRate: 0.1,
        tUpdate: 5
      }
    }

    let t = p.millis() * 0.001;

    if (p.captures[0].available() == true) {
      p.captures[0].read();
    }
    // if (p.captures[1].available() == true) {
    //   p.captures[1].read();
    // }

    p.processCamera(pgTapes[0], p.captures[0]);
    p.recordMovie(pgTapes[1], p.movies[0]);

    p.renderVideo(pgTapes[0]);
    p.renderVideo(pgTapes[1]);

    p.image(pgTapes[0].render, 0, 0);
    p.image(pgTapes[1].render, width, 0);

    index = (index + 1) % pgTapes[0].tape.length;

    let T = jsonUi.sliderValues.tUpdate;
    if (Math.floor(t / T) - Math.floor(lastT / T) > 0) {
      print(p.frameRate());
      jumpLast = jumpTarget;
      jumpTarget = Math.floor(p.random(pgTapes[0].tape.length))
      jump = 0;
    }
    lastT = t;
  }

  p.processCamera = function (pgTape, capture) {
    let pgs = pgTape.tape;
    let pg = pgs[index];
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);
    if (jsonUi.sliderValues.debugMode == 'showVideo') {
      pg.image(capture, 0, 0, width, height);
    }
    else {
      pg.translate(pg.width / 2, pg.height / 2);
      pg.textFont(font);
      let x = p.map(Math.floor(index / 10) * 10, 0, pgs.length, -200, 200);
      pg.text(("00000" + index).slice(-4), x - 64, 0);
    }
    pg.endDraw();
  }

  p.renderVideo = function (pgTape) {
    let pgs = pgTape.tape;
    let render = pgTape.render;
    let pg = pgs[index];
    render.beginDraw();
    // p.background(jsonUi.sliderValues.background);
    render.blendMode(p.BLEND);

    let delay = Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    jump += jsonUi.sliderValues.jumpRate;
    let J = Math.floor(p.lerp(jumpLast, jumpTarget, p.constrain(jump, 0, 1)));
    if (isNaN(J) || J < 0) J = 0;
    render.push();
    switch (jsonUi.sliderValues.frameMode) {
      case 'delay':
        // delay
        render.image(pgs[(index + pgs.length - delay) % pgs.length], 0, 0);
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
        render.tint(255, jsonUi.sliderValues.blendTint * 255);
        render.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
        break;

      case 'blendtwo':
        // blend two
        if (jsonUi.sliderValues.blendMode == 'blend') {
          render.tint(255, jsonUi.sliderValues.blendTint * 128);
          render.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
          render.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
        }
        else if (jsonUi.sliderValues.blendMode == 'lightest') {
          render.background(0);
          render.blendMode(p.LIGHTEST);
          render.tint(255);
          render.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
          render.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
          render.blendMode(p.BLEND);
        }
        else if (jsonUi.sliderValues.blendMode == 'darkest') {
          render.background(255);
          render.blendMode(p.DARKEST);
          render.tint(255);
          render.image(pgs[(index + pgs.length - 30 * 20) % pgs.length], 0, 0);
          render.image(pgs[(index + pgs.length - 30 * 0) % pgs.length], 0, 0);
          render.blendMode(p.BLEND);
        }
        break;

      case 'normal':
      default:
        // real-time
        render.image(pg, 0, 0);
        break;
    }
    render.pop();
    render.endDraw();
  }

  p.recordMovie = function (pgTape, movie) {
    let pgs = pgTape.tape;
    let render = pgTape.render;
    if (videoTapingCount >= pgs.length) return;
    let pg = pgs[videoTapingCount];
    pg.beginDraw();
    pg.background(0);
    pg.image(movie, 0, 0, width, height);
    pg.endDraw();

    videoTapingCount++;
  }};

var p001 = new p5(s);