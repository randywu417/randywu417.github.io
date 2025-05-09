var P, R = -1, h = function(e) {
  addEventListener("pageshow", function(t) {
    t.persisted && (R = t.timeStamp, e(t));
  }, !0);
}, S = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, y = function() {
  var e = S();
  return e && e.activationStart || 0;
}, d = function(e, t) {
  var n = S(), i = "navigate";
  return R >= 0 ? i = "back-forward-cache" : n && (document.prerendering || y() > 0 ? i = "prerender" : document.wasDiscarded ? i = "restore" : n.type && (i = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: i };
}, p = function(e, t, n) {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(e)) {
      var i = new PerformanceObserver(function(r) {
        Promise.resolve().then(function() {
          t(r.getEntries());
        });
      });
      return i.observe(Object.assign({ type: e, buffered: !0 }, n || {})), i;
    }
  } catch {
  }
}, l = function(e, t, n, i) {
  var r, o;
  return function(u) {
    t.value >= 0 && (u || i) && ((o = t.value - (r || 0)) || r === void 0) && (r = t.value, t.delta = o, t.rating = function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    }(t.value, n), e(t));
  };
}, A = function(e) {
  requestAnimationFrame(function() {
    return requestAnimationFrame(function() {
      return e();
    });
  });
}, C = function(e) {
  document.addEventListener("visibilitychange", function() {
    document.visibilityState === "hidden" && e();
  });
}, I = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, v = -1, w = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, T = function(e) {
  document.visibilityState === "hidden" && v > -1 && (v = e.type === "visibilitychange" ? e.timeStamp : 0, G());
}, F = function() {
  addEventListener("visibilitychange", T, !0), addEventListener("prerenderingchange", T, !0);
}, G = function() {
  removeEventListener("visibilitychange", T, !0), removeEventListener("prerenderingchange", T, !0);
}, q = function() {
  return v < 0 && (v = w(), F(), h(function() {
    setTimeout(function() {
      v = w(), F();
    }, 0);
  })), { get firstHiddenTime() {
    return v;
  } };
}, E = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", function() {
    return e();
  }, !0) : e();
}, M = [1800, 3e3], J = function(e, t) {
  t = t || {}, E(function() {
    var n, i = q(), r = d("FCP"), o = p("paint", function(u) {
      u.forEach(function(c) {
        c.name === "first-contentful-paint" && (o.disconnect(), c.startTime < i.firstHiddenTime && (r.value = Math.max(c.startTime - y(), 0), r.entries.push(c), n(!0)));
      });
    });
    o && (n = l(e, r, M, t.reportAllChanges), h(function(u) {
      r = d("FCP"), n = l(e, r, M, t.reportAllChanges), A(function() {
        r.value = performance.now() - u.timeStamp, n(!0);
      });
    }));
  });
}, k = [0.1, 0.25], Y = function(e, t) {
  t = t || {}, J(I(function() {
    var n, i = d("CLS", 0), r = 0, o = [], u = function(a) {
      a.forEach(function(s) {
        if (!s.hadRecentInput) {
          var _ = o[0], z = o[o.length - 1];
          r && s.startTime - z.startTime < 1e3 && s.startTime - _.startTime < 5e3 ? (r += s.value, o.push(s)) : (r = s.value, o = [s]);
        }
      }), r > i.value && (i.value = r, i.entries = o, n());
    }, c = p("layout-shift", u);
    c && (n = l(e, i, k, t.reportAllChanges), C(function() {
      u(c.takeRecords()), n(!0);
    }), h(function() {
      r = 0, i = d("CLS", 0), n = l(e, i, k, t.reportAllChanges), A(function() {
        return n();
      });
    }), setTimeout(n, 0));
  }));
}, H = 0, b = 1 / 0, m = 0, K = function(e) {
  e.forEach(function(t) {
    t.interactionId && (b = Math.min(b, t.interactionId), m = Math.max(m, t.interactionId), H = m ? (m - b) / 7 + 1 : 0);
  });
}, O = function() {
  return P ? H : performance.interactionCount || 0;
}, Q = function() {
  "interactionCount" in performance || P || (P = p("event", K, { type: "event", buffered: !0, durationThreshold: 0 }));
}, f = [], g = /* @__PURE__ */ new Map(), D = 0, U = function() {
  var e = Math.min(f.length - 1, Math.floor((O() - D) / 50));
  return f[e];
}, V = [], W = function(e) {
  if (V.forEach(function(r) {
    return r(e);
  }), e.interactionId || e.entryType === "first-input") {
    var t = f[f.length - 1], n = g.get(e.interactionId);
    if (n || f.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var i = { id: e.interactionId, latency: e.duration, entries: [e] };
        g.set(i.id, i), f.push(i);
      }
      f.sort(function(r, o) {
        return o.latency - r.latency;
      }), f.length > 10 && f.splice(10).forEach(function(r) {
        return g.delete(r.id);
      });
    }
  }
}, j = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = I(e), document.visibilityState === "hidden" ? e() : (n = t(e), C(e)), n;
}, B = [200, 500], Z = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, E(function() {
    var n;
    Q();
    var i, r = d("INP"), o = function(c) {
      j(function() {
        c.forEach(W);
        var a = U();
        a && a.latency !== r.value && (r.value = a.latency, r.entries = a.entries, i());
      });
    }, u = p("event", o, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    i = l(e, r, B, t.reportAllChanges), u && (u.observe({ type: "first-input", buffered: !0 }), C(function() {
      o(u.takeRecords()), i(!0);
    }), h(function() {
      D = O(), f.length = 0, g.clear(), r = d("INP"), i = l(e, r, B, t.reportAllChanges);
    }));
  }));
}, x = [2500, 4e3], L = {}, $ = function(e, t) {
  t = t || {}, E(function() {
    var n, i = q(), r = d("LCP"), o = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach(function(s) {
        s.startTime < i.firstHiddenTime && (r.value = Math.max(s.startTime - y(), 0), r.entries = [s], n());
      });
    }, u = p("largest-contentful-paint", o);
    if (u) {
      n = l(e, r, x, t.reportAllChanges);
      var c = I(function() {
        L[r.id] || (o(u.takeRecords()), u.disconnect(), L[r.id] = !0, n(!0));
      });
      ["keydown", "click"].forEach(function(a) {
        addEventListener(a, function() {
          return j(c);
        }, { once: !0, capture: !0 });
      }), C(c), h(function(a) {
        r = d("LCP"), n = l(e, r, x, t.reportAllChanges), A(function() {
          r.value = performance.now() - a.timeStamp, L[r.id] = !0, n(!0);
        });
      });
    }
  });
}, N = [800, 1800], X = function e(t) {
  document.prerendering ? E(function() {
    return e(t);
  }) : document.readyState !== "complete" ? addEventListener("load", function() {
    return e(t);
  }, !0) : setTimeout(t, 0);
}, ee = function(e, t) {
  t = t || {};
  var n = d("TTFB"), i = l(e, n, N, t.reportAllChanges);
  X(function() {
    var r = S();
    r && (n.value = Math.max(r.responseStart - y(), 0), n.entries = [r], i(!0), h(function() {
      n = d("TTFB", 0), (i = l(e, n, N, t.reportAllChanges))(!0);
    }));
  });
};
export {
  k as CLSThresholds,
  M as FCPThresholds,
  B as INPThresholds,
  x as LCPThresholds,
  N as TTFBThresholds,
  Y as onCLS,
  J as onFCP,
  Z as onINP,
  $ as onLCP,
  ee as onTTFB
};
