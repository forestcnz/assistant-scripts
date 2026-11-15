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
        "images\/夫子.png",
        "images\/中心龙头.png",
        "images\/私塾学习.png",
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
    if (__flowGate("node-mwfzyvrz-4q-9817e")) {
        __flowNode("node-mwfzyvrz-4q-9817e");
        for (var __flow_node_mwfzyvrz_4q_9817e = 0; ; __flow_node_mwfzyvrz_4q_9817e++) {
            if (__flow_node_mwfzyvrz_4q_9817e > 0) sleep(300);
            __flowNode("node-mwfzz7jb-4r-gejk0");
            if (!!__flowImage("images\/夫子.png", 0, 300, { threshold: 0.7 })) {
                __flowNode("node-mwg06oeu-4w-g5x11");
                sleep(1000);
                __flowNode("node-mwg00nj9-4s-dn7yp");
                var __flow_node_mwg00nj9_4s_dn7yp = __flowImage("images\/夫子.png", 5000, 300, { threshold: 0.7 });
                if (__flow_node_mwg00nj9_4s_dn7yp && !click(__flow_node_mwg00nj9_4s_dn7yp.x, __flow_node_mwg00nj9_4s_dn7yp.y)) {
                    throw Error('点击失败');
                }
                __flowNode("node-mwg017ei-4t-0iktz");
                sleep(1000);
                __flowNode("node-mwg01nx3-4v-ri21v");
                break;
            } else {
                __flowNode("node-mwg019j6-4u-lnzob");
                sleep(1000);
                __flowNode("node-mwfzu17n-4b-rqnmg");
                for (var __flow_node_mwfzu17n_4b_rqnmg = 0; ; __flow_node_mwfzu17n_4b_rqnmg++) {
                    if (__flow_node_mwfzu17n_4b_rqnmg > 0) sleep(300);
                    __flowNode("node-mwfzu17n-4c-8s5ps");
                    if (!!__flowImage("images\/中心龙头.png", 0, 300, { threshold: 0.8 })) {
                        __flowNode("node-mwfzu17n-4d-zehzz");
                        var __flow_node_mwfzu17n_4d_zehzz = __flowImage("images\/中心龙头.png", 5000, 300, { threshold: 0.8 });
                        if (__flow_node_mwfzu17n_4d_zehzz && !click(__flow_node_mwfzu17n_4d_zehzz.x, __flow_node_mwfzu17n_4d_zehzz.y)) {
                            throw Error('点击失败');
                        }
                        __flowNode("node-mwfzu17n-4e-3mhpb");
                        sleep(4000);
                        __flowNode("node-mwfzu17n-4f-rkbmc");
                        break;
                    } else {
                        __flowNode("node-mwfzu17n-4g-ru3qt");
                        var __flow_node_mwfzu17n_4g_ru3qt = click(1778, 24, 50);
                        if (!__flow_node_mwfzu17n_4g_ru3qt) throw Error('操作失败');
                        __flowNode("node-mwfzu17n-4h-u74bf");
                        sleep(1000);
                        __flowNode("node-mwfzu17n-4i-g7k0h");
                        var __flow_node_mwfzu17n_4i_g7k0h = click(1103, 760, 50);
                        if (!__flow_node_mwfzu17n_4i_g7k0h) throw Error('操作失败');
                        __flowNode("node-mwfzu17n-4j-fe4hx");
                        sleep(1000);
                    }
                }
                __flowNode("node-mwfzv7rb-4l-q7pwo");
                __flowNode("node-mwfzw7oh-4m-m6gxw");
                sleep(1000);
                __flowNode("node-mwfzw99s-4n-kzthj");
                var __flow_node_mwfzw99s_4n_kzthj = click(973, 47, 50);
                if (!__flow_node_mwfzw99s_4n_kzthj) throw Error('操作失败');
                __flowNode("node-mwfzxcd3-4o-7nuin");
                sleep(3000);
                __flowNode("node-mwfzxgxi-4p-73tp2");
                var __flow_node_mwfzxgxi_4p_73tp2 = click(1363, 112, 50);
                if (!__flow_node_mwfzxgxi_4p_73tp2) throw Error('操作失败');
                __flowNode("node-mwg08qoh-4x-uuv99");
                sleep(2000);
            }
        }
    }
    if (__flowGate("node-mwfzb4mx-2f-g7ns2")) {
        __flowNode("node-mwfzb4mx-2f-g7ns2");
        var __flow_node_mwfzb4mx_2f_g7ns2 = __flowWaitClick("images\/私塾学习.png", 0, 300, { threshold: 0.9, offsetX: 0, offsetY: 0, afterWait: 0, stable: false, clickRetry: 2, retryGap: 300, missLimit: 0, failure: "stop" });
        if (!__flow_node_mwfzb4mx_2f_g7ns2) throw Error('等待图片超时');
    }
    if (__flowGate("node-mwfzd04s-2j-9el9a")) {
        __flowNode("node-mwfzd04s-2j-9el9a");
        sleep(1000);
    }
    if (__flowGate("node-mwfzc6v2-2g-e8feq")) {
        __flowNode("node-mwfzc6v2-2g-e8feq");
        __flowNode("node-mwfzctle-2h-4mtao");
        var __flow_node_mwfzctle_2h_4mtao = click(1430, 321, 50);
        if (!__flow_node_mwfzctle_2h_4mtao) throw Error('操作失败');
        __flowNode("node-mwfzcvk0-2i-pmx2u");
        sleep(1000);
        __flowNode("node-mwfzdzdt-2k-lwlxm");
        var __flow_node_mwfzdzdt_2k_lwlxm = click(1430, 321, 50);
        if (!__flow_node_mwfzdzdt_2k_lwlxm) throw Error('操作失败');
        __flowNode("node-mwfze1yi-2l-lsd6z");
        sleep(1000);
        __flowNode("node-mwfzepja-2m-kt1rf");
        var __flow_node_mwfzepja_2m_kt1rf = click(1094, 516, 50);
        if (!__flow_node_mwfzepja_2m_kt1rf) throw Error('操作失败');
        __flowNode("node-mwfzezja-2n-vk922");
        sleep(1000);
        __flowNode("node-mwfzfbx6-2o-fkpfm");
        var __flow_node_mwfzfbx6_2o_fkpfm = click(960, 747, 50);
        if (!__flow_node_mwfzfbx6_2o_fkpfm) throw Error('操作失败');
        __flowNode("node-mwfzfdo2-2p-ccdeb");
        sleep(1000);
    }
    if (__flowGate("node-mwfzhv09-2q-3o98c")) {
        __flowNode("node-mwfzhv09-2q-3o98c");
        var __flow_node_mwfzhv09_2q_3o98c = click(914, 824, 50);
        if (!__flow_node_mwfzhv09_2q_3o98c) throw Error('操作失败');
    }
    if (__flowGate("node-mwfzjcvv-2w-9ny4i")) {
        __flowNode("node-mwfzjcvv-2w-9ny4i");
        sleep(1000);
    }
    if (__flowGate("node-mwfzoyek-30-jyv2u")) {
        __flowNode("node-mwfzoyek-30-jyv2u");
        __flowNode("node-mwfzoyek-31-8mvqb");
        var __flow_node_mwfzoyek_31_8mvqb = click(1430, 321, 50);
        if (!__flow_node_mwfzoyek_31_8mvqb) throw Error('操作失败');
        __flowNode("node-mwfzoyek-32-s1dq4");
        sleep(1000);
        __flowNode("node-mwfzoyek-33-fi44q");
        var __flow_node_mwfzoyek_33_fi44q = click(1430, 321, 50);
        if (!__flow_node_mwfzoyek_33_fi44q) throw Error('操作失败');
        __flowNode("node-mwfzoyek-34-73msz");
        sleep(1000);
        __flowNode("node-mwfzoyek-35-piujw");
        var __flow_node_mwfzoyek_35_piujw = click(1094, 516, 50);
        if (!__flow_node_mwfzoyek_35_piujw) throw Error('操作失败');
        __flowNode("node-mwfzoyek-36-svxoy");
        sleep(1000);
        __flowNode("node-mwfzoyek-37-ufxph");
        var __flow_node_mwfzoyek_37_ufxph = click(960, 747, 50);
        if (!__flow_node_mwfzoyek_37_ufxph) throw Error('操作失败');
        __flowNode("node-mwfzoyek-38-4wref");
        sleep(1000);
    }
    if (__flowGate("node-mwfzi7ia-2r-vbqmd")) {
        __flowNode("node-mwfzi7ia-2r-vbqmd");
        var __flow_node_mwfzi7ia_2r_vbqmd = click(1050, 831, 50);
        if (!__flow_node_mwfzi7ia_2r_vbqmd) throw Error('操作失败');
    }
    if (__flowGate("node-mwfzjeov-2x-33bbl")) {
        __flowNode("node-mwfzjeov-2x-33bbl");
        sleep(1000);
    }
    if (__flowGate("node-mwfzp4xa-39-psjz5")) {
        __flowNode("node-mwfzp4xa-39-psjz5");
        __flowNode("node-mwfzp4xa-3a-dnsso");
        var __flow_node_mwfzp4xa_3a_dnsso = click(1430, 321, 50);
        if (!__flow_node_mwfzp4xa_3a_dnsso) throw Error('操作失败');
        __flowNode("node-mwfzp4xa-3b-bednr");
        sleep(1000);
        __flowNode("node-mwfzp4xa-3c-b1ha3");
        var __flow_node_mwfzp4xa_3c_b1ha3 = click(1430, 321, 50);
        if (!__flow_node_mwfzp4xa_3c_b1ha3) throw Error('操作失败');
        __flowNode("node-mwfzp4xa-3d-85udy");
        sleep(1000);
        __flowNode("node-mwfzp4xa-3e-wk1jx");
        var __flow_node_mwfzp4xa_3e_wk1jx = click(1094, 516, 50);
        if (!__flow_node_mwfzp4xa_3e_wk1jx) throw Error('操作失败');
        __flowNode("node-mwfzp4xa-3f-wqnwx");
        sleep(1000);
        __flowNode("node-mwfzp4xa-3g-xyd1y");
        var __flow_node_mwfzp4xa_3g_xyd1y = click(960, 747, 50);
        if (!__flow_node_mwfzp4xa_3g_xyd1y) throw Error('操作失败');
        __flowNode("node-mwfzp4xa-3h-27gys");
        sleep(1000);
    }
    if (__flowGate("node-mwfziqin-2s-dwwhi")) {
        __flowNode("node-mwfziqin-2s-dwwhi");
        var __flow_node_mwfziqin_2s_dwwhi = click(1168, 831, 50);
        if (!__flow_node_mwfziqin_2s_dwwhi) throw Error('操作失败');
    }
    if (__flowGate("node-mwfzjga6-2y-03uqh")) {
        __flowNode("node-mwfzjga6-2y-03uqh");
        sleep(1000);
    }
    if (__flowGate("node-mwfzq69b-3r-nohid")) {
        __flowNode("node-mwfzq69b-3r-nohid");
        __flowNode("node-mwfzq69b-3s-0wyfl");
        var __flow_node_mwfzq69b_3s_0wyfl = click(1430, 321, 50);
        if (!__flow_node_mwfzq69b_3s_0wyfl) throw Error('操作失败');
        __flowNode("node-mwfzq69b-3t-lqpyd");
        sleep(1000);
        __flowNode("node-mwfzq69b-3u-j90jt");
        var __flow_node_mwfzq69b_3u_j90jt = click(1430, 321, 50);
        if (!__flow_node_mwfzq69b_3u_j90jt) throw Error('操作失败');
        __flowNode("node-mwfzq69b-3v-vij6k");
        sleep(1000);
        __flowNode("node-mwfzq69b-3w-pqti4");
        var __flow_node_mwfzq69b_3w_pqti4 = click(1094, 516, 50);
        if (!__flow_node_mwfzq69b_3w_pqti4) throw Error('操作失败');
        __flowNode("node-mwfzq69b-3x-oxb3l");
        sleep(1000);
        __flowNode("node-mwfzq69b-3y-hqdw1");
        var __flow_node_mwfzq69b_3y_hqdw1 = click(960, 747, 50);
        if (!__flow_node_mwfzq69b_3y_hqdw1) throw Error('操作失败');
        __flowNode("node-mwfzq69b-3z-4f4ay");
        sleep(1000);
    }
    if (__flowGate("node-mwfziqw6-2t-jnk8i")) {
        __flowNode("node-mwfziqw6-2t-jnk8i");
        var __flow_node_mwfziqw6_2t_jnk8i = click(1317, 831, 50);
        if (!__flow_node_mwfziqw6_2t_jnk8i) throw Error('操作失败');
    }
    if (__flowGate("node-mwfzjj7d-2z-usn9p")) {
        __flowNode("node-mwfzjj7d-2z-usn9p");
        sleep(1000);
    }
    if (__flowGate("node-mwfzprel-3i-ndttz")) {
        __flowNode("node-mwfzprel-3i-ndttz");
        __flowNode("node-mwfzprel-3j-6k7jz");
        var __flow_node_mwfzprel_3j_6k7jz = click(1430, 321, 50);
        if (!__flow_node_mwfzprel_3j_6k7jz) throw Error('操作失败');
        __flowNode("node-mwfzprel-3k-fd4yx");
        sleep(1000);
        __flowNode("node-mwfzprel-3l-oa1a4");
        var __flow_node_mwfzprel_3l_oa1a4 = click(1430, 321, 50);
        if (!__flow_node_mwfzprel_3l_oa1a4) throw Error('操作失败');
        __flowNode("node-mwfzprel-3m-8v4jt");
        sleep(1000);
        __flowNode("node-mwfzprel-3n-xaoyg");
        var __flow_node_mwfzprel_3n_xaoyg = click(1094, 516, 50);
        if (!__flow_node_mwfzprel_3n_xaoyg) throw Error('操作失败');
        __flowNode("node-mwfzprel-3o-0ags9");
        sleep(1000);
        __flowNode("node-mwfzprel-3p-eoa7i");
        var __flow_node_mwfzprel_3p_eoa7i = click(960, 747, 50);
        if (!__flow_node_mwfzprel_3p_eoa7i) throw Error('操作失败');
        __flowNode("node-mwfzprel-3q-jprbn");
        sleep(1000);
    }
    if (__flowGate("node-mwfzirdg-2u-y646x")) {
        __flowNode("node-mwfzirdg-2u-y646x");
        var __flow_node_mwfzirdg_2u_y646x = click(1455, 831, 50);
        if (!__flow_node_mwfzirdg_2u_y646x) throw Error('操作失败');
    }
    if (__flowGate("node-mwfzjak3-2v-6z20m")) {
        __flowNode("node-mwfzjak3-2v-6z20m");
        sleep(1000);
    }
    if (__flowGate("node-mwfzqaul-40-5h37c")) {
        __flowNode("node-mwfzqaul-40-5h37c");
        __flowNode("node-mwfzqaul-41-86nkw");
        var __flow_node_mwfzqaul_41_86nkw = click(1430, 321, 50);
        if (!__flow_node_mwfzqaul_41_86nkw) throw Error('操作失败');
        __flowNode("node-mwfzqaul-42-7i3mn");
        sleep(1000);
        __flowNode("node-mwfzqaul-43-fzubm");
        var __flow_node_mwfzqaul_43_fzubm = click(1430, 321, 50);
        if (!__flow_node_mwfzqaul_43_fzubm) throw Error('操作失败');
        __flowNode("node-mwfzqaul-44-tiikf");
        sleep(1000);
        __flowNode("node-mwfzqaul-45-plw8s");
        var __flow_node_mwfzqaul_45_plw8s = click(1094, 516, 50);
        if (!__flow_node_mwfzqaul_45_plw8s) throw Error('操作失败');
        __flowNode("node-mwfzqaul-46-mbwtp");
        sleep(1000);
        __flowNode("node-mwfzqaul-47-ta88e");
        var __flow_node_mwfzqaul_47_ta88e = click(960, 747, 50);
        if (!__flow_node_mwfzqaul_47_ta88e) throw Error('操作失败');
        __flowNode("node-mwfzqaul-48-i6l36");
        sleep(1000);
    }
    if (__flowGate("node-mwfzs8r3-4a-noix4")) {
        __flowNode("node-mwfzs8r3-4a-noix4");
        sleep(1000);
    }
    if (__flowGate("node-mwfzs3k9-49-w8xrp")) {
        __flowNode("node-mwfzs3k9-49-w8xrp");
        var __flow_node_mwfzs3k9_49_w8xrp = click(1661, 95, 50);
        if (!__flow_node_mwfzs3k9_49_w8xrp) throw Error('操作失败');
    }
}
function __flowRecover() {
}
