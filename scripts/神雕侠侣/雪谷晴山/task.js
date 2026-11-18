// Generated from flow.json
sleep(500);
var __flowTemplates = Object.create(null);
var __flowResume = null;
var __flowJumps = 0;
var __flowRecoveries = 0;
var __flowRecoveryMode = "stop";
var __flowRecoveryLimit = 0;
var __flowRecoveryDelay = 0;
try {
    for (var __flowPath of [
        "images\/云中易.png",
        "images\/进入恩仇录.png",
        "images\/恩仇录排名奖励.png",
        "images\/领取恩仇 排名奖励.png",
        "images\/快速通关.png",
        "images\/免费通关.png",
        "images\/100恩仇16.png",
        "images\/通用.png",
        "images\/战况.png",
        "images\/100恩仇20_21关卡.png",
        "images\/100恩仇21.png",
        "images\/100_26.png",
        "images\/离开副本.png",
    ]) {
        __flowTemplates[__flowPath] = images.read(__flowPath);
    }
    while (true) {
        try {
            __flowMain();
            break;
        } catch (__flowError) {
            if (!(__flowError instanceof Error)) throw __flowError;
            if (!__flowRunning()) throw __flowError;
            if (__flowError && __flowError.__flowJump) {
                if (++__flowJumps > 20) throw Error('跳转次数过多，请检查兜底锚点');
                __flowResume = __flowError.__flowJump;
                continue;
            }
            if (__flowError && __flowError.__flowFatal) throw __flowError;
            if (__flowRecoveries < __flowRecoveryLimit) {
                __flowRecoveries++;
                log('流程异常：' + (__flowError && __flowError.message ? __flowError.message : __flowError));
                if (__flowRecoveryDelay > 0) sleep(__flowRecoveryDelay);
                __flowRecover();
                if (__flowRecoveryMode === 'restart') {
                    __flowResume = '__start__';
                    continue;
                }
            }
            throw __flowError;
        }
    }
} finally {
    images.releaseAll(__flowTemplates);
}

