// src/utils/screenRecorder.ts

let screenRecorder: MediaRecorder | null = null;
let screenChunks: Blob[] = [];

export const startScreenRecording = async (stream: MediaStream) => {
  screenChunks = [];

  let combinedStream = stream;
  try {
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const audioTrack = micStream.getAudioTracks()[0];
    if (audioTrack) {
      combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...stream.getAudioTracks(),
        audioTrack,
      ]);
    }
  } catch (err) {
    console.warn("Mic audio not available, continuing without it:", err);
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : "video/webm";

  screenRecorder = new MediaRecorder(combinedStream, { mimeType });

  screenRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) screenChunks.push(e.data);
  };

  screenRecorder.start(1000);
};

export const stopScreenRecording = (): Promise<Blob> => {
  return new Promise((resolve) => {
    if (!screenRecorder) return resolve(new Blob());

    screenRecorder.onstop = () => {
      resolve(new Blob(screenChunks, { type: "video/webm" }));
    };

    screenRecorder.stop();
  });
};