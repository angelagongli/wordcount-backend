const path = require("path");
const child_process = require("child_process");
const formidable = require("formidable");
const router = require("express").Router();
const db = require("../models");

router.get("/api/papers", function(req, res) {
  db.Paper.findOne().then(dbPaper => {
    res.json(dbPaper);
  });
});

router.post("/api/papers", function(req, res) {
  const form = formidable({ uploadDir: path.join(__dirname, "../pdfs")});
  form.parse(req, (err, fields, files) => {    
    const output = {
      text: "",
      count: 0
    };

    const pdftotext = child_process.spawn('pdftotext', [files.upload.path, '-']);
    const wc = child_process.spawn('wc', ['-w']);

    pdftotext.stdout.on('data', (data) => {
      wc.stdin.write(data);
      output.text = "..." + data.toString();
    });
    
    pdftotext.stderr.on('data', (data) => {
      console.error(`pdftotext stderr: ${data}`);
    });
    
    pdftotext.on('close', (code) => {
      if (code !== 0) {
        console.log(`pdftotext process exited with code ${code}`);
      }
      wc.stdin.end();
    });
    
    wc.stdout.on('data', (data) => {
      output.count = parseInt(data.toString());
      db.Paper.create({
        fileName: files.upload.name,
        path: files.upload.path,
        text: output.text,
        wordCount: output.count
      }).then(dbPaper => {
        console.log("new paper: " + JSON.stringify(dbPaper));
        res.redirect("/");
      });
    });
    
    wc.stderr.on('data', (data) => {
      console.error(`wc stderr: ${data}`);
    });
    
    wc.on('close', (code) => {
      if (code !== 0) {
        console.log(`wc process exited with code ${code}`);
      }
    });
  });
});
  
router.delete("/api/papers/:id", function(req, res) {
  db.Paper.findOne({
    where: {
      id: req.params.id
    }
  }).then(dbPaper => {
    const rm = child_process.spawn('rm', [dbPaper.path]);
    
    rm.on('close', (code) => {
      if (code !== 0) {
        console.log(`rm process exited with code ${code}`);
      }
    });
    
    db.Paper.destroy({
      where: {
        id: req.params.id
      }
    }).then(data => {
      res.json(data);
    });
  });
});
    
router.use(function(req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

module.exports = router;
