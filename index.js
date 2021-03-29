const express = require("express");
const expressFileUpload = require("express-fileupload");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin");

ffmpeg.setFlvtoolPath("C:/flvtool");

console.log(ffmpeg);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/convert", (req, res) => {
  const to = req.body.to;
  const file = req.files.file;
  const fileName = `output.${to}`;
  console.log(to);
  console.log(file);

  file.mv("tmp/" + file.name, function (err) {
    if (err) return res.sendStatus(500).send(err);
    console.log("File Uploaded successfully");
  });

  ffmpeg("tmp/" + file.name)
    .withOutputFormat(to)
  .on("end", (stdout, stderr) => {
    console.log("Finished");
    res.download(__dirname + fileName, function (err) {
        if (err) throw err;

        fs.unlink(__dirname + fileName, function (err) {
          if (err) throw err;
          console.log("File deleted");
        });
    });

    fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
    });
  })
  .on("error", (err) => {
    console.log("Error takes place");

    fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
    });
  })
.saveToFile(__dirname + fileName)
});

app.listen(4000, () => console.log("Server is listening on port 4000"));
