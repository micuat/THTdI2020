import spout.*;
Spout spout;
PGraphics pgr; // Canvas to receive a texture

import deadpixel.keystone.*;

Keystone[] keystones = new Keystone[2];
CornerPinSurface[] surfaces = new CornerPinSurface[2];

PGraphics offscreen;

void setup() {
  // Keystone will only work with P3D or OPENGL renderers, 
  // since it relies on texture mapping to deform
  size(800, 600, P3D);

  for(int i = 0; i < keystones.length; i++) {
    keystones[i] = new Keystone(this);
    surfaces[i] = keystones[i].createCornerPinSurface(200, 150, 20);
  }

  offscreen = createGraphics(400, 300, P3D);
  spout = new Spout(this);
  pgr = createGraphics(width, height, PConstants.P2D);
}

void draw() {
  pgr = spout.receiveTexture(pgr);

  offscreen.beginDraw();
  offscreen.image(pgr, 0, 0, offscreen.width, offscreen.height);
  offscreen.endDraw();

  background(0);

  for(int i = 0; i < surfaces.length; i++) {
    surfaces[i].render(offscreen);
  }
}

void keyPressed() {
  switch(key) {
  case '1':
    keystones[0].toggleCalibration();
    break;

  case '2':
    keystones[1].toggleCalibration();
    break;

  case 'l':
    // loads the saved layout
    keystones[0].load();
    break;

  case 's':
    // saves the layout
    keystones[0].save();
    break;
  }
}
