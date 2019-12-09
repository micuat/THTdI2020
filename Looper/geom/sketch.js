if (pgs == undefined) {
  var pgs = [];
}
var s = function (p) {
  let index = 0;
  let width = 640//1280;
  let height = 480//720;
  let lastT = 0;

  let font;

  let setupDone = false;

  p.setup = function () {
    p.createCanvas(width * 2, height * 2)
    p.frameRate(30);
    p.background(0);

    let length = 660;
    if (pgs.length != length) {
      pgs = [];
      for (let i = 0; i < length; i++) {
        pgs.push(p.createGraphics(width, height, p.P3D));
        // pgs[i].beginDraw();
        // pgs[i].background(0, 255, 255);
        // pgs[i].endDraw();
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
  p.draw = function () {
    if (setupDone == false) return;
    let jsonUi = JSON.parse(p.jsonUiString);

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
    let pg = pgs[index];
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);
    if (jsonUi.sliderValues.debugMode == 'showVideo') {
      pg.image(p.captures[0], 0, 0, width, height);
    }
    else {
      pg.translate(pg.width / 2, pg.height / 2);
      pg.textFont(font);
      let x = p.map(Math.floor(index / 10) * 10, 0, pgs.length, -200, 200);
      pg.text(("     " + index).slice(-2), x - 64, 0);
    }
    pg.endDraw();

    // p.background(jsonUi.sliderValues.background);
    p.blendMode(p.BLEND);

    let delay = Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    jump += jsonUi.sliderValues.jumpRate;
    let J = Math.floor(p.lerp(jumpLast, jumpTarget, p.constrain(jump, 0, 1)));
    if (isNaN(J) || J < 0) J = 0;
    p.push();
    switch (jsonUi.sliderValues.frameMode) {
      case 'delay':
        // delay
        p.image(pgs[(index + pgs.length - delay) % pgs.length], 0, 0);
        break;

      case 'random':
        // random
        p.image(p.random(pgs), 0, 0);
        break;

      case 'noise':
        // noise
        p.image(pgs[Math.floor(p.noise(t * 0.1, index * 0.0) * pgs.length)], 0, 0);
        break;

      case 'jump':
        // jump
        if (jump > 1) jump = 1;
        p.tint(255, jsonUi.sliderValues.blendTint * 255);
        p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
        break;

      case 'blendtwo':
        // blend two
        if (jsonUi.sliderValues.blendMode == 'blend') {
          p.tint(255, jsonUi.sliderValues.blendTint * 128);
          p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
          p.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
        }
        else if (jsonUi.sliderValues.blendMode == 'lightest') {
          p.background(0);
          p.blendMode(p.LIGHTEST);
          p.tint(255);
          p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
          p.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
          p.blendMode(p.BLEND);
        }
        else if (jsonUi.sliderValues.blendMode == 'darkest') {
          p.background(255);
          p.blendMode(p.DARKEST);
          p.tint(255);
          p.image(pgs[(index + pgs.length - 30 * 20) % pgs.length], 0, 0);
          p.image(pgs[(index + pgs.length - 30 * 0) % pgs.length], 0, 0);
          // p.image(pgs[(index + pgs.length + J * 3) % pgs.length], 0, 0);
          // p.image(pgs[(index + pgs.length + J * 4) % pgs.length], 0, 0);
          p.blendMode(p.BLEND);
          // p.filter(p.INVERT)
          // p.filter(p.THRESHOLD, 0.2)
        }
        break;

      case 'normal':
      default:
        // real-time
        p.image(pg, 0, 0);
        break;
    }
    p.pop();

    // if(p.captures[1].available()) {
    //   p.image(p.captures[1], width, 0);
    // }

    p.image(p.movies[0], width, 0, width, height);

    index = (index + 1) % pgs.length;

    let T = jsonUi.sliderValues.tUpdate;
    if (Math.floor(t / T) - Math.floor(lastT / T) > 0) {
      print(p.frameRate());
      jumpLast = jumpTarget;
      jumpTarget = Math.floor(p.random(pgs.length))
      jump = 0;

      p.movies[0].jump(0);
    }
    lastT = t;
  }
};

var p001 = new p5(s);