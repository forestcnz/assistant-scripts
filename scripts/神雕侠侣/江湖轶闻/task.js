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
        "images\/周伯通.png",
        "images\/周伯通_1.png",
        "images\/中心龙头.png",
        "images\/江湖.png",
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
    if (__flowGate("node-mwg0pcwb-2-jyxun")) {
        __flowNode("node-mwg0pcwb-2-jyxun");
        for (var __flow_node_mwg0pcwb_2_jyxun = 0; ; __flow_node_mwg0pcwb_2_jyxun++) {
            if (__flow_node_mwg0pcwb_2_jyxun > 0) sleep(300);
            __flowNode("node-mwg0pmdb-3-l1p1a");
            if (!!__flowImage("images\/周伯通.png", 0, 300, { threshold: 0.6 })) {
                __flowNode("node-mwg1ehek-r-bdier");
                log("找到周伯通了");
                __flowNode("node-mwg0qt5l-4-vrccg");
                var __flow_node_mwg0qt5l_4_vrccg = __flowImage("images\/周伯通_1.png", 5000, 300, { threshold: 0.6 });
                if (__flow_node_mwg0qt5l_4_vrccg && !click(__flow_node_mwg0qt5l_4_vrccg.x, __flow_node_mwg0qt5l_4_vrccg.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwg0rvhp-e-hu088");
                sleep(1000);
                __flowNode("node-mwg0s032-f-xtmh0");
                break;
            } else {
                __flowNode("node-mwg0rnll-5-6e2h6");
                for (var __flow_node_mwg0rnll_5_6e2h6 = 0; ; __flow_node_mwg0rnll_5_6e2h6++) {
                    if (__flow_node_mwg0rnll_5_6e2h6 > 0) sleep(300);
                    __flowNode("node-mwg0rnll-6-o5ecp");
                    if (!!__flowImage("images\/中心龙头.png", 0, 300, { threshold: 0.9 })) {
                        __flowNode("node-mwg0rnll-7-1ticg");
                        var __flow_node_mwg0rnll_7_1ticg = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.9 });
                        if (__flow_node_mwg0rnll_7_1ticg && !click(__flow_node_mwg0rnll_7_1ticg.x, __flow_node_mwg0rnll_7_1ticg.y)) {
                            throw Error('点击失败');
                        }
                        __flowNode("node-mwg0rnll-8-18v2w");
                        sleep(4000);
                        __flowNode("node-mwg0rnll-9-2gd46");
                        break;
                    } else {
                        __flowNode("node-mwg0rnll-a-pnorp");
                        var __flow_node_mwg0rnll_a_pnorp = click(1778, 24, 50);
                        if (!__flow_node_mwg0rnll_a_pnorp) throw Error('操作失败');
                        __flowNode("node-mwg0rnll-b-wmhgf");
                        sleep(1000);
                        __flowNode("node-mwg0rnll-c-2919w");
                        var __flow_node_mwg0rnll_c_2919w = click(1103, 760, 50);
                        if (!__flow_node_mwg0rnll_c_2919w) throw Error('操作失败');
                        __flowNode("node-mwg0rnll-d-ezld9");
                        sleep(1000);
                    }
                    __flowNode("node-mwg14f4t-m-ooqs8");
                    var __flow_node_mwg14f4t_m_ooqs8 = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.7 });
                    if (__flow_node_mwg14f4t_m_ooqs8 && !click(__flow_node_mwg14f4t_m_ooqs8.x, __flow_node_mwg14f4t_m_ooqs8.y)) {
                        throw Error('点击失败');
                    }
                    __flowNode("node-mwg14s9j-n-ggbhp");
                    sleep(4000);
                    __flowNode("node-mwg0s63q-g-6i57d");
                    __flowNode("node-mwg0sf2n-h-qdfba");
                    var __flow_node_mwg0sf2n_h_qdfba = click(308, 256, 50);
                    if (!__flow_node_mwg0sf2n_h_qdfba) throw Error('操作失败');
                    __flowNode("node-mwg159qa-o-namtj");
                    sleep(3000);
                    __flowNode("node-mwg15gks-p-ovm4f");
                    var __flow_node_mwg15gks_p_ovm4f = click(308, 256, 50);
                    if (!__flow_node_mwg15gks_p_ovm4f) throw Error('操作失败');
                    __flowNode("node-mwg15jt9-q-63ekk");
                    sleep(4000);
                    __flowNode("node-mwg217ru-u-q2jc3");
                    break;
                }
            }
        }
    }
    if (__flowGate("node-mwg232c5-v-dj2ir")) {
        __flowNode("node-mwg232c5-v-dj2ir");
        sleep(3000);
    }
    if (__flowGate("node-mwg23bpw-w-t4xfn")) {
        __flowNode("node-mwg23bpw-w-t4xfn");
        var __flow_node_mwg23bpw_w_t4xfn = __flowWaitClick("images\/江湖.png", 10000, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwg23bpw_w_t4xfn) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwg24n6h-x-j9gmv")) {
        __flowNode("node-mwg24n6h-x-j9gmv");
        sleep(1000);
    }
}
function __flowRecover() {
}
