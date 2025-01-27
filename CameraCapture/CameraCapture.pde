import spout.*;

int nSenders = 3;
PGraphics camCanvas;
Spout[] senders;
Spout senderof;
color[] colors;

import processing.video.*;

Capture[] cam = new Capture[2];
Capture curCam;

JSONObject json;

public Movie[] movies = new Movie[2];

int w = 640;
int h = 480;
void setup() {
  size(960, 240, P3D);

  json = loadJSONObject(dataPath("settings.json"));

  String[] cameras = Capture.list();

  if (cameras == null) {
    println("Failed to retrieve the list of available cameras, will try the default...");
    cam[0] = new Capture(this, w, h);
  } 
  if (cameras.length == 0) {
    println("There are no cameras available for capture.");
    exit();
  } else {
    println("Available cameras:");
    printArray(cameras);

    // The camera can be initialized directly using an element
    // from the array returned by list():
    cam[0] = new Capture(this, 1920, 1080, "USB Capture HDMI", 60);
    //cam[0] = new Capture(this, w, h, "USB Capture HDMI", 60);
    cam[1] = new Capture(this, w, h, "Logitech Webcam C925e", 30);
    // Or, the settings can be defined based on the text in the list
    //cam = new Capture(this, 640, 480, "Built-in iSight", 30);

    // Start capturing the images from the camera
    cam[0].start();
    cam[1].stop();
    curCam = cam[0];
  }

  camCanvas = createGraphics(w, h, P2D);

  movies[0] = new Movie(this, "191217_bl.mp4");  
  movies[1] = new Movie(this, "191217_wl.mp4");  

  for (int i = 0; i < movies.length; i++) {
    movies[i].play();
    movies[i].jump(0);
    movies[i].speed(1);
    movies[i].loop();
    movies[i].volume(0);
    movies[i].pause();
  }

  // Create Spout senders to send frames out.
  senders = new Spout[nSenders];
  for (int i = 0; i < nSenders; i++) { 
    senders[i] = new Spout(this);
    String sendername = "CameraCapture"+i;
    senders[i].createSender(sendername, w, h);
  }
  senderof = new Spout(this);
  senderof.createSender("of-videoin", w, h);

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

  if (curCam == cam[0]) {
    int cx = json.getInt("cx");
    int cy = json.getInt("cy");
    int rw = json.getInt("w");
    int rh = json.getInt("h");
    int rx = cx - rw / 2;
    int ry = cy - rh / 2;
    camCanvas.beginDraw();
    camCanvas.image(curCam, 0, 0, w, h, rx, ry, rw+rx, rh+ry);
    camCanvas.endDraw();
    scale(0.5, 0.5);
    push();
    image(curCam, 0, 0, w, h);
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    scale(w/1920.0, h/1080.0); // BAD!!!
    rect(rx, ry, rw, rh);
    pop();
    //image(movies[0], w, 0, w, h);
    //image(movies[1], w * 2, 0, w, h);
  }
  else {
    camCanvas.beginDraw();
    camCanvas.translate(w/2,h/2);
    camCanvas.scale(2,2);
    camCanvas.translate(-w/2,-h/2);
    camCanvas.image(curCam, 0, 0, w, h);
    camCanvas.endDraw();
  }
  image(camCanvas, w, 0, w, h);
  image(movies[0], w * 2, 0, w, h);

  senders[0].sendTexture(camCanvas);
  senderof.sendTexture(camCanvas);
  //senders[1].sendTexture(movies[0]);    
  //senders[2].sendTexture(movies[1]);
}

void keyPressed() {
  json = loadJSONObject(dataPath("settings.json"));

  if (key == '1') {
    cam[0].start();
    curCam = cam[0];
    cam[1].stop();
  }
  if (key == '2') {
    cam[1].start();
    curCam = cam[1];
    cam[0].stop();
  }
}
