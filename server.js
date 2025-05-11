import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 3000;
const DATA_FILE = "./proverbs.json";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

function readData() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/proverbs", (req, res) => {
  const data = readData();
  res.json(data);
});

app.get("/proverbs/:id", (req, res) => {
  const data = readData();
  const proverb = data.find((p) => p.id === parseInt(req.params.id));
  if (proverb) {
    res.json(proverb);
  } else {
    res.status(404).json({ message: "Proverb not found" });
  }
});

app.post("/proverbs", (req, res) => {
  const data = readData();
  const newProverb = {
    id: data.length ? data[data.length - 1].id + 1 : 1,
    ...req.body,
  };
  data.push(newProverb);
  writeData(data);
  res.status(201).json(newProverb);
});

app.put("/proverbs/:id", (req, res) => {
  const data = readData();
  const index = data.findIndex((p) => p.id === parseInt(req.params.id));
  if (index !== -1) {
    data[index] = { id: parseInt(req.params.id), ...req.body };
    writeData(data);
    res.json(data[index]);
  } else {
    res.status(404).json({ message: "Proverb not found" });
  }
});

app.delete("/proverbs/:id", (req, res) => {
  let data = readData();
  const index = data.findIndex((p) => p.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = data.splice(index, 1);
    writeData(data);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ message: "Proverb not found" });
  }
});

app.get("/proverbs/random", (req, res) => {
  const data = readData();
  const randomProverb = data[Math.floor(Math.random() * data.length)];
  res.json(randomProverb);
});

// فیلتر بر اساس دسته‌بندی
app.get("/proverbs/category/:category", (req, res) => {
  const data = readData();
  const filtered = data.filter((p) => p.category === req.params.category);
  res.json(filtered);
});

app.get("/proverbs/search/:keyword", (req, res) => {
  const data = readData();
  const keyword = req.params.keyword.toLowerCase();
  const results = data.filter(
    (p) =>
      p.textDari.toLowerCase().includes(keyword) ||
      p.textPashto.toLowerCase().includes(keyword) ||
      p.translationEn.toLowerCase().includes(keyword)
  );
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
