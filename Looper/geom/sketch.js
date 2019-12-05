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
    p.createCanvas(1600, 800)
    p.frameRate(30);
    p.background(0);

    let length = 60//0;
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
        delayFrame: 0,
        debugNumbers: 0,
        frameMode: 0,
        blendTint: 0.3,
        blendMode: 0,
        jumpRate: 0.1,
        tUpdate: 5
      }
    }

    let t = p.millis() * 0.001;

    if (p.capture.available() == true) {
      p.capture.read();
    }
    let pg = pgs[index];
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);
    if (jsonUi.sliderValues.debugNumbers < 1) {
      pg.image(p.capture, 0, 0, width, height);
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

    let frameMode = Math.floor(jsonUi.sliderValues.frameMode + 0.5);
    let delay = Math.min(Math.floor(jsonUi.sliderValues.delayFrame), pgs.length - 1);
    jump += jsonUi.sliderValues.jumpRate;
    let J = Math.floor(p.lerp(jumpLast, jumpTarget, jump));
    if (isNaN(J) || J < 0) J = 0;
    p.push();
    switch (frameMode) {
      case 0:
        // real-time
        p.image(pg, 0, 0);
        break;

      case 1:
        // delay
        p.image(pgs[(index + pgs.length - delay) % pgs.length], 0, 0);
        break;

      case 2:
        // random
        p.image(p.random(pgs), 0, 0);
        break;

      case 3:
        // noise
        p.image(pgs[Math.floor(p.noise(t * 0.1, index * 0.0) * pgs.length)], 0, 0);
        break;

      case 4:
        // jump
        if (jump > 1) jump = 1;
        p.tint(255, jsonUi.sliderValues.blendTint * 255);
        p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
        break;

      case 5:
        // blend two
        if (Math.floor(jsonUi.sliderValues.blendMode + 0.5) == 0) {
          p.tint(255, jsonUi.sliderValues.blendTint * 128);
          p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
          p.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
        }
        else {
          p.tint(255);
          p.background(0);
          p.blendMode(p.LIGHTEST);
          p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
          p.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
          p.blendMode(p.BLEND);
        }
    }
    p.pop();

    index = (index + 1) % pgs.length;

    let T = jsonUi.sliderValues.tUpdate;
    if (Math.floor(t / T) - Math.floor(lastT / T) > 0) {
      print(p.frameRate());
      jumpLast = jumpTarget;
      jumpTarget = Math.floor(p.random(pgs.length))
      jump = 0;
    }
    lastT = t;
  }
};

var p001 = new p5(s);