// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/竞技场入口图片.png",
        "images\/随机战.png",
        "images\/次数耗尽.png",
        "images\/战斗中.png",
        "images\/战败.png",
    ]) {
        __flowTemplates[__flowPath] = images.read(__flowPath);
    }
    __flowMain();
} finally {
    images.releaseAll(__flowTemplates);
}

function __flowImage(path, timeoutMs, intervalMs, options) {
    if (!requestScreenCapture()) throw Error('截屏不可用');
    var template = __flowTemplates[path];
    if (!template) return null;
    return waitImage(template, timeoutMs / 1000, intervalMs / 1000, options);
}
function __flowText(text, options) {
    if (!requestScreenCapture()) throw Error('截屏不可用');
    if (options.match === 'exact') {
        var started = __flowNow();
        var wanted = text.trim().toLowerCase();
        while (true) {
            var shot = captureScreen();
            if (!shot) throw Error('截图失败');
            try {
                var lines = ocr.recognize(shot, options.region ? { region: options.region } : {});
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].text.trim().toLowerCase() === wanted) return lines[i];
                }
            } finally { images.release(shot); }
            if (__flowNow() - started >= options.timeoutMs) return null;
            sleep(options.intervalMs);
        }
    }
    var result = waitText(text, options);
    if (result.reason === 'capture_error' || result.reason === 'ocr_error' || result.reason === 'invalid_argument')
        throw Error(result.lastError || result.reason);
    return result.value;
}
function __flowWaitCondition(check, timeoutMs, intervalMs) {
    if (!requestScreenCapture()) throw Error('截屏不可用');
    var started = __flowNow();
    while (true) {
        if (check()) return true;
        if (__flowNow() - started >= timeoutMs) return false;
        sleep(intervalMs);
    }
}
function __flowWaitImageGone(path, timeoutMs, intervalMs, options) {
    if (!requestScreenCapture()) throw Error('截屏不可用');
    var template = __flowTemplates[path];
    if (!template) throw Error('图片素材不存在');
    var started = __flowNow();
    while (true) {
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        var exists = false;
        try { exists = images.existsImage(shot, template, options); }
        finally { images.release(shot); }
        if (!exists) return true;
        if (__flowNow() - started >= timeoutMs) return false;
        sleep(intervalMs);
    }
}
function __flowMultiImage(entries, mode, timeoutMs, intervalMs, options) {
    if (!requestScreenCapture()) throw Error('截屏不可用');
    var started = __flowNow();
    while (true) {
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        var first = null, matched = 0;
        try {
            for (var i = 0; i < entries.length; i++) {
                var template = __flowTemplates[entries[i].path];
                if (!template) throw Error('图片素材不存在：' + entries[i].path);
                var point = images.findImage(shot, template, Object.assign({}, options, { threshold: entries[i].threshold }));
                if (point) {
                    matched++;
                    if (!first) first = point;
                }
            }
        } finally { images.release(shot); }
        if (mode === 'any' && first) return first;
        if (mode === 'all' && matched === entries.length) return first;
        if (__flowNow() - started >= timeoutMs) return null;
        sleep(intervalMs);
    }
}
function __flowMain() {
    __flowNode("node-mw5z0ezl-miko9");
    for (var __flow_node_mw5z0ezl_miko9 = 0; ; __flow_node_mw5z0ezl_miko9++) {
        if (__flow_node_mw5z0ezl_miko9 > 0) sleep(300);
        if (!!__flowImage("images\/竞技场入口图片.png", 0, 300, { threshold: 0.9 })) break;
        __flowNode("node-mw8zo5yq-g-lxz3k");
        __flowNode("node-mw8zo5yq-h-lrkc1");
        if (!click(1778, 24, 50)) throw Error('操作失败');
        __flowNode("node-mw8zo5yq-i-o9e1a");
        sleep(1000);
        __flowNode("node-mw8zo5yq-j-mqjmp");
        if (!click(1103, 760, 50)) throw Error('操作失败');
        __flowNode("node-mw8zo5yq-k-a1uig");
        sleep(100);
    }
    __flowNode("node-mw5z8f6x-dg1vh");
    sleep(1000);
    __flowNode("node-mw5z37bv-09f2d");
    if (!click(1265, 42, 50)) throw Error('操作失败');
    __flowNode("node-mw5zjb18-1cl5a");
    sleep(1000);
    __flowNode("node-mw5zjqpe-rtidx");
    for (var __flow_node_mw5zjqpe_rtidx = 0; ; __flow_node_mw5zjqpe_rtidx++) {
        if (__flow_node_mw5zjqpe_rtidx > 0) sleep(300);
        __flowNode("node-mw5zk48q-2s5gr");
        var __flow_node_mw5zk48q_2s5gr = __flowImage("images\/随机战.png", 5000, 300, { threshold: 0.9 });
        if (__flow_node_mw5zk48q_2s5gr && !click(__flow_node_mw5zk48q_2s5gr.x, __flow_node_mw5zk48q_2s5gr.y)) throw Error('点击失败');
        __flowNode("node-mw5zl0j7-5i63g");
        sleep(500);
        __flowNode("node-mw5zq509-3dzeo");
        if (!!__flowImage("images\/次数耗尽.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mw5zqz5w-acxlf");
            if (!click(1198, 656, 50)) throw Error('操作失败');
            __flowNode("node-mw5zsbf2-bgezn");
            sleep(1000);
            __flowNode("node-mw5zrpu5-n4e45");
            if (!click(445, 738, 50)) throw Error('操作失败');
            __flowNode("node-mw5zsgon-sqsm1");
            sleep(1000);
            __flowNode("node-mw5zslcd-7ynnq");
            if (!click(1661, 90, 50)) throw Error('操作失败');
            __flowNode("node-mw5ztmqb-xfwc6");
            break;
        } else {
            __flowNode("node-mw5zr2bn-vwgj9");
            sleep(100);
        }
        __flowNode("node-mw5zlb6q-diq5q");
        for (var __flow_node_mw5zlb6q_diq5q = 0; ; __flow_node_mw5zlb6q_diq5q++) {
            if (__flow_node_mw5zlb6q_diq5q > 0) sleep(300);
            if (!(!!__flowImage("images\/战斗中.png", 0, 300, { threshold: 0.9 }))) break;
            __flowNode("node-mw5zm0uj-png8m");
            sleep(1000);
        }
        __flowNode("node-mw5zmzfk-jse87");
        if (!!__flowImage("images\/战败.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mw5zo47j-2v8n5");
            if (!click(1409, 341, 50)) throw Error('操作失败');
        } else {
            __flowNode("node-mw5zox3t-vae0j");
            sleep(100);
        }
        __flowNode("node-mw5zuz5e-uzxjz");
        continue;
    }
}
