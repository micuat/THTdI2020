function PLayer(p) {
  this.p = p;
  this.width = p.width;
  this.height = p.height;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
  this.setup();
}

{
  PLayer.prototype.setup = function () { }

  PLayer.prototype.draw = function () {
    this.pg.beginDraw();
    this.drawLayer();
    this.pg.endDraw();
  }

  PLayer.prototype.drawTo = function (toPg) {
    toPg.image(this.pg, 0, 0);
  }
}

function P001(p) {
  PLayer.call(this, p);
}

{
  P001.prototype = Object.create(PLayer.prototype);

  P001.prototype.setup = function () {
    let p = this.p;
    this.particles = [];
    this.terrain = {
      tl: [-p.width / 2, -p.height / 2],
      tr: [p.width / 2, -p.height / 2],
      bl: [-p.width / 2, p.height / 2],
      br: [p.width / 2, p.height / 2]
    }
    this.pathfinder = new Pathfinder(p);
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(p, this.pg));
    }
  }

  P001.prototype.drawTerrain = function (jsonUi, t) {
    let p = this.p;
    let pg = this.pg;
    let terrainAlpha = 255;
    let terrainConnect = 0;
    terrainConnect = jsonUi.sliderValues.terrainAlpha;
    if (terrainConnect == 0) return;
    if (jsonUi.sliderValues.terrainAlpha < 0.1) {
      terrainAlpha *= p.map(jsonUi.sliderValues.terrainAlpha, 0, 0.1, 0, 1);
    }
    pg.strokeWeight(2);
    pg.stroke(255);
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);
    pg.rotateX(-2 * jsonUi.sliderValues.terrainRot);
    let gridN = 12;
    let gridMatrix = [];
    for (let i = 0; i <= gridN; i++) {
      gridMatrix[i] = [];
      for (let j = 0; j <= gridN; j++) {
        let x0 = p.lerp(this.terrain.tl[0], this.terrain.tr[0], i / gridN);
        let y0 = p.lerp(this.terrain.tl[1], this.terrain.tr[1], i / gridN);
        let x1 = p.lerp(this.terrain.bl[0], this.terrain.br[0], i / gridN);
        let y1 = p.lerp(this.terrain.bl[1], this.terrain.br[1], i / gridN);
        let x = p.lerp(x0, x1, j / gridN);
        let y = p.lerp(y0, y1, j / gridN);
        let n = p.noise(t * 1 + y * 0.1, x * 0.1);
        let amp = 0;
        amp = jsonUi.sliderValues.terrainNoise;
        y += -amp * EasingFunctions.easeInQuint(n);
        gridMatrix[i][j] = { x: x, y: y };
      }
    }
    setColor(pg, 'stroke', 0, terrainAlpha);
    for (let i = 0; i <= gridN; i++) {
      let l = terrainConnect;
      for (let j = 0; j < gridN; j++) {
        let g0 = gridMatrix[i][j];
        let g1 = gridMatrix[i][j + 1];
        let x1 = p.lerp(g0.x, g1.x, l);
        let y1 = p.lerp(g0.y, g1.y, l);
        pg.line(g0.x, g0.y, x1, y1);

        x1 = p.lerp(g0.x, g1.x, 1 - l);
        y1 = p.lerp(g0.y, g1.y, 1 - l);
        pg.line(g1.x, g1.y, x1, y1);
      }
      for (let j = 0; j < gridN; j++) {
        let g0 = gridMatrix[j][i];
        let g1 = gridMatrix[j + 1][i];
        let x1 = p.lerp(g0.x, g1.x, l);
        let y1 = p.lerp(g0.y, g1.y, l);
        pg.line(g0.x, g0.y, x1, y1);

        x1 = p.lerp(g0.x, g1.x, 1 - l);
        y1 = p.lerp(g0.y, g1.y, 1 - l);
        pg.line(g1.x, g1.y, x1, y1);
      }
    }
    pg.popMatrix();
  }

  P001.prototype.drawLayer = function () {
    let p = this.p;
    let pg = this.pg;
    let t = this.t;
    let jsonUi = this.jsonUi;
    let tw = t % 2;
    if (tw > 1) tw = 2 - tw;

    pg.clear();
    pg.textSize(24)

    setColor(pg, 'background', 1, jsonUi.sliderValues.background);

    pg.strokeWeight(1);
    pg.noFill();
    pg.stroke(0);

    pg.pushMatrix();

    this.drawTerrain(jsonUi, t);

    this.pathfinder.draw(jsonUi.sliderValues.pathfinder, pg, t);

    setColor(pg, 'stroke', 2);
    for (let i = 0; i < this.particles.length; i++) {
      let pt = this.particles[i];
      pt.update(jsonUi);
    }
    pg.popMatrix();
  }

  P001.prototype.constructor = P001;
}

