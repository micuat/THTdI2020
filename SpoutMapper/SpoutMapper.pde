import spout.*;
Spout[] receivers;
PGraphics[] canvas;
int nReceivers = 10;

import deadpixel.keystone.*;

Keystone[] keystones = new Keystone[nReceivers];
CornerPinSurface[] surfaces = new CornerPinSurface[nReceivers];

//PGraphics offscreen;

void setup() {
  // Keystone will only work with P3D or OPENGL renderers, 
  // since it relies on texture mapping to deform
  //size(800, 600, P3D);
  //surface.setResizable(true);
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
  blendMode(BLEND);
  background(0);
  blendMode(ADD);
  for (int i = 0; i < surfaces.length; i++) {
    canvas[i] = receivers[i].receiveTexture(canvas[i]);
    surfaces[i].render(canvas[i], 0, 0, canvas[i].width, canvas[i].height);
  }
}

void keyPressed() {
  switch(key) {
  case 'c':
    keystones[0].toggleCalibration();
    break;

  case 'l':
    // loads the saved layout
    for (int i = 0; i < keystones.length; i++) {
      keystones[i].load("keystone" + i + ".xml");
    }
    break;

  case 's':
    // saves the layout
    for (int i = 0; i < keystones.length; i++) {
      keystones[i].save("keystone" + i + ".xml");
    }
    break;
  
  case '0':
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
    receivers[key - '0'].selectSender(); // change that quadrant
    break;
  }
}
