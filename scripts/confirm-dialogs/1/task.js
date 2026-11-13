// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/同意.png",
        "images\/同意2.png",
        "images\/归队确定.png",
        "images\/组队确定.png",
        "images\/确定2.png",
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
    __flowNode("node-mw690cpu-v6at4");
    for (var __flow_node_mw690cpu_v6at4 = 0; ; __flow_node_mw690cpu_v6at4++) {
        if (__flow_node_mw690cpu_v6at4 > 0) sleep(300);
        __flowNode("node-mw690i6q-73b5m");
        var __flow_node_mw690i6q_73b5m = __flowImage("images\/同意.png", 100, 100, { threshold: 0.8 });
        if (__flow_node_mw690i6q_73b5m && !click(__flow_node_mw690i6q_73b5m.x, __flow_node_mw690i6q_73b5m.y)) throw Error('点击失败');
        __flowNode("node-mw690j92-ca3a5");
        var __flow_node_mw690j92_ca3a5 = __flowImage("images\/同意2.png", 100, 100, { threshold: 0.8 });
        if (__flow_node_mw690j92_ca3a5 && !click(__flow_node_mw690j92_ca3a5.x, __flow_node_mw690j92_ca3a5.y)) throw Error('点击失败');
        __flowNode("node-mw690lu8-qg4uq");
        var __flow_node_mw690lu8_qg4uq = __flowImage("images\/归队确定.png", 100, 100, { threshold: 0.8 });
        if (__flow_node_mw690lu8_qg4uq && !click(__flow_node_mw690lu8_qg4uq.x, __flow_node_mw690lu8_qg4uq.y)) throw Error('点击失败');
        __flowNode("node-mw690k7n-i2xg9");
        var __flow_node_mw690k7n_i2xg9 = __flowImage("images\/组队确定.png", 100, 100, { threshold: 0.8 });
        if (__flow_node_mw690k7n_i2xg9 && !click(__flow_node_mw690k7n_i2xg9.x, __flow_node_mw690k7n_i2xg9.y)) throw Error('点击失败');
        __flowNode("node-mw690l12-uv314");
        var __flow_node_mw690l12_uv314 = __flowImage("images\/组队确定.png", 100, 100, { threshold: 0.8 });
        if (__flow_node_mw690l12_uv314 && !click(__flow_node_mw690l12_uv314.x, __flow_node_mw690l12_uv314.y)) throw Error('点击失败');
        __flowNode("node-mw6eglr5-oaemg");
        var __flow_node_mw6eglr5_oaemg = __flowImage("images\/确定2.png", 5000, 300, { threshold: 0.9 });
        if (__flow_node_mw6eglr5_oaemg && !click(__flow_node_mw6eglr5_oaemg.x, __flow_node_mw6eglr5_oaemg.y)) throw Error('点击失败');
    }
}
