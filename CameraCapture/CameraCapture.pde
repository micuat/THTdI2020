import spout.*;

int nSenders = 2;
PGraphics[] canvas;
Spout[] senders;
color[] colors;

import processing.video.*;

Capture[] cam = new Capture[2];

void setup() {
  size(1280, 480, P3D);

  String[] cameras = Capture.list();

  if (cameras == null) {
    println("Failed to retrieve the list of available cameras, will try the default...");
    cam[0] = new Capture(this, 640, 480);
  } if (cameras.length == 0) {
    println("There are no cameras available for capture.");
    exit();
  } else {
    println("Available cameras:");
    printArray(cameras);

    // The camera can be initialized directly using an element
    // from the array returned by list():
    cam[0] = new Capture(this, 640, 480, "USB Capture HDMI", 60);
    cam[1] = new Capture(this, 640, 480, "Logitech Webcam C925e", 30);
    // Or, the settings can be defined based on the text in the list
    //cam = new Capture(this, 640, 480, "Built-in iSight", 30);
    
    // Start capturing the images from the camera
    cam[0].start();
    cam[1].start();
  }

  // Create Spout senders to send frames out.
  senders = new Spout[nSenders];
  for (int i = 0; i < nSenders; i++) { 
    senders[i] = new Spout(this);
    String sendername = "CameraCapture"+i;
    senders[i].createSender(sendername, 320, 180);
  }
}


void draw() {
  if (cam[0].available() == true) {
    cam[0].read();
  }
  if (cam[1].available() == true) {
    cam[1].read();
  }
  image(cam[0], 0, 0, width/2, height);
  image(cam[1], width/2, 0, width/2, height);
  // The following does the same as the above image() line, but 
  // is faster when just drawing the image without any additional 
  // resizing, transformations, or tint.
  //set(0, 0, cam);
  for (int i = 0; i < nSenders; i++) {
    senders[i].sendTexture(cam[i]);    
  }
}
