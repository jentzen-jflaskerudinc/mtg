(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 || (b2 = {}))
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __spreadProps = (a2, b2) => __defProps(a2, __getOwnPropDescs(b2));

  // public/v1/vendor/preact-htm.js
  var e;
  var n;
  var _;
  var t;
  var o;
  var r;
  var u;
  var l = {};
  var i = [];
  var c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function s(e2, n2) {
    for (var _2 in n2) e2[_2] = n2[_2];
    return e2;
  }
  function f(e2) {
    var n2 = e2.parentNode;
    n2 && n2.removeChild(e2);
  }
  function a(n2, _2, t2) {
    var o2, r2, u2, l2 = {};
    for (u2 in _2) "key" == u2 ? o2 = _2[u2] : "ref" == u2 ? r2 = _2[u2] : l2[u2] = _2[u2];
    if (arguments.length > 2 && (l2.children = arguments.length > 3 ? e.call(arguments, 2) : t2), "function" == typeof n2 && null != n2.defaultProps) for (u2 in n2.defaultProps) void 0 === l2[u2] && (l2[u2] = n2.defaultProps[u2]);
    return p(n2, l2, o2, r2, null);
  }
  function p(e2, t2, o2, r2, u2) {
    var l2 = { type: e2, props: t2, key: o2, ref: r2, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == u2 ? ++_ : u2 };
    return null != n.vnode && n.vnode(l2), l2;
  }
  function h(e2) {
    return e2.children;
  }
  function d(e2, n2) {
    this.props = e2, this.context = n2;
  }
  function v(e2, n2) {
    if (null == n2) return e2.__ ? v(e2.__, e2.__.__k.indexOf(e2) + 1) : null;
    for (var _2; n2 < e2.__k.length; n2++) if (null != (_2 = e2.__k[n2]) && null != _2.__e) return _2.__e;
    return "function" == typeof e2.type ? v(e2) : null;
  }
  function y(e2) {
    var n2, _2;
    if (null != (e2 = e2.__) && null != e2.__c) {
      for (e2.__e = e2.__c.base = null, n2 = 0; n2 < e2.__k.length; n2++) if (null != (_2 = e2.__k[n2]) && null != _2.__e) {
        e2.__e = e2.__c.base = _2.__e;
        break;
      }
      return y(e2);
    }
  }
  function m(e2) {
    (!e2.__d && (e2.__d = true) && t.push(e2) && !g.__r++ || r !== n.debounceRendering) && ((r = n.debounceRendering) || o)(g);
  }
  function g() {
    for (var e2; g.__r = t.length; ) e2 = t.sort(function(e3, n2) {
      return e3.__v.__b - n2.__v.__b;
    }), t = [], e2.some(function(e3) {
      var n2, _2, t2, o2, r2, u2;
      e3.__d && (r2 = (o2 = (n2 = e3).__v).__e, (u2 = n2.__P) && (_2 = [], (t2 = s({}, o2)).__v = o2.__v + 1, P(u2, o2, t2, n2.__n, void 0 !== u2.ownerSVGElement, null != o2.__h ? [r2] : null, _2, null == r2 ? v(o2) : r2, o2.__h), D(_2, o2), o2.__e != r2 && y(o2)));
    });
  }
  function k(e2, n2, _2, t2, o2, r2, u2, c2, s2, f2) {
    var a2, d2, y2, m2, g2, k2, x2, H2 = t2 && t2.__k || i, E2 = H2.length;
    for (_2.__k = [], a2 = 0; a2 < n2.length; a2++) if (null != (m2 = _2.__k[a2] = null == (m2 = n2[a2]) || "boolean" == typeof m2 ? null : "string" == typeof m2 || "number" == typeof m2 || "bigint" == typeof m2 ? p(null, m2, null, null, m2) : Array.isArray(m2) ? p(h, { children: m2 }, null, null, null) : m2.__b > 0 ? p(m2.type, m2.props, m2.key, null, m2.__v) : m2)) {
      if (m2.__ = _2, m2.__b = _2.__b + 1, null === (y2 = H2[a2]) || y2 && m2.key == y2.key && m2.type === y2.type) H2[a2] = void 0;
      else for (d2 = 0; d2 < E2; d2++) {
        if ((y2 = H2[d2]) && m2.key == y2.key && m2.type === y2.type) {
          H2[d2] = void 0;
          break;
        }
        y2 = null;
      }
      P(e2, m2, y2 = y2 || l, o2, r2, u2, c2, s2, f2), g2 = m2.__e, (d2 = m2.ref) && y2.ref != d2 && (x2 || (x2 = []), y2.ref && x2.push(y2.ref, null, m2), x2.push(d2, m2.__c || g2, m2)), null != g2 ? (null == k2 && (k2 = g2), "function" == typeof m2.type && null != m2.__k && m2.__k === y2.__k ? m2.__d = s2 = b(m2, s2, e2) : s2 = C(e2, m2, y2, H2, g2, s2), f2 || "option" !== _2.type ? "function" == typeof _2.type && (_2.__d = s2) : e2.value = "") : s2 && y2.__e == s2 && s2.parentNode != e2 && (s2 = v(y2));
    }
    for (_2.__e = k2, a2 = E2; a2--; ) null != H2[a2] && ("function" == typeof _2.type && null != H2[a2].__e && H2[a2].__e == _2.__d && (_2.__d = v(t2, a2 + 1)), U(H2[a2], H2[a2]));
    if (x2) for (a2 = 0; a2 < x2.length; a2++) T(x2[a2], x2[++a2], x2[++a2]);
  }
  function b(e2, n2, _2) {
    var t2, o2;
    for (t2 = 0; t2 < e2.__k.length; t2++) (o2 = e2.__k[t2]) && (o2.__ = e2, n2 = "function" == typeof o2.type ? b(o2, n2, _2) : C(_2, o2, o2, e2.__k, o2.__e, n2));
    return n2;
  }
  function C(e2, n2, _2, t2, o2, r2) {
    var u2, l2, i2;
    if (void 0 !== n2.__d) u2 = n2.__d, n2.__d = void 0;
    else if (null == _2 || o2 != r2 || null == o2.parentNode) e: if (null == r2 || r2.parentNode !== e2) e2.appendChild(o2), u2 = null;
    else {
      for (l2 = r2, i2 = 0; (l2 = l2.nextSibling) && i2 < t2.length; i2 += 2) if (l2 == o2) break e;
      e2.insertBefore(o2, r2), u2 = r2;
    }
    return void 0 !== u2 ? u2 : o2.nextSibling;
  }
  function x(e2, n2, _2) {
    "-" === n2[0] ? e2.setProperty(n2, _2) : e2[n2] = null == _2 ? "" : "number" != typeof _2 || c.test(n2) ? _2 : _2 + "px";
  }
  function H(e2, n2, _2, t2, o2) {
    var r2;
    e: if ("style" === n2) if ("string" == typeof _2) e2.style.cssText = _2;
    else {
      if ("string" == typeof t2 && (e2.style.cssText = t2 = ""), t2) for (n2 in t2) _2 && n2 in _2 || x(e2.style, n2, "");
      if (_2) for (n2 in _2) t2 && _2[n2] === t2[n2] || x(e2.style, n2, _2[n2]);
    }
    else if ("o" === n2[0] && "n" === n2[1]) r2 = n2 !== (n2 = n2.replace(/Capture$/, "")), n2 = n2.toLowerCase() in e2 ? n2.toLowerCase().slice(2) : n2.slice(2), e2.l || (e2.l = {}), e2.l[n2 + r2] = _2, _2 ? t2 || e2.addEventListener(n2, r2 ? S : E, r2) : e2.removeEventListener(n2, r2 ? S : E, r2);
    else if ("dangerouslySetInnerHTML" !== n2) {
      if (o2) n2 = n2.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");
      else if ("href" !== n2 && "list" !== n2 && "form" !== n2 && "tabIndex" !== n2 && "download" !== n2 && n2 in e2) try {
        e2[n2] = null == _2 ? "" : _2;
        break e;
      } catch (e3) {
      }
      "function" == typeof _2 || (null != _2 && (false !== _2 || "a" === n2[0] && "r" === n2[1]) ? e2.setAttribute(n2, _2) : e2.removeAttribute(n2));
    }
  }
  function E(e2) {
    this.l[e2.type + false](n.event ? n.event(e2) : e2);
  }
  function S(e2) {
    this.l[e2.type + true](n.event ? n.event(e2) : e2);
  }
  function P(e2, _2, t2, o2, r2, u2, l2, i2, c2) {
    var f2, a2, p2, v2, y2, m2, g2, b2, C2, x2, H2, E2 = _2.type;
    if (void 0 !== _2.constructor) return null;
    null != t2.__h && (c2 = t2.__h, i2 = _2.__e = t2.__e, _2.__h = null, u2 = [i2]), (f2 = n.__b) && f2(_2);
    try {
      e: if ("function" == typeof E2) {
        if (b2 = _2.props, C2 = (f2 = E2.contextType) && o2[f2.__c], x2 = f2 ? C2 ? C2.props.value : f2.__ : o2, t2.__c ? g2 = (a2 = _2.__c = t2.__c).__ = a2.__E : ("prototype" in E2 && E2.prototype.render ? _2.__c = a2 = new E2(b2, x2) : (_2.__c = a2 = new d(b2, x2), a2.constructor = E2, a2.render = A), C2 && C2.sub(a2), a2.props = b2, a2.state || (a2.state = {}), a2.context = x2, a2.__n = o2, p2 = a2.__d = true, a2.__h = []), null == a2.__s && (a2.__s = a2.state), null != E2.getDerivedStateFromProps && (a2.__s == a2.state && (a2.__s = s({}, a2.__s)), s(a2.__s, E2.getDerivedStateFromProps(b2, a2.__s))), v2 = a2.props, y2 = a2.state, p2) null == E2.getDerivedStateFromProps && null != a2.componentWillMount && a2.componentWillMount(), null != a2.componentDidMount && a2.__h.push(a2.componentDidMount);
        else {
          if (null == E2.getDerivedStateFromProps && b2 !== v2 && null != a2.componentWillReceiveProps && a2.componentWillReceiveProps(b2, x2), !a2.__e && null != a2.shouldComponentUpdate && false === a2.shouldComponentUpdate(b2, a2.__s, x2) || _2.__v === t2.__v) {
            a2.props = b2, a2.state = a2.__s, _2.__v !== t2.__v && (a2.__d = false), a2.__v = _2, _2.__e = t2.__e, _2.__k = t2.__k, _2.__k.forEach(function(e3) {
              e3 && (e3.__ = _2);
            }), a2.__h.length && l2.push(a2);
            break e;
          }
          null != a2.componentWillUpdate && a2.componentWillUpdate(b2, a2.__s, x2), null != a2.componentDidUpdate && a2.__h.push(function() {
            a2.componentDidUpdate(v2, y2, m2);
          });
        }
        a2.context = x2, a2.props = b2, a2.state = a2.__s, (f2 = n.__r) && f2(_2), a2.__d = false, a2.__v = _2, a2.__P = e2, f2 = a2.render(a2.props, a2.state, a2.context), a2.state = a2.__s, null != a2.getChildContext && (o2 = s(s({}, o2), a2.getChildContext())), p2 || null == a2.getSnapshotBeforeUpdate || (m2 = a2.getSnapshotBeforeUpdate(v2, y2)), H2 = null != f2 && f2.type === h && null == f2.key ? f2.props.children : f2, k(e2, Array.isArray(H2) ? H2 : [H2], _2, t2, o2, r2, u2, l2, i2, c2), a2.base = _2.__e, _2.__h = null, a2.__h.length && l2.push(a2), g2 && (a2.__E = a2.__ = null), a2.__e = false;
      } else null == u2 && _2.__v === t2.__v ? (_2.__k = t2.__k, _2.__e = t2.__e) : _2.__e = w(t2.__e, _2, t2, o2, r2, u2, l2, c2);
      (f2 = n.diffed) && f2(_2);
    } catch (e3) {
      _2.__v = null, (c2 || null != u2) && (_2.__e = i2, _2.__h = !!c2, u2[u2.indexOf(i2)] = null), n.__e(e3, _2, t2);
    }
  }
  function D(e2, _2) {
    n.__c && n.__c(_2, e2), e2.some(function(_3) {
      try {
        e2 = _3.__h, _3.__h = [], e2.some(function(e3) {
          e3.call(_3);
        });
      } catch (e3) {
        n.__e(e3, _3.__v);
      }
    });
  }
  function w(n2, _2, t2, o2, r2, u2, i2, c2) {
    var s2, a2, p2, h2 = t2.props, d2 = _2.props, y2 = _2.type, m2 = 0;
    if ("svg" === y2 && (r2 = true), null != u2) {
      for (; m2 < u2.length; m2++) if ((s2 = u2[m2]) && (s2 === n2 || (y2 ? s2.localName == y2 : 3 == s2.nodeType))) {
        n2 = s2, u2[m2] = null;
        break;
      }
    }
    if (null == n2) {
      if (null === y2) return document.createTextNode(d2);
      n2 = r2 ? document.createElementNS("http://www.w3.org/2000/svg", y2) : document.createElement(y2, d2.is && d2), u2 = null, c2 = false;
    }
    if (null === y2) h2 === d2 || c2 && n2.data === d2 || (n2.data = d2);
    else {
      if (u2 = u2 && e.call(n2.childNodes), a2 = (h2 = t2.props || l).dangerouslySetInnerHTML, p2 = d2.dangerouslySetInnerHTML, !c2) {
        if (null != u2) for (h2 = {}, m2 = 0; m2 < n2.attributes.length; m2++) h2[n2.attributes[m2].name] = n2.attributes[m2].value;
        (p2 || a2) && (p2 && (a2 && p2.__html == a2.__html || p2.__html === n2.innerHTML) || (n2.innerHTML = p2 && p2.__html || ""));
      }
      if (function(e2, n3, _3, t3, o3) {
        var r3;
        for (r3 in _3) "children" === r3 || "key" === r3 || r3 in n3 || H(e2, r3, null, _3[r3], t3);
        for (r3 in n3) o3 && "function" != typeof n3[r3] || "children" === r3 || "key" === r3 || "value" === r3 || "checked" === r3 || _3[r3] === n3[r3] || H(e2, r3, n3[r3], _3[r3], t3);
      }(n2, d2, h2, r2, c2), p2) _2.__k = [];
      else if (m2 = _2.props.children, k(n2, Array.isArray(m2) ? m2 : [m2], _2, t2, o2, r2 && "foreignObject" !== y2, u2, i2, u2 ? u2[0] : t2.__k && v(t2, 0), c2), null != u2) for (m2 = u2.length; m2--; ) null != u2[m2] && f(u2[m2]);
      c2 || ("value" in d2 && void 0 !== (m2 = d2.value) && (m2 !== n2.value || "progress" === y2 && !m2) && H(n2, "value", m2, h2.value, false), "checked" in d2 && void 0 !== (m2 = d2.checked) && m2 !== n2.checked && H(n2, "checked", m2, h2.checked, false));
    }
    return n2;
  }
  function T(e2, _2, t2) {
    try {
      "function" == typeof e2 ? e2(_2) : e2.current = _2;
    } catch (e3) {
      n.__e(e3, t2);
    }
  }
  function U(e2, _2, t2) {
    var o2, r2;
    if (n.unmount && n.unmount(e2), (o2 = e2.ref) && (o2.current && o2.current !== e2.__e || T(o2, null, _2)), null != (o2 = e2.__c)) {
      if (o2.componentWillUnmount) try {
        o2.componentWillUnmount();
      } catch (e3) {
        n.__e(e3, _2);
      }
      o2.base = o2.__P = null;
    }
    if (o2 = e2.__k) for (r2 = 0; r2 < o2.length; r2++) o2[r2] && U(o2[r2], _2, "function" != typeof e2.type);
    t2 || null == e2.__e || f(e2.__e), e2.__e = e2.__d = void 0;
  }
  function A(e2, n2, _2) {
    return this.constructor(e2, _2);
  }
  function M(_2, t2, o2) {
    var r2, u2, i2;
    n.__ && n.__(_2, t2), u2 = (r2 = "function" == typeof o2) ? null : o2 && o2.__k || t2.__k, i2 = [], P(t2, _2 = (!r2 && o2 || t2).__k = a(h, null, [_2]), u2 || l, l, void 0 !== t2.ownerSVGElement, !r2 && o2 ? [o2] : u2 ? null : t2.firstChild ? e.call(t2.childNodes) : null, i2, !r2 && o2 ? o2 : u2 ? u2.__e : t2.firstChild, r2), D(i2, _2);
  }
  e = i.slice, n = { __e: function(e2, n2) {
    for (var _2, t2, o2; n2 = n2.__; ) if ((_2 = n2.__c) && !_2.__) try {
      if ((t2 = _2.constructor) && null != t2.getDerivedStateFromError && (_2.setState(t2.getDerivedStateFromError(e2)), o2 = _2.__d), null != _2.componentDidCatch && (_2.componentDidCatch(e2), o2 = _2.__d), o2) return _2.__E = _2;
    } catch (n3) {
      e2 = n3;
    }
    throw e2;
  } }, _ = 0, d.prototype.setState = function(e2, n2) {
    var _2;
    _2 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), "function" == typeof e2 && (e2 = e2(s({}, _2), this.props)), e2 && s(_2, e2), null != e2 && this.__v && (n2 && this.__h.push(n2), m(this));
  }, d.prototype.forceUpdate = function(e2) {
    this.__v && (this.__e = true, e2 && this.__h.push(e2), m(this));
  }, d.prototype.render = h, t = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, g.__r = 0, u = 0;
  var L;
  var N;
  var W;
  var R = 0;
  var I = [];
  var O = n.__b;
  var V = n.__r;
  var q = n.diffed;
  var B = n.__c;
  var $ = n.unmount;
  function j(e2, _2) {
    n.__h && n.__h(N, e2, R || _2), R = 0;
    var t2 = N.__H || (N.__H = { __: [], __h: [] });
    return e2 >= t2.__.length && t2.__.push({}), t2.__[e2];
  }
  function G(e2) {
    return R = 1, z(ie, e2);
  }
  function z(e2, n2, _2) {
    var t2 = j(L++, 2);
    return t2.t = e2, t2.__c || (t2.__ = [_2 ? _2(n2) : ie(void 0, n2), function(e3) {
      var n3 = t2.t(t2.__[0], e3);
      t2.__[0] !== n3 && (t2.__ = [n3, t2.__[1]], t2.__c.setState({}));
    }], t2.__c = N), t2.__;
  }
  function J(e2, _2) {
    var t2 = j(L++, 3);
    !n.__s && le(t2.__H, _2) && (t2.__ = e2, t2.__H = _2, N.__H.__h.push(t2));
  }
  function Q(e2) {
    return R = 5, Y(function() {
      return { current: e2 };
    }, []);
  }
  function Y(e2, n2) {
    var _2 = j(L++, 7);
    return le(_2.__H, n2) && (_2.__ = e2(), _2.__H = n2, _2.__h = e2), _2.__;
  }
  function te() {
    I.forEach(function(e2) {
      if (e2.__P) try {
        e2.__H.__h.forEach(re), e2.__H.__h.forEach(ue), e2.__H.__h = [];
      } catch (_2) {
        e2.__H.__h = [], n.__e(_2, e2.__v);
      }
    }), I = [];
  }
  n.__b = function(e2) {
    N = null, O && O(e2);
  }, n.__r = function(e2) {
    V && V(e2), L = 0;
    var n2 = (N = e2.__c).__H;
    n2 && (n2.__h.forEach(re), n2.__h.forEach(ue), n2.__h = []);
  }, n.diffed = function(e2) {
    q && q(e2);
    var _2 = e2.__c;
    _2 && _2.__H && _2.__H.__h.length && (1 !== I.push(_2) && W === n.requestAnimationFrame || ((W = n.requestAnimationFrame) || function(e3) {
      var n2, _3 = function() {
        clearTimeout(t2), oe && cancelAnimationFrame(n2), setTimeout(e3);
      }, t2 = setTimeout(_3, 100);
      oe && (n2 = requestAnimationFrame(_3));
    })(te)), N = void 0;
  }, n.__c = function(e2, _2) {
    _2.some(function(e3) {
      try {
        e3.__h.forEach(re), e3.__h = e3.__h.filter(function(e4) {
          return !e4.__ || ue(e4);
        });
      } catch (t2) {
        _2.some(function(e4) {
          e4.__h && (e4.__h = []);
        }), _2 = [], n.__e(t2, e3.__v);
      }
    }), B && B(e2, _2);
  }, n.unmount = function(e2) {
    $ && $(e2);
    var _2 = e2.__c;
    if (_2 && _2.__H) try {
      _2.__H.__.forEach(re);
    } catch (e3) {
      n.__e(e3, _2.__v);
    }
  };
  var oe = "function" == typeof requestAnimationFrame;
  function re(e2) {
    var n2 = N;
    "function" == typeof e2.__c && e2.__c(), N = n2;
  }
  function ue(e2) {
    var n2 = N;
    e2.__c = e2.__(), N = n2;
  }
  function le(e2, n2) {
    return !e2 || e2.length !== n2.length || n2.some(function(n3, _2) {
      return n3 !== e2[_2];
    });
  }
  function ie(e2, n2) {
    return "function" == typeof n2 ? n2(e2) : n2;
  }
  var ce = function(e2, n2, _2, t2) {
    var o2;
    n2[0] = 0;
    for (var r2 = 1; r2 < n2.length; r2++) {
      var u2 = n2[r2++], l2 = n2[r2] ? (n2[0] |= u2 ? 1 : 2, _2[n2[r2++]]) : n2[++r2];
      3 === u2 ? t2[0] = l2 : 4 === u2 ? t2[1] = Object.assign(t2[1] || {}, l2) : 5 === u2 ? (t2[1] = t2[1] || {})[n2[++r2]] = l2 : 6 === u2 ? t2[1][n2[++r2]] += l2 + "" : u2 ? (o2 = e2.apply(l2, ce(e2, l2, _2, ["", null])), t2.push(o2), l2[0] ? n2[0] |= 2 : (n2[r2 - 2] = 0, n2[r2] = o2)) : t2.push(l2);
    }
    return t2;
  };
  var se = /* @__PURE__ */ new Map();
  var fe = function(e2) {
    var n2 = se.get(this);
    return n2 || (n2 = /* @__PURE__ */ new Map(), se.set(this, n2)), (n2 = ce(this, n2.get(e2) || (n2.set(e2, n2 = function(e3) {
      for (var n3, _2, t2 = 1, o2 = "", r2 = "", u2 = [0], l2 = function(e4) {
        1 === t2 && (e4 || (o2 = o2.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? u2.push(0, e4, o2) : 3 === t2 && (e4 || o2) ? (u2.push(3, e4, o2), t2 = 2) : 2 === t2 && "..." === o2 && e4 ? u2.push(4, e4, 0) : 2 === t2 && o2 && !e4 ? u2.push(5, 0, true, o2) : t2 >= 5 && ((o2 || !e4 && 5 === t2) && (u2.push(t2, 0, o2, _2), t2 = 6), e4 && (u2.push(t2, e4, 0, _2), t2 = 6)), o2 = "";
      }, i2 = 0; i2 < e3.length; i2++) {
        i2 && (1 === t2 && l2(), l2(i2));
        for (var c2 = 0; c2 < e3[i2].length; c2++) n3 = e3[i2][c2], 1 === t2 ? "<" === n3 ? (l2(), u2 = [u2], t2 = 3) : o2 += n3 : 4 === t2 ? "--" === o2 && ">" === n3 ? (t2 = 1, o2 = "") : o2 = n3 + o2[0] : r2 ? n3 === r2 ? r2 = "" : o2 += n3 : '"' === n3 || "'" === n3 ? r2 = n3 : ">" === n3 ? (l2(), t2 = 1) : t2 && ("=" === n3 ? (t2 = 5, _2 = o2, o2 = "") : "/" === n3 && (t2 < 5 || ">" === e3[i2][c2 + 1]) ? (l2(), 3 === t2 && (u2 = u2[0]), t2 = u2, (u2 = u2[0]).push(2, 0, t2), t2 = 0) : " " === n3 || "	" === n3 || "\n" === n3 || "\r" === n3 ? (l2(), t2 = 2) : o2 += n3), 3 === t2 && "!--" === o2 && (t2 = 4, u2 = u2[0]);
      }
      return l2(), u2;
    }(e2)), n2), arguments, [])).length > 1 ? n2 : n2[0];
  }.bind(a);

  // public/v1/app.js
  var MTG = window.MTG;
  var PREVIEW = !!window.MTG_PREVIEW;
  var IS_TV = !!window.MTG_TV;
  var store = {
    get(k2, d2) {
      try {
        const v2 = localStorage.getItem("mtg1." + k2);
        return v2 == null ? d2 : JSON.parse(v2);
      } catch (e2) {
        return d2;
      }
    },
    set(k2, v2) {
      try {
        localStorage.setItem("mtg1." + k2, JSON.stringify(v2));
      } catch (e2) {
      }
    },
    del(k2) {
      try {
        localStorage.removeItem("mtg1." + k2);
      } catch (e2) {
      }
    }
  };
  var clientId = store.get("clientId", null) || (() => {
    const id = "c" + Math.random().toString(36).slice(2, 12);
    store.set("clientId", id);
    return id;
  })();
  var S2 = {
    route: "",
    settings: MTG.normSettings(store.get("settings", { players: 4, life: 40, timerOn: false, mins: 2, commander: true })),
    game: null,
    role: null,
    // 'local' | 'host' | 'player' | 'spectator' | 'tv'
    seat: -1,
    // my seat when role === 'player'
    hostToken: null,
    conn: false,
    clockOffset: 0,
    toast: "",
    tvMirror: false
    // preview: show the TV view of the local game
  };
  var subs = /* @__PURE__ */ new Set();
  var set = (patch) => {
    Object.assign(S2, patch);
    subs.forEach((f2) => f2());
  };
  function useStore() {
    const [, force] = G(0);
    J(() => {
      const f2 = () => force((n2) => n2 + 1);
      subs.add(f2);
      return () => subs.delete(f2);
    }, []);
    return S2;
  }
  var toastT;
  function toast(msg) {
    set({ toast: msg });
    clearTimeout(toastT);
    toastT = setTimeout(() => set({ toast: "" }), 2600);
  }
  function parseHash() {
    const h2 = location.hash.replace(/^#\/?/, "");
    const [name, arg] = h2.split("/");
    return { name: name || (IS_TV ? "tv" : "setup"), arg: arg || "" };
  }
  var go = (r2) => {
    location.hash = "#/" + r2;
  };
  addEventListener("hashchange", () => set({ route: parseHash() }));
  S2.route = parseHash();
  var net = {
    ws: null,
    wanted: false,
    delay: 600,
    pending: [],
    waiters: [],
    start() {
      if (PREVIEW || this.ws) return;
      this.wanted = true;
      const proto = location.protocol === "https:" ? "wss" : "ws";
      let ws;
      try {
        ws = new WebSocket(`${proto}://${location.host}/v1/ws`);
      } catch (e2) {
        return;
      }
      this.ws = ws;
      ws.onopen = () => {
        this.delay = 600;
        set({ conn: true });
        this.rejoin();
        const q2 = this.pending;
        this.pending = [];
        q2.forEach((m2) => ws.send(JSON.stringify(m2)));
      };
      ws.onclose = () => {
        this.ws = null;
        set({ conn: false });
        if (this.wanted) {
          setTimeout(() => this.start(), this.delay);
          this.delay = Math.min(this.delay * 2, 5e3);
        }
      };
      ws.onerror = () => {
      };
      ws.onmessage = (ev) => {
        let m2;
        try {
          m2 = JSON.parse(ev.data);
        } catch (e2) {
          return;
        }
        onServer(m2);
      };
    },
    send(m2) {
      if (PREVIEW) return false;
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(m2));
        return true;
      }
      this.pending.push(m2);
      this.start();
      return false;
    },
    // ask and wait for one reply of the given types
    ask(m2, types, ms = 6e3) {
      return new Promise((res) => {
        if (PREVIEW) return res({ t: "error", error: "offline" });
        const w2 = { types, res };
        this.waiters.push(w2);
        setTimeout(() => {
          const i2 = this.waiters.indexOf(w2);
          if (i2 >= 0) {
            this.waiters.splice(i2, 1);
            res({ t: "error", error: "timeout" });
          }
        }, ms);
        this.send(m2);
      });
    },
    // after a reconnect, re-attach to whatever game this device is part of
    rejoin() {
      const g2 = S2.game;
      if (!g2 || !g2.code) return;
      if ((S2.role === "host" || S2.role === "local") && S2.hostToken) {
        this.ws.send(JSON.stringify({ t: "host", code: g2.code, hostToken: S2.hostToken }));
        if (S2.role === "local") this.ws.send(JSON.stringify({ t: "sync", game: g2 }));
      } else if (S2.role === "player" || S2.role === "spectator" || S2.role === "tv") {
        this.ws.send(JSON.stringify({ t: "join", code: g2.code, as: S2.role, clientId, password: store.get("pw." + g2.code, "") }));
      }
    }
  };
  function onServer(m2) {
    for (const w2 of net.waiters.slice()) {
      if (w2.types.includes(m2.t) || m2.t === "error") {
        net.waiters.splice(net.waiters.indexOf(w2), 1);
        w2.res(m2);
        return;
      }
    }
    if (m2.t === "state" && m2.game) {
      if (typeof m2.now === "number") S2.clockOffset = m2.now - Date.now();
      if (S2.role === "local") return;
      const patch = { game: m2.game };
      if (typeof m2.seat === "number") patch.seat = m2.seat;
      set(patch);
    } else if (m2.t === "error" && m2.error) {
      toast(m2.error);
    } else if (m2.t === "sat" && typeof m2.seat === "number") {
      set({ seat: m2.seat });
    } else if (m2.t === "kicked") {
      toast(m2.error || "The game ended");
      leaveGame();
    }
  }
  function saveLocal() {
    if (S2.role === "local" || S2.role === "host") store.set("game", { game: S2.game, role: S2.role, hostToken: S2.hostToken });
  }
  function dispatch(a2) {
    if (!S2.game || S2.role === "spectator" || S2.role === "tv") return;
    if (S2.role === "player" && S2.seat < 0) return;
    const next = MTG.apply(S2.game, a2);
    if (!next) return;
    set({ game: next });
    if (S2.role === "local") {
      saveLocal();
      if (S2.hostToken) net.send({ t: "sync", game: next });
    } else {
      net.send({ t: "act", a: a2 });
      if (S2.role === "host") saveLocal();
    }
  }
  function startLocal() {
    const game = MTG.newGame(S2.settings, { mode: "local" });
    set({ game, role: "local", seat: -1, hostToken: null });
    saveLocal();
    go("game");
    net.ask({ t: "create", mode: "local", game }, ["created"]).then((r2) => {
      if (r2.t !== "created" || S2.role !== "local" || !S2.game || S2.game.startedAt !== game.startedAt) return;
      set({ game: __spreadProps(__spreadValues({}, S2.game), { code: r2.code }), hostToken: r2.hostToken });
      saveLocal();
      net.send({ t: "sync", game: S2.game });
    });
  }
  async function createHosted(opts) {
    const game = MTG.newGame(S2.settings, { mode: "hosted", code: opts.code, locked: opts.locked, spectators: opts.spectators });
    const r2 = await net.ask({ t: "create", mode: "hosted", game, password: opts.locked ? opts.password : "" }, ["created"]);
    if (r2.t !== "created") return r2.error === "offline" || r2.error === "timeout" ? "CAN'T REACH THE SERVER" : String(r2.error || "COULD NOT CREATE GAME").toUpperCase();
    set({ game: r2.game, role: "host", seat: -1, hostToken: r2.hostToken });
    if (opts.locked) store.set("pw." + r2.code, opts.password);
    saveLocal();
    go("game");
    return "";
  }
  async function joinGame(code, password, as) {
    const r2 = await net.ask({ t: "join", code, password, as, clientId }, ["joined"]);
    if (r2.t !== "joined") return r2.error === "offline" || r2.error === "timeout" ? "CAN'T REACH THE SERVER" : String(r2.error || "COULD NOT JOIN").toUpperCase();
    store.set("pw." + code, password || "");
    store.set("joined", { code, as });
    set({ game: r2.game, role: r2.role, seat: typeof r2.seat === "number" ? r2.seat : -1, clockOffset: (r2.now || Date.now()) - Date.now() });
    go(r2.role === "player" ? "game" : "watch");
    return "";
  }
  function leaveGame() {
    if (S2.game && S2.game.code && S2.role !== "local" && S2.role !== "host") net.send({ t: "leave" });
    if (S2.role === "host" || S2.role === "local") net.send({ t: "end" });
    store.del("game");
    store.del("joined");
    set({ game: null, role: null, seat: -1, hostToken: null, tvMirror: false });
    go(IS_TV ? "tv" : "setup");
  }
  (() => {
    if (IS_TV) return;
    const saved = store.get("game", null);
    if (saved && saved.game && (saved.role === "local" || saved.role === "host")) {
      S2.game = saved.game;
      S2.role = saved.role;
      S2.hostToken = saved.hostToken || null;
      if (S2.game.code && S2.hostToken) net.start();
      return;
    }
    const j2 = store.get("joined", null);
    if (j2 && j2.code && !PREVIEW) joinGame(j2.code, store.get("pw." + j2.code, ""), j2.as);
  })();
  function useViewport() {
    const read = () => ({ w: window.visualViewport && window.visualViewport.width || innerWidth, h: window.visualViewport && window.visualViewport.height || innerHeight });
    const [v2, setV] = G(read);
    J(() => {
      const f2 = () => setV(read());
      addEventListener("resize", f2);
      addEventListener("orientationchange", () => setTimeout(f2, 250));
      if (window.visualViewport) window.visualViewport.addEventListener("resize", f2);
      return () => {
        removeEventListener("resize", f2);
        if (window.visualViewport) window.visualViewport.removeEventListener("resize", f2);
      };
    }, []);
    return v2;
  }
  function Stage({ min = 992, minRatio = 1, maxRatio = 2.4, turnPortrait = false, render }) {
    const { w: vw, h: vh } = useViewport();
    const turn = turnPortrait && vh > vw;
    const sw = turn ? vh : vw, sh = turn ? vw : vh;
    const wide = sw >= sh;
    const ratio = Math.min(maxRatio, Math.max(minRatio, wide ? sw / sh : sh / sw));
    const W2 = Math.round(wide ? min * ratio : min);
    const H2 = Math.round(wide ? min : min * ratio);
    const scale = Math.min(sw / W2, sh / H2);
    const style = `width:${W2}px;height:${H2}px;left:50%;top:50%;transform:translate(-50%,-50%)${turn ? " rotate(90deg)" : ""} scale(${scale})`;
    return fe`<div id="stage" style=${style}>${render(W2, H2)}</div>`;
  }
  var Chevron = ({ left }) => fe`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${left ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}></path></svg>`;
  var Switch = ({ on, onToggle, label }) => fe`<button class="switch" role="switch" aria-checked=${on ? "true" : "false"} aria-label=${label} onClick=${onToggle}><span></span></button>`;
  function Stepper({ value, onMinus, onPlus, label, small, disabled }) {
    return fe`<div class="stepper" style=${{ opacity: disabled ? 0.35 : 1, marginRight: small ? "-14px" : 0 }}>
    <button class=${"stepBtn" + (small ? " sm" : "")} aria-label=${"Decrease " + label} disabled=${disabled} onClick=${onMinus}>−</button>
    <b class="stepVal" style=${small ? { width: "44px", fontSize: "28px", transform: "none" } : null}>${value}</b>
    <button class=${"stepBtn" + (small ? " sm" : "")} aria-label=${"Increase " + label} disabled=${disabled} onClick=${onPlus}>+</button>
  </div>`;
  }
  function Title({ sub }) {
    return fe`<div class="titleBlock"><h1>Magic: The Gathering</h1><div class="titleSub"><i></i>${sub}<i></i></div></div>`;
  }
  function QR({ text, size = 180 }) {
    const ref = Q(null);
    J(() => {
      if (!ref.current || !window.qrcode) return;
      try {
        const q2 = window.qrcode(0, "M");
        q2.addData(text);
        q2.make();
        ref.current.innerHTML = q2.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
        const svg = ref.current.querySelector("svg");
        if (svg) {
          svg.setAttribute("width", size);
          svg.setAttribute("height", size);
        }
      } catch (e2) {
      }
    }, [text, size]);
    return fe`<div class="qrBox" ref=${ref}></div>`;
  }
  var joinUrl = (code) => `${location.origin}/v1/#/join/${code}`;
  var tvUrl = (code) => `${location.origin}/v1/tv${code ? "#/tv/" + code : ""}`;
  var clamp = (v2, lo, hi) => Math.max(lo, Math.min(hi, v2));
  var standalone = () => matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches || navigator.standalone === true;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  var installEvt = null;
  addEventListener("beforeinstallprompt", (e2) => {
    e2.preventDefault();
    installEvt = e2;
    set({});
  });
  addEventListener("appinstalled", () => {
    installEvt = null;
    toast("Installed. Open MTG from your home screen.");
  });
  if (!PREVIEW && "serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/v1/sw.js", { scope: "/v1/" }).catch(() => {
  }));
  function InstallRow() {
    useStore();
    const [help, setHelp] = G(false);
    if (PREVIEW || standalone()) return null;
    if (installEvt) return fe`<button class="flatLink ruled" onClick=${async () => {
      const e2 = installEvt;
      installEvt = null;
      e2.prompt();
      try {
        await e2.userChoice;
      } catch (e3) {
      }
      set({});
    }}>
    <span class="col">INSTALL THE APP<span>OPENS FULL SCREEN FROM YOUR HOME SCREEN</span></span><${Chevron} /></button>`;
    return fe`<button class="flatLink ruled" onClick=${() => setHelp(!help)}>
    <span class="col">INSTALL THE APP<span>${help ? isIOS ? "IN SAFARI: TAP SHARE, THEN ADD TO HOME SCREEN" : "IN CHROME: TAP \u22EE, THEN ADD TO HOME SCREEN" : "OPENS FULL SCREEN FROM YOUR HOME SCREEN"}</span></span><${Chevron} /></button>`;
  }
  function Setup() {
    const s2 = useStore().settings;
    const upd = (p2) => {
      const n2 = MTG.normSettings(__spreadValues(__spreadValues({}, s2), p2));
      store.set("settings", n2);
      set({ settings: n2 });
    };
    return fe`<div class="tbl screen">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="COMPANION APP" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="row"><span class="lbl">PLAYERS</span>
        <${Stepper} label="players" value=${s2.players} onMinus=${() => upd({ players: clamp(s2.players - 1, 1, 4) })} onPlus=${() => upd({ players: clamp(s2.players + 1, 1, 4) })} /></div>
      <div class="row"><span class="lbl">STARTING LIFE</span>
        <${Stepper} label="starting life" value=${s2.life} onMinus=${() => upd({ life: clamp(s2.life - 5, 5, 200) })} onPlus=${() => upd({ life: clamp(s2.life + 5, 5, 200) })} /></div>
      <div class="row">
        <div class="col" style="gap:14px"><span class="lbl">TURN TIMER</span><span class="sub" style=${{ opacity: s2.timerOn ? 1 : 0.35 }}>MIN PER TURN</span></div>
        <div class="col" style="align-items:flex-end;gap:6px">
          <${Switch} label="Turn timer" on=${s2.timerOn} onToggle=${() => upd({ timerOn: !s2.timerOn })} />
          <${Stepper} small label="minutes" value=${s2.mins} disabled=${!s2.timerOn} onMinus=${() => upd({ mins: clamp(s2.mins - 1, 1, 30) })} onPlus=${() => upd({ mins: clamp(s2.mins + 1, 1, 30) })} />
        </div>
      </div>
      <div class="row"><div class="col"><span class="lbl">COMMANDER</span><span class="sub">DAMAGE & TAX</span></div>
        <${Switch} label="Commander" on=${s2.commander} onToggle=${() => upd({ commander: !s2.commander })} /></div>
      <div class="col" style="gap:18px;padding-top:22px">
        <div class="col" style="gap:0">
          <button class="flatLink ruled" onClick=${() => go("host")}><span class="col">HOST A GAME<span>PLAYERS JOIN FROM THEIR OWN PHONES</span></span><${Chevron} /></button>
          <button class="flatLink ruled" onClick=${() => go("join")}><span class="col">JOIN A GAME<span>ENTER A HOST'S GAME CODE</span></span><${Chevron} /></button>
          <${InstallRow} />
        </div>
        <button class="goldBtn goldTex" onClick=${startLocal}>START LOCAL GAME</button>
      </div>
    </div></div>
  </div>`;
  }
  function Host() {
    const [code, setCode] = G(() => MTG.makeCode());
    const [locked, setLocked] = G(false);
    const [spec, setSpec] = G(true);
    const [pw, setPw] = G("");
    const [err, setErr] = G("");
    const [busy, setBusy] = G(false);
    const create = async () => {
      if (locked && !pw.trim()) {
        setErr("SET A PASSWORD OR TURN IT OFF");
        return;
      }
      setBusy(true);
      setErr("");
      const e2 = await createHosted({ code, locked, password: pw.trim(), spectators: spec });
      setBusy(false);
      if (e2) setErr(PREVIEW ? "ONLINE GAMES WORK ON THE LIVE APP, NOT IN THIS PREVIEW" : e2);
    };
    return fe`<div class="tbl screen">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="HOST A GAME" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="row" style="padding:10px 0 20px">
        <div class="col" style="gap:6px"><span class="lbl">GAME CODE</span><span class="bigCode" style="font-size:58px;padding-left:0">${code}</span></div>
        <button class="iconBtn" style="width:76px;height:76px;color:var(--gold)" aria-label="Generate a new code" onClick=${() => setCode(MTG.makeCode())}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4v6h-6"></path><path d="M18.5 15a7 7 0 1 1-1.6-7.3L20 10"></path></svg></button>
      </div>
      <div class="row"><div class="col"><span class="lbl">PASSWORD</span><span class="sub">${locked ? "REQUIRED TO JOIN" : "ANYONE WITH THE CODE"}</span></div>
        <${Switch} label="Password" on=${locked} onToggle=${() => setLocked(!locked)} /></div>
      ${locked && fe`<div class="ruled" style="padding:6px 0 18px"><input class="field text" type="password" aria-label="Game password" placeholder="Set a password" value=${pw} onInput=${(e2) => setPw(e2.target.value)} /></div>`}
      <div class="row"><div class="col"><span class="lbl">SPECTATORS</span><span class="sub">${spec ? "CAN WATCH WITHOUT A SEAT" : "PLAYERS ONLY"}</span></div>
        <${Switch} label="Allow spectators" on=${spec} onToggle=${() => setSpec(!spec)} /></div>
      <div class="hint" style="padding-top:6px">Players, life, turn timer and commander come from the setup screen.</div>
      <div class="err">${err}</div>
      <div class="col" style="gap:18px">
        <button class="goldBtn goldTex" disabled=${busy} onClick=${create}>${busy ? "CREATING\u2026" : "CREATE GAME"}</button>
        <button class="flatLink back" onClick=${() => go("setup")}><${Chevron} left />BACK TO SETUP</button>
      </div>
    </div></div>
  </div>`;
  }
  function Join({ initial }) {
    const [code, setCode] = G((initial || "").toUpperCase().slice(0, 6));
    const [pw, setPw] = G("");
    const [info, setInfo] = G(null);
    const [err, setErr] = G("");
    const [busy, setBusy] = G(false);
    J(() => {
      setInfo(null);
      setErr("");
      if (code.length !== 6 || PREVIEW) return;
      let live = true;
      net.ask({ t: "peek", code }, ["peek"]).then((r2) => {
        if (!live) return;
        if (r2.t === "peek" && r2.exists) setInfo(r2);
        else setErr(r2.error === "timeout" ? "CAN'T REACH THE SERVER" : "NO GAME WITH THAT CODE");
      });
      return () => {
        live = false;
      };
    }, [code]);
    const act = async (as) => {
      if (code.length !== 6) {
        setErr("ENTER THE 6-CHARACTER CODE");
        return;
      }
      if (PREVIEW) {
        setErr("ONLINE GAMES WORK ON THE LIVE APP, NOT IN THIS PREVIEW");
        return;
      }
      setBusy(true);
      setErr("");
      const e2 = await joinGame(code, pw, as);
      setBusy(false);
      if (e2) setErr(e2);
    };
    const locked = info ? info.locked : false;
    return fe`<div class="tbl screen">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="JOIN A GAME" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="col ruled" style="gap:14px;padding:14px 0 22px">
        <label class="lbl" for="code">GAME CODE</label>
        <input id="code" class="field code" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC123" value=${code}
          onInput=${(e2) => setCode(e2.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} />
        <span class="sub">${info ? `${info.open} OPEN SEAT${info.open === 1 ? "" : "S"} \xB7 ${info.players} PLAYERS` : "ASK THE HOST FOR THE 6-CHARACTER CODE"}</span>
      </div>
      ${locked && fe`<div class="col ruled" style="gap:14px;padding:14px 0 22px">
        <div style="display:flex;align-items:center;gap:10px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 018 0v4"></path></svg><label class="lbl" for="pw">PASSWORD</label></div>
        <input id="pw" class="field text" type="password" placeholder="Enter password" value=${pw} onInput=${(e2) => setPw(e2.target.value)} />
        <span class="sub">THIS GAME IS PASSWORD LOCKED</span></div>`}
      <div class="err" style="padding-top:8px">${err}</div>
      <div class="col" style="gap:18px">
        <button class="goldBtn goldTex" disabled=${busy || info && info.open === 0} onClick=${() => act("player")}>JOIN GAME</button>
        <button class="goldBtn goldTex" disabled=${busy || info && !info.spectators} onClick=${() => act("spectator")}>SPECTATE</button>
        <button class="flatLink back" onClick=${() => go("setup")}><${Chevron} left />BACK TO SETUP</button>
      </div>
    </div></div>
  </div>`;
  }
  function quadsAll(W2, H2) {
    const m2 = 20, gap = 18;
    const cw = (W2 - 2 * m2 - gap) / 2, rh = (H2 - 2 * m2 - gap) / 2;
    const x2 = m2 + cw + gap, y2 = m2 + rh + gap;
    return {
      bl: { x: m2, y: y2, w: cw, h: rh, rot: 0 },
      br: { x: x2, y: y2, w: cw, h: rh, rot: 0 },
      tr: { x: x2, y: m2, w: cw, h: rh, rot: 180 },
      tl: { x: m2, y: m2, w: cw, h: rh, rot: 180 },
      bottom: { x: m2, y: y2, w: W2 - 2 * m2, h: rh, rot: 0, wide: true },
      top: { x: m2, y: m2, w: W2 - 2 * m2, h: rh, rot: 180, wide: true },
      solo: { x: m2, y: m2, w: W2 - 2 * m2, h: H2 - 2 * m2, rot: 0, wide: true, solo: true }
    };
  }
  var LAYOUTS = { 1: ["solo"], 2: ["bottom", "top"], 3: ["bottom", "tl", "tr"], 4: ["bl", "tl", "tr", "br"] };
  var seatRot = (n2, i2) => ["tr", "tl", "top"].includes((LAYOUTS[n2] || LAYOUTS[4])[i2]) ? 180 : 0;
  var quadsFor = (n2, W2, H2) => {
    const Q2 = quadsAll(W2, H2);
    return (LAYOUTS[n2] || LAYOUTS[4]).map((k2) => Q2[k2]);
  };
  function useDelta(life) {
    const prev = Q(life);
    const [delta, setDelta] = G(0);
    const t2 = Q(null);
    J(() => {
      const d2 = life - prev.current;
      prev.current = life;
      if (!d2) return;
      setDelta((x2) => x2 + d2);
      clearTimeout(t2.current);
      t2.current = setTimeout(() => setDelta(0), 1600);
    }, [life]);
    J(() => () => clearTimeout(t2.current), []);
    return delta;
  }
  function Seat({ g: g2, i: i2, q: q2, onMenu, canEdit, showActive }) {
    const nameRef = Q(null);
    const wasEdit = Q(canEdit);
    J(() => {
      if (canEdit && !wasEdit.current && i2 === S2.seat && !g2.seats[i2].name && nameRef.current && S2.role === "player") nameRef.current.focus();
      wasEdit.current = canEdit;
    }, [canEdit, S2.seat === i2]);
    const s2 = g2.seats[i2];
    const delta = useDelta(s2.life);
    const [name, setName] = G(s2.name);
    const focused = Q(false);
    J(() => {
      if (!focused.current) setName(s2.name);
    }, [s2.name]);
    const d2 = (a2) => canEdit && dispatch(__spreadProps(__spreadValues({}, a2), { seat: i2 }));
    const det = MTG.details(g2, i2);
    const n2 = MTG.activeCount(g2, i2);
    const centerPos = q2.wide && !q2.solo ? "left: 60px; width: 520px" : q2.solo ? "left: 0; right: 0" : "left: 0; right: 0";
    const detPos = q2.wide && !q2.solo ? "left: 60px; width: 520px" : "left: 130px; right: 130px";
    const cmdr = g2.settings.commander;
    const art = s2.cmdrs[0] && (s2.cmdrs[0].art || s2.cmdrs[0].image);
    const compact = q2.h < 440;
    return fe`<div class="seat" style=${`left:${q2.x}px;top:${q2.y}px;width:${q2.w}px;height:${q2.h}px`}>
    <div class="seatIn" style=${{ transform: q2.rot ? "rotate(180deg)" : "none" }}>
      ${art && fe`<div class="seatArt" aria-hidden="true" style=${{ backgroundImage: `url("${art}")` }}></div>`}
      <div class="seatShade" aria-hidden="true"></div>
      ${showActive && fe`<div class="activeEdge" aria-hidden="true"></div>`}
      ${MTG.isDead(g2, i2) && fe`<div class="outVeil" aria-hidden="true">${s2.out ? "CONCEDED" : "DEFEATED"}</div>`}
      <div style=${`position:absolute;top:${compact ? 14 : 40}px;${centerPos};display:flex;justify-content:center;z-index:2`}>
        ${!canEdit ? fe`<div class="nameIn" style="display:flex;align-items:center;justify-content:center;border-color:rgba(201,162,39,0.3)">${MTG.seatLabel(g2, i2).toUpperCase()}</div>` : fe`<input class="nameIn" ref=${nameRef} type="text" aria-label="Player name" placeholder="Player Name" maxlength="24" value=${name}
          onFocus=${() => {
      focused.current = true;
    }}
          onInput=${(e2) => setName(e2.target.value)}
          onBlur=${() => {
      focused.current = false;
      if (name !== s2.name) d2({ type: "name", name });
    }}
          onKeyDown=${(e2) => {
      if (e2.key === "Enter") e2.target.blur();
    }} />`}
      </div>
      <div style=${`position:absolute;top:${compact ? 72 : 102}px;${detPos};display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;z-index:2`}>
        ${det.map((x2) => fe`<div class="detLine"><b>${x2.label}</b><span> ${x2.text}</span></div>`)}
      </div>
      ${canEdit && fe`<button class="lifeZone" aria-label="Lose one life" style="left:0;padding:0 0 0 38px;text-align:left" onClick=${() => d2({ type: "life", d: -1 })}>−</button>
      <button class="lifeZone" aria-label="Gain one life" style="right:0;padding:0 38px 0 0;text-align:right" onClick=${() => d2({ type: "life", d: 1 })}>+</button>`}
      <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2">
        <span class="lifeNum" aria-live="polite" style=${q2.solo ? "font-size:230px" : compact ? "font-size:118px" : null}>${s2.life}</span>
      </div>
      <div class="pete" style=${`position:absolute;top:calc(50% - ${q2.solo ? 180 : compact ? 100 : 112}px);left:0;right:0;text-align:center;pointer-events:none;z-index:2;font-size:34px;color:${delta > 0 ? "#7FD08A" : "#E0715B"};text-shadow:0 2px 10px rgba(8,8,10,0.95)`}>${delta ? delta > 0 ? "+" + delta : String(delta) : ""}</div>
      <div style=${compact ? "position:absolute;top:8px;left:8px;z-index:3" : `position:absolute;top:calc(50% + ${q2.solo ? 150 : 88}px);left:0;right:0;display:flex;justify-content:center;z-index:2`}>
        <button class="burger" aria-label="Menu" style=${canEdit ? null : { visibility: "hidden" }} onClick=${() => onMenu(i2)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
          ${n2 > 0 && fe`<span class="badge">${n2}</span>`}
        </button>
      </div>
      ${cmdr && (canEdit || s2.tax > 0) && fe`<div style="position:absolute;bottom:12px;left:130px;right:130px;display:flex;align-items:center;justify-content:center;gap:4px;z-index:2">
        ${canEdit && fe`<button class="taxBtn" aria-label="Remove commander tax" onClick=${() => d2({ type: "tax", d: -2 })}>−</button>`}
        <div style="min-width:96px;display:flex;align-items:baseline;justify-content:center;gap:8px;pointer-events:none"><span class="sub" style="letter-spacing:0.2em">TAX</span><b class="pete" style="font-size:32px;line-height:1;color:var(--bright)">${s2.tax}</b></div>
        ${canEdit && fe`<button class="taxBtn" aria-label="Add commander tax" onClick=${() => d2({ type: "tax", d: 2 })}>+</button>`}
      </div>`}
      ${canEdit && fe`<button class="five" style="left:18px" onClick=${() => d2({ type: "life", d: -5 })}>−5</button>
      <button class="five" style="right:18px" onClick=${() => d2({ type: "life", d: 5 })}>+5</button>`}
    </div>
    <div class="seatFrame frame9" aria-hidden="true"></div>
  </div>`;
  }
  function useNow(ms = 250) {
    const [now, setNow] = G(Date.now());
    J(() => {
      const t2 = setInterval(() => setNow(Date.now()), ms);
      return () => clearInterval(t2);
    }, [ms]);
    return now;
  }
  function remaining(g2, now) {
    if (!g2.settings.timerOn) return null;
    const elapsed = (now + (S2.role === "local" ? 0 : S2.clockOffset) - g2.turnStartedAt) / 1e3;
    return Math.ceil(g2.settings.mins * 60 - elapsed);
  }
  var fmt = (s2) => s2 <= 0 ? "TIME" : `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}`;
  function EndTurn({ g: g2, x: x2, y: y2, enabled }) {
    const now = useNow();
    const rem = remaining(g2, now);
    const [pressed, setPressed] = G(false);
    const who = MTG.seatLabel(g2, g2.active).toUpperCase() + "'S TURN";
    return fe`<div style=${`position:absolute;left:${x2}px;top:${y2}px;width:300px;height:0;margin-left:-150px;z-index:12`}>
    <div style="position:absolute;left:0;right:0;top:-112px;height:224px;display:flex;justify-content:center">
      <button class=${"endTurn endTex endGlow" + (pressed ? " pressed" : "")} aria-label="End turn" disabled=${!enabled}
        onPointerDown=${() => setPressed(true)} onPointerUp=${() => setPressed(false)} onPointerLeave=${() => setPressed(false)}
        onClick=${() => dispatch({ type: "endTurn" })}>
        <span class="who">${who}</span>
        <span class="big">END<br />TURN</span>
        ${rem !== null && fe`<span class=${"clock" + (rem <= 15 ? " low" : "")}>${fmt(rem)}</span>`}
      </button>
    </div>
  </div>`;
  }
  function Table() {
    const st = useStore();
    const g2 = st.game;
    const [menu, setMenu] = G(-1);
    const n2 = g2.seats.length;
    const timerOn = g2.settings.timerOn;
    const vp = useViewport();
    return fe`<${Stage} turnPortrait minRatio=${1.25} render=${(W2, H2) => {
      const quads = quadsFor(n2, W2, H2);
      return fe`<div class="tbl" style=${`position:relative;width:${W2}px;height:${H2}px;overflow:hidden`}>
    ${quads.map((q2, i2) => fe`<${Seat} key=${i2} g=${g2} i=${i2} q=${q2} canEdit=${true} showActive=${n2 > 1 && g2.active === i2 && !MTG.isDead(g2, i2)} onMenu=${setMenu} />`)}
    ${n2 > 1 && fe`<${EndTurn} g=${g2} x=${W2 / 2} y=${H2 / 2} enabled=${true} />`}
    ${n2 === 1 && timerOn && fe`<${SoloClock} g=${g2} />`}
    ${PREVIEW && fe`<${PreviewBar} />`}
  </div>`;
    }} />
  ${menu >= 0 && fe`<${Menu} g=${g2} i=${menu} rot=${vp.h > vp.w ? 0 : seatRot(n2, menu)} isHost=${true} onClose=${() => setMenu(-1)} />`}`;
  }
  function SoloClock({ g: g2 }) {
    const rem = remaining(g2, useNow());
    return fe`<div class="pete" style="position:absolute;top:40px;right:60px;z-index:6;font-size:40px;color:var(--gold)">${fmt(rem)}</div>`;
  }
  function phoneGrid(n2, W2, H2) {
    const m2 = 20, gap = 18;
    if (W2 >= H2) return { quads: quadsFor(n2, W2, H2).map((q2) => __spreadProps(__spreadValues({}, q2), { rot: 0 })), et: { x: W2 / 2, y: H2 / 2, s: 0.9 } };
    const strip = n2 > 1 ? 200 : 0, half = Math.ceil(n2 / 2);
    const h2 = (H2 - 2 * m2 - gap * (n2 - 1) - strip) / n2;
    const quads = [];
    let y2 = m2, etY = H2 / 2;
    for (let k2 = 0; k2 < n2; k2++) {
      quads.push({ x: m2, y: y2, w: W2 - 2 * m2, h: h2, rot: 0 });
      y2 += h2 + gap;
      if (k2 === half - 1 && strip) {
        etY = y2 - gap / 2 + strip / 2;
        y2 += strip;
      }
    }
    return { quads, et: { x: W2 / 2, y: etY, s: 0.8 } };
  }
  function PlayerView() {
    const st = useStore();
    const g2 = st.game;
    const i2 = st.seat;
    const vp = useViewport();
    const [menu, setMenu] = G(-1);
    const [gridPref, setGrid] = G(() => store.get("phoneGrid", true));
    const flip = () => {
      store.set("phoneGrid", !gridPref);
      setGrid(!gridPref);
    };
    if (!g2) return fe`<${Waiting} text="CONNECTING…" />`;
    const seated = i2 >= 0 && !!g2.seats[i2];
    const grid = gridPref || !seated;
    const sit = (k2) => {
      set({ seat: k2 });
      net.send({ t: "sit", seat: k2 });
    };
    const n2 = g2.seats.length;
    const mine = seated && g2.active === i2;
    const toggle = seated && fe`<button class="viewToggle" onClick=${flip} aria-label=${grid ? "Show only my seat" : "Show all players"}>
    ${grid ? fe`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>MY SEAT` : fe`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"></rect><rect x="13" y="3" width="8" height="8" rx="1"></rect><rect x="3" y="13" width="8" height="8" rx="1"></rect><rect x="13" y="13" width="8" height="8" rx="1"></rect></svg>`}</button>`;
    const turned = vp.h > vp.w;
    const overlay = fe`${toggle}${!seated && fe`<div class="sitBanner">TAP AN OPEN SEAT TO SIT DOWN</div>`}${!st.conn && fe`<div class="connDot" title="Reconnecting"></div>`}`;
    if (grid) {
      return fe`<${Stage} min=${900} render=${(W2, H2) => {
        const L2 = phoneGrid(n2, W2, H2);
        return fe`<div class="tbl" style=${`position:relative;width:${W2}px;height:${H2}px;overflow:hidden`}>
        ${L2.quads.map((q2, k2) => fe`<${Seat} key=${k2} g=${g2} i=${k2} q=${q2} canEdit=${seated} showActive=${n2 > 1 && g2.active === k2 && !MTG.isDead(g2, k2)} onMenu=${setMenu} />`)}
        ${L2.quads.map((q2, k2) => k2 === i2 || g2.seats[k2].owner ? null : !seated ? fe`<button class="sitHere" style=${`left:${q2.x}px;top:${q2.y}px;width:${q2.w}px;height:${q2.h}px`} onClick=${() => sit(k2)}>
              <span class="goldBtn goldTex" style="width:auto;padding:0 34px">SIT HERE</span></button>` : fe`<div style=${`position:absolute;left:${q2.x}px;top:${q2.y}px;width:${q2.w}px;height:${q2.h}px;pointer-events:none;z-index:8`}>
              <button class="movePill" style="left:auto;right:18px" onClick=${() => sit(k2)}>MOVE HERE</button></div>`)}
        ${n2 > 1 && fe`<div style=${`position:absolute;left:${L2.et.x}px;top:${L2.et.y}px;transform:scale(${L2.et.s});z-index:12`}><${EndTurn} g=${g2} x=${0} y=${0} enabled=${seated} /></div>`}
      </div>`;
      }} />
    ${!seated && fe`<div class="sitBanner">TAP AN OPEN SEAT TO SIT DOWN</div>`}${!st.conn && fe`<div class="connDot" title="Reconnecting"></div>`}
    ${menu >= 0 && fe`<${Menu} g=${g2} i=${menu} rot=${0} isHost=${false} onView=${menu === i2 ? flip : null} onClose=${() => setMenu(-1)} />`}`;
    }
    return fe`<${Stage} min=${900} render=${(W2, H2) => {
      const tall = H2 > W2;
      const q2 = quadsAll(W2, H2).solo;
      return fe`<div class="tbl" style=${`position:relative;width:${W2}px;height:${H2}px;overflow:hidden`}>
    <${Seat} g=${g2} i=${i2} q=${q2} canEdit=${true} showActive=${mine} onMenu=${setMenu} />
    ${mine ? fe`<${EndTurn} g=${g2} x=${tall ? W2 / 2 : W2 - 190} y=${tall ? H2 - 270 : 210} enabled=${true} />` : fe`<div class="sub" style=${`position:absolute;${tall ? "bottom:120px;left:0;right:0;text-align:center" : "top:44px;right:60px"};z-index:6;font-size:15px`}>${MTG.seatLabel(g2, g2.active).toUpperCase()}'S TURN</div>`}
  </div>`;
    }} />
  ${overlay}
  ${menu >= 0 && fe`<${Menu} g=${g2} i=${menu} rot=${0} isHost=${false} onClose=${() => setMenu(-1)} />`}`;
  }
  function Waiting({ text }) {
    return fe`<div class="tbl screen"><div class="tblBlur"></div><${Title} sub=${text} />
    <button class="flatLink back" style="width:auto;position:relative;z-index:1" onClick=${leaveGame}><${Chevron} left />BACK</button></div>`;
  }
  var HEAD = { "": "MENU", add: "COMMANDER", search: "COMMANDER", cmd: "COMMANDER DAMAGE", ctr: "COUNTERS", status: "STATUS", extra: "EXTRA TURNS", timer: "TURN TIMER", host: "HOSTED GAME" };
  function Menu({ g: g2, i: i2, rot, isHost, onClose, onView }) {
    const st = useStore();
    const [tab, setTab] = G("");
    const [pick, setPick] = G(false);
    const [custom, setCustom] = G("");
    const [confirm, setConfirm] = G("");
    const [editIdx, setEditIdx] = G(-1);
    const [zoom, setZoom] = G(null);
    const s2 = g2.seats[i2];
    const d2 = (a2) => dispatch(__spreadProps(__spreadValues({}, a2), { seat: i2 }));
    const goTab = (t2) => {
      setTab(t2);
      setPick(false);
      setCustom("");
      setConfirm("");
    };
    const back = () => pick ? setPick(false) : goTab(tab === "search" ? "add" : "");
    const n2 = g2.seats.length;
    const cmdMax = MTG.cmdMax(g2, i2);
    const ctrSum = MTG.counterKinds(s2).filter((k2) => (s2.ctr[k2.key] || 0) > 0).map((k2) => k2.chip + " " + s2.ctr[k2.key]).join(" \xB7 ");
    const statOn = MTG.statusKinds(s2).filter((f2) => MTG.hasFlag(g2, i2, f2.key));
    const local = g2.mode === "local";
    const items = [];
    if (g2.settings.commander) {
      items.push({ label: "COMMANDER", summary: s2.cmdrs.length ? s2.cmdrs.map((c2) => c2.name).join(" \xB7 ").toUpperCase() : "NONE YET", t: "add" });
      if (n2 > 1) items.push({ label: "COMMANDER DAMAGE", summary: cmdMax > 0 ? "MAX " + cmdMax : "", t: "cmd" });
    }
    items.push({ label: "COUNTERS", summary: ctrSum, t: "ctr" });
    items.push({ label: "STATUS", summary: statOn.map((f2) => f2.label).join(" \xB7 "), t: "status" });
    const exN = MTG.extraCount(g2, i2);
    if (n2 > 1) items.push({ label: "EXTRA TURN", summary: exN ? exN + (exN > 1 ? " EXTRA TURNS QUEUED" : " EXTRA TURN QUEUED") : "", t: "extra" });
    if (onView) items.push({ label: "SHOW ONLY MY SEAT", summary: "ONE BIG LIFE TOTAL", fn: () => {
      onClose();
      onView();
    } });
    if (isHost) {
      items.push({ label: "TURN TIMER", summary: g2.settings.timerOn ? g2.settings.mins + " MIN PER TURN" : "OFF", t: "timer" });
      items.push({ label: local ? "TV DISPLAY" : "HOSTED GAME", summary: g2.code ? "CODE " + g2.code + (g2.locked ? " \xB7 PASSWORD ON" : "") : st.conn ? "CONNECTING\u2026" : "OFFLINE", t: "host" });
    }
    const concede = () => {
      if (s2.out) {
        d2({ type: "concede", out: false });
        setConfirm("");
        return;
      }
      if (confirm !== "concede") {
        setConfirm("concede");
        return;
      }
      d2({ type: "concede", out: true });
      onClose();
    };
    const reset = () => {
      if (confirm !== "reset") {
        setConfirm("reset");
        return;
      }
      dispatch({ type: "reset" });
      onClose();
    };
    const exit = () => {
      if (confirm !== "exit") {
        setConfirm("exit");
        return;
      }
      leaveGame();
    };
    const vp = useViewport();
    const side = rot % 180 !== 0;
    const aw = (side ? vp.h : vp.w) - 24, ah = (side ? vp.w : vp.h) - 24;
    const sc = Math.min(1, aw / 560);
    const maxH = Math.floor(ah / sc);
    return fe`<div class="veil" style="position:fixed" onClick=${(e2) => {
      if (e2.target === e2.currentTarget) onClose();
    }}>
    <div class="menu mgrCard" style=${{ transform: `rotate(${rot}deg) scale(${sc})`, maxHeight: maxH + "px", minHeight: Math.min(820, maxH) + "px" }} role="dialog" aria-label=${HEAD[tab]}>
      <div class="menuHead">
        ${tab && fe`<button class="iconBtn" aria-label="Back" onClick=${back}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>`}
        <div class="col" style="flex:1 1 0;gap:2px">
          <h2>${tab === "host" && g2.mode === "local" ? "TV DISPLAY" : HEAD[tab]}</h2>
          <div style="font-size:12px;letter-spacing:0.18em;color:var(--muted)">${MTG.seatLabel(g2, i2).toUpperCase()} · LIFE <span class="pete" style="font-size:20px;color:var(--white);letter-spacing:0">${s2.life}</span></div>
        </div>
        <button class="iconBtn" aria-label="Close menu" onClick=${onClose}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
      </div>

      ${tab === "" && fe`
        <div class="col" style="align-items:flex-start;gap:8px;padding:8px 0 4px">
          ${items.map((it) => fe`<button class="menuItem" onClick=${() => it.fn ? it.fn() : goTab(it.t)}><span>${it.label}<${Chevron} /></span><span class="subGold">${it.summary}</span></button>`)}
        </div>
        <div class="col" style="gap:8px;padding-top:16px;margin-top:auto">
          <button class=${"concede" + (confirm === "concede" ? " armed" : "") + (s2.out ? " rejoin" : "")} onClick=${concede}>${s2.out ? "REJOIN GAME" : confirm === "concede" ? "TAP AGAIN TO CONCEDE" : "CONCEDE"}</button>
          <div style="display:flex;align-items:stretch">
            ${isHost && fe`<button class=${"flatHalf" + (confirm === "reset" ? " armed" : "")} onClick=${reset}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v6h6"></path><path d="M5.5 15a7 7 0 1 0 1.6-7.3L4 10"></path></svg>${confirm === "reset" ? "CONFIRM RESET" : "RESET GAME"}</button><span class="vRule" aria-hidden="true"></span>`}
            <button class=${"flatHalf" + (confirm === "exit" ? " armed" : "")} onClick=${exit}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h4v16h-4"></path><path d="M10 8l-4 4 4 4"></path><path d="M6 12h10"></path></svg>${confirm === "exit" ? "CONFIRM EXIT" : isHost ? "EXIT GAME" : "LEAVE GAME"}</button>
          </div>
        </div>`}

      ${tab === "add" && fe`<div class="col" style="gap:30px;padding-top:56px">
        ${s2.cmdrs.map((c2, k2) => fe`<div class="ruled" style="padding-bottom:18px"><div style="min-height:72px;display:flex;align-items:center;gap:16px">
          <button class="cardOpen" aria-label=${"View " + c2.name} onClick=${() => setZoom(c2)}>
            <span class="art" style=${c2.art ? { backgroundImage: `url("${c2.art}")` } : null}>${c2.art ? "" : "ART"}</span>
            <span class="col" style="flex:1 1 0;min-width:0;text-align:left"><span style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:var(--gold-dim)">${k2 === 0 ? "COMMANDER" : "PARTNER"} · TAP TO VIEW</span><span style="font-size:17px;font-weight:700;letter-spacing:0.1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--bright)">${c2.name.toUpperCase()}</span></span>
          </button>
          <button class="textBtn" onClick=${() => {
      setEditIdx(k2);
      goTab("search");
    }}>CHANGE</button>
        </div></div>`)}
        ${s2.cmdrs.length < 2 && fe`<button class="pickRow" style="min-height:84px" onClick=${() => {
      setEditIdx(-1);
      goTab("search");
    }}>
          <span class="col"><span style="font-size:18px;letter-spacing:0.18em;color:var(--gold)">ADD COMMANDER</span><span>${s2.cmdrs.length ? "PARTNER \xB7 FRIENDS FOREVER \xB7 BACKGROUND" : "NO COMMANDER SELECTED"}</span></span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`}
      </div>`}

      ${tab === "search" && fe`<${CmdrSearch} onPick=${(c2) => {
      d2(editIdx >= 0 ? { type: "setCmdr", idx: editIdx, cmdr: c2 } : { type: "addCmdr", cmdr: c2 });
      goTab("add");
    }}
        onRemove=${editIdx >= 0 ? () => {
      d2({ type: "removeCmdr", idx: editIdx });
      goTab("add");
    } : null} />`}

      ${tab === "cmd" && fe`<div class="col" style="gap:36px;padding-top:20px">
        ${g2.seats.map((o2, j2) => j2 === i2 ? null : fe`<div class="ctrRow">
          <div class="name">FROM ${MTG.seatLabel(g2, j2).toUpperCase()}</div>
          <button class="stepBtn lg" aria-label="Remove one" onClick=${() => d2({ type: "cmd", from: j2, d: -1 })}>−</button>
          <b class=${(s2.cmd[j2] || 0) >= 21 ? "lethal" : ""}>${s2.cmd[j2] || 0}</b>
          <button class="stepBtn lg" aria-label="Add one" onClick=${() => d2({ type: "cmd", from: j2, d: 1 })}>+</button>
        </div>`)}
        <div class="hint">Also comes off life. 21 from one commander is lethal.</div>
      </div>`}

      ${tab === "ctr" && !pick && fe`<div class="col" style="gap:24px;padding-top:20px">
        ${MTG.counterKinds(s2).filter((k2) => s2.shown[k2.key] || (s2.ctr[k2.key] || 0) > 0).map((k2) => fe`<div class="ctrRow">
          <div class="name">${k2.label}</div>
          <button class="stepBtn lg" aria-label=${"Remove " + k2.label} onClick=${() => d2({ type: "ctr", key: k2.key, d: -1 })}>−</button>
          <b class=${k2.lethal && (s2.ctr[k2.key] || 0) >= k2.lethal ? "lethal" : ""}>${s2.ctr[k2.key] || 0}</b>
          <button class="stepBtn lg" aria-label=${"Add " + k2.label} onClick=${() => d2({ type: "ctr", key: k2.key, d: 1 })}>+</button>
        </div>`)}
        ${!MTG.counterKinds(s2).some((k2) => s2.shown[k2.key] || (s2.ctr[k2.key] || 0) > 0) && fe`<div class="hint">No counters yet.</div>`}
        <button class="pickRow" onClick=${() => setPick(true)}><span class="col"><span style="color:var(--gold)">ADD COUNTER</span><span>POISON · ENERGY · EXPERIENCE · RAD · CUSTOM</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>
      </div>`}
      ${tab === "ctr" && pick && fe`<div class="col" style="gap:10px;padding-top:10px">
        ${MTG.counterKinds(s2).filter((k2) => !(s2.shown[k2.key] || (s2.ctr[k2.key] || 0) > 0)).map((k2) => fe`<button class="pickRow" onClick=${() => {
      d2({ type: "showCtr", key: k2.key });
      setPick(false);
    }}><span class="col"><span>${k2.label}</span>${k2.lethal && fe`<span>${k2.lethal} IS LETHAL</span>`}</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`)}
        <div class="sub" style="padding-top:10px">FIND ANY COUNTER</div>
        <${CounterSearch} seat=${s2} onPick=${(nm) => {
      const k2 = MTG.counterKinds(s2).find((x2) => x2.label === nm.toUpperCase() || x2.chip === nm.toUpperCase());
      d2(k2 ? { type: "showCtr", key: k2.key } : { type: "customCtr", name: nm });
      setPick(false);
    }} />
      </div>`}

      ${tab === "status" && !pick && fe`<div class="col" style="gap:10px;padding-top:20px">
        ${statOn.map((f2) => fe`<div class="pickRow" style="cursor:default"><span class="col"><span>${f2.label}</span><span>${f2.hint}</span></span><button class="textBtn" onClick=${() => d2({ type: "flag", key: f2.key })}>REMOVE</button></div>`)}
        ${!statOn.length && fe`<div class="hint">No status yet.</div>`}
        <button class="pickRow" onClick=${() => setPick(true)}><span class="col"><span style="color:var(--gold)">ADD STATUS</span><span>MONARCH · INITIATIVE · CITY'S BLESSING · RING · CUSTOM</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>
      </div>`}
      ${tab === "status" && pick && fe`<div class="col" style="gap:10px;padding-top:10px">
        ${MTG.statusKinds(s2).filter((f2) => !MTG.hasFlag(g2, i2, f2.key)).map((f2) => {
      const holder = f2.solo ? f2.key === "monarch" ? g2.monarch : g2.initiative : -1;
      const hint = holder >= 0 ? "TAKES IT FROM " + MTG.seatLabel(g2, holder).toUpperCase() : f2.hint;
      const take = () => {
        d2({ type: "flag", key: f2.key });
        if (holder >= 0) toast(f2.label.charAt(0) + f2.label.slice(1).toLowerCase() + " moved from " + MTG.seatLabel(g2, holder));
        setPick(false);
      };
      return fe`<button class="pickRow" onClick=${take}><span class="col"><span>${f2.label}</span><span style=${holder >= 0 ? { color: "var(--gold)" } : null}>${hint}</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`;
    })}
        <div class="sub" style="padding-top:10px">CUSTOM STATUS</div>
        <div style="display:flex;gap:12px"><input class="boxIn" type="text" aria-label="Custom status name" placeholder="Name it" maxlength="24" value=${custom} onInput=${(e2) => setCustom(e2.target.value)} />
          <button class="smallBtn" onClick=${() => {
      if (custom.trim()) {
        d2({ type: "customStatus", name: custom.trim() });
        setCustom("");
        setPick(false);
      }
    }}>ADD</button></div>
      </div>`}

      ${tab === "extra" && fe`<div class="col" style="gap:10px;padding-top:20px">
        <div class="row"><span class="col"><span class="lbl">EXTRA TURNS</span><span class="subGold">${exN ? "NEXT UP AFTER THIS TURN" : "NONE QUEUED"}</span></span>
          <div class="stepper" style="margin-right:-14px"><button class="stepBtn lg" aria-label="Remove an extra turn" disabled=${!exN} onClick=${() => d2({ type: "extra", d: -1 })}>−</button>
          <b class="stepVal" style="width:56px;font-size:40px">${exN}</b>
          <button class="stepBtn lg" aria-label="Add an extra turn" onClick=${() => d2({ type: "extra", d: 1 })}>+</button></div></div>
        <div class="hint">An extra turn starts as soon as the current turn ends. After it, play goes on to this player's left, the same as a normal turn. If several are queued, the most recent one is taken first.</div>
      </div>`}
      ${tab === "timer" && fe`<div class="col" style="gap:10px;padding-top:20px">
        <div class="row"><span class="lbl">TURN TIMER</span><${Switch} label="Turn timer" on=${g2.settings.timerOn} onToggle=${() => dispatch({ type: "timer", on: !g2.settings.timerOn })} /></div>
        <div class="row" style=${{ opacity: g2.settings.timerOn ? 1 : 0.35 }}><span class="lbl">MIN PER TURN</span>
          <div class="stepper" style="margin-right:-14px"><button class="stepBtn lg" aria-label="Fewer minutes" disabled=${!g2.settings.timerOn} onClick=${() => dispatch({ type: "timer", mins: g2.settings.mins - 1 })}>−</button>
          <b class="stepVal" style="width:56px;font-size:40px">${g2.settings.mins}</b>
          <button class="stepBtn lg" aria-label="More minutes" disabled=${!g2.settings.timerOn} onClick=${() => dispatch({ type: "timer", mins: g2.settings.mins + 1 })}>+</button></div></div>
        <div class="hint">Restarts on every End Turn. Applies to all players.</div>
      </div>`}

      ${tab === "host" && fe`<${HostPanel} g=${g2} />`}
    </div>
    ${zoom && fe`<${CardZoom} c=${zoom} rot=${rot} onClose=${() => setZoom(null)} />`}
  </div>`;
  }
  function CardZoom({ c: c2, rot, onClose }) {
    const vp = useViewport();
    const side = rot % 180 !== 0;
    const h2 = Math.min((side ? vp.w : vp.h) - 60, ((side ? vp.h : vp.w) - 40) * 1.395);
    return fe`<div class="cardZoom" role="dialog" aria-label=${c2.name} onClick=${(e2) => {
      e2.stopPropagation();
      onClose();
    }}>
    <div style=${{ transform: `rotate(${rot}deg)`, display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      ${c2.image ? fe`<img src=${c2.image} alt=${c2.name} style=${{ height: h2 + "px", width: "auto", maxWidth: (side ? vp.h : vp.w) - 40 + "px", objectFit: "contain", borderRadius: h2 * 0.045 + "px", boxShadow: "0 0 60px rgba(0,0,0,0.9)" }} />` : fe`<div class="cmdrCard" style=${{ height: h2 + "px", width: h2 / 1.395 + "px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px", boxSizing: "border-box" }}><span class="lbl">${c2.name.toUpperCase()}<br /><span class="sub">NO CARD IMAGE</span></span></div>`}
      <span class="sub">TAP ANYWHERE TO CLOSE</span>
    </div>
  </div>`;
  }
  function HostPanel({ g: g2 }) {
    const st = useStore();
    const [pw, setPw] = G("");
    const [shared, setShared] = G(false);
    const local = g2.mode === "local";
    if (!g2.code) return fe`<div class="col" style="gap:14px;padding-top:30px"><div class="lbl">${PREVIEW ? "PREVIEW MODE" : st.conn ? "CONNECTING\u2026" : "OFFLINE"}</div>
    <div class="hint">${PREVIEW ? "The live app gives every game a code so a TV can show it. Use SHOW TV VIEW at the bottom of the table to see it here." : "This game still works. A TV code appears as soon as the server is reachable."}</div></div>`;
    const share = async () => {
      const url = local ? tvUrl(g2.code) : joinUrl(g2.code);
      try {
        if (navigator.share) await navigator.share({ title: "MTG game " + g2.code, text: local ? "Watch our game" : "Join my game: " + g2.code, url });
        else {
          await navigator.clipboard.writeText(url);
        }
        setShared(true);
      } catch (e2) {
      }
    };
    const setRoom = (p2) => net.send(__spreadValues({ t: "room" }, p2));
    return fe`<div class="col" style="gap:10px;padding-top:12px">
    <div class="col ruled" style="align-items:center;gap:8px;padding:8px 0 22px">
      <span class="sub">${local ? "TV CODE" : "GAME CODE"}</span>
      <span class="bigCode">${g2.code}</span>
      ${local && fe`<div style="display:flex;align-items:center;gap:18px;padding-top:6px"><${QR} text=${tvUrl(g2.code)} size=${120} /><span class="hint" style="max-width:240px">Open ${location.host}/v1/tv on the TV and enter this code, or scan.</span></div>`}
    </div>
    <button class="row" style="width:100%;box-sizing:border-box;border-top:none;border-left:none;border-right:none;background:transparent;color:var(--bright);text-align:left" onClick=${share}>
      <span class="col"><span class="lbl">${local ? "SHARE TV LINK" : "SHARE GAME"}</span><span class="subGold">${shared ? "LINK READY" : local ? "SEND THE TV LINK" : "INVITE LINK \xB7 " + joinUrl(g2.code).replace(/^https?:\/\//, "")}</span></span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="M7 8l5-5 5 5"></path><path d="M5 13v7h14v-7"></path></svg>
    </button>
    ${!local && fe`
      <div class="row"><span class="col"><span class="lbl">PASSWORD</span><span class="subGold">${g2.locked ? "ON \xB7 REQUIRED TO JOIN" : "OFF \xB7 ANYONE WITH THE CODE CAN JOIN"}</span></span>
        <${Switch} label="Password" on=${g2.locked} onToggle=${() => {
      if (g2.locked) setRoom({ locked: false });
      else if (pw.trim()) setRoom({ locked: true, password: pw.trim() });
      else toast("Type a password first");
    }} /></div>
      <div style="display:flex;gap:12px;padding-top:10px">
        <input class="boxIn" type="password" aria-label="Game password" placeholder=${g2.locked ? "New password" : "Set a password"} value=${pw} onInput=${(e2) => setPw(e2.target.value)} />
        <button class="smallBtn" onClick=${() => {
      if (pw.trim()) {
        setRoom({ locked: true, password: pw.trim() });
        store.set("pw." + g2.code, pw.trim());
        setPw("");
        toast("Password saved");
      }
    }}>${g2.locked ? "CHANGE" : "SET"}</button>
      </div>
      <div class="row"><span class="col"><span class="lbl">SPECTATORS</span><span class="subGold">${g2.spectators ? "ALLOWED" : "PLAYERS ONLY"}</span></span>
        <${Switch} label="Spectators" on=${g2.spectators} onToggle=${() => setRoom({ spectators: !g2.spectators })} /></div>
      <div class="hint">${g2.seats.filter((x2) => x2.owner).length} of ${g2.seats.length} seats taken from phones${st.conn ? "" : " \xB7 reconnecting\u2026"}</div>`}
  </div>`;
  }
  var KNOWN_COUNTERS = "+1/+1,-1/-1,loyalty,defense,shield,stun,finality,charge,time,lore,level,oil,quest,storage,fade,age,ticket,bounty,blood,aegis,aim,arrow,arrowhead,awakening,blaze,bloodline,book,brain,bribery,brick,burden,cage,carrion,coin,collection,component,contested,corpse,corruption,credit,croak,crystal,cube,currency,death,delay,depletion,descent,despair,devotion,divinity,doom,dream,echo,egg,elixir,ember,enlightened,eon,eyeball,eyestalk,fate,feather,fetch,filibuster,flame,flood,foreshadow,fungus,fury,fuse,gem,ghostform,glyph,gold,growth,hack,harmony,hatching,hatchling,healing,hit,hone,hoofprint,hope,hour,hourglass,hunger,ice,incarnation,income,infection,influence,ingenuity,intel,intervention,invitation,isolation,javelin,judgment,ki,kick,knickknack,knowledge,landmark,luck,magnet,manabond,manifestation,mannequin,matrix,mine,mining,mire,music,muster,necrodermis,net,night,omen,ore,page,pain,palliation,paralyzation,pause,petal,petrification,phylactery,phyresis,pin,plague,plot,polyp,pressure,prey,pupa,rejection,reprieve,rev,revival,ribbon,ritual,rope,rust,scream,scroll,shell,shred,silver,sleep,sleight,slime,slumber,soot,soul,spark,spite,spore,stash,story,strife,study,supply,suspect,takeover,task,theft,tide,tower,training,trap,treasure,unity,unlock,valor,velocity,verse,vitality,void,volatile,vortex,vow,voyage,wage,winch,wind,wish,wreck,flying,first strike,double strike,deathtouch,hexproof,indestructible,lifelink,menace,reach,trample,vigilance,haste".split(",");
  function CounterSearch({ seat, onPick }) {
    const [q2, setQ] = G("");
    const [found, setFound] = G([]);
    const [state, setState] = G("idle");
    const term = q2.trim().toLowerCase();
    J(() => {
      if (term.length < 2) {
        setFound([]);
        setState("idle");
        return;
      }
      let live = true;
      setState("busy");
      const t2 = setTimeout(async () => {
        try {
          const r2 = await fetch("https://api.scryfall.com/cards/search?unique=cards&order=edhrec&q=" + encodeURIComponent(`o:"${term}" o:counter`));
          if (r2.status === 404) {
            if (live) {
              setFound([]);
              setState("done");
            }
            return;
          }
          const j2 = await r2.json();
          const names = /* @__PURE__ */ new Set();
          for (const c2 of j2.data || []) {
            const text = [c2.oracle_text, ...(c2.card_faces || []).map((f2) => f2.oracle_text)].join(" ").toLowerCase();
            const re2 = /([+\-]\d\/[+\-]\d|[a-z][a-z-]*(?: strike)?) counters?\b/g;
            for (let m2 = re2.exec(text); m2; m2 = re2.exec(text)) {
              const nm = m2[1];
              if (nm.includes(term) && !["a", "an", "the", "that", "those", "of", "more", "each", "any", "all", "no", "its", "his", "her", "their", "additional", "those", "kind", "many", "x", "two", "three", "four", "five", "one"].includes(nm)) names.add(nm);
            }
          }
          if (live) {
            setFound([...names]);
            setState("done");
          }
        } catch (e2) {
          if (live) {
            setFound([]);
            setState("offline");
          }
        }
      }, 280);
      return () => {
        live = false;
        clearTimeout(t2);
      };
    }, [term]);
    const have = new Set(MTG.counterKinds(seat).filter((k2) => seat.shown[k2.key] || (seat.ctr[k2.key] || 0) > 0).map((k2) => k2.label.toLowerCase()));
    const local = term ? [...MTG.COUNTERS.map((k2) => k2.label.toLowerCase()), ...KNOWN_COUNTERS].filter((c2) => c2.includes(term)) : [];
    const list = [.../* @__PURE__ */ new Set([...local, ...found])].filter((c2) => !have.has(c2)).sort((a2, b2) => (a2.startsWith(term) ? 0 : 1) - (b2.startsWith(term) ? 0 : 1) || a2.localeCompare(b2)).slice(0, 8);
    const exact = list.includes(term) || have.has(term) || MTG.counterKinds(seat).some((k2) => k2.label.toLowerCase() === term || k2.chip.toLowerCase() === term);
    const add = (nm) => {
      onPick(nm.slice(0, 24));
      setQ("");
    };
    return fe`<div class="col" style="gap:10px">
    <div style="display:flex;gap:12px"><input class="boxIn" type="text" aria-label="Counter name" placeholder="Search counters or name your own" maxlength="24" value=${q2} onInput=${(e2) => setQ(e2.target.value)} onKeyDown=${(e2) => {
      if (e2.key === "Enter" && term) add(list[0] || q2.trim());
    }} /></div>
    ${state === "busy" && fe`<div class="sub">SEARCHING CARDS…</div>`}
    ${state === "offline" && !list.length && term && fe`<div class="sub">${PREVIEW ? "THIS PREVIEW CAN'T REACH SCRYFALL." : "CAN'T REACH SCRYFALL."} KNOWN COUNTERS STILL SHOW.</div>`}
    ${list.map((c2) => fe`<button class="pickRow" onClick=${() => add(c2)}><span class="col"><span>${c2.toUpperCase()} COUNTER</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`)}
    ${term && !exact && fe`<button class="pickRow" onClick=${() => add(q2.trim())}><span class="col"><span style="color:var(--gold)">ADD "${q2.trim().toUpperCase()}"</span><span>CUSTOM COUNTER</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C96A" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></button>`}
  </div>`;
  }
  var cardArt = (c2) => {
    const iu = c2.image_uris || c2.card_faces && c2.card_faces[0] && c2.card_faces[0].image_uris || {};
    return { name: c2.name, art: iu.art_crop || "", image: iu.normal || iu.large || "" };
  };
  function CmdrSearch({ onPick, onRemove }) {
    const [q2, setQ] = G("");
    const [hits, setHits] = G([]);
    const [state, setState] = G("idle");
    J(() => {
      const term = q2.trim();
      if (term.length < 2) {
        setHits([]);
        setState("idle");
        return;
      }
      let live = true;
      setState("busy");
      const t2 = setTimeout(async () => {
        try {
          const r2 = await fetch("https://api.scryfall.com/cards/search?order=edhrec&unique=cards&q=" + encodeURIComponent(`is:commander ${term}`));
          if (r2.status === 404) {
            if (live) {
              setHits([]);
              setState("none");
            }
            return;
          }
          const j2 = await r2.json();
          if (live) {
            setHits((j2.data || []).slice(0, 8).map(cardArt));
            setState("done");
          }
        } catch (e2) {
          if (live) {
            setHits([]);
            setState("offline");
          }
        }
      }, 250);
      return () => {
        live = false;
        clearTimeout(t2);
      };
    }, [q2]);
    const useTyped = async () => {
      const name = q2.trim();
      if (!name) return;
      try {
        const r2 = await fetch("https://api.scryfall.com/cards/named?fuzzy=" + encodeURIComponent(name));
        if (r2.ok) return onPick(cardArt(await r2.json()));
      } catch (e2) {
      }
      onPick({ name });
    };
    const msg = { busy: "SEARCHING SCRYFALL\u2026", none: "NO COMMANDERS MATCH", offline: PREVIEW ? "THIS PREVIEW CAN'T REACH SCRYFALL. THE LIVE APP SEARCHES IT AS YOU TYPE." : "CAN'T REACH SCRYFALL. USE ADDS THE NAME AS TYPED." }[state];
    return fe`<div class="col" style="gap:12px;padding-top:16px">
    <div style="display:flex;gap:12px"><input class="boxIn" type="text" aria-label="Commander name" placeholder="Search commanders" value=${q2} onInput=${(e2) => setQ(e2.target.value)} onKeyDown=${(e2) => {
      if (e2.key === "Enter") hits[0] ? onPick(hits[0]) : useTyped();
    }} />
      <button class="smallBtn" disabled=${!q2.trim()} onClick=${useTyped}>USE</button></div>
    ${msg && fe`<div class="sub">${msg}</div>`}
    ${hits.map((h2) => fe`<button class="pickRow" style="justify-content:flex-start" onClick=${() => onPick(h2)}>
      <span class="art" style=${h2.art ? { backgroundImage: `url("${h2.art}")` } : null}>${h2.art ? "" : "ART"}</span>
      <span class="col" style="flex:1 1 0;min-width:0"><span style="font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h2.name.toUpperCase()}</span></span><${Chevron} /></button>`)}
    ${onRemove && fe`<button class="textBtn" style="align-self:flex-start;color:var(--red-soft)" onClick=${onRemove}>REMOVE COMMANDER</button>`}
  </div>`;
  }
  function Tv({ g: g2 }) {
    const now = useNow();
    const [page, setPage] = G(0);
    const n2 = g2.seats.length;
    J(() => {
      const k2 = (e2) => {
        if (e2.key === "ArrowRight" || e2.key === "ArrowLeft") setPage((p2) => 1 - p2);
      };
      addEventListener("keydown", k2);
      return () => removeEventListener("keydown", k2);
    }, []);
    const rem = remaining(g2, now);
    const up = MTG.upNext(g2);
    const nextSeat = up.seat;
    return fe`<${Stage} turnPortrait minRatio=${1.3} render=${(W2, H2) => {
      const quads = quadsFor(n2, W2, H2);
      return fe`<div class="tbl" style=${`position:relative;width:${W2}px;height:${H2}px;overflow:hidden`}>
    ${page === 0 ? fe`
      ${quads.map((q2, i2) => fe`<${TvSeat} key=${i2} g=${g2} i=${i2} q=${q2} />`)}
      <${Motes} g=${g2} quads=${quads} W=${W2} H=${H2} />
      ${n2 > 1 && fe`<div style=${`position:absolute;left:${W2 / 2}px;top:${H2 / 2}px;width:300px;height:0;margin-left:-150px;z-index:12`}>
        <div style="position:absolute;left:-90px;right:-90px;bottom:42px;display:flex;justify-content:center"><span class="hubTag" style="color:var(--bright);font-size:15px;letter-spacing:0.11em">${MTG.seatLabel(g2, g2.active).toUpperCase()}'S TURN</span></div>
        <div style="position:absolute;left:0;right:0;top:-32px;height:63px;display:flex;justify-content:center">
          <div id="timerPlate" class=${rem !== null && rem <= 30 ? "low" : ""}>${rem === null ? fe`<span class="s">TURN ${g2.round}</span>` : rem <= 0 ? fe`<span class="s">TIME!</span>` : fe`<span class="t">${fmt(rem)}</span>`}</div>
        </div>
        ${(nextSeat !== g2.active || up.extra) && fe`<div style="position:absolute;left:-90px;right:-90px;top:44px;display:flex;justify-content:center"><span class="hubTag">NEXT · ${MTG.seatLabel(g2, nextSeat).toUpperCase()}${up.extra ? " \xB7 EXTRA TURN" : ""}</span></div>`}
        ${g2.code && fe`<div style=${`position:absolute;left:-90px;right:-90px;top:${nextSeat !== g2.active || up.extra ? 86 : 44}px;display:flex;justify-content:center`}><${CodeTag} g=${g2} /></div>`}
      </div>`}
      ${n2 === 1 && g2.code && fe`<div style="position:absolute;top:34px;right:44px;z-index:12"><${CodeTag} g=${g2} /></div>`}
    ` : fe`<${TvCommanders} g=${g2} />`}
  </div>`;
    }} />`;
  }
  function CodeTag({ g: g2 }) {
    return fe`<span class="hubTag codeTag">${g2.mode === "hosted" ? "JOIN CODE" : "GAME CODE"} <b class="pete">${g2.code}</b></span>`;
  }
  function TvSeat({ g: g2, i: i2, q: q2 }) {
    const s2 = g2.seats[i2];
    const prev = Q(s2.life);
    const ref = Q(null);
    J(() => {
      if (prev.current !== s2.life && ref.current) {
        ref.current.classList.remove("bump");
        void ref.current.offsetWidth;
        ref.current.classList.add("bump");
      }
      prev.current = s2.life;
    }, [s2.life]);
    const active = g2.seats.length > 1 && g2.active === i2 && !s2.out;
    const dead = MTG.isDead(g2, i2);
    const art = s2.cmdrs[0] && (s2.cmdrs[0].art || s2.cmdrs[0].image);
    const chips = [];
    MTG.statusKinds(s2).forEach((f2) => {
      if (MTG.hasFlag(g2, i2, f2.key)) chips.push(fe`<div class="chip status"><em>${f2.label}</em></div>`);
    });
    Object.entries(s2.cmd).forEach(([j2, v2]) => {
      if (v2 <= 0 || !g2.seats[j2]) return;
      const o2 = g2.seats[j2];
      const oa = o2.cmdrs[0] && (o2.cmdrs[0].art || o2.cmdrs[0].image);
      chips.push(fe`<div class=${"chip withArt" + (v2 >= 21 ? " lethal" : v2 >= 15 ? " warn" : "")}><i style=${oa ? { backgroundImage: `url("${oa}")` } : null}></i><em>${MTG.seatLabel(g2, +j2).toUpperCase()}</em><b>${v2}</b></div>`);
    });
    MTG.counterKinds(s2).forEach((k2) => {
      const v2 = s2.ctr[k2.key] || 0;
      if (v2 > 0) chips.push(fe`<div class=${"chip" + (k2.lethal && v2 >= k2.lethal ? " lethal" : "")}><em>${k2.chip}</em><b>${v2}</b></div>`);
    });
    if (g2.settings.commander && s2.tax > 0) chips.push(fe`<div class="chip"><em>TAX</em><b>${s2.tax}</b></div>`);
    const narrowTop = !q2.wide;
    return fe`<div class=${"seat tvSeat" + (active ? " active" : "") + (dead ? " dead" : "")} style=${`left:${q2.x}px;top:${q2.y}px;width:${q2.w}px;height:${q2.h}px`}>
    <div class="seatArt" style=${art ? { backgroundImage: `url("${art}")` } : null}></div>
    <div class="seatShade" aria-hidden="true"></div>
    <div class="activeGlow"></div>
    <div style=${`position:absolute;top:30px;${narrowTop ? "left:44px;right:44px" : "left:60px;width:520px"};display:flex;flex-direction:column;align-items:center;gap:2px;z-index:2`}>
      <div class="pName">${MTG.seatLabel(g2, i2).toUpperCase()}</div>
      <div class="cmdName" style="max-width:100%">${s2.cmdrs.map((c2) => c2.name).join(" \xB7 ")}</div>
    </div>
    <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;z-index:2">
      <span class="lifeNum" ref=${ref}>${s2.life}</span>
    </div>
    ${dead && fe`<div class="deadTag" style="z-index:2">${s2.out ? "CONCEDED" : "DEFEATED"}</div>`}
    <div class="chips" style=${`top:calc(50% + ${dead ? 136 : 112}px);z-index:2`}>${chips}</div>
    <div class="seatFrame frame9" aria-hidden="true"></div>
  </div>`;
  }
  function TvCommanders({ g: g2 }) {
    return fe`<div style="position:absolute;top:0;right:0;bottom:0;left:0">
    <div style="position:absolute;top:62px;right:0;left:0;text-align:center">
      <div style="font-size:27px;font-weight:700;letter-spacing:0.22em;color:var(--bright)">COMMANDERS</div>
      <div style="margin-top:10px;font-size:13px;letter-spacing:0.24em;color:var(--muted)">◀ ▶ ON THE REMOTE TO SWITCH PAGES</div>
    </div>
    <div class="cmdrRow">${g2.seats.map((s2, i2) => {
      const c2 = s2.cmdrs[0];
      const img = c2 && (c2.image || c2.art);
      const a2 = g2.active === i2;
      return fe`<div class=${"cmdrCol" + (a2 ? " active" : "")}><div class="cmdrCard">${img ? fe`<img alt="" src=${img} />` : fe`<div style="position:absolute;right:0;bottom:16px;left:0;text-align:center;font-size:10px;letter-spacing:0.18em;color:#5E574B">NO COMMANDER SET</div>`}</div>
        <div class="cn">${c2 ? c2.name : "\u2014"}</div><div class="pn">${MTG.seatLabel(g2, i2).toUpperCase()}${a2 ? " \xB7 THEIR TURN" : ""}</div></div>`;
    })}</div>
  </div>`;
  }
  function Motes({ g: g2, quads, W: W2 = 1586, H: H2 = 992 }) {
    const ref = Q(null);
    const live = Q({ g: g2, quads, W: W2, H: H2 });
    live.current = { g: g2, quads, W: W2, H: H2 };
    J(() => {
      const cv = ref.current;
      if (!cv || !cv.getContext) return;
      if (/[?&]particles=off\b/.test(location.search) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const motes = [];
      const spawn = (m2, fresh) => {
        const { g: G2, quads: Q2 } = live.current;
        const c2 = Q2[G2.active];
        if (c2 && G2.seats.length > 1 && Math.random() < 0.45) {
          m2.x = c2.x + Math.random() * c2.w;
          m2.y = c2.y + (fresh ? Math.random() : 0.75 + Math.random() * 0.25) * c2.h;
        } else {
          const L2 = live.current;
          m2.x = Math.random() * L2.W;
          m2.y = fresh ? Math.random() * L2.H : L2.H + Math.random() * 40;
        }
        m2.r = 0.8 + Math.random() * 2.2;
        m2.vy = -(0.12 + Math.random() * 0.35);
        m2.sw = Math.random() * 6.28;
        m2.sws = 4e-3 + Math.random() * 0.01;
        m2.tw = Math.random() * 6.28;
        m2.life = 0;
        m2.max = 500 + Math.random() * 700;
        return m2;
      };
      for (let k2 = 0; k2 < 46; k2++) motes.push(spawn({}, true));
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 32;
      const sg = sprite.getContext("2d");
      const gr = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,240,200,1)");
      gr.addColorStop(0.25, "rgba(232,201,106,0.55)");
      gr.addColorStop(1, "rgba(201,162,39,0)");
      sg.fillStyle = gr;
      sg.fillRect(0, 0, 32, 32);
      let last = 0, raf;
      const frame = (ts) => {
        raf = requestAnimationFrame(frame);
        if (ts - last < 32 || document.hidden) return;
        const dt = Math.min((ts - last) / 16.7, 3);
        last = ts;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = "lighter";
        for (const m2 of motes) {
          m2.life += dt;
          m2.sw += m2.sws * dt;
          m2.tw += 0.05 * dt;
          m2.y += m2.vy * dt;
          m2.x += Math.sin(m2.sw) * 0.25 * dt;
          const fade = Math.min(1, m2.life / 60, (m2.max - m2.life) / 90);
          if (fade <= 0 || m2.y < -20) {
            spawn(m2, false);
            continue;
          }
          const s2 = m2.r * 6;
          ctx.globalAlpha = Math.max(0, Math.min(1, fade * (0.35 + 0.35 * Math.sin(m2.tw)) + 0.05));
          ctx.drawImage(sprite, m2.x - s2 / 2, m2.y - s2 / 2, s2, s2);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      };
      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    }, []);
    return fe`<canvas ref=${ref} width=${W2} height=${H2} style="position:absolute;top:0;left:0;z-index:7;pointer-events:none"></canvas>`;
  }
  function TvEntry({ initial }) {
    const st = useStore();
    const [code, setCode] = G((initial || "").toUpperCase());
    const [pw, setPw] = G("");
    const [err, setErr] = G("");
    const [needPw, setNeedPw] = G(false);
    const tried = Q(false);
    const connect = async (c2 = code) => {
      if (c2.length !== 6) {
        setErr("ENTER THE 6-CHARACTER CODE");
        return;
      }
      if (PREVIEW) {
        setErr("THE TV CONNECTS TO GAMES ON THE LIVE APP");
        return;
      }
      setErr("");
      const e2 = await joinGame(c2, pw, "tv");
      if (e2) {
        setErr(e2);
        if (/PASSWORD/.test(e2)) setNeedPw(true);
      }
    };
    J(() => {
      if (initial && initial.length === 6 && !tried.current) {
        tried.current = true;
        connect(initial.toUpperCase());
      }
    }, []);
    if (st.game && (st.role === "tv" || st.role === "spectator")) return fe`<${Tv} g=${st.game} />`;
    return fe`<div class="tbl screen">
    <div class="tblBlur" aria-hidden="true"></div>
    <${Title} sub="TV DISPLAY" />
    <div class="card mgrCard frame9"><div class="cardBody">
      <div class="col ruled" style="gap:14px;padding:14px 0 22px">
        <label class="lbl" for="tvcode">GAME CODE</label>
        <input id="tvcode" class="field code" maxlength="6" autocomplete="off" placeholder="ABC123" value=${code} onInput=${(e2) => setCode(e2.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} onKeyDown=${(e2) => {
      if (e2.key === "Enter") connect();
    }} />
        <span class="sub">THE CODE IS IN THE MENU UNDER TV DISPLAY OR HOSTED GAME</span>
      </div>
      ${needPw && fe`<div class="col ruled" style="gap:14px;padding:14px 0 22px"><label class="lbl" for="tvpw">PASSWORD</label><input id="tvpw" class="field text" type="password" value=${pw} onInput=${(e2) => setPw(e2.target.value)} onKeyDown=${(e2) => {
      if (e2.key === "Enter") connect();
    }} /></div>`}
      <div class="err" style="padding-top:8px">${err}</div>
      <button class="goldBtn goldTex" onClick=${() => connect()}>SHOW GAME</button>
      <div style="height:12px"></div>
    </div></div>
  </div>`;
  }
  function Watch() {
    const st = useStore();
    if (!st.game) return fe`<${Waiting} text="CONNECTING…" />`;
    return fe`<div><${Tv} g=${st.game} /><button class="flatLink back" style="position:fixed;top:8px;left:8px;width:auto;min-height:44px;z-index:50;background:rgba(8,8,10,0.6);border-radius:8px;padding:0 12px" onClick=${leaveGame}><${Chevron} left />LEAVE</button></div>`;
  }
  function PreviewBar() {
    return fe`<button class="flatLink" style="position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);width:auto;min-height:40px;z-index:40;padding:0 16px;background:rgba(8,8,10,0.8);border:1px solid var(--edge);border-radius:8px 8px 0 0;font-size:12px" onClick=${() => set({ tvMirror: true })}>SHOW TV VIEW</button>`;
  }
  function PreviewTv() {
    const st = useStore();
    return fe`<div><${Tv} g=${st.game} /><button class="flatLink back" style="position:fixed;top:8px;left:8px;width:auto;min-height:44px;z-index:50;background:rgba(8,8,10,0.75);border:1px solid var(--edge);border-radius:8px;padding:0 14px;font-size:13px" onClick=${() => set({ tvMirror: false })}><${Chevron} left />BACK TO TABLET</button></div>`;
  }
  function App() {
    const st = useStore();
    const r2 = st.route;
    let view;
    if (IS_TV || r2.name === "tv") view = fe`<${TvEntry} initial=${r2.arg} />`;
    else if (st.tvMirror && st.game) view = fe`<${PreviewTv} />`;
    else if (r2.name === "game" && st.game) view = st.role === "player" ? fe`<${PlayerView} />` : fe`<${Table} />`;
    else if (r2.name === "watch") view = fe`<${Watch} />`;
    else if (r2.name === "host") view = fe`<${Host} />`;
    else if (r2.name === "join") view = fe`<${Join} initial=${r2.arg} />`;
    else if (st.game && (st.role === "local" || st.role === "host")) view = fe`<${Table} />`;
    else view = fe`<${Setup} />`;
    return fe`${view}<div id="toast" class=${st.toast ? "show" : ""} role="status">${st.toast}</div>`;
  }
  if (S2.game && (S2.role === "local" || S2.role === "host") && S2.route.name === "setup" && !location.hash) S2.route = { name: "game", arg: "" };
  M(fe`<${App} />`, document.getElementById("app"));
  async function keepAwake() {
    try {
      const wl = await navigator.wakeLock.request("screen");
      wl.addEventListener("release", () => setTimeout(keepAwake, 1500));
    } catch (e2) {
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") keepAwake();
  });
  keepAwake();
  if (IS_TV) {
    let t2;
    const wake = () => {
      document.body.classList.remove("hideCursor");
      clearTimeout(t2);
      t2 = setTimeout(() => document.body.classList.add("hideCursor"), 2500);
    };
    document.addEventListener("mousemove", wake);
    wake();
  }
  window.__mtg = { S: S2, set, dispatch, MTG };
})();
