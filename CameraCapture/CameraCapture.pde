import spout.*;

int nSenders = 3;
PGraphics[] canvas;
Spout[] senders;
color[] colors;

import processing.video.*;

Capture[] cam = new Capture[2];
Capture curCam;

public Movie[] movies = new Movie[2];

void setup() {
  size(960, 240, P3D);

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
    cam[1].stop();
    curCam = cam[0];
  }

  movies[0] = new Movie(this, "191217_bl.mp4");  
  movies[1] = new Movie(this, "191217_wl.mp4");  

  for (int i = 0; i < movies.length; i++) {
    movies[i].play();
    movies[i].jump(0);
    movies[i].speed(1);
    movies[i].loop();
    movies[i].volume(0);
    //movies[i].pause();
  }

  // Create Spout senders to send frames out.
  senders = new Spout[nSenders];
  for (int i = 0; i < nSenders; i++) { 
    senders[i] = new Spout(this);
    String sendername = "CameraCapture"+i;
    senders[i].createSender(sendername, 640, 480);
  }
}

void movieEvent(Movie m) {
  m.read();
}

void draw() {
  if (cam[0].available() == true) {
    cam[0].read();
  }
  if (cam[1].available() == true) {
    cam[1].read();
  }
  int w = 320;
  int h = 240;
  image(curCam, 0, 0, w, h);
  image(movies[0], w, 0, w, h);
  image(movies[1], w * 2, 0, w, h);

  senders[0].sendTexture(curCam);    
  //senders[1].sendTexture(movies[0]);    
  //senders[2].sendTexture(movies[1]);    
}

void keyPressed() {
  if(key == '1') {
    cam[0].start();
    curCam = cam[0];
    cam[1].stop();
  }
  if(key == '2') {
    cam[1].start();
    curCam = cam[1];
    cam[0].stop();
  }
}