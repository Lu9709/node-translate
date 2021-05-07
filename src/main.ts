import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

const errorMap = {
  52000:'成功',
  52001:'请求超时',
  52002:'系统错误',
  52003:'未授权用户',
  54000:'必填参数为空',
  54001:'签名错误',
  54003:'访问频率受限',
  54004:'账户余额不足',
  54005:'长query请求频繁',
  58000:'客户端IP非法',
  58001:'译文语言方向不支持',
  58002:'服务当前已关闭',
  90107:'认证未通过或未生效',
  unknown: '服务器繁忙'
}

export const translate = (word) => {
  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  let from,to
  if(/[a-zA-Z]/.test(word[0])) {
    //英译中
    from = 'en';
    to = 'zh'

  }else {
    //中译英
    from = 'zh';
    to = 'en'
  }
  const query: string = querystring.stringify({
    q: word, from, to, appid:appId, salt, sign
  });

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let chunks = [];
    response.on('data', (chunk) => {
      chunks.push(chunk);
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString();
      //声明类型
      type BaiduResult = {
        from: string,
        to: string,
        trans_result: { src: string; dst: string }[],// trans_result 是一个数组
        error_code?: string // code可能没有
        error_msg?: string
      }
      const object: BaiduResult = JSON.parse(string);
      if (object.error_code) {
        console.log(errorMap[object.error_code] || object.error_msg);// 表驱动编程
        process.exit(2);//退出当前进程
      } else {
        console.log(object.trans_result[0].dst);
        process.exit(0);
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};