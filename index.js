const dns = require("dns");
const express = require("express");
const cors = require("cors");
const url = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

const shortUrlMap = {};
let index = 0;

app.post("/api/shorturl", (req, res, next) => {
  const { url: original_url } = req.body;

  dns.lookup(url.parse(original_url).hostname, (err, address) => {
    if (err || !address) {
      return next({ message: "invalid url" });
    }

    const short_url = ++index;

    if (original_url) {
      shortUrlMap[short_url] = original_url;
    }

    res.json({
      original_url,
      short_url,
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res, next) => {
  const { short_url } = req.params;
  const original_url = shortUrlMap[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    next({ message: "No original url" });
  }
});

app.use((err, req, res, next) => {
  res.json({
    error: err.message,
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