/** 锚点闸门：跳转后只放行目标锚点及其之后的步骤。 */
function __flowGate(name) {
    if (__flowResume === null) return true;
    if (__flowResume === name) { __flowResume = null; return true; }
    return false;
}
function __flowGoto(name) {
    var signal = new Error('流程跳转');
    signal.__flowJump = name;
    throw signal;
}
/** 素材缺失、截屏不可用等无法通过重试恢复的错误。 */
function __flowFatal(message) {
    var error = new Error(message);
    error.__flowFatal = true;
    return error;
}
function __flowImage(path, timeoutMs, intervalMs, options) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var template = __flowTemplates[path];
    if (!template) return null;
    return waitImage(template, timeoutMs / 1000, intervalMs / 1000, options);
}
function __flowText(text, options) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
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
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var started = __flowNow();
    while (true) {
        if (check()) return true;
        if (__flowNow() - started >= timeoutMs) return false;
        sleep(intervalMs);
    }
}
function __flowWaitImageGone(path, timeoutMs, intervalMs, options) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var template = __flowTemplates[path];
    if (!template) throw __flowFatal('图片素材不存在');
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
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var started = __flowNow();
    while (true) {
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        var first = null, matched = 0;
        try {
            for (var i = 0; i < entries.length; i++) {
                var template = __flowTemplates[entries[i].path];
                if (!template) throw __flowFatal('图片素材不存在：' + entries[i].path);
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
/** 采样画面指纹：按 step 间距取像素网格，用于判断画面是否稳定。 */
function __flowSignature(shot, region, step) {
    var width = images.width(shot), height = images.height(shot);
    var rx = 0, ry = 0, rw = width, rh = height;
    if (region) { rx = region[0]; ry = region[1]; rw = region[2]; rh = region[3]; }
    rx = Math.max(0, Math.min(rx, width - 1));
    ry = Math.max(0, Math.min(ry, height - 1));
    rw = Math.max(2, Math.min(rw, width - rx));
    rh = Math.max(2, Math.min(rh, height - ry));
    var cols = Math.max(2, Math.min(48, Math.floor(rw / step)));
    var rows = Math.max(2, Math.min(48, Math.floor(rh / step)));
    var gapX = Math.max(1, Math.floor(rw / cols));
    var gapY = Math.max(1, Math.floor(rh / rows));
    var signature = [];
    for (var y = 0; y < rh; y += gapY) {
        var row = [];
        for (var x = 0; x < rw; x += gapX) {
            var color = images.pixel(shot, rx + x, ry + y);
            row.push(color === null || color === undefined ? -1 : color);
        }
        signature.push(row);
    }
    return signature;
}
/** 两帧指纹的差异比例；单点通道差之和超过 24 视为变化。 */
function __flowStableDiff(a, b) {
    var total = 0, changed = 0;
    for (var y = 0; y < a.length; y++) {
        var rowA = a[y], rowB = b[y] || [];
        for (var x = 0; x < rowA.length; x++) {
            var ca = rowA[x], cb = rowB[x];
            if (ca === undefined || cb === undefined || ca < 0 || cb < 0) continue;
            total++;
            var dr = ((ca >> 16) & 255) - ((cb >> 16) & 255);
            var dg = ((ca >> 8) & 255) - ((cb >> 8) & 255);
            var db = (ca & 255) - (cb & 255);
            if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) > 24) changed++;
        }
    }
    return total > 0 ? changed / total : 0;
}
function __flowWaitStable(region, step, diffRatio, frames, timeoutMs, pollMs) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var last = null, stable = 0, started = __flowNow();
    while (true) {
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        var signature = null;
        try { signature = __flowSignature(shot, region, step); }
        finally { images.release(shot); }
        if (last && __flowStableDiff(last, signature) <= diffRatio) stable++;
        else stable = 1;
        last = signature;
        if (stable >= frames) return true;
        if (timeoutMs > 0 && __flowNow() - started >= timeoutMs) return false;
        sleep(pollMs);
    }
}
function __flowWaitClick(path, timeoutMs, intervalMs, options) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var template = __flowTemplates[path];
    if (!template) throw __flowFatal('图片素材不存在');
    var deadline = timeoutMs > 0 ? __flowNow() + timeoutMs : Infinity;
    var misses = 0, retries = 0;
    while (true) {
        var point = null;
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        try { point = images.findImage(shot, template, options); }
        finally { images.release(shot); }
        if (point) {
            if (click(point.x + options.offsetX, point.y + options.offsetY)) {
                if (options.stable) __flowWaitStable(null, 8, 0.02, 2, 3000, 200);
                else if (options.afterWait > 0) sleep(options.afterWait);
                return point;
            }
            if (++retries > options.clickRetry) {
                if (options.failure === 'skip') { console.warn('点击失败'); return null; }
                throw Error('点击失败');
            }
            if (options.retryGap > 0) sleep(options.retryGap);
            continue;
        }
        misses++;
        if (options.missLimit > 0 && misses >= options.missLimit) return null;
        if (__flowNow() >= deadline) return null;
        sleep(intervalMs);
    }
}
/** 单帧内按顺序匹配多张图片，返回首个命中项；命中项可自带点击。 */
function __flowSwitch(entries, timeoutMs, intervalMs) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var deadline = timeoutMs > 0 ? __flowNow() + timeoutMs : Infinity;
    while (true) {
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        var index = 0, point = null;
        try {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var template = __flowTemplates[entry.path];
                if (!template) throw __flowFatal('图片素材不存在：' + entry.path);
                var options = { threshold: entry.threshold };
                if (entry.region) options.region = entry.region;
                var found = images.findImage(shot, template, options);
                if (found) { index = i + 1; point = found; break; }
            }
        } finally { images.release(shot); }
        if (index) {
            if (entries[index - 1].click && !click(point.x, point.y)) {
                if (entries[index - 1].failure === 'skip') console.warn('点击失败');
                else throw Error('点击失败');
            }
            return { index: index, x: point.x, y: point.y };
        }
        if (__flowNow() >= deadline) return null;
        sleep(intervalMs);
    }
}
/** 循环点掉一组弹窗图片，连续 emptyRounds 轮无命中后结束。 */
function __flowDialogClear(entries, pollMs, emptyRounds, maxMs, maxClicks, afterClick, afterWaitMs, clickFailure) {
    if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
    var started = __flowNow(), empty = 0, clicks = 0;
    while (true) {
        var shot = captureScreen();
        if (!shot) throw Error('截图失败');
        var hit = null;
        try {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var template = __flowTemplates[entry.path];
                if (!template) throw __flowFatal('图片素材不存在：' + entry.path);
                var options = { threshold: entry.threshold };
                if (entry.region) options.region = entry.region;
                var found = images.findImage(shot, template, options);
                if (found) { hit = found; break; }
            }
        } finally { images.release(shot); }
        if (hit) {
            clicks++;
            if (!click(hit.x, hit.y) && clickFailure === 'stop') throw Error('点击失败');
            empty = 0;
            if (afterClick === 'stable') __flowWaitStable(null, 8, 0.02, 2, 3000, 200);
            else sleep(Math.max(afterWaitMs, 50));
            if (maxClicks > 0 && clicks >= maxClicks) break;
        } else {
            if (++empty >= emptyRounds) break;
            sleep(pollMs);
        }
        if (maxMs > 0 && __flowNow() - started >= maxMs) break;
    }
    return { clicks: clicks };
}
/** 长等待：固定时长、等图片出现/消失，或一直等待到停止；按心跳输出日志。 */
function __flowWaitEvent(mode, path, durationMs, pollMs, heartbeatMs, options) {
    var waitingImage = mode === 'imageAppear' || mode === 'imageGone';
    if (waitingImage) {
        if (!requestScreenCapture()) throw __flowFatal('截屏不可用');
        if (!__flowTemplates[path]) throw __flowFatal('图片素材不存在');
    }
    var started = __flowNow(), lastBeat = started;
    while (true) {
        if (mode === 'imageAppear') {
            if (__flowImage(path, 0, pollMs, options)) return true;
        } else if (mode === 'imageGone') {
            if (!__flowImage(path, 0, pollMs, options)) return true;
        }
        if (mode !== 'forever' && durationMs > 0 && __flowNow() - started >= durationMs) return mode === 'duration';
        if (heartbeatMs > 0 && __flowNow() - lastBeat >= heartbeatMs) {
            lastBeat = __flowNow();
            log('等待中：已等待 ' + Math.round((__flowNow() - started) / 1000) + ' 秒');
        }
        sleep(pollMs);
    }
}
function __flowMain() {
    if (__flowResume === '__start__') __flowResume = null;
    if (__flowGate("node-mwfujwex-j-3c96p")) {
        __flowNode("node-mwfujwex-j-3c96p");
        for (var __flow_node_mwfujwex_j_3c96p = 0; ; __flow_node_mwfujwex_j_3c96p++) {
            if (__flow_node_mwfujwex_j_3c96p > 0) sleep(300);
            __flowNode("node-mwfujzpn-k-v0p1g");
            if (!!__flowImage("images\/云中易.png", 0, 300, { threshold: 0.7 })) {
                __flowNode("node-mwfukkyw-l-q1njo");
                var __flow_node_mwfukkyw_l_q1njo = __flowImage("images\/云中易.png", 5000, 300, { threshold: 0.9 });
                if (__flow_node_mwfukkyw_l_q1njo && !click(__flow_node_mwfukkyw_l_q1njo.x, __flow_node_mwfukkyw_l_q1njo.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwfukzj3-m-3j2ou");
                sleep(3000);
                __flowNode("node-mwful9f4-n-05f9g");
                break;
            } else {
                __flowNode("node-mwfuldjs-o-1sful");
                var __flow_node_mwfuldjs_o_1sful = click(1778, 24, 50);
                if (!__flow_node_mwfuldjs_o_1sful) throw Error('操作失败');
                __flowNode("node-mwfuldjt-p-yqa3y");
                sleep(1000);
                __flowNode("node-mwfuldjt-q-60b3c");
                var __flow_node_mwfuldjt_q_60b3c = click(1103, 760, 50);
                if (!__flow_node_mwfuldjt_q_60b3c) throw Error('操作失败');
                __flowNode("node-mwfuldjt-r-3cb6f");
                sleep(1000);
            }
        }
    }
    if (__flowGate("node-mwfuq22f-s-cgp4j")) {
        __flowNode("node-mwfuq22f-s-cgp4j");
        var __flow_node_mwfuq22f_s_cgp4j = __flowWaitClick("images\/进入恩仇录.png", 10000, 300, { threshold: 0.8, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfuq22f_s_cgp4j) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwfus2hc-u-6y332")) {
        __flowNode("node-mwfus2hc-u-6y332");
        sleep(1000);
    }
    if (__flowGate("node-mwfur5t4-t-zqzyk")) {
        __flowNode("node-mwfur5t4-t-zqzyk");
        if (!!__flowImage("images\/恩仇录排名奖励.png", 0, 300, { threshold: 0.8 })) {
            __flowNode("node-mwfuscqy-v-6yagu");
            var __flow_node_mwfuscqy_v_6yagu = __flowWaitClick("images\/领取恩仇 排名奖励.png", 10000, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
            if (!__flow_node_mwfuscqy_v_6yagu) throw Error('等待图片超时');
            __flowNode("node-mwfutgno-x-9ww5e");
            sleep(1000);
        } else {
            __flowNode("node-mwfut5yn-w-ubhc0");
            sleep(1000);
        }
    }
    if (__flowGate("node-mwfuul0h-y-swbmc")) {
        __flowNode("node-mwfuul0h-y-swbmc");
        var __flow_node_mwfuul0h_y_swbmc = __flowWaitClick("images\/快速通关.png", 10000, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfuul0h_y_swbmc) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwfuv6x0-z-mjt62")) {
        __flowNode("node-mwfuv6x0-z-mjt62");
        sleep(1000);
    }
    if (__flowGate("node-mwfuw77k-10-29rlf")) {
        __flowNode("node-mwfuw77k-10-29rlf");
        var __flow_node_mwfuw77k_10_29rlf = __flowWaitClick("images\/免费通关.png", 10000, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfuw77k_10_29rlf) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwfuwy32-11-amp5z")) {
        __flowNode("node-mwfuwy32-11-amp5z");
        sleep(1000);
    }
    if (__flowGate("node-mwfuxtdy-12-ara5b")) {
        __flowNode("node-mwfuxtdy-12-ara5b");
        __flowNode("node-mwfuyhcu-13-pt1gx");
        var __flow_node_mwfuyhcu_13_pt1gx = __flowWaitClick("images\/100恩仇16.png", 10000, 300, { threshold: 0.7, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfuyhcu_13_pt1gx) throw Error('等待图片超时');
        __flowNode("node-mwfv0hn8-15-h2xps");
        for (var __flow_node_mwfv0hn8_15_h2xps = 0; __flow_node_mwfv0hn8_15_h2xps < 5; __flow_node_mwfv0hn8_15_h2xps++) {
            if (__flow_node_mwfv0hn8_15_h2xps > 0) sleep(300);
            __flowNode("node-mwfv0n9c-16-7mwgg");
            var __flow_node_mwfv0n9c_16_7mwgg = __flowWaitClick("images\/通用.png", 0, 300, { threshold: 0.8, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
            if (!__flow_node_mwfv0n9c_16_7mwgg) throw Error('等待图片超时');
        }
    }
    if (__flowGate("node-mwfv4iqn-17-muy2i")) {
        __flowNode("node-mwfv4iqn-17-muy2i");
        var __flow_node_mwfv4iqn_17_muy2i = __flowWaitImageGone("images\/战况.png", 10000000, 300, { threshold: 0.9 });
        if (!__flow_node_mwfv4iqn_17_muy2i) throw Error('等待图片消失超时');
    }
    if (__flowGate("node-mwfuzomh-14-ba00e")) {
        __flowNode("node-mwfuzomh-14-ba00e");
        sleep(15000);
    }
    if (__flowGate("node-mwfv6gl3-18-nuvxw")) {
        __flowNode("node-mwfv6gl3-18-nuvxw");
        var __flow_node_mwfv6gl3_18_nuvxw = click(1769, 564, 50);
        if (!__flow_node_mwfv6gl3_18_nuvxw) throw Error('操作失败');
    }
    if (__flowGate("node-mwfv7u9r-19-d7o25")) {
        __flowNode("node-mwfv7u9r-19-d7o25");
        sleep(3000);
    }
    if (__flowGate("node-mwfv8vtz-1a-56y7f")) {
        __flowNode("node-mwfv8vtz-1a-56y7f");
        var __flow_node_mwfv8vtz_1a_56y7f = __flowWaitClick("images\/100恩仇20_21关卡.png", 0, 300, { threshold: 0.7, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfv8vtz_1a_56y7f) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwfva6h9-1b-n694m")) {
        __flowNode("node-mwfva6h9-1b-n694m");
        sleep(5000);
    }
    if (__flowGate("node-mwfvasqv-1c-2kz3m")) {
        __flowNode("node-mwfvasqv-1c-2kz3m");
        var __flow_node_mwfvasqv_1c_2kz3m = click(1769, 564, 50);
        if (!__flow_node_mwfvasqv_1c_2kz3m) throw Error('操作失败');
    }
    if (__flowGate("node-mwfvbc1q-1d-2zae5")) {
        __flowNode("node-mwfvbc1q-1d-2zae5");
        sleep(1000);
    }
    if (__flowGate("node-mwfvc2y9-1e-vneth")) {
        __flowNode("node-mwfvc2y9-1e-vneth");
        __flowNode("node-mwfvc2y9-1f-x0oud");
        var __flow_node_mwfvc2y9_1f_x0oud = __flowWaitClick("images\/100恩仇21.png", 0, 300, { threshold: 0.8, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfvc2y9_1f_x0oud) throw Error('等待图片超时');
        __flowNode("node-mwfvc2y9-1g-wzkiv");
        for (var __flow_node_mwfvc2y9_1g_wzkiv = 0; __flow_node_mwfvc2y9_1g_wzkiv < 5; __flow_node_mwfvc2y9_1g_wzkiv++) {
            if (__flow_node_mwfvc2y9_1g_wzkiv > 0) sleep(300);
            __flowNode("node-mwfvc2y9-1h-qrzwu");
            var __flow_node_mwfvc2y9_1h_qrzwu = __flowWaitClick("images\/通用.png", 0, 300, { threshold: 0.8, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
            if (!__flow_node_mwfvc2y9_1h_qrzwu) throw Error('等待图片超时');
        }
    }
    if (__flowGate("node-mwfyrb7l-2c-wiwp2")) {
        __flowNode("node-mwfyrb7l-2c-wiwp2");
        var __flow_node_mwfyrb7l_2c_wiwp2 = __flowWaitImageGone("images\/战况.png", 10000, 300, { threshold: 0.9 });
        if (!__flow_node_mwfyrb7l_2c_wiwp2) throw Error('等待图片消失超时');
    }
    if (__flowGate("node-mwfvhqq4-1m-ecq9t")) {
        __flowNode("node-mwfvhqq4-1m-ecq9t");
        sleep(20000);
    }
    if (__flowGate("node-mwfz0a0y-2d-gs3yo")) {
        __flowNode("node-mwfz0a0y-2d-gs3yo");
        var __flow_node_mwfz0a0y_2d_gs3yo = click(1565, 416, 50);
        if (!__flow_node_mwfz0a0y_2d_gs3yo) throw Error('操作失败');
    }
    if (__flowGate("node-mwfz2nra-2e-j3j2e")) {
        __flowNode("node-mwfz2nra-2e-j3j2e");
        sleep(2000);
    }
    if (__flowGate("node-mwfvggtk-1i-3m52o")) {
        __flowNode("node-mwfvggtk-1i-3m52o");
        __flowNode("node-mwfvggtk-1j-gj868");
        var __flow_node_mwfvggtk_1j_gj868 = __flowWaitClick("images\/100_26.png", 0, 300, { threshold: 0.8, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfvggtk_1j_gj868) throw Error('等待图片超时');
        __flowNode("node-mwfvggtk-1k-35xug");
        for (var __flow_node_mwfvggtk_1k_35xug = 0; __flow_node_mwfvggtk_1k_35xug < 5; __flow_node_mwfvggtk_1k_35xug++) {
            if (__flow_node_mwfvggtk_1k_35xug > 0) sleep(300);
            __flowNode("node-mwfvggtk-1l-ygbiq");
            var __flow_node_mwfvggtk_1l_ygbiq = __flowWaitClick("images\/通用.png", 0, 300, { threshold: 0.8, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
            if (!__flow_node_mwfvggtk_1l_ygbiq) throw Error('等待图片超时');
        }
    }
    if (__flowGate("node-mwfvk5fs-1n-z72q0")) {
        __flowNode("node-mwfvk5fs-1n-z72q0");
        var __flow_node_mwfvk5fs_1n_z72q0 = __flowWaitClick("images\/离开副本.png", 0, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfvk5fs_1n_z72q0) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwfvku1w-1o-mf27p")) {
        __flowNode("node-mwfvku1w-1o-mf27p");
        sleep(1000);
    }
}
function __flowRecover() {
}