function PBlend(p) {
  PLayer.call(this, p);
  this.maskIntPg = p.createGraphics(this.width, this.height, p.P3D);
}

{
  PBlend.prototype = Object.create(PLayer.prototype);

  PBlend.prototype.setup = function () {
    let p = this.p;
    this.pg.noSmooth();
  }

  PBlend.prototype.draw = function () {
    this.maskIntPg.beginDraw();
    this.drawMask();
    this.maskIntPg.endDraw();
    this.pg.beginDraw();
    this.drawLayer();
    this.pg.endDraw();
  }

  PBlend.prototype.drawMask = function () {
    let p = this.p;
    let pg = this.maskIntPg;
    pg.clear();
    pg.blendMode(p.BLEND);
    pg.image(this.frontPg, 0, 0);
    pg.blendMode(p.MULTIPLY);
    pg.image(this.maskPg, 0, 0);
  }

  PBlend.prototype.drawLayer = function () {
    let p = this.p;
    let pg = this.pg;
    pg.clear();
    pg.blendMode(p.BLEND);
    pg.image(this.backPg, 0, 0);
    pg.blendMode(p.SUBTRACT);
    pg.image(this.maskPg, 0, 0);
    pg.blendMode(p.ADD);
    pg.image(this.maskIntPg, 0, 0);
  }

  PBlend.prototype.constructor = PBlend;
}

if (pgs == undefined) {
  var pgs = [];
}
var s = function (p) {
  let index = 0;
  // let p001 = new P001(p);
  let width = 1280;
  let height = 720;
  let lastT = 0;

  p.setup = function () {
    p.frameRate(30);
    if (pgs.length == 0) {
      for (let i = 0; i < 60; i++) {
        pgs.push(p.createGraphics(width, height, p.P3D));
        // pgs[i].beginDraw();
        // pgs[i].background(0);
        // pgs[i].endDraw();
      }
    }
  }

  p.draw = function () {
    let jsonUi = JSON.parse(p.jsonUiString);

    if (jsonUi.sliderValues == undefined) {
      // p.background(255, 0, 0);
      // return;
    }

    let t = p.millis() * 0.001;
    // p001.t = t;
    // p001.jsonUi = jsonUi;
    // p001.draw();

    // p.image(pBlend001.pg, 0, 0);
    p.background(0, 0, 0);
    if (p.capture.available() == true) {
      p.capture.read();
    }
    let pg = pgs[index];
    pg.beginDraw();
    pg.image(p.capture, 0, 0, width, height);
    pg.endDraw();

    // p.image(p.random(pgs), 0, 0, p.width, p.height);
    let sc = 2;
    p.translate(width*sc/2, height*sc/2);
    p.scale(-1, 1);
    p.translate(-width*sc/2, -height*sc/2);
    p.image(p.capture, 200, 900, width * sc, height * sc);
    // p.image(p.random(pgs), 200, 700, width * 1.5, height * 1.5);
    // p.image(pgs[(index + 30) % pgs.length], 0, 0);

    index = (index + 1) % pgs.length;

    // p.fill(255, 0, 0);
    // p.rect(0, 0, p.width, p.height)
    p.fill(255);

    // p.image(p.capture, 0, 0, width, height);
    p.stroke(255);
    // p.line(p.mouseX, p.mouseY, width, height);

    if (Math.floor(t) - Math.floor(lastT) > 0) {
      print(p.frameRate());
    }
    lastT = t;

    // p.background(0)
  }
};

var p001 = new p5(s);