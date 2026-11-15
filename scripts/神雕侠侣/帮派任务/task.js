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
        "images\/任务使_1.png",
        "images\/任务使.png",
        "images\/调整位置.png",
        "images\/进行帮派任务.png",
        "images\/帮派宣言.png",
        "images\/宣言.png",
        "images\/使用宣言.png",
        "images\/交付任务.png",
        "images\/比武.png",
        "images\/战况.png",
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
    if (__flowGate("node-mwghao7m-c-jngyq")) {
        __flowNode("node-mwghao7m-c-jngyq");
        for (var __flow_node_mwghao7m_c_jngyq = 0; ; __flow_node_mwghao7m_c_jngyq++) {
            if (__flow_node_mwghao7m_c_jngyq > 0) sleep(300);
            __flowNode("node-mwghhy5e-j-t9cyq");
            if (!!__flowImage("images\/任务使_1.png", 0, 300, { threshold: 0.7 })) {
                __flowNode("node-mwghiaab-k-olrok");
                var __flow_node_mwghiaab_k_olrok = __flowImage("images\/任务使.png", 5000, 300, { threshold: 0.7 });
                if (__flow_node_mwghiaab_k_olrok && !click(__flow_node_mwghiaab_k_olrok.x, __flow_node_mwghiaab_k_olrok.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwghiovb-l-xzisk");
                sleep(1000);
                __flowNode("node-mwghiye8-m-4x3nd");
                break;
            } else {
                __flowNode("node-mwgh09lp-1-oya5b");
                __flowNode("node-mwgh0kz7-2-hjz4b");
                var __flow_node_mwgh0kz7_2_hjz4b = click(1778, 24, 50);
                if (!__flow_node_mwgh0kz7_2_hjz4b) throw Error('操作失败');
                __flowNode("node-mwghcs05-f-0uhiv");
                var __flow_node_mwghcs05_f_0uhiv = click(1103, 760, 50);
                if (!__flow_node_mwghcs05_f_0uhiv) throw Error('操作失败');
                __flowNode("node-mwgh0tpm-3-t18g9");
                sleep(1000);
                __flowNode("node-mwghdm72-h-ofhaz");
                var __flow_node_mwghdm72_h_ofhaz = click(1778, 24, 50);
                if (!__flow_node_mwghdm72_h_ofhaz) throw Error('操作失败');
                __flowNode("node-mwgh0vw5-4-xcia3");
                var __flow_node_mwgh0vw5_4_xcia3 = click(1466, 920, 50);
                if (!__flow_node_mwgh0vw5_4_xcia3) throw Error('操作失败');
                __flowNode("node-mwgh3vi9-5-u41nr");
                sleep(1000);
                __flowNode("node-mwhuv7e3-c-asl8d");
                var __flow_node_mwhuv7e3_c_asl8d = __flowImage("images\/调整位置.png", 5000, 300, { threshold: 0.9 });
                if (__flow_node_mwhuv7e3_c_asl8d && !click(__flow_node_mwhuv7e3_c_asl8d.x, __flow_node_mwhuv7e3_c_asl8d.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwhuvwky-e-39upl");
                sleep(2000);
            }
        }
    }
    if (__flowGate("node-mwghl15h-o-32h9s")) {
        __flowNode("node-mwghl15h-o-32h9s");
        for (var __flow_node_mwghl15h_o_32h9s = 0; ; __flow_node_mwghl15h_o_32h9s++) {
            if (__flow_node_mwghl15h_o_32h9s > 0) sleep(300);
            __flowNode("node-mwghl79l-p-anqh4");
            var __flow_node_mwghl79l_p_anqh4 = __flowImage("images\/进行帮派任务.png", 5000, 300, { threshold: 0.7 });
            if (__flow_node_mwghl79l_p_anqh4 && !click(__flow_node_mwghl79l_p_anqh4.x, __flow_node_mwghl79l_p_anqh4.y)) {
                throw Error('点击失败');
            }
            __flowNode("node-mwghm4g7-q-suk60");
            __flowNode("node-mwghmwya-s-fs678");
            if (!!__flowImage("images\/帮派宣言.png", 0, 300, { threshold: 0.7 })) {
                __flowNode("node-mwghotb0-u-x4tux");
                var __flow_node_mwghotb0_u_x4tux = __flowImage("images\/帮派宣言.png", 5000, 300, { threshold: 0.7 });
                if (__flow_node_mwghotb0_u_x4tux && !click(__flow_node_mwghotb0_u_x4tux.x, __flow_node_mwghotb0_u_x4tux.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwgi6c44-1f-uvvtx");
                sleep(1000);
                __flowNode("node-mwgi69qa-1e-vp98p");
                var __flow_node_mwgi69qa_1e_vp98p = click(1450, 821, 50);
                if (!__flow_node_mwgi69qa_1e_vp98p) throw Error('操作失败');
                __flowNode("node-mwgi74ht-1g-o2hqo");
                sleep(500);
                __flowNode("node-mwgi7bav-1h-usd32");
                var __flow_node_mwgi7bav_1h_usd32 = click(1450, 821, 50);
                if (!__flow_node_mwgi7bav_1h_usd32) throw Error('操作失败');
                __flowNode("node-mwhv08gu-g-wn67p");
                sleep(1000);
                __flowNode("node-mwhv04rx-f-e3dbc");
                var __flow_node_mwhv04rx_f_e3dbc = click(107, 488, 50);
                if (!__flow_node_mwhv04rx_f_e3dbc) throw Error('操作失败');
                __flowNode("node-mwhv3ynm-i-0fxgf");
                sleep(2000);
                __flowNode("node-mwgi8mmu-1j-0et4m");
                var __flow_node_mwgi8mmu_1j_0et4m = __flowWaitClick("images\/宣言.png", 0, 300, { threshold: 0.7, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
                if (!__flow_node_mwgi8mmu_1j_0et4m) throw Error('等待图片超时');
                __flowNode("node-mwgi98mz-1k-m1mqe");
                sleep(500);
                __flowNode("node-mwgi9dqb-1l-wfvit");
                var __flow_node_mwgi9dqb_1l_wfvit = __flowWaitClick("images\/使用宣言.png", 0, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
                if (!__flow_node_mwgi9dqb_1l_wfvit) throw Error('等待图片超时');
                __flowNode("node-mwgia6m5-1m-pv7mj");
                sleep(3000);
                __flowNode("node-mwhv18q4-h-ccs04");
                var __flow_node_mwhv18q4_h_ccs04 = click(107, 488, 50);
                if (!__flow_node_mwhv18q4_h_ccs04) throw Error('操作失败');
                __flowNode("node-mwgibt6q-1o-h9fmf");
                var __flow_node_mwgibt6q_1o_h9fmf = __flowWaitClick("images\/交付任务.png", 0, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
                if (!__flow_node_mwgibt6q_1o_h9fmf) throw Error('等待图片超时');
                __flowNode("node-mwgicd38-1p-gmicy");
                sleep(4000);
            } else {
                __flowNode("node-mwghoqo7-t-5ln6e");
                sleep(1000);
            }
            __flowNode("node-mwghmkd6-r-2ggxf");
            __flowNode("node-mwghqclp-v-vv87z");
            if (!!__flowImage("images\/比武.png", 0, 300, { threshold: 0.7 })) {
                __flowNode("node-mwghqodg-w-svb24");
                var __flow_node_mwghqodg_w_svb24 = __flowImage("images\/比武.png", 5000, 300, { threshold: 0.7 });
                if (__flow_node_mwghqodg_w_svb24 && !click(__flow_node_mwghqodg_w_svb24.x, __flow_node_mwghqodg_w_svb24.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwghregg-x-3sysu");
                sleep(1000);
                __flowNode("node-mwghrr0j-y-s51e7");
                var __flow_node_mwghrr0j_y_s51e7 = click(1436, 817, 50);
                if (!__flow_node_mwghrr0j_y_s51e7) throw Error('操作失败');
                __flowNode("node-mwghsidd-z-8m8b9");
                sleep(1000);
                __flowNode("node-mwghsm7x-10-jid0r");
                var __flow_node_mwghsm7x_10_jid0r = click(1436, 817, 50);
                if (!__flow_node_mwghsm7x_10_jid0r) throw Error('操作失败');
                __flowNode("node-mwghtaae-12-miwip");
                sleep(1000);
                __flowNode("node-mwght0z6-11-se9q6");
                var __flow_node_mwght0z6_11_se9q6 = __flowText("比武", { timeoutMs: 5000, intervalMs: 300, match: "contains" });
                if (__flow_node_mwght0z6_11_se9q6 && !click(__flow_node_mwght0z6_11_se9q6.centerX(), __flow_node_mwght0z6_11_se9q6.centerY())) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwghug6s-15-49kcb");
                sleep(3000);
                __flowNode("node-mwgi2wqx-1d-hqxk9");
                var __flow_node_mwgi2wqx_1d_hqxk9 = click(256, 638, 50);
                if (!__flow_node_mwgi2wqx_1d_hqxk9) throw Error('操作失败');
                __flowNode("node-mwghtsur-13-084qd");
                sleep(1000);
                __flowNode("node-mwghuqfj-16-3cmls");
                var __flow_node_mwghuqfj_16_3cmls = __flowWaitImageGone("images\/战况.png", 1000000, 300, { threshold: 0.9 });
                if (!__flow_node_mwghuqfj_16_3cmls) throw Error('等待图片消失超时');
                __flowNode("node-mwghvv7w-17-ky5l3");
                sleep(1000);
                __flowNode("node-mwghwa2x-18-l3kg3");
                var __flow_node_mwghwa2x_18_l3kg3 = __flowText("交付任务", { timeoutMs: 5000, intervalMs: 300, match: "contains", region: [3, 320, 465, 609] });
                if (__flow_node_mwghwa2x_18_l3kg3 && !click(__flow_node_mwghwa2x_18_l3kg3.centerX(), __flow_node_mwghwa2x_18_l3kg3.centerY())) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwghx12u-19-bhlwu");
                sleep(1000);
                __flowNode("node-mwghx711-1a-in47u");
                var __flow_node_mwghx711_1a_in47u = __flowImage("images\/交付任务.png", 5000, 300, { threshold: 0.7 });
                if (__flow_node_mwghx711_1a_in47u && !click(__flow_node_mwghx711_1a_in47u.x, __flow_node_mwghx711_1a_in47u.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwghxrij-1b-rj7qp");
                sleep(1000);
            } else {
                __flowNode("node-mwghxu0r-1c-3f765");
                sleep(1000);
            }
        }
    }
    if (__flowGate("node-mwhuvsho-d-xurv1")) {
        __flowNode("node-mwhuvsho-d-xurv1");
        sleep(1000);
    }
}
function __flowRecover() {
}
