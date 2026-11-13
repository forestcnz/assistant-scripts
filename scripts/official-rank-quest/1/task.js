// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/中心龙头.png",
        "images\/吏部尚书.png",
        "images\/领取官职任务.png",
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
    __flowNode("node-mw7nmoki-mbkfc");
    for (var __flow_node_mw7nmoki_mbkfc = 0; ; __flow_node_mw7nmoki_mbkfc++) {
        if (__flow_node_mw7nmoki_mbkfc > 0) sleep(300);
        __flowNode("node-mw7nmr5t-4r7ic");
        if (!!__flowImage("images\/中心龙头.png", 0, 300, { threshold: 0.7 })) {
            __flowNode("node-mw7nnpzj-n34hp");
            var __flow_node_mw7nnpzj_n34hp = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.8 });
            if (__flow_node_mw7nnpzj_n34hp && !click(__flow_node_mw7nnpzj_n34hp.x, __flow_node_mw7nnpzj_n34hp.y)) throw Error('点击失败');
            __flowNode("node-mw7nok34-dla8k");
            sleep(6000);
            __flowNode("node-mw7nopam-ytpnm");
            break;
        } else {
            __flowNode("node-mw8zmicl-1-hetta");
            __flowNode("node-mw8zmicl-2-hbo5o");
            if (!click(1778, 24, 50)) throw Error('操作失败');
            __flowNode("node-mw8zmicl-3-q61l0");
            sleep(1000);
            __flowNode("node-mw8zmicl-4-32fc9");
            if (!click(1103, 760, 50)) throw Error('操作失败');
            __flowNode("node-mw8zmicl-5-bkxsq");
            sleep(1000);
        }
    }
    __flowNode("node-mw7nr3of-2qzon");
    if (!click(1619, 129, 50)) throw Error('操作失败');
    __flowNode("node-mw7nw0ao-hbn3x");
    sleep(3000);
    __flowNode("node-mw7nvs5b-je7sd");
    if (!click(1619, 129, 50)) throw Error('操作失败');
    __flowNode("node-mw7nribw-afm89");
    sleep(1000);
    __flowNode("node-mw7o6u09-mr47l");
    var __flow_node_mw7o6u09_mr47l = __flowImage("images\/吏部尚书.png", 10000, 300, { threshold: 0.8 });
    if (__flow_node_mw7o6u09_mr47l && !click(__flow_node_mw7o6u09_mr47l.x, __flow_node_mw7o6u09_mr47l.y)) throw Error('点击失败');
    __flowNode("node-mw7obdkc-8e7et");
    sleep(5000);
    __flowNode("node-mw7oastb-s06aa");
    var __flow_node_mw7oastb_s06aa = __flowImage("images\/领取官职任务.png", 5000, 300, { threshold: 0.8 });
    if (__flow_node_mw7oastb_s06aa && !click(__flow_node_mw7oastb_s06aa.x, __flow_node_mw7oastb_s06aa.y)) throw Error('点击失败');
    __flowNode("node-mw8xs3xu-hd78e");
    sleep(500);
    __flowNode("node-mw7od22t-es2c9");
    if (!click(830, 562, 50)) throw Error('操作失败');
}
