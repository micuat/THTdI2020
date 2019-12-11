var width = 640//1280;
var height = 480//720;

if (pgTapes == undefined) {
  var pgTapes = [];
  for (let i = 0; i < 4; i++) {
    pgTapes[i] = [];
  }
  var pgRenders = [];
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
    let length = 600;
    if (pgTapes[0].length != length) {
      for (let i = 0; i < pgTapes.length; i++) {
        pgTapes[i] = []
        for (let j = 0; j < length; j++) {
          pgTapes[i].push(fixedPgs[pgCount++]);
        }
      }

      for (let i = 0; i < 4; i++) {
        pgRenders[i] = fixedPgs[pgCount++];
      }
    }

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

    p.renderVideo(pgTapes[1], pgRenders[0], 0);
    p.renderVideo(pgTapes[1], pgRenders[1], 1);

    p.spouts[0].sendTexture(pgRenders[0]);    
    p.spouts[1].sendTexture(pgRenders[1]);    

    p.image(pgRenders[0], 0, 0);
    p.image(pgRenders[1], width, 0);

    let T = jsonUi.sliderValues.tUpdate;
    if (Math.floor(t / T) - Math.floor(lastT / T) > 0) {
      print(p.frameRate());
      if (jsonUi.sliderValues.frameMode == 'fall') {
        jumpLast = index;
      }
      else {
        jumpLast = jumpTarget;
      }
      jumpTarget = Math.floor(p.random(pgTapes[0].length))
      jump = 0;
    }

    index = (index + 1) % pgTapes[0].length;
    lastT = t;
  }

  p.processCamera = function (pgs, capture) {
    let pg = pgs[index];
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);
    if (jsonUi.sliderValues.debugMode == 'showVideo') {
      pg.translate(pg.width / 2, pg.height / 2);
      pg.scale(1, 1.33333);
      pg.translate(-pg.width / 2, -pg.height / 2);

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

  p.renderVideo = function (pgs, render, I) {
    let pg = pgs[index];
    render.beginDraw();
    // p.background(jsonUi.sliderValues.background);
    render.blendMode(p.BLEND);

    let delay = Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    jump += 1 / 30 / 10;//jsonUi.sliderValues.jumpRate;
    let J = Math.floor(p.lerp(jumpLast, jumpTarget, p.constrain(jump, 0, 1)));
    if (isNaN(J) || J < 0) J = 0;
    render.push();
    switch (jsonUi.sliderValues.frameMode) {
      case 'delay':
        // delay
        render.image(pgs[(index + pgs.length - delay * (I + 1)) % pgs.length], 0, 0);
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

      case 'fall':
        // fall
        if (jump > 1) jump = 1;
        render.image(pgs[jumpLast % pgs.length], 0, 0);
        render.tint(255, jump * 255);
        // if (jsonUi.sliderValues.blendMode == 'blend') {
        // }
        // else if (jsonUi.sliderValues.blendMode == 'lightest') {
        //   render.tint(jump * 255, 255);
        //   render.blendMode(p.LIGHTEST);
        // }
        // else if (jsonUi.sliderValues.blendMode == 'darkest') {
        //   render.tint((1 - jump) * 255, 255);
        //   render.blendMode(p.DARKEST);
        // }
        render.image(pgs[index], 0, 0);
        render.blendMode(p.BLEND);
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

  p.recordMovie = function (pgs, movie) {
    if (videoTapingCount >= pgs.length) return;
    let pg = pgs[videoTapingCount];
    pg.beginDraw();
    pg.background(0);
    pg.image(movie, 0, 0, width, height);
    pg.endDraw();

    videoTapingCount++;
  }
};

var p001 = new p5(s);