// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/使用.png",
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
    __flowNode("node-mw7mab46-74kyf");
    if (!click(383, 130, 50)) throw Error('操作失败');
    __flowNode("node-mw7mca3a-3sm58");
    sleep(1000);
    __flowNode("node-mw7mcdex-ef3xg");
    for (var __flow_node_mw7mcdex_ef3xg = 0; __flow_node_mw7mcdex_ef3xg < 5; __flow_node_mw7mcdex_ef3xg++) {
        if (__flow_node_mw7mcdex_ef3xg > 0) sleep(300);
        __flowNode("node-mw7mcq0e-e1f9t");
        if (!click(96, 420, 50)) throw Error('操作失败');
        __flowNode("node-mw7mk5gg-ejyln");
        sleep(2000);
        __flowNode("node-mw7mcs4f-udvec");
        if (!click(400, 646, 50)) throw Error('操作失败');
        __flowNode("node-mw7mkd8n-v6equ");
        sleep(2000);
        __flowNode("node-mw7mcr1p-nthgq");
        if (!click(1752, 881, 50)) throw Error('操作失败');
        __flowNode("node-mw7mkh3t-mtdin");
        sleep(3000);
        __flowNode("node-mw7mct5q-azuxa");
        if (!click(960, 350, 50)) throw Error('操作失败');
        __flowNode("node-mw7mks9r-08tsl");
        sleep(20000);
        __flowNode("node-mw7mcu7n-zv8ub");
        if (!click(96, 420, 50)) throw Error('操作失败');
        __flowNode("node-mw7ml0nl-m1umu");
        sleep(9000);
        __flowNode("node-mw7mcv75-h9n41");
        if (!click(216, 716, 50)) throw Error('操作失败');
        __flowNode("node-mw7ml8u7-y416j");
        sleep(1000);
    }
    __flowNode("node-mw7my9zu-umdoi");
    sleep(1000);
    __flowNode("node-mw7n76go-1o1d9");
    if (!click(1778, 24, 50)) throw Error('操作失败');
    __flowNode("node-mw7myep8-1s6v1");
    sleep(1000);
    __flowNode("node-mw7myjp3-kqbms");
    if (!click(1103, 760, 50)) throw Error('操作失败');
    __flowNode("node-mw7mzmpj-7888i");
    for (var __flow_node_mw7mzmpj_7888i = 0; ; __flow_node_mw7mzmpj_7888i++) {
        if (__flow_node_mw7mzmpj_7888i > 0) sleep(300);
        __flowNode("node-mw7mzsao-p2wt8");
        if (!!__flowImage("images\/使用.png", 0, 300, { threshold: 0.7 })) {
            __flowNode("node-mw7n15hd-9fjca");
            var __flow_node_mw7n15hd_9fjca = __flowImage("images\/使用.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mw7n15hd_9fjca && !click(__flow_node_mw7n15hd_9fjca.x, __flow_node_mw7n15hd_9fjca.y)) throw Error('点击失败');
            __flowNode("node-mw7n4wjt-7cl0f");
            continue;
        } else {
            __flowNode("node-mw7n116c-2s7q0");
            break;
        }
    }
}
