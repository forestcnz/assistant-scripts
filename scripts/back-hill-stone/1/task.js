// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
try {
    for (var __flowPath of [
        "images\/送我去资源场.png",
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
    __flowNode("node-mw8yghfi-1-smwti");
    __flowNode("node-mw7tlqqm-dqf2p");
    if (!click(1778, 24, 50)) throw Error('操作失败');
    __flowNode("node-mw7tlrpj-d7bme");
    sleep(1000);
    __flowNode("node-mw7tlso8-lqgg9");
    if (!click(1103, 760, 50)) throw Error('操作失败');
    __flowNode("node-mw7tlu07-b7sr5");
    sleep(1000);
    __flowNode("node-mw7tno8w-v4wqg");
    if (!click(1837, 543, 50)) throw Error('操作失败');
    __flowNode("node-mw7tomhe-3yyzp");
    sleep(1000);
    __flowNode("node-mw7tonns-bvrq0");
    if (!click(1475, 925, 50)) throw Error('操作失败');
    __flowNode("node-mw7tp1g7-5a31c");
    sleep(1000);
    __flowNode("node-mw7tpaxl-c9rcr");
    if (!click(1714, 547, 50)) throw Error('操作失败');
    __flowNode("node-mw7tpr56-5j2eu");
    sleep(1000);
    __flowNode("node-mw7tpta8-kelac");
    if (!click(1516, 642, 50)) throw Error('操作失败');
    __flowNode("node-mw7tqmlq-b3ac1");
    sleep(10000);
    __flowNode("node-mw7tr70e-kj5k3");
    var __flow_node_mw7tr70e_kj5k3 = __flowImage("images\/送我去资源场.png", 5000, 300, { threshold: 0.7 });
    if (__flow_node_mw7tr70e_kj5k3 && !click(__flow_node_mw7tr70e_kj5k3.x, __flow_node_mw7tr70e_kj5k3.y)) throw Error('点击失败');
    __flowNode("node-mw7tsgf5-kvosb");
    sleep(1000);
    __flowNode("node-mw7tsi3s-6zl8f");
    if (!click(1463, 908, 50)) throw Error('操作失败');
    __flowNode("node-mw7twboh-u6gke");
    sleep(1000);
    __flowNode("node-mw7twd6f-wnpks");
    if (!click(1117, 915, 50)) throw Error('操作失败');
    __flowNode("node-mw7twu7k-q3dnm");
    sleep(3000);
    __flowNode("node-mw7tx94w-r3oba");
    if (!click(1482, 920, 50)) throw Error('操作失败');
    __flowNode("node-mw7tytwt-biknt");
    sleep(2000);
    __flowNode("node-mw7tyya7-hctaw");
    if (!click(1653, 100, 50)) throw Error('操作失败');
    __flowNode("node-mw7tzny3-rq3p5");
    sleep(1000);
    __flowNode("node-mw7tzpji-fjl54");
    if (!click(1778, 24, 50)) throw Error('操作失败');
    __flowNode("node-mw7tzrir-kdsa8");
    sleep(1000);
    __flowNode("node-mw7tztl5-yo4qm");
    if (!click(1103, 760, 50)) throw Error('操作失败');
    __flowNode("node-mw7tzw80-y8yhk");
    sleep(1000);
}
