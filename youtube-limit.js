// 参数说明：time=1800（30分钟，单位：秒）
const TIME_LIMIT = parseInt($argument.time) || 60;
const YOUTUBE_DOMAINS = ["googlevideo.com", "youtubei.googleapis.com"];

let startTime = 0;
let isYouTubeActive = false;

function checkYouTubeTraffic() {
  const now = Date.now() / 1000;
  const session = $network.session;

  // 检测当前活跃连接是否属于YouTube
  let youtubeTraffic = false;
  for (const conn of session.connections) {
    if (YOUTUBE_DOMAINS.some(domain => conn.domain.includes(domain))) {
      youtubeTraffic = true;
      break;
    }
  }

  // 状态切换逻辑
  if (youtubeTraffic) {
    if (!isYouTubeActive) {
      startTime = now; // 开始计时
      isYouTubeActive = true;
    } else if (now - startTime >= TIME_LIMIT) {
      // 超时后添加REJECT规则
      $surge.setSelectGroupPolicy("PROXY", "REJECT");
      $notification.post("YouTube时间限制", "已连续使用30分钟，网络已断开", "");
      $panel.content = `已限制: ${Math.floor(TIME_LIMIT/60)}分钟`;
    }
  } else {
    isYouTubeActive = false; // 重置计时
    $panel.content = `已监控: ${Math.floor((now - startTime)/60)}分钟`;
  }

  $done();
}

// 每10秒检查一次
$surge.setInterval(checkYouTubeTraffic, 10);
