// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/通用.png",
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
    __flowNode("node-mw5yl31w-36ixx");
    for (var __flow_node_mw5yl31w_36ixx = 0; ; __flow_node_mw5yl31w_36ixx++) {
        if (__flow_node_mw5yl31w_36ixx > 0) sleep(300);
        __flowNode("node-mw5ylgpc-nxnq6");
        var __flow_node_mw5ylgpc_nxnq6 = __flowImage("images\/通用.png", 5000, 300, { threshold: 0.9 });
        if (__flow_node_mw5ylgpc_nxnq6 && !click(__flow_node_mw5ylgpc_nxnq6.x, __flow_node_mw5ylgpc_nxnq6.y)) throw Error('点击失败');
    }
}
