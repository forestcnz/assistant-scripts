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
        "images\/成长上限.png",
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
    if (__flowGate("node-mwg2fgak-18-13lmo")) {
        __flowNode("node-mwg2fgak-18-13lmo");
        var __flow_node_mwg2fgak_18_13lmo = click(1778, 24, 50);
        if (!__flow_node_mwg2fgak_18_13lmo) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2fgak-19-1zqo6")) {
        __flowNode("node-mwg2fgak-19-1zqo6");
        sleep(1000);
    }
    if (__flowGate("node-mwg2fgak-1a-8oevi")) {
        __flowNode("node-mwg2fgak-1a-8oevi");
        var __flow_node_mwg2fgak_1a_8oevi = click(1103, 760, 50);
        if (!__flow_node_mwg2fgak_1a_8oevi) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2fgak-1b-cr7p4")) {
        __flowNode("node-mwg2fgak-1b-cr7p4");
        sleep(1000);
    }
    if (__flowGate("node-mwg2g760-1c-vzi43")) {
        __flowNode("node-mwg2g760-1c-vzi43");
        var __flow_node_mwg2g760_1c_vzi43 = click(1848, 560, 50);
        if (!__flow_node_mwg2g760_1c_vzi43) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2gv71-1d-rhp9r")) {
        __flowNode("node-mwg2gv71-1d-rhp9r");
        sleep(1000);
    }
    if (__flowGate("node-mwg2gwmj-1e-aakay")) {
        __flowNode("node-mwg2gwmj-1e-aakay");
        var __flow_node_mwg2gwmj_1e_aakay = click(1671, 640, 50);
        if (!__flow_node_mwg2gwmj_1e_aakay) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2hr1d-1f-apoh4")) {
        __flowNode("node-mwg2hr1d-1f-apoh4");
        sleep(1000);
    }
    if (__flowGate("node-mwg2kvj2-1g-2onti")) {
        __flowNode("node-mwg2kvj2-1g-2onti");
        var __flow_node_mwg2kvj2_1g_2onti = click(1170, 135, 50);
        if (!__flow_node_mwg2kvj2_1g_2onti) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2lm5v-1h-c50e7")) {
        __flowNode("node-mwg2lm5v-1h-c50e7");
        sleep(1000);
    }
    if (__flowGate("node-mwg2lthq-1i-htpw2")) {
        __flowNode("node-mwg2lthq-1i-htpw2");
        var __flow_node_mwg2lthq_1i_htpw2 = click(526, 190, 50);
        if (!__flow_node_mwg2lthq_1i_htpw2) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2nyje-1k-gmjcr")) {
        __flowNode("node-mwg2nyje-1k-gmjcr");
        sleep(1000);
    }
    if (__flowGate("node-mwg2nppk-1j-d3pkl")) {
        __flowNode("node-mwg2nppk-1j-d3pkl");
        __flowNode("node-mwg2o2gh-1l-8nmfi");
        var __flow_node_mwg2o2gh_1l_8nmfi = click(873, 577, 50);
        if (!__flow_node_mwg2o2gh_1l_8nmfi) throw Error('操作失败');
        __flowNode("node-mwg2oyn2-1m-irfov");
        sleep(1000);
        __flowNode("node-mwg2p0ke-1n-9dnwy");
        var __flow_node_mwg2p0ke_1n_9dnwy = click(1455, 662, 50);
        if (!__flow_node_mwg2p0ke_1n_9dnwy) throw Error('操作失败');
        __flowNode("node-mwg2plkw-1o-byfho");
        sleep(1000);
        __flowNode("node-mwg2ppa8-1p-dxxol");
        if (!!__flowImage("images\/成长上限.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mwg2sems-1q-6uban");
            var __flow_node_mwg2sems_1q_6uban = __flowImage("images\/成长上限.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mwg2sems_1q_6uban && !click(__flow_node_mwg2sems_1q_6uban.x, __flow_node_mwg2sems_1q_6uban.y)) {
                throw Error('点击失败');
            }
        } else {
            __flowNode("node-mwg2t451-1r-dagvs");
            var __flow_node_mwg2t451_1r_dagvs = click(1455, 662, 50);
            if (!__flow_node_mwg2t451_1r_dagvs) throw Error('操作失败');
            __flowNode("node-mwg3jb9p-3r-98o5x");
            sleep(1000);
            __flowNode("node-mwg2t4ju-1s-izbuf");
            var __flow_node_mwg2t4ju_1s_izbuf = click(1455, 662, 50);
            if (!__flow_node_mwg2t4ju_1s_izbuf) throw Error('操作失败');
        }
        __flowNode("node-mwg2tfzb-1t-x967d");
        sleep(1000);
    }
    if (__flowGate("node-mwg2uhhn-1u-guf8c")) {
        __flowNode("node-mwg2uhhn-1u-guf8c");
        var __flow_node_mwg2uhhn_1u_guf8c = click(541, 345, 50);
        if (!__flow_node_mwg2uhhn_1u_guf8c) throw Error('操作失败');
    }
    if (__flowGate("node-mwg39w2k-2d-enzd1")) {
        __flowNode("node-mwg39w2k-2d-enzd1");
        sleep(1000);
    }
    if (__flowGate("node-mwg39pxp-23-yrbet")) {
        __flowNode("node-mwg39pxp-23-yrbet");
        __flowNode("node-mwg39pxp-24-gelr7");
        var __flow_node_mwg39pxp_24_gelr7 = click(873, 577, 50);
        if (!__flow_node_mwg39pxp_24_gelr7) throw Error('操作失败');
        __flowNode("node-mwg39pxp-25-5vq07");
        sleep(1000);
        __flowNode("node-mwg39pxp-26-5vlfs");
        var __flow_node_mwg39pxp_26_5vlfs = click(1455, 662, 50);
        if (!__flow_node_mwg39pxp_26_5vlfs) throw Error('操作失败');
        __flowNode("node-mwg39pxp-27-smvg7");
        sleep(1000);
        __flowNode("node-mwg39pxp-28-4vtb5");
        if (!!__flowImage("images\/成长上限.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mwg39pxp-29-vzi0l");
            var __flow_node_mwg39pxp_29_vzi0l = __flowImage("images\/成长上限.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mwg39pxp_29_vzi0l && !click(__flow_node_mwg39pxp_29_vzi0l.x, __flow_node_mwg39pxp_29_vzi0l.y)) {
                throw Error('点击失败');
            }
        } else {
            __flowNode("node-mwg39pxp-2a-xp79t");
            var __flow_node_mwg39pxp_2a_xp79t = click(1455, 662, 50);
            if (!__flow_node_mwg39pxp_2a_xp79t) throw Error('操作失败');
            __flowNode("node-mwg3dhdq-3m-3awek");
            sleep(1000);
            __flowNode("node-mwg39pxp-2b-xj2fd");
            var __flow_node_mwg39pxp_2b_xj2fd = click(1455, 662, 50);
            if (!__flow_node_mwg39pxp_2b_xj2fd) throw Error('操作失败');
        }
        __flowNode("node-mwg39pxp-2c-vkw9l");
        sleep(1000);
    }
    if (__flowGate("node-mwg2uiiq-1v-4n1vq")) {
        __flowNode("node-mwg2uiiq-1v-4n1vq");
        var __flow_node_mwg2uiiq_1v_4n1vq = click(522, 485, 50);
        if (!__flow_node_mwg2uiiq_1v_4n1vq) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2xkvp-20-wcr33")) {
        __flowNode("node-mwg2xkvp-20-wcr33");
        sleep(1000);
    }
    if (__flowGate("node-mwg3a2vy-2e-sej7p")) {
        __flowNode("node-mwg3a2vy-2e-sej7p");
        __flowNode("node-mwg3a2vy-2f-c3yuu");
        var __flow_node_mwg3a2vy_2f_c3yuu = click(873, 577, 50);
        if (!__flow_node_mwg3a2vy_2f_c3yuu) throw Error('操作失败');
        __flowNode("node-mwg3a2vy-2g-0bjze");
        sleep(1000);
        __flowNode("node-mwg3a2vy-2h-k5d1g");
        var __flow_node_mwg3a2vy_2h_k5d1g = click(1455, 662, 50);
        if (!__flow_node_mwg3a2vy_2h_k5d1g) throw Error('操作失败');
        __flowNode("node-mwg3a2vy-2i-jf7xh");
        sleep(1000);
        __flowNode("node-mwg3a2vy-2j-pw880");
        if (!!__flowImage("images\/成长上限.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mwg3a2vy-2k-ioc9q");
            var __flow_node_mwg3a2vy_2k_ioc9q = __flowImage("images\/成长上限.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mwg3a2vy_2k_ioc9q && !click(__flow_node_mwg3a2vy_2k_ioc9q.x, __flow_node_mwg3a2vy_2k_ioc9q.y)) {
                throw Error('点击失败');
            }
        } else {
            __flowNode("node-mwg3a2vy-2l-45nt6");
            var __flow_node_mwg3a2vy_2l_45nt6 = click(1455, 662, 50);
            if (!__flow_node_mwg3a2vy_2l_45nt6) throw Error('操作失败');
            __flowNode("node-mwg3dpqe-3n-rvbyx");
            sleep(1000);
            __flowNode("node-mwg3a2vy-2m-6805r");
            var __flow_node_mwg3a2vy_2m_6805r = click(1455, 662, 50);
            if (!__flow_node_mwg3a2vy_2m_6805r) throw Error('操作失败');
        }
        __flowNode("node-mwg3a2vy-2n-uoda9");
        sleep(1000);
    }
    if (__flowGate("node-mwg2ujhi-1w-oa3i3")) {
        __flowNode("node-mwg2ujhi-1w-oa3i3");
        var __flow_node_mwg2ujhi_1w_oa3i3 = click(538, 644, 50);
        if (!__flow_node_mwg2ujhi_1w_oa3i3) throw Error('操作失败');
    }
    if (__flowGate("node-mwg3agr8-2y-zgy6s")) {
        __flowNode("node-mwg3agr8-2y-zgy6s");
        sleep(1000);
    }
    if (__flowGate("node-mwg3aa1t-2o-f6uln")) {
        __flowNode("node-mwg3aa1t-2o-f6uln");
        __flowNode("node-mwg3aa1t-2p-xsl2r");
        var __flow_node_mwg3aa1t_2p_xsl2r = click(873, 577, 50);
        if (!__flow_node_mwg3aa1t_2p_xsl2r) throw Error('操作失败');
        __flowNode("node-mwg3aa1t-2q-njebi");
        sleep(1000);
        __flowNode("node-mwg3aa1t-2r-y9myr");
        var __flow_node_mwg3aa1t_2r_y9myr = click(1455, 662, 50);
        if (!__flow_node_mwg3aa1t_2r_y9myr) throw Error('操作失败');
        __flowNode("node-mwg3aa1t-2s-4fp7p");
        sleep(1000);
        __flowNode("node-mwg3aa1t-2t-salq5");
        if (!!__flowImage("images\/成长上限.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mwg3aa1t-2u-ci5db");
            var __flow_node_mwg3aa1t_2u_ci5db = __flowImage("images\/成长上限.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mwg3aa1t_2u_ci5db && !click(__flow_node_mwg3aa1t_2u_ci5db.x, __flow_node_mwg3aa1t_2u_ci5db.y)) {
                throw Error('点击失败');
            }
        } else {
            __flowNode("node-mwg3aa1t-2v-nnu27");
            var __flow_node_mwg3aa1t_2v_nnu27 = click(1455, 662, 50);
            if (!__flow_node_mwg3aa1t_2v_nnu27) throw Error('操作失败');
            __flowNode("node-mwg3dwk1-3o-qdg3i");
            sleep(1000);
            __flowNode("node-mwg3aa1t-2w-ul9yl");
            var __flow_node_mwg3aa1t_2w_ul9yl = click(1455, 662, 50);
            if (!__flow_node_mwg3aa1t_2w_ul9yl) throw Error('操作失败');
        }
        __flowNode("node-mwg3aa1t-2x-22agw");
        sleep(1000);
    }
    if (__flowGate("node-mwg2ukg9-1x-25vgq")) {
        __flowNode("node-mwg2ukg9-1x-25vgq");
        var __flow_node_mwg2ukg9_1x_25vgq = click(505, 783, 50);
        if (!__flow_node_mwg2ukg9_1x_25vgq) throw Error('操作失败');
    }
    if (__flowGate("node-mwg3ak4w-2z-y6fs6")) {
        __flowNode("node-mwg3ak4w-2z-y6fs6");
        sleep(1000);
    }
    if (__flowGate("node-mwg3azdv-3a-t3kdx")) {
        __flowNode("node-mwg3azdv-3a-t3kdx");
        __flowNode("node-mwg3azdv-3b-hs6dc");
        var __flow_node_mwg3azdv_3b_hs6dc = click(873, 577, 50);
        if (!__flow_node_mwg3azdv_3b_hs6dc) throw Error('操作失败');
        __flowNode("node-mwg3azdv-3c-2k6l9");
        sleep(1000);
        __flowNode("node-mwg3azdv-3d-tilcd");
        var __flow_node_mwg3azdv_3d_tilcd = click(1455, 662, 50);
        if (!__flow_node_mwg3azdv_3d_tilcd) throw Error('操作失败');
        __flowNode("node-mwg3azdv-3e-vvemm");
        sleep(1000);
        __flowNode("node-mwg3azdv-3f-i9r3e");
        if (!!__flowImage("images\/成长上限.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mwg3azdv-3g-r3rk8");
            var __flow_node_mwg3azdv_3g_r3rk8 = __flowImage("images\/成长上限.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mwg3azdv_3g_r3rk8 && !click(__flow_node_mwg3azdv_3g_r3rk8.x, __flow_node_mwg3azdv_3g_r3rk8.y)) {
                throw Error('点击失败');
            }
        } else {
            __flowNode("node-mwg3azdv-3h-v66p1");
            var __flow_node_mwg3azdv_3h_v66p1 = click(1455, 662, 50);
            if (!__flow_node_mwg3azdv_3h_v66p1) throw Error('操作失败');
            __flowNode("node-mwg3e8sv-3p-ecbzy");
            sleep(1000);
            __flowNode("node-mwg3azdv-3i-d7hlh");
            var __flow_node_mwg3azdv_3i_d7hlh = click(1455, 662, 50);
            if (!__flow_node_mwg3azdv_3i_d7hlh) throw Error('操作失败');
        }
        __flowNode("node-mwg3azdv-3j-o4q7a");
        sleep(1000);
    }
    if (__flowGate("node-mwg2ulnn-1y-yc8gb")) {
        __flowNode("node-mwg2ulnn-1y-yc8gb");
        var __flow_node_mwg2ulnn_1y_yc8gb = click(541, 898, 50);
        if (!__flow_node_mwg2ulnn_1y_yc8gb) throw Error('操作失败');
    }
    if (__flowGate("node-mwg2xipd-1z-njuge")) {
        __flowNode("node-mwg2xipd-1z-njuge");
        sleep(1000);
    }
    if (__flowGate("node-mwg3atr4-30-kwt0x")) {
        __flowNode("node-mwg3atr4-30-kwt0x");
        __flowNode("node-mwg3atr4-31-1d9li");
        var __flow_node_mwg3atr4_31_1d9li = click(873, 577, 50);
        if (!__flow_node_mwg3atr4_31_1d9li) throw Error('操作失败');
        __flowNode("node-mwg3atr4-32-1u2np");
        sleep(1000);
        __flowNode("node-mwg3atr4-33-0p9oq");
        var __flow_node_mwg3atr4_33_0p9oq = click(1455, 662, 50);
        if (!__flow_node_mwg3atr4_33_0p9oq) throw Error('操作失败');
        __flowNode("node-mwg3atr4-34-sfz0i");
        sleep(1000);
        __flowNode("node-mwg3atr4-35-5wmrl");
        if (!!__flowImage("images\/成长上限.png", 0, 300, { threshold: 0.9 })) {
            __flowNode("node-mwg3atr4-36-9gpz6");
            var __flow_node_mwg3atr4_36_9gpz6 = __flowImage("images\/成长上限.png", 5000, 300, { threshold: 0.9 });
            if (__flow_node_mwg3atr4_36_9gpz6 && !click(__flow_node_mwg3atr4_36_9gpz6.x, __flow_node_mwg3atr4_36_9gpz6.y)) {
                throw Error('点击失败');
            }
        } else {
            __flowNode("node-mwg3atr4-37-eoclp");
            var __flow_node_mwg3atr4_37_eoclp = click(1455, 662, 50);
            if (!__flow_node_mwg3atr4_37_eoclp) throw Error('操作失败');
            __flowNode("node-mwg3efy0-3q-fk7t8");
            sleep(1000);
            __flowNode("node-mwg3atr4-38-wvjfy");
            var __flow_node_mwg3atr4_38_wvjfy = click(1455, 662, 50);
            if (!__flow_node_mwg3atr4_38_wvjfy) throw Error('操作失败');
        }
        __flowNode("node-mwg3atr4-39-9nsgj");
        sleep(1000);
    }
    if (__flowGate("node-mwg3b8ji-3k-y3fpd")) {
        __flowNode("node-mwg3b8ji-3k-y3fpd");
        sleep(3000);
    }
    if (__flowGate("node-mwg3bdqf-3l-a0q14")) {
        __flowNode("node-mwg3bdqf-3l-a0q14");
        var __flow_node_mwg3bdqf_3l_a0q14 = click(1666, 102, 50);
        if (!__flow_node_mwg3bdqf_3l_a0q14) throw Error('操作失败');
    }
}
function __flowRecover() {
}
