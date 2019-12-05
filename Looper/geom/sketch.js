if (pgs == undefined) {
  var pgs = [];
}
var s = function (p) {
  let index = 0;
  let width = 640//1280;
  let height = 480//720;
  let lastT = 0;

  let font;

  p.setup = function () {
    p.createCanvas(1600, 800)
    p.frameRate(30);
    font = p.createFont('Verdana', 128);
    let length = 30//0;
    if (pgs.length != length) {
      pgs = [];
      for (let i = 0; i < length; i++) {
        pgs.push(p.createGraphics(width, height, p.P3D));
        pgs[i].beginDraw();
        pgs[i].background(0, 255, 255);
        pgs[i].endDraw();
      }
    }
  }
  let jump = 0;
  let jumpTarget = 0;
  let jumpLast = 0;
  p.draw = function () {
    let jsonUi = JSON.parse(p.jsonUiString);

    if (jsonUi.sliderValues == undefined) {
      jsonUi.sliderValues = {
        background: 0,
        debugNumbers: 0
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
      pg.text(("     " + index).slice(-2), -64, 0);
    }
    pg.endDraw();

    p.background(jsonUi.sliderValues.background);

    // let sc = 2;
    // p.translate(width*sc/2, height*sc/2);
    // p.scale(-1, 1);
    // p.translate(-width*sc/2, -height*sc/2);
    // p.background(0)
    // p.image(pg, 0, 0)
    // p.image(p.capture, 200, 900, width * sc, height * sc);
    // p.image(p.random(pgs), 200, 700, width * 1.5, height * 1.5);

    // noise
    // p.image(pgs[Math.floor(p.noise(t * 0.1, index * 0.0) * pgs.length)], 0, 0);

    // jump
    jump += 1;
    if (jump > 1) jump = 1;
    let J = Math.floor(p.lerp(jumpLast, jumpTarget, jump))
    p.blendMode(p.BLEND);
    // p.tint(10, 255)
    // p.tint(255, p.map(p.mouseX, 0, p.width, 255, 0));
    // p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);

    p.background(255);
    p.pushMatrix();
    p.translate(pg.width / 2, pg.height / 2);
    // p.scale(4, 4);
    p.translate(-pg.width / 2, -pg.height / 2);
    p.translate(0, 100)
    p.blendMode(p.BLEND)

    // p.tint(255)
    p.tint(255, p.map(p.mouseX, 0, p.width, 255, 0));
    p.image(pgs[(index + pgs.length + J) % pgs.length], 0, 0);
    p.image(pgs[(index + pgs.length + J * 2) % pgs.length], 0, 0);
    // p.image(pgs[(index + pgs.length + J*3) % pgs.length], 0, 0);
    // p.image(pgs[(index + pgs.length + J*4) % pgs.length], 0, 0);

    // normal
    let delay = 10//30 * 5;
    p.image(pgs[(index + pgs.length - 10) % pgs.length], 0, 0);
    p.popMatrix()

    index = (index + 1) % pgs.length;

    let T = 5;
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