import spout.*;
Spout spout;
PGraphics pgr; // Canvas to receive a texture

import deadpixel.keystone.*;

Keystone[] keystones = new Keystone[2];
CornerPinSurface[] surfaces = new CornerPinSurface[2];

//PGraphics offscreen;

void setup() {
  // Keystone will only work with P3D or OPENGL renderers, 
  // since it relies on texture mapping to deform
  //size(800, 600, P3D);
  fullScreen(P3D, 2);

  for(int i = 0; i < keystones.length; i++) {
    keystones[i] = new Keystone(this);
    surfaces[i] = keystones[i].createCornerPinSurface(200, 150, 20);
    surfaces[i].moveTo(i * 250, 0);
  }

  //offscreen = createGraphics(400, 300, P3D);
  spout = new Spout(this);
  pgr = createGraphics(width, height, PConstants.P2D);
}

void draw() {
  pgr = spout.receiveTexture(pgr);

  //offscreen.beginDraw();
  //offscreen.image(pgr, 0, 0, offscreen.width/2, offscreen.height/2);
  //offscreen.endDraw();

  background(0);

  for(int i = 0; i < surfaces.length; i++) {
    surfaces[i].render(pgr, 0, 0, pgr.width, pgr.height);
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
    keystones[0].load("keystone0.xml");
    keystones[1].load("keystone1.xml");
    break;

  case 's':
    // saves the layout
    keystones[0].save("keystone0.xml");
    keystones[1].save("keystone1.xml");
    break;
  }
}
