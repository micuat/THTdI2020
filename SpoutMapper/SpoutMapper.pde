import spout.*;
Spout[] receivers;
PGraphics[] canvas;
int nReceivers = 2;

import deadpixel.keystone.*;

Keystone[] keystones = new Keystone[2];
CornerPinSurface[] surfaces = new CornerPinSurface[2];

//PGraphics offscreen;

void setup() {
  // Keystone will only work with P3D or OPENGL renderers, 
  // since it relies on texture mapping to deform
  //size(800, 600, P3D);
  fullScreen(P3D, 2);

  for (int i = 0; i < keystones.length; i++) {
    keystones[i] = new Keystone(this);
    surfaces[i] = keystones[i].createCornerPinSurface(200, 150, 20);
    surfaces[i].moveTo(i * 250, 0);
  }

  //offscreen = createGraphics(400, 300, P3D);
  receivers = new Spout[nReceivers];
  for (int i = 0; i < nReceivers; i++) { 
    receivers[i] = new Spout(this);
    String sendername = "Videolooper"+str(i);
    receivers[i].createReceiver(sendername);
  }
  canvas = new PGraphics[nReceivers];
  for (int i = 0; i < nReceivers; i++) {
    canvas[i] = createGraphics(640, 480, P2D);
  }
}

void draw() {
  background(0);

  for (int i = 0; i < surfaces.length; i++) {
    canvas[i] = receivers[i].receiveTexture(canvas[i]);
    surfaces[i].render(canvas[i], 0, 0, canvas[i].width, canvas[i].height);
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
