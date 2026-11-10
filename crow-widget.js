// クロウの「いま何してる？」ウィジェット (Scriptable用)
// GitHub (hiyori-labo/crow-widget) の now.json を読み、
// 中の画像(Base64)と「場所＋一言ログ」を表示する。

const JSON_URL = "https://raw.githubusercontent.com/hiyori-labo/crow-widget/main/now.json";

async function build() {
  const w = new ListWidget();
  w.setPadding(0, 0, 0, 0);

  let data = null;
  try {
    const req = new Request(JSON_URL + "?t=" + Date.now());
    data = await req.loadJSON();
  } catch (e) {
    data = null;
  }

  // 背景画像 (Base64から復元)
  if (data && data.imageBase64) {
    try {
      const imgData = Data.fromBase64String(data.imageBase64);
      const img = Image.fromData(imgData);
      if (img) w.backgroundImage = img;
    } catch (e) {
      w.backgroundColor = new Color("#1c1a17");
    }
  } else {
    w.backgroundColor = new Color("#1c1a17");
  }

  // 下部グラデーション
  const grad = new LinearGradient();
  grad.colors = [new Color("#000000", 0), new Color("#000000", 0.55)];
  grad.locations = [0.45, 1.0];
  w.backgroundGradient = grad;

  w.addSpacer();

  const pad = w.addStack();
  pad.layoutVertically();
  pad.setPadding(0, 14, 12, 14);

  function addLine(text, font, color) {
    const t = pad.addText(text || "");
    t.font = font;
    t.textColor = color;
    t.shadowColor = new Color("#000000", 0.6);
    t.shadowRadius = 3;
    t.shadowOffset = new Point(0, 1);
    return t;
  }

  addLine(data ? data.timeLabel : "", Font.boldSystemFont(22), Color.white());
  addLine(data ? data.place : "クロウ", Font.boldSystemFont(13), Color.white());
  addLine(data ? data.line : "……", Font.systemFont(12), new Color("#f0e9dd"));

  // 30分後に再読み込みを促す
  w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
  return w;
}

const widget = await build();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentLarge();
}
Script.complete();
