var colorSchemes = [
  // new ColorScheme("06d6a0-f8ffe5-ef476f-1b9aaa-ffc43d"),
  new ColorScheme("ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6")
];
function setColor(parent, func, index, alpha) {
  if (alpha == undefined) alpha = 255;
  parent[func](colorSchemes[0].get(index).r, colorSchemes[0].get(index).g, colorSchemes[0].get(index).b, alpha);
}
function Ring(x, y) {
  this.x = x;
  this.y = y;
  this.count = 0;
  this.maxCount = 30;
  this.draw = function (pg, pathfinderDraw) {
    let r = 10 + this.count * 0.5;
    let alpha = pathfinderDraw * (this.maxCount - this.count) / this.maxCount;
    setColor(pg, 'stroke', 4, alpha * 255);
    pg.ellipse(this.x, this.y, r, r);
    this.count++;
    if (this.count >= this.maxCount) {
      return true;
    }
    else return false;
  }
}

function Pathfinder(p) {
  this.x = 0;
  this.y = 0;
  this.target = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
    rot: 0
  }
  this.orig = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
    rot: 0
  }
  this.cycle = 0.5;
  this.lastT = -100;
  this.tick = 800 / 12;
  this.rings = [];
  this.draw = function (pathfinderDraw, pg, t) {
    if (pathfinderDraw == 0) return;
    if (Math.floor(t / this.cycle) - Math.floor(this.lastT) > 0) {
      if (this.target.rot % 2 == 0) {
        this.rings.push(new Ring((this.target.x + this.target.sx) * this.tick, (this.target.y + this.target.sy) * this.tick));
        this.rings.push(new Ring((this.target.x - this.target.sx) * this.tick, (this.target.y + this.target.sy) * this.tick));
        this.rings.push(new Ring((this.target.x - this.target.sx) * this.tick, (this.target.y - this.target.sy) * this.tick));
        this.rings.push(new Ring((this.target.x + this.target.sx) * this.tick, (this.target.y - this.target.sy) * this.tick));
      }
      else {
        this.rings.push(new Ring((this.target.x + this.target.sy) * this.tick, (this.target.y + this.target.sx) * this.tick));
        this.rings.push(new Ring((this.target.x - this.target.sy) * this.tick, (this.target.y + this.target.sx) * this.tick));
        this.rings.push(new Ring((this.target.x - this.target.sy) * this.tick, (this.target.y - this.target.sx) * this.tick));
        this.rings.push(new Ring((this.target.x + this.target.sy) * this.tick, (this.target.y - this.target.sx) * this.tick));
      }
      this.lastT = t / this.cycle;
      this.orig = this.target;
      this.target = {
        x: this.orig.x,
        y: this.orig.y,
        sx: this.orig.sx,
        sy: this.orig.sy,
        rot: this.orig.rot
      }
      let rand = Math.random();
      if (rand > 0.8) {
        this.target.x = Math.floor(p.random(-5, 6));
      }
      else if (rand > 0.6) {
        this.target.y = Math.floor(p.random(-5, 6));
      }
      else if (rand > 0.4) {
        this.target.sx = Math.floor(p.random(0, 4));
      }
      else if (rand > 0.2) {
        this.target.sy = Math.floor(p.random(0, 4));
      }
      else {
        this.target.rot = Math.floor(p.random(0, 4));
      }
    }
    let tw = EasingFunctions.easeInOutCubic(t / this.cycle - this.lastT);
    this.x = p.lerp(this.orig.x, this.target.x, tw);
    this.y = p.lerp(this.orig.y, this.target.y, tw);
    this.sx = p.lerp(this.orig.sx, this.target.sx, tw);
    this.sy = p.lerp(this.orig.sy, this.target.sy, tw);
    this.rot = p.lerp(this.orig.rot, this.target.rot, tw);
    let r = 10;
    pg.pushStyle();
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);

    for (let i = this.rings.length - 1; i >= 0; i--) {
      if (this.rings[i].draw(pg, pathfinderDraw)) {
        this.rings.splice(i, 1);
      }
    }

    setColor(pg, 'fill', 4, pathfinderDraw * 255);
    pg.noStroke();
    pg.translate(this.x * this.tick, this.y * this.tick);
    pg.rotate(this.rot * Math.PI * 0.5);
    pg.ellipse((+this.sx) * this.tick, (+this.sy) * this.tick, r, r);
    pg.ellipse((-this.sx) * this.tick, (+this.sy) * this.tick, r, r);
    pg.ellipse((-this.sx) * this.tick, (-this.sy) * this.tick, r, r);
    pg.ellipse((+this.sx) * this.tick, (-this.sy) * this.tick, r, r);

    setColor(pg, 'stroke', 4, pathfinderDraw * 255);
    pg.noFill();
    pg.rect(-this.sx * this.tick, -this.sy * this.tick, this.sx * 2 * this.tick, this.sy * 2 * this.tick);
    pg.popMatrix();
    pg.popStyle();
  }
}

