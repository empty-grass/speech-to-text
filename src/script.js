/** 音声認識処理 */

// SpeechRecognition オブジェクトの取得
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// 日本語の設定
recognition.lang = 'ja-JP';
recognition.interimResults = false; // 認識途中の結果も取得する
recognition.continuous = true; // 継続して認識する

let result = "";
let startButton = document.getElementById('start');
let stopButton = document.getElementById('stop');
let output = document.getElementById('output');

recognition.onstart = () => {
  console.log('音声認識を開始しました。');
  result = "";
  output.innerText = "";
};

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  console.log('認識結果: ', transcript);
  result += transcript;
};

recognition.onerror = (event) => {
  console.error('エラーが発生しました: ', event.error);
  console.log(event);
};

recognition.onend = (event) => {
  console.log('音声認識が停止しました。');
};

startButton.onclick = async () => {
  // recognition.start();
  console.log(await fetchFurigana('フロントからの文章です'));
};

stopButton.onclick = () => {
  recognition.stop();
  output.innerText = result;
};

/** 漢字かな変換処理 */
async function fetchFurigana(target) {
  const URL = "https://bfyczjwxz5ibu2ra4a2cpk6bq40tiays.lambda-url.ap-northeast-1.on.aws/";
  const headers = {
    "Content-Type": "application/json"
  };
  const params = {
    "query": target,
    "grade": 1
  };

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error(response.error);
    }
    const body = await response.json();
    return body;
  } catch (error) {
    throw new Error(error);
  }
}