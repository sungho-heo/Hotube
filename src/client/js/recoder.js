import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";


const recoderBtn = document.getElementById("recoderBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;
const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
};


const downloadUrl = (fileUrl, filename) => {

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = filename;
    a.click();
};


const handleDownload = async () => {

    recoderBtn.removeEventListener("click", handleDownload);
    recoderBtn.innerText = "Transcording ...";
    recoderBtn.disable = true;

    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    await ffmpeg.run("-i", files.input, "-r", "60", files.output);
    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-vframes", "1", files.thumb);

    const mp4File = ffmpeg.FS("readFile", files.output);
    const thumbFile = ffmpeg.FS("readFile", files.thumb);

    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumbBlob);

    downloadUrl(mp4Url, "Myrecording.mp4");
    downloadUrl(thumbUrl, "Mythumbnail.jpg");

    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);
    URL.revokeObjectURL(videoFile);

    recoderBtn.innerText = "Recoder Again";
    recoderBtn.disabled = false;
    recoderBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
    recoderBtn.innerText = "Download"
    recoderBtn.removeEventListener("click", handleStop)
    recoderBtn.addEventListener("click", handleDownload)
    recorder.stop()
};

const handleStart = () => {
    recoderBtn.innerText = "Stop Recording"
    recoderBtn.removeEventListener("click", handleStart)
    recoderBtn.addEventListener("click", handleStop)
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" })
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data)
        video.srcObject = null
        video.src = videoFile
        video.loop = true
        video.play()
    }
    recorder.start()
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: 1024,
            height: 526,
        }
    })
    video.srcObject = stream
    video.play()
};

init();

recoderBtn.addEventListener("click", handleStart);
