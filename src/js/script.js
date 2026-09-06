/** 音声認識処理 */

// SpeechRecognition オブジェクトの取得
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// 音声認識設定
recognition.lang = 'ja-JP';
recognition.interimResults = false;
recognition.continuous = true;

let query = "";
let startButton = document.getElementById('start');
let stopButton = document.getElementById('stop');
let mic = document.getElementById('mic');
let wait = document.getElementById('wait');
let error = document.getElementById('error');
let output = document.getElementById('output');

recognition.onstart = () => {
  console.log('音声認識を開始しました。');
  query = "";
  output.innerText = "";
};

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  console.log('認識結果: ', transcript);
  query += transcript;
};

recognition.onerror = (event) => {
  console.error('エラーが発生しました: ', event.error);
  console.log(event);
};

recognition.onend = async (event) => {
  console.log('音声認識が停止しました。');
  mic.style.display = 'none';
  wait.style.display = 'flex';
  let grade = parseInt(document.querySelector('input[name="grade"]:checked')?.value);
  console.log(query, grade);
  let result = await fetchFurigana(query, grade);
  if (result) {
    output.innerHTML = result;
  } else {
    error.style.display = 'flex';
  }
  wait.style.display = 'none';
  startButton.toggleAttribute('disabled');
  stopButton.toggleAttribute('disabled');
};

startButton.onclick = () => {
  startButton.toggleAttribute('disabled');
  mic.style.display = 'flex';
  error.style.display = 'none';
  recognition.start();
  stopButton.toggleAttribute('disabled');
};

stopButton.onclick = () => {
  recognition.stop();
};

/** 漢字かな変換処理 */
async function fetchFurigana(query, grade = 2) {
  if (!query) {
    return '';
  }

  const URL = "https://bfyczjwxz5ibu2ra4a2cpk6bq40tiays.lambda-url.ap-northeast-1.on.aws/";
  const headers = {
    "Content-Type": "application/json"
  };
  const params = {
    "query": query,
    "grade": grade
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
    return body.result;
  } catch (error) {
    throw new Error(error);
  }
}

/** レイアウトの縦/横変更処理 */
let changeLayoutButton = document.getElementById('change-layout');
changeLayoutButton.onclick = () => {
  document.getElementById('lh').toggleAttribute('disabled');
  document.getElementById('lv').toggleAttribute('disabled');
}