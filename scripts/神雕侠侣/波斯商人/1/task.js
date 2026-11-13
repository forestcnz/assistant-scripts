// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/中心龙头.png",
        "images\/波斯商人.png",
        "images\/收集瓷器.png",
        "images\/精品提交.png",
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
    __flowNode("node-mw7ooloe-4amv3");
    for (var __flow_node_mw7ooloe_4amv3 = 0; ; __flow_node_mw7ooloe_4amv3++) {
        if (__flow_node_mw7ooloe_4amv3 > 0) sleep(300);
        __flowNode("node-mw7oon2f-12c6b");
        if (!!__flowImage("images\/中心龙头.png", 0, 300, { threshold: 0.8 })) {
            __flowNode("node-mw7oot6v-a4e4i");
            var __flow_node_mw7oot6v_a4e4i = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.8 });
            if (__flow_node_mw7oot6v_a4e4i && !click(__flow_node_mw7oot6v_a4e4i.x, __flow_node_mw7oot6v_a4e4i.y)) throw Error('点击失败');
            __flowNode("node-mw7opfwz-z6uq5");
            sleep(5000);
            __flowNode("node-mw7oppeh-jyx74");
            break;
        } else {
            __flowNode("node-mw8znojd-b-4y30i");
            __flowNode("node-mw8znojd-c-v4cyj");
            if (!click(1778, 24, 50)) throw Error('操作失败');
            __flowNode("node-mw8znojd-d-o3jn7");
            sleep(1000);
            __flowNode("node-mw8znojd-e-nnq39");
            if (!click(1103, 760, 50)) throw Error('操作失败');
            __flowNode("node-mw8znojd-f-uew1o");
            sleep(1000);
        }
    }
    __flowNode("node-mw7osp9k-i05bq");
    if (!click(861, 42, 50)) throw Error('操作失败');
    __flowNode("node-mw7ot61d-90xhz");
    sleep(5000);
    __flowNode("node-mw7ouc1e-2b4c2");
    if (!click(687, 64, 50)) throw Error('操作失败');
    __flowNode("node-mw7oup7d-o3mr8");
    sleep(4000);
    __flowNode("node-mw7ovezt-9x0a8");
    var __flow_node_mw7ovezt_9x0a8 = __flowImage("images\/波斯商人.png", 15000, 300, { threshold: 0.8 });
    if (__flow_node_mw7ovezt_9x0a8 && !click(__flow_node_mw7ovezt_9x0a8.x, __flow_node_mw7ovezt_9x0a8.y)) throw Error('点击失败');
    __flowNode("node-mw7oxfae-dzgtf");
    sleep(1000);
    __flowNode("node-mw7oxigr-2x720");
    var __flow_node_mw7oxigr_2x720 = __flowImage("images\/收集瓷器.png", 5000, 300, { threshold: 0.8 });
    if (__flow_node_mw7oxigr_2x720 && !click(__flow_node_mw7oxigr_2x720.x, __flow_node_mw7oxigr_2x720.y)) throw Error('点击失败');
    __flowNode("node-mw7oyzzj-376yf");
    sleep(1000);
    __flowNode("node-mw7ozfaj-rzgma");
    var __flow_node_mw7ozfaj_rzgma = __flowImage("images\/波斯商人.png", 15000, 300, { threshold: 0.8 });
    if (__flow_node_mw7ozfaj_rzgma && !click(__flow_node_mw7ozfaj_rzgma.x, __flow_node_mw7ozfaj_rzgma.y)) throw Error('点击失败');
    __flowNode("node-mw7p00lk-0mzrn");
    for (var __flow_node_mw7p00lk_0mzrn = 0; __flow_node_mw7p00lk_0mzrn < 10; __flow_node_mw7p00lk_0mzrn++) {
        if (__flow_node_mw7p00lk_0mzrn > 0) sleep(300);
        __flowNode("node-mw7p0wjf-xgvpf");
        var __flow_node_mw7p0wjf_xgvpf = __flowImage("images\/精品提交.png", 5000, 300, { threshold: 0.9 });
        if (__flow_node_mw7p0wjf_xgvpf && !click(__flow_node_mw7p0wjf_xgvpf.x, __flow_node_mw7p0wjf_xgvpf.y)) throw Error('点击失败');
    }
    __flowNode("node-mw7p2dbd-1sd1g");
    if (!click(912, 120, 50)) throw Error('操作失败');
}
