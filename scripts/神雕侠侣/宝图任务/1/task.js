// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/中心龙头.png",
        "images\/店小二.png",
        "images\/领取宝图任务.png",
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
    __flowNode("node-mw7pbi2r-hn6te");
    for (var __flow_node_mw7pbi2r_hn6te = 0; ; __flow_node_mw7pbi2r_hn6te++) {
        if (__flow_node_mw7pbi2r_hn6te > 0) sleep(300);
        __flowNode("node-mw7pbni8-q98ju");
        if (!!__flowImage("images\/中心龙头.png", 0, 300, { threshold: 0.7 })) {
            __flowNode("node-mw7pca3l-k8232");
            var __flow_node_mw7pca3l_k8232 = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.8 });
            if (__flow_node_mw7pca3l_k8232 && !click(__flow_node_mw7pca3l_k8232.x, __flow_node_mw7pca3l_k8232.y)) throw Error('点击失败');
            __flowNode("node-mw7pcmy2-s54q4");
            sleep(5000);
            __flowNode("node-mw7pcy1u-jcsxh");
            break;
        } else {
            __flowNode("node-mw8zn2as-6-zv7x2");
            __flowNode("node-mw8zn2as-7-bfvwk");
            if (!click(1778, 24, 50)) throw Error('操作失败');
            __flowNode("node-mw8zn2as-8-e3f74");
            sleep(1000);
            __flowNode("node-mw8zn2as-9-s2tda");
            if (!click(1103, 760, 50)) throw Error('操作失败');
            __flowNode("node-mw8zn2as-a-82fzh");
            sleep(1000);
        }
    }
    __flowNode("node-mw7u5taw-po41q");
    if (!click(586, 914, 50)) throw Error('操作失败');
    __flowNode("node-mw7u6m5n-z8ohm");
    sleep(4000);
    __flowNode("node-mw7u6q7q-r4ust");
    if (!click(441, 804, 50)) throw Error('操作失败');
    __flowNode("node-mw7u7jx4-csks8");
    sleep(4000);
    __flowNode("node-mw7u860h-u898w");
    if (!click(441, 804, 50)) throw Error('操作失败');
    __flowNode("node-mw7u8z8u-imbru");
    sleep(3000);
    __flowNode("node-mw7u8tkw-akvfh");
    if (!click(441, 804, 50)) throw Error('操作失败');
    __flowNode("node-mw7ub0xi-g0k44");
    sleep(3000);
    __flowNode("node-mw7ub7yw-w64qh");
    var __flow_node_mw7ub7yw_w64qh = __flowImage("images\/店小二.png", 15000, 300, { threshold: 0.7 });
    if (__flow_node_mw7ub7yw_w64qh && !click(__flow_node_mw7ub7yw_w64qh.x, __flow_node_mw7ub7yw_w64qh.y)) throw Error('点击失败');
    __flowNode("node-mw7ux3i9-4zadg");
    sleep(2000);
    __flowNode("node-mw7ue0uu-8x43i");
    var __flow_node_mw7ue0uu_8x43i = __flowImage("images\/领取宝图任务.png", 5000, 300, { threshold: 0.9 });
    if (__flow_node_mw7ue0uu_8x43i && !click(__flow_node_mw7ue0uu_8x43i.x, __flow_node_mw7ue0uu_8x43i.y)) throw Error('点击失败');
    __flowNode("node-mw7uxbel-46tnd");
    sleep(1000);
    __flowNode("node-mw7ugckm-zrzz4");
    var __flow_node_mw7ugckm_zrzz4 = __flowText("宝图任务", { timeoutMs: 5000, intervalMs: 300, match: "contains" });
    if (__flow_node_mw7ugckm_zrzz4 && !click(__flow_node_mw7ugckm_zrzz4.centerX(), __flow_node_mw7ugckm_zrzz4.centerY())) throw Error('点击失败');
    __flowNode("node-mw7ujmpq-9k1bi");
    sleep(300000);
}
