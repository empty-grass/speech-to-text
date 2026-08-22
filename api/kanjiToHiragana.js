/**
 * Lambda function
 *
 * テキスト内の漢字を平仮名へ変換する
 * Yahoo ルビ振り(V2)APIを用いる
 * https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html
 */
export const handler = async (event) => {
  // POSTパラメータ取得
  console.log('value =', event);
  let params = JSON.parse(event['body']);
  if (params.query == null) {
    return responseError(new Error('Validation Error query: null/undefined'), 400, 'テキストが設定されていません。');
  }
  if (params.grade == null) {
    return responseError(new Error('Validation Error query: null/undefined'), 400, '学年が設定されていません。');
  }
  if (!Number.isInteger(params.grade) || params.grade < 1 || params.grade > 8) {
    return responseError(new Error(`Validation Error query: ${params.grade}`), 400, '学年が不正です。');
  }

  // ルビ振りAPIへのリクエスト
  const APPID = 'XXX'; // CLIENT ID
  const URL = 'https://jlp.yahooapis.jp/jsonrpc';
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': `Yahoo AppID: ${APPID}`
  };
  const paramDic = {
    id: '1234-1',
    jsonrpc: '2.0',
    method: 'jlp.furiganaservice.furigana',
    params: {
      q: params.query,
      grade: params.grade
    }
  };

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(paramDic)
    });
    if (!response.ok) {
      return responseError(new Error(`HTTP Error ${response.status} (${response.statusText}): ${errorBody}`), response.statusCode, 'HTTPエラーが発生しました。');
    }
    const body = await response.json();

    // レスポンス用テキストへ変換
    let formatedText = '';
    body.result.word.forEach(element => {
      if (element.furigana) formatedText = formatedText + element.furigana;
      else formatedText = formatedText + element.surface;
    });

    return {
      result: formatedText
    };
  } catch (e) {
    return responseError(e, 500, '外部APIリクエスト処理にてエラーが発生しました。');
  }
};

function responseError(error, statusCode, message) {
  console.error(error);
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      error: message
    })
  };
}