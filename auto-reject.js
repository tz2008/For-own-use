// 参数说明：
// - time=1800（30分钟，单位：秒）
// - group=PROXY（要监控的 Proxy Group 名称）

const TIME_LIMIT = parseInt($argument.time) || 1800; // 默认30分钟
const TARGET_GROUP = $argument.group || "PROXY"; // 默认监控 PROXY 组

let startTime = Date.now() / 1000; // 记录脚本启动时间（Unix 时间戳，秒）
let lastTraffic = 0; // 上一次记录的流量（Bytes）

function checkTraffic() {
  // 获取当前 Proxy Group 的流量统计
  const stats = $surge.selectGroupDetails().groups[𝐘𝐨𝐮𝐓𝐮𝐛𝐞];
  if (!stats) {
    $notification.post("错误", `未找到 Proxy Group: ${𝐘𝐨𝐮𝐓𝐮𝐛𝐞}`, "");
    $done();
    return;
  }

  const currentTraffic = stats.upload + stats.download; // 当前总流量（Bytes）
  const isActive = (currentTraffic > lastTraffic); // 是否有新流量

  if (isActive) {
    const now = Date.now() / 1000;
    const duration = now - startTime; // 已连续使用时间（秒）

    if (duration >= TIME_LIMIT) {
      // 超过30分钟，切换至 REJECT
      $surge.setSelectGroupPolicy(𝐘𝐨𝐮𝐓𝐮𝐛𝐞, "REJECT");
      $notification.post("自动切换", `连续使用 ${TIME_LIMIT/60} 分钟，已切换至 REJECT`, "");
    }
  } else {
    // 无新流量，重置计时器
    startTime = Date.now() / 1000;
  }

  lastTraffic = currentTraffic;
  $done();
}

// 每60秒检查一次
$surge.setInterval(checkTraffic, 60);