function Particle(p, pg) {
  this.pos = { x: Math.random() * pg.width, y: Math.random() * pg.height };
  let v = p5.Vector.random2D();
  // this.vel = {x: -5, y: 5};
  this.z = p.random(0.5, 3);
  this.vel = { x: 5 / this.z * v.x, y: 5 / this.z * v.y };
  this.rot = 0;
  this.rVel = (Math.random() - 0.5) * 0.3;
  this.l = 200 / this.z;
  this.history = [];
  this.update = function (jsonUi) {
    let l = jsonUi.sliderValues.armLength;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    let w = 1280, h = 720;
    if (this.pos.x < -this.l) this.pos.x = w + this.l;
    if (this.pos.x > w + this.l) this.pos.x = - this.l;
    if (this.pos.y < -this.l) this.pos.y = h + this.l;
    if (this.pos.y > h + this.l) this.pos.y = - this.l;
    this.rot += this.rVel;
    let dx = Math.cos(this.rot);
    let dy = Math.sin(this.rot);
    this.x0 = this.pos.x + dx * -this.l * 0.5 * l;
    this.y0 = this.pos.y + dy * -this.l * 0.5 * l;
    this.x1 = this.pos.x + dx * this.l * 0.5 * l;
    this.y1 = this.pos.y + dy * this.l * 0.5 * l;


    this.history.push({ x0: this.x0, y0: this.y0, x1: this.x1, y1: this.y1 });
    if (this.history.length > jsonUi.sliderValues.particleHistory) this.history.shift();
    for (let i = 0; i < this.history.length; i++) {
      let h = this.history[i];
      pg.line(h.x0, h.y0, h.x1, h.y1);
    }
  }
}

function PLayer(p) {
  this.p = p;
  this.width = p.width;
  this.height = p.height;
  this.pg = p.createGraphics(this.width, this.height, p.P3D);
}

{
  PLayer.prototype.draw = function (args) {
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

  P001.prototype.drawLayer = function () {
    let p = this.p;
  }

  P001.prototype.constructor = P001;
}

var s = function (p) {
  let particles = [];
  let pg = p.createGraphics(p.width, p.height, p.P3D);

  let terrain = {
    tl: [-p.width / 2, -p.height / 2],
    tr: [p.width / 2, -p.height / 2],
    bl: [-p.width / 2, p.height / 2],
    br: [p.width / 2, p.height / 2]
  }
  let pathfinder = new Pathfinder(p);

  p.setup = function () {
    p.frameRate(30);

    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(p, pg));
    }
  }

  p.drawTerrain = function (jsonUi, t) {
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
        let x0 = p.lerp(terrain.tl[0], terrain.tr[0], i / gridN);
        let y0 = p.lerp(terrain.tl[1], terrain.tr[1], i / gridN);
        let x1 = p.lerp(terrain.bl[0], terrain.br[0], i / gridN);
        let y1 = p.lerp(terrain.bl[1], terrain.br[1], i / gridN);
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

  p.draw = function () {
    let t = p.millis() * 0.001;
    let tw = t % 2;
    if (tw > 1) tw = 2 - tw;

    let jsonUi = JSON.parse(p.jsonUiString);

    if (jsonUi.sliderValues == undefined) {
      p.background(255, 0, 0);
      return;
    }

    pg.beginDraw();
    pg.clear();
    pg.textSize(24)

    setColor(pg, 'background', 1, jsonUi.sliderValues.background);

    pg.strokeWeight(1);
    pg.noFill();
    pg.stroke(0);

    pg.pushMatrix();

    p.drawTerrain(jsonUi, t);

    pathfinder.draw(jsonUi.sliderValues.pathfinder, pg, t);

    setColor(pg, 'stroke', 2);
    for (let i = 0; i < particles.length; i++) {
      let pt = particles[i];
      pt.update(jsonUi);
    }
    pg.popMatrix();
    pg.endDraw();
    p.image(pg, 0, 0);
  }
};

var p001 = new p5(s);