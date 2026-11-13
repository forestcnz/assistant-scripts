const template = images.read("images/示例图案.png");
const canvas = images.read("images/示例画面.png");
if (!template || !canvas) throw Error("找不到演示素材");
const point = images.findImage(canvas, template, { threshold: 0.95 });
log(point ? "已匹配，中心：" + point.x + ", " + point.y : "未匹配");
images.releaseAll(template, canvas);
