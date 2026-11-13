// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/梦瑶.png",
        "images\/进入秘境.png",
        "images\/闯关.png",
        "images\/挑战.png",
        "images\/战胜确认.png",
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
    __flowNode("node-mw6aj875-tvzvr");
    if (!click(1777, 24, 50)) throw Error('操作失败');
    __flowNode("node-mw6ajcr4-dxc8y");
    sleep(1000);
    __flowNode("node-mw6aj9hh-2xjlk");
    if (!click(1472, 912, 50)) throw Error('操作失败');
    __flowNode("node-mw6alqid-mcrxy");
    var __flow_node_mw6alqid_mcrxy = __flowImage("images\/梦瑶.png", 5000, 300, { threshold: 0.7 });
    if (__flow_node_mw6alqid_mcrxy && !click(__flow_node_mw6alqid_mcrxy.x, __flow_node_mw6alqid_mcrxy.y)) throw Error('点击失败');
    __flowNode("node-mw6ase8f-hf4z7");
    sleep(4000);
    __flowNode("node-mw6asqf1-rl75e");
    var __flow_node_mw6asqf1_rl75e = __flowImage("images\/进入秘境.png", 5000, 300, { threshold: 0.9 });
    if (__flow_node_mw6asqf1_rl75e && !click(__flow_node_mw6asqf1_rl75e.x, __flow_node_mw6asqf1_rl75e.y)) throw Error('点击失败');
    __flowNode("node-mw6b6924-ei9us");
    sleep(1000);
    __flowNode("node-mw6awvvz-5vi74");
    var __flow_node_mw6awvvz_5vi74 = __flowImage("images\/闯关.png", 5000, 300, { threshold: 0.9 });
    if (__flow_node_mw6awvvz_5vi74 && !click(__flow_node_mw6awvvz_5vi74.x, __flow_node_mw6awvvz_5vi74.y)) throw Error('点击失败');
    __flowNode("node-mw6b6bdu-eaps5");
    sleep(1000);
    __flowNode("node-mw6atumz-tbqca");
    for (var __flow_node_mw6atumz_tbqca = 0; ; __flow_node_mw6atumz_tbqca++) {
        if (__flow_node_mw6atumz_tbqca > 0) sleep(300);
        __flowNode("node-mw6ax7lg-lt9hk");
        var __flow_node_mw6ax7lg_lt9hk = __flowImage("images\/挑战.png", 5000, 300, { threshold: 0.9 });
        if (__flow_node_mw6ax7lg_lt9hk && !click(__flow_node_mw6ax7lg_lt9hk.x, __flow_node_mw6ax7lg_lt9hk.y)) throw Error('点击失败');
        __flowNode("node-mw6ayavf-gxw49");
        sleep(2000);
        __flowNode("node-mw6b0z57-g6s7a");
        for (var __flow_node_mw6b0z57_g6s7a = 0; ; __flow_node_mw6b0z57_g6s7a++) {
            if (__flow_node_mw6b0z57_g6s7a > 0) sleep(300);
            if (!(!!__flowImage("images\/战胜确认.png", 0, 300, { threshold: 0.9 }))) break;
            __flowNode("node-mw6b1a41-he1sv");
            var __flow_node_mw6b1a41_he1sv = __flowImage("images\/战胜确认.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mw6b1a41_he1sv && !click(__flow_node_mw6b1a41_he1sv.x, __flow_node_mw6b1a41_he1sv.y)) throw Error('点击失败');
            __flowNode("node-mw6b1r78-bocbp");
            sleep(1000);
            __flowNode("node-mw6b29cz-vkidf");
            continue;
        }
    }
}
