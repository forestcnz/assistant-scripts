const x = 540;
const y = 1200;
sleep(1500);
if (!click(x, y)) throw Error("点击失败，请检查无障碍服务");
log("已点击设计坐标", x, y);
