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
        "images\/生肖大使.png",
        "images\/中心龙头.png",
        "images\/查看生肖.png",
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
    if (__flowGate("node-mwg5x65b-45-o8iod")) {
        __flowNode("node-mwg5x65b-45-o8iod");
        for (var __flow_node_mwg5x65b_45_o8iod = 0; ; __flow_node_mwg5x65b_45_o8iod++) {
            if (__flow_node_mwg5x65b_45_o8iod > 0) sleep(300);
            __flowNode("node-mwg5xihd-46-bvfbf");
            if (!!__flowImage("images\/生肖大使.png", 0, 300, { threshold: 0.64 })) {
                __flowNode("node-mwg5y3yy-47-vq7nm");
                var __flow_node_mwg5y3yy_47_vq7nm = __flowImage("images\/生肖大使.png", 5000, 300, { threshold: 0.64 });
                if (__flow_node_mwg5y3yy_47_vq7nm && !click(__flow_node_mwg5y3yy_47_vq7nm.x, __flow_node_mwg5y3yy_47_vq7nm.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwg5yh4q-48-bmxjj");
                sleep(1000);
                __flowNode("node-mwg5yok9-49-urm13");
                break;
            } else {
                __flowNode("node-mwg5pl9l-3s-tiypd");
                for (var __flow_node_mwg5pl9l_3s_tiypd = 0; ; __flow_node_mwg5pl9l_3s_tiypd++) {
                    if (__flow_node_mwg5pl9l_3s_tiypd > 0) sleep(300);
                    __flowNode("node-mwg5pl9l-3t-y9z6t");
                    if (!!__flowImage("images\/中心龙头.png", 0, 300, { threshold: 0.7 })) {
                        __flowNode("node-mwg5pl9l-3u-39skt");
                        var __flow_node_mwg5pl9l_3u_39skt = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.7 });
                        if (__flow_node_mwg5pl9l_3u_39skt && !click(__flow_node_mwg5pl9l_3u_39skt.x, __flow_node_mwg5pl9l_3u_39skt.y)) {
                            throw Error('点击失败');
                        }
                        __flowNode("node-mwg5pl9l-3v-n1zt2");
                        sleep(4000);
                        __flowNode("node-mwg5qodq-42-4prrc");
                        var __flow_node_mwg5qodq_42_4prrc = click(1845, 463, 50);
                        if (!__flow_node_mwg5qodq_42_4prrc) throw Error('操作失败');
                        __flowNode("node-mwg6cvgk-4c-zcf4q");
                        sleep(4000);
                        __flowNode("node-mwg5tdxk-44-qzr7c");
                        var __flow_node_mwg5tdxk_44_qzr7c = click(1783, 901, 50);
                        if (!__flow_node_mwg5tdxk_44_qzr7c) throw Error('操作失败');
                        __flowNode("node-mwg6cvth-4d-8tr55");
                        sleep(4000);
                        __flowNode("node-mwg6d61m-4e-qzexn");
                        break;
                    } else {
                        __flowNode("node-mwg5pl9l-3x-c0bv9");
                        var __flow_node_mwg5pl9l_3x_c0bv9 = click(1778, 24, 50);
                        if (!__flow_node_mwg5pl9l_3x_c0bv9) throw Error('操作失败');
                        __flowNode("node-mwg5pl9l-3y-awdjf");
                        sleep(1000);
                        __flowNode("node-mwg5pl9l-3z-vx2tm");
                        var __flow_node_mwg5pl9l_3z_vx2tm = click(1103, 760, 50);
                        if (!__flow_node_mwg5pl9l_3z_vx2tm) throw Error('操作失败');
                        __flowNode("node-mwg5pl9l-40-1ovmi");
                        sleep(1000);
                    }
                }
            }
        }
    }
    if (__flowGate("node-mwg6h3f2-4f-58ntw")) {
        __flowNode("node-mwg6h3f2-4f-58ntw");
        var __flow_node_mwg6h3f2_4f_58ntw = __flowWaitClick("images\/查看生肖.png", 10000, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwg6h3f2_4f_58ntw) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwg6hlca-4g-l4rz2")) {
        __flowNode("node-mwg6hlca-4g-l4rz2");
        sleep(2000);
    }
    if (__flowGate("node-mwg6i7hz-4h-jgafh")) {
        __flowNode("node-mwg6i7hz-4h-jgafh");
        var __flow_node_mwg6i7hz_4h_jgafh = click(1677, 450, 50);
        if (!__flow_node_mwg6i7hz_4h_jgafh) throw Error('操作失败');
    }
    if (__flowGate("node-mwg6itv1-4i-ycmaz")) {
        __flowNode("node-mwg6itv1-4i-ycmaz");
        sleep(1000);
    }
    if (__flowGate("node-mwg6jbkc-4j-btfqi")) {
        __flowNode("node-mwg6jbkc-4j-btfqi");
        for (var __flow_node_mwg6jbkc_4j_btfqi = 0; __flow_node_mwg6jbkc_4j_btfqi < 4; __flow_node_mwg6jbkc_4j_btfqi++) {
            if (__flow_node_mwg6jbkc_4j_btfqi > 0) sleep(1000);
            var __flow_node_mwg6jbkc_4j_btfqi_jx = Math.round((Math.random() * 2 - 1) * 1);
            var __flow_node_mwg6jbkc_4j_btfqi_jy = Math.round((Math.random() * 2 - 1) * 1);
            if (!click((951 + __flow_node_mwg6jbkc_4j_btfqi_jx), (693 + __flow_node_mwg6jbkc_4j_btfqi_jy), 50)) {
                throw Error('操作失败');
            }
        }
    }
    if (__flowGate("node-mwg6lgl6-4k-9ejt1")) {
        __flowNode("node-mwg6lgl6-4k-9ejt1");
        sleep(1000);
    }
    if (__flowGate("node-mwg6lotm-4l-804xt")) {
        __flowNode("node-mwg6lotm-4l-804xt");
        var __flow_node_mwg6lotm_4l_804xt = click(1661, 91, 50);
        if (!__flow_node_mwg6lotm_4l_804xt) throw Error('操作失败');
    }
}
function __flowRecover() {
}
