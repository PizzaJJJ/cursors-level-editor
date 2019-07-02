var A = window;
var E = document;
var background = new Image();
var tempImg = new Image();
var bgOpacity = 0.5;  // transparency of the background image
var bgFit = true;   // fit image to the screensize
var bgRatio = true; // save image aspect ratio when fitting
var bgScale = 1.0; // image scale
var bgShiftX = 0; // image shift by x axis (start point is {x: 0, y: 0}, left top corner)
var bgShiftY = 0; // image shift by y axis (start point is {x: 0, y: 0}, left top corner)
var wallhack = false, clickCount = 1, cursorWeight = 1, serverPing = 50;
var codeShown = false, showImage = false;
var manualText = "Instructions:\n"+
"→ A/S to cycle colors.\n"+
"→ B to place a button.\n"+
"→ N to place a hover zone.\n"+
"→ Arrow keys to change button and hover size,\n"+
"→ Shift + Arrows to reduce its size.\n"+
"→ W to put a goal.\n"+
"→ Change size with Arrows.\n"+
"→ Shift + Arrows to reduce its size.\n"+
"→ Shift + W to place a red trap.\n"+
"→ Press + or - to increase/decrease the counter in buttons and areas\n"+
"→ Z to undo button/goal/hover area placement\n"+
"→ O to set spawn point\n"+
"→ To erase a wall: press A or S until the color is white or ESR, then delete using click\n";

var ws = null, monitorTimer = null;

/* the link on your image or imgdata ****/
    background.src = "http://news.nationalgeographic.com/content/dam/news/photos/000/755/75552.ngsversion.1422285553360.adapt.1900.1.jpg";
/****************************************/

function changeImg(src) {
    tempImg.src = src;
    tempImg.onload = () => background.src = src;
    tempImg.onerror = () => console.error("Image not found!");
}

function Cell(i, j) {
    this.x = i;
    this.y = j;
    this.visited = false;
    this.walls = {
        top: true,
        right: true,
        bottom: true,
        left: true
    };
}

function Grid() {
    this.width = 20;
    this.height = 15;
    this.cells = [];
}

Grid.prototype = {
    fill: function() {
        var i, j, w = this.width, h = this.height;

        for (i = 0; i < w; i++) {
            this.cells[i] = [];
            for (j = 0; j < h; j++) {
                this.cells[i][j] = new Cell(i, j);
            }
        }
    },
    unvisitedExist: function() {
        var i, j, w = this.width, h = this.height;

        for (i = 0; i < w; i++) {
            for (j = 0; j < h; j++) {
                if (!this.cells[i][j].visited) {
                    return true;
                }
            }
        }

        return false;
    },
    isInside: function(x, y) {
        return x >= 0 && x < this.width && y >=0 && y < this.height;
    },
    getNeighbors: function(cell) {
        var x = cell.x, y = cell.y, neighbors = [];

        if (this.isInside(x, y - 1)) {
            neighbors.push(this.cells[x][y - 1]);
        }
        if (this.isInside(x + 1, y)) {
            neighbors.push(this.cells[x + 1][y]);
        }
        if (this.isInside(x, y + 1)) {
            neighbors.push(this.cells[x][y + 1]);
        }
        if (this.isInside(x - 1, y)) {
            neighbors.push(this.cells[x - 1][y]);
        }

        return neighbors;
    },
    getNextNeighbor: function(cell) {
        var neighbors = this.getNeighbors(cell),
            index, i = 0;

        for (; i < neighbors.length; i++) {
            if (neighbors[i].visited) {
                neighbors.splice(i, 1);
                i--;
            }
        }
        index = Math.floor(neighbors.length*Math.random());
        return neighbors[index];
    },
    removeWallsBetween: function(cellA, cellB) {
        var dirX = cellA.x - cellB.x,
            dirY = cellA.y - cellB.y;

        if (dirX === 1 && dirY === 0) {
            cellA.walls.left = false;
            cellB.walls.right = false;
        }
        if (dirX === -1 && dirY === 0) {
            cellA.walls.right = false;
            cellB.walls.left = false;
        }
        if (dirX === 0 && dirY === 1) {
            cellA.walls.top = false;
            cellB.walls.bottom = false;
        }
        if (dirX === 0 && dirY === -1) {
            cellA.walls.bottom = false;
            cellB.walls.top = false;
        }
    }
};

function va(f) {
    var xx, yy;

    if (!testMode) return L = !1, V(f), !1;
    if (!wallhack) {
        U() ? X || (X = !0, W(k, q)) : (X = !1, !testMode || M.checked || y.requestPointerLock && y.requestPointerLock());
    }
    if (L) L = !1;
    else if (V(f), f.ctrlKey || f.shiftKey) Y = !0, R = k, S = q;
    else if (100 < t - ca && v == k && w == q) {
        ca = t;
        I.push([v << 1, w << 1, t]);
        xx = v;
        yy = w;
        sleep(serverPing).then(() => TestModeHandlers.putClick(xx, yy, clickCount));
        var b = [v, w];
        N.push(b);
        setTimeout(function() {
            N.remove(b);
        }, 1E3);
    }
    return !1;
}

function V(f) {
    var x, y, x1, y1, a, d;
    if (U()) {
        var b = f.webkitMovementX || f.mozMovementX || f.movementX || 0;
        f = f.webkitMovementY || f.mozMovementY || f.movementY || 0;
        300 > Math.abs(b) + Math.abs(f) && (B += b, C += f, v = B >> 1, w = C >> 1);
    } else f.offsetX ? (B = f.offsetX, C = f.offsetY) : f.layerX && (B = f.layerX, C = f.layerY), v = B >> 1, w = C >> 1;
    if (testMode) {
        if (wallhack) {
            k = v, q = w;
        } else Z();
        if (!U() || v == k && w == q || (f = b = 0, v > k && (b = 1),
            w > q && (f = 1), v = k, w = q, B = (v << 1) + b, C = (w << 1) + f), Y && (R != k || S != q) && 50 < t - da) {
            b = R;
            f = S;
            a = k, d = q;
            R = k;
            S = q;
            da = t;
            x = b;
            y = f;
            sleep(serverPing).then(() => TestModeHandlers.putLine(x, y, a, d));
        }
        x1 = k;
        y1 = q;
        sleep(serverPing).then(() => TestModeHandlers.processTriggerAt(x1, y1));
    } else {
        k = v, q = w;
    }
}

function Z() {
    if (z(k, q)) {
        var a;
        a: {
            a = k;
            var b = q,
                c = [],
                d = new Uint8Array(12E4);
            c.push([a, b]);
            d[a + 400 * b] = 1;
            do {
                var g = c.shift(),
                    e = g[0],
                    g = g[1];
                if (!(0 > e || 0 > g || 400 <= e || 300 <= g)) {
                    if (!z(e, g)) {
                        a = {
                            x: e,
                            y: g
                        };
                        break a;
                    }
                    d[e - 1 + 400 * g] || (c.push([e - 1, g]), d[e - 1 + 400 * g] = 1);
                    d[e + 1 + 400 * g] || (c.push([e + 1, g]), d[e + 1 + 400 * g] = 1);
                    d[e + 400 * (g - 1)] || (c.push([e, g - 1]), d[e + 400 * (g - 1)] = 1);
                    d[e + 400 * (g + 1)] || (c.push([e, g + 1]), d[e + 400 * (g + 1)] = 1);
                }
            } while (0 < c.length);
            a = {
                x: a,
                y: b
            };
        }
        k = a.x;
        q = a.y;
    }
    if (k != v || q != w) a = fa(k, q, v, w), k = a.x, q = a.y;
}

function U() {
    if (!wallhack) return E.pointerLockElement === y || E.mozPointerLockElement === y || E.webkitPointerLockElement === y;
}

function W(f, b) {
    k = v = f;
    q = w = b;
    B = v << 1;
    C = w << 1;
}

function ga(f) {
    a.imageSmoothingEnabled = f;
    a.mozImageSmoothingEnabled = f;
    a.oImageSmoothingEnabled = f;
    a.webkitImageSmoothingEnabled = f;
}

function isInsideObj(x, y, obj) {
    return !obj.hidden && (x >= obj.x && x < obj.x + obj.width) && (y >= obj.y && y < obj.y + obj.height);
}

function getTriggerAt(x, y) {
    var i, l, obj;
    for (i = 0, l = r.length; i < l; i++) {
        obj = r[i];
        if (obj.type == 2 || obj.type == 3 || obj.type == 4)
            if (isInsideObj(x, y, obj)) return obj;
    }
}

function isWallAt(x, y) {
    var i, l, obj;
    for (i = 0, l = r.length; i < l; i++) {
        obj = r[i];
        if (obj.type == 1)
            if (isInsideObj(x, y, obj)) return true;
    }
}

function fa(a, b, c, d) {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    if (z(a, b)) return {
        x: a,
        y: b
    };
    if (a == c && b == d) return {
        x: c,
        y: d
    };
    var g = a,
        e = b;
    c = c - a | 0;
    d = d - b | 0;
    var n =
        0,
        l = 0,
        p = 0,
        k = 0;
    0 > c ? n = -1 : 0 < c && (n = 1);
    0 > d ? l = -1 : 0 < d && (l = 1);
    0 > c ? p = -1 : 0 < c && (p = 1);
    var m = Math.abs(c) | 0,
        h = Math.abs(d) | 0;
    m <= h && (m = Math.abs(d) | 0, h = Math.abs(c) | 0, 0 > d ? k = -1 : 0 < d && (k = 1), p = 0);
    c = m >> 1;
    for (d = 0; d <= m && !z(a, b); d++) g = a, e = b, c += h, c >= m ? (c -= m, a += n, b += l) : (a += p, b += k);
    return {
        x: g,
        y: e
    }
}

function z(a, b) {
    return (0 > a || 400 <= a || 0 > b || 300 <= b) ? true : (wallhack ? false : isWallAt(a, b));
}
 
function Ja() {
    for (var a = 0; a < r.length; a++) {
        var b = r[a];
        5 == b.type && Ka(b);
    }
}
 
function Ka(a) {
    function b(a, b, c) {
        e.push([c, a, b]);
        l[a + 400 * b] = !0;
        g(a, b)
    }
 
    function c(a, b, c) {
        p.push([c,
            a, b
        ]);
        l[a + 400 * b] = !0
    }
 
    function d(a, b) {
        return 255 != k[4 * (a + 400 * b) + 3] && !l[a + 400 * b]
    }
 
    function g(a, b) {
        var c = 4 * (a + 400 * b);
        k[c + 0] = 255;
        k[c + 1] = 153;
        k[c + 2] = 153;
        k[c + 3] = 255
    }
    for (var e = a.queue, k = a.img.data, l = a.explored, p = a.potentialQueue, r = e.length, m = 0; m < p.length; m++) z(p[m][1], p[m][2]) || (g(p[m][1], p[m][2]), e.push(p[m]), p.splice(m, 1), --m);
    for (m = 0; m < r; ++m) z(e[m][1], e[m][2]) && (p.push(e[m]), e.splice(m, 1), --m, --r);
    for (r = 0; 50 > r && 0 != e.length; ++r) {
        for (var h = Number.POSITIVE_INFINITY, q = [e[0]], m = 1; m < e.length; ++m) {
            var x = e[m][0];
            .01 > Math.abs(x - h) ? q.push(e[m]) : x < h && (h = x, q = [e[m]])
        }
        for (m = 0; m < q.length; ++m) {
            var x = q[m][0],
                h = q[m][1],
                s = q[m][2],
                qa = e.indexOf(q[m]); - 1 != qa && e.splice(qa, 1);
            0 < h && d(h - 1, s) && (z(h - 1, s) ? c(h - 1, s, x + 1) : b(h - 1, s, x + 1));
            0 < s && d(h, s - 1) && (z(h, s - 1) ? c(h, s - 1, x + 1) : b(h, s - 1, x + 1));
            400 > h + 1 && d(h + 1, s) && (z(h + 1, s) ? c(h + 1, s, x + 1) : b(h + 1, s, x + 1));
            300 > s + 1 && d(h, s + 1) && (z(h, s + 1) ? c(h, s + 1, x + 1) : b(h, s + 1, x + 1));
            0 < h && 0 < s && d(h - 1, s - 1) && (z(h - 1, s - 1) ? c(h - 1, s - 1, x + Math.SQRT2) : b(h - 1, s - 1,  
x + Math.SQRT2));
            0 < h && 300 > s + 1 && d(h - 1, s + 1) && (z(h - 1, s + 1) ? c(h - 1, s + 1, x + Math.SQRT2) :
                b(h - 1, s + 1, x + Math.SQRT2));
            400 > h + 1 && 0 < s && d(h + 1, s - 1) && (z(h + 1, s - 1) ? c(h + 1, s - 1, x + Math.SQRT2) : b(h + 1,  
s - 1, x + Math.SQRT2));
            400 > h + 1 && 300 > s + 1 && d(h + 1, s + 1) && (z(h + 1, s + 1) ? c(h + 1, s + 1, x + Math.SQRT2) : b(h  
+ 1, s + 1, x + Math.SQRT2))
        }
    }
    a.ctx.putImageData(a.img, 0, 0)
}

var y, a, v = 0, w = 0, B = 0, C = 0, k = 0, q = 0,
M = null, P = new Image;
P.src = "img/cursor.png";
var t = 0,
L = testMode && !0,
r = [], I = [], O = [], N = [],
ca = 0, R = 0, S = 0, da = 0,
X = !1, Y = !1;

var ra = function() {
    var e = !1,
        n = 0,
        l = 0,
        p = 1,
        u = 200,
        m = 150,
        h = new Uint8Array(1200),
        t = "#000000 #FF9999 #9999FF #FFFF99 #99FFFF #FF99FF #3333FF".split(" ");

    function f() {
        var a = 0,
            b = 0,
            c = v / 10,
            d = w / 10;
        n < c ? (c = Math.ceil(c), a = Math.floor(n)) : (c = Math.floor(c), a = Math.ceil(n));
        l < d ? (d = Math.ceil(d), b = Math.floor(l)) :
            (d = Math.floor(d), b = Math.ceil(l));
        if (a > c) var e = c,
            c = a,
            a = e;
        b > d && (e = d, d = b, b = e);
        return {
            sx: a,
            sy: b,
            fx: c,
            fy: d
        }
    }

    function b(evt) {
        if (evt.which == 3 || evt.button == 2) return;
        if (!testMode) {
            e = !0;
            n = v / 10;
            l = w / 10
        }
    }

    function c(a) {
        return "0x" + parseInt(a.slice(1), 16).toString(16).toUpperCase()
    }

    function cc(a) {
        return "#" + parseInt(a.slice(1), 16).toString(16).padStart(6, "0").toUpperCase()
    }

    function d(a, b, c, d, e) {
        var x = 10 * ~~(k / 10) - ~~(a / 2) + c,
            y = 10 * ~~(q / 10) - ~~(b / 2) + d,
            addX = e.type == 2 ? 0 : c,
            addY = e.type == 2 ? 0 : d;

        if (x < 0) x = addX;
        if (y < 0) y = addY;
        if (x + a > 400) x += (400 - (x + a) - addX);
        if (y + b > 300) y += (300 - (y + b) - addY);

        a = {
            x: x,
            y: y,
            width: a,
            height: b
        };
        for (var f in e) e.hasOwnProperty(f) && (a[f] = e[f]);
        return a;
    }

    function g(a, b) {
        for (var c = null, d = Number.POSITIVE_INFINITY, e = 0; e < r.length; e++) {
            var f = r[e];
            if (f.hasOwnProperty("x") && f.hasOwnProperty("y") && f.hasOwnProperty("width") &&
                f.hasOwnProperty("height")) {
                var g = f.x + f.width / 2,
                    h = f.y + f.height / 2,
                    g = (a - g) * (a - g) + (b - h) * (b - h);
                g < d && (d = g, c = f)
            }
        }
        return c
    }

    function resize(b, isReduce, dirCode) {
        switch (dirCode) {
            case 37:
                isReduce ? b.width -= 10 : (b.x -= 10, b.width += 10), 0 == b.width && r.splice(r.indexOf(b), 1);
                break;
            case 39:
                isReduce ? (b.x += 10, b.width -= 10) : b.width += 10, 0 == b.width && r.splice(r.indexOf(b), 1);
                break;
            case 38:
                isReduce ? b.height -= 10 : (b.y -= 10, b.height += 10), 0 == b.height && r.splice(r.indexOf(b), 1);
                break;
            case 40:
                isReduce ? (b.y += 10, b.height -= 10) : b.height += 10, 0 == b.height && r.splice(r.indexOf(b), 1);
                break;
        }

        var x = b.x, y = b.y, w = b.width, h = b.height,
            addX = b.type == 4 ? 5 : 0,
            addY = b.type == 4 ? 5 : 0;

        if (w > 400 - 2*addX) b.width = 400 - 2*addX;
        if (h > 300 - 2*addY) b.height = 300 - 2*addY;
        if (x + w > 400 - addX) b.x += (400 - (x + w) - addX);
        if (y + h > 300 - addY) b.y += (300 - (y + h) - addY);
        if (b.x < addX) b.x = addX;
        if (b.y < addY) b.y = addY;
    }

    E.addEventListener("mouseup", function(evt) {
        if (testMode) {
            TestModeHandlers.mouseup(evt);
        } else {
            if (e) {
                for (var a = f(), b = p, c = a.sy; c < a.fy; ++c)
                    for (var d = a.sx; d < a.fx; ++d) h[d + 40 * c] = b;
                e = !1
            }
            if (codeShown) logArea.value = generateCode();
        }
    });
    E.addEventListener("mousemove", function() {});
    A.getSpawnPoint = function() {
        return [u ,m];
    },
    A.generateCode = function() {
        for (var a = "class Level? : public Level {\npublic:\n\tLevel?() : Level(" +
                u + ", " + m + "){}\n\n\tvoid OnInit(){\n", a = a + ("\t\tstd::vector<LevelObject*> wallByColor["  
+ t.length + "];\n"), b = new Uint8Array(1200), d = [], e = 0; 30 > e; ++e)
            for (var f = 0; 40 > f; ++f)
                if (!b[f + 40 * e]) {
                    var g = h[f + 40 * e];
                    if (0 != g) {
                        for (var k = f; 40 > f && h[f + 40 * e] == g && !b[f + 40 * e];) b[f + 40 * e] = !0, ++f;
                        var l = f--,
                            p = l - k,
                            q = e++;
                        a: for (; 30 > e;) {
                            for (var n = k; n < l; ++n) {
                                if (h[n + 40 * e] != g) break a;
                                if (b[n + 40 * e]) break a
                            }
                            for (n = k; n < l; ++n) b[n + 40 * e] = !0;
                            ++e
                        }
                        l = e - q;
                        e = q;
                        d.push({
                            x: 10 * k,
                            y: 10 * q,
                            width: 10 * p,
                            height: 10 * l,
                            color: g - 1
                        })
                    }
                }
        for (b = 0; b < d.length; b++) e = d[b], 0 ==
            e.color ? a += "\t\tAddObject(new ObjWall(" + e.x + ", " + e.y + ", " + e.width + ", " + e.height +  
", 0x000000));\n" : (f = c(t[e.color]), a += "\t\twallByColor[" + e.color + "].push_back(AddObject(new ObjWall(" +  
e.x + ", " + e.y + ", " + e.width + ", " + e.height + ", " + f + ")));\n");
        for (b = 0; b < r.length; b++) d = r[b], 0 != d.type && (2 == d.type ? a += "\t\tAddObject(new ObjTeleport(" + (d.isBad ? "" : "LevelManager::GetNextLevel(this), ") + d.x + ", " + d.y + ", " + d.width + ", " + d.height + "));\n" : 3  
== d.type ? (a += "\t\tAddObject(new ObjAreaCounter(wallByColor[" + d.colorCode + "], " + d.x + ", " + d.y +
            ", " + d.width + ", " + d.height + ", ", a += d.count + ", " + c(d.color) + "));\n") : 4 == d.type &&  
(a += "\t\tAddObject(new ObjClickBox(wallByColor[" + d.colorCode + "], " + d.x + ", " + d.y + ", " + d.width + ", " +  
d.height + ", ", a += d.count + ", 1000, " + c(d.color) + "));\n"));
        return a += "\t}\n};\n"
    };
    A.generateWalls = function() {
        var id = 0, a = "";
        for (var b = new Uint8Array(1200), d = [], e = 0; 30 > e; ++e)
            for (var f = 0; 40 > f; ++f)
                if (!b[f + 40 * e]) {
                    var g = h[f + 40 * e];
                    if (0 != g) {
                        for (var k = f; 40 > f && h[f + 40 * e] == g && !b[f + 40 * e];) b[f + 40 * e] = !0, ++f;
                        var l = f--,
                            p = l - k,
                            q = e++;
                        a: for (; 30 > e;) {
                            for (var n = k; n < l; ++n) {
                                if (h[n + 40 * e] != g) break a;
                                if (b[n + 40 * e]) break a
                            }
                            for (n = k; n < l; ++n) b[n + 40 * e] = !0;
                            ++e
                        }
                        l = e - q;
                        e = q;
                        r.push({
                            type: 1,
                            x: 10 * k,
                            y: 10 * q,
                            width: 10 * p,
                            height: 10 * l,
                            color: cc(t[g - 1])
                        });
                        id++;
                    }
                }
    };
    A.clearWalls = function() {
        h = new Uint8Array(1200);
    };
    A.generateMaze = function() {
        var grid = new Grid(),
            current, next, stack = [],
            i, j, x, y, w, hh, cell;

        h = new Uint8Array(1200);
        grid.fill();
        current = grid.cells[1][1];
        current.visited = true;

        while (grid.unvisitedExist()) {
            next = grid.getNextNeighbor(current);
            if (next) {
                stack.push(current);
                grid.removeWallsBetween(current, next);
                next.visited = true;
                current = next;
            } else if (stack.length) {
                current = stack.pop();
            }
        }

        w = grid.width;
        hh = grid.height;

        for (i = 0; i < w; i++) {
            for (j = 0; j < hh; j++) {
                cell = grid.cells[i][j];
                x = (cell.x * 2) + 1;
                y = (cell.y * 2) + 1;
                fillWall(x, y);
                x = (cell.x * 2) - 1;
                y = (cell.y * 2) - 1;
                fillWall(x, y);
                x = (cell.x * 2) - 1;
                y = (cell.y * 2) + 1;
                fillWall(x, y);
                x = (cell.x * 2) + 1;
                y = (cell.y * 2) - 1;
                fillWall(x, y);
                if (cell.walls.top) {
                    x = cell.x * 2;
                    y = (cell.y * 2) - 1;
                    fillWall(x, y);
                }
                if (cell.walls.bottom) {
                    x = cell.x * 2;
                    y = (cell.y * 2) + 1;
                    fillWall(x, y);
                }
                if (cell.walls.left) {
                    x = (cell.x * 2) - 1;
                    y = cell.y * 2;
                    fillWall(x, y);
                }
                if (cell.walls.right) {
                    x = (cell.x * 2) + 1;
                    y = cell.y * 2;
                    fillWall(x, y);
                }
                if (i == w - 1) {
                    x = (cell.x * 2) + 1;
                    y = cell.y * 2;
                    eraseWall(x, y);
                }
                if (j == hh - 1) {
                    x = cell.x * 2;
                    y = (cell.y * 2) + 1;
                    eraseWall(x, y);
                }
            }
        }

        function fillWall(x, y) {
            if (x >= 0 && y >= 0) {
                var sum = x + 40*y;
                if (sum < 1200) h[sum] = p;
            }
        }

        function eraseWall(x, y) {
            if (x >= 0 && y >= 0) {
                var sum = x + 40*y, color = Math.min(1, Math.round(2*Math.random()));
                if (color === 1) color = p;
                if (sum < 1200) h[sum] = color;
            }
        }
    };
    E.addEventListener("keydown", function(a) {
        var b = a.keyCode;
        if (b == 9) {
            a.preventDefault();
        }
        if (!testMode) {
            switch (b) {
                case 65:
                    --p, 0 > p && (p = t.length);
                    break;
                case 83:
                    ++p, p > t.length && (p = 0);
                    break;
                case 66:
                    r.push(d(40, 40, 5, 5, {
                        type: 4,
                        color: t[p - 1],
                        colorCode: p - 1,
                        count: 5
                    }));
                    break;
                case 90:
                    r.pop();
                    break;
                case 87:
                    r.push(d(50, 50, -5, -5, {
                        type: 2,
                        isBad: a.shiftKey
                    }));
                    break;
                case 79:
                    u = k, m = q;
                    break;
                case 78:
                    r.push(d(40, 40, 0, 0, {
                        type: 3,
                        color: t[p - 1],
                        colorCode: p - 1,
                        count: 1
                    }));
                    break;
                case 37:
                case 39:
                case 38:
                case 40:
                    b = g(v, w);
                    if (b != null) {
                        resize(b, a.shiftKey, a.keyCode);
                    }
                    break;
                case 107:
                case 187:
                    b = g(v, w), null != b && 'count' in b && ++b.count;
                    break;
                case 189:
                case 109:
                    b = g(v, w), null != b && 'count' in b && b.count > 1 && --b.count;
                    break;
            }
            if (codeShown) logArea.value = generateCode();
        }
    });
    return {
        renderEditor: function(ctx) {
            ctx.save();
            ctx.fillStyle = "#FF0000";
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 1;
            ctx.globalAlpha = .09;
            ctx.beginPath();
            for (var b = 0; 400 > b; b += 10) ctx.moveTo((b << 1) + .5, 0), ctx.lineTo((b << 1) + .5, 600);
            for (var c = 0; 300 > c; c += 10) ctx.moveTo(0, (c << 1) + .5), ctx.lineTo(800, (c << 1) + .5);
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(400.5, 0);
            ctx.lineTo(400.5, 600);
            ctx.moveTo(0, 300.5, 0);
            ctx.lineTo(800, 300.5);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#000000";
            for (var d = f(), c = 0; 300 > c; c += 10)
                for (b = 0; 400 > b; b += 10) {
                    var g = b / 10 | 0,
                        k = c / 10 | 0,
                        l = h[g + 40 * k];
                    e && g >= d.sx && g < d.fx && k >= d.sy && k < d.fy && (l = p);
                    0 != l && (ctx.fillStyle = t[l - 1], ctx.fillRect(b << 1, c << 1, 20, 20))
                }
            ctx.save();
            ctx.globalAlpha = .09;
            ctx.fillStyle = "#0000FF";
            ctx.beginPath();
            ctx.arc(u << 1, m << 1, 20, 0, 2 * Math.PI, !1);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2.5;
            ctx.font = "14px NovaSquare";
            ctx.globalAlpha = .5;
            ctx.strokeText("Current color: ", 10, 590);
            ctx.globalAlpha = 1;
            ctx.fillText("Current color: ", 10, 590);
            0 == p ? ctx.fillText("ESR", 105, 590) : (ctx.fillStyle = "#000000", ctx.fillRect(104, 575, 22, 22), ctx.fillStyle = t[p - 1], ctx.fillRect(105, 576, 20, 20));
            ctx.restore();
            ctx.restore();
        },
        initEditor: function() {
            y.addEventListener("mousedown", b)
        }
    }
}(),
Ha = ra.renderEditor,
La = ra.initEditor,
za = new Uint8Array(12E4);

Array.prototype.remove = function(a) {
    a = this.indexOf(a);
    return -1 != a ? (this.splice(a, 1), !0) : !1
};

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length);
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

function render() {
    var canv = E.createElement('canvas');
    canv.width = 800;
    canv.height = 600;
    ctx = canv.getContext('2d');

    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 1;
    ctx.save();
        var f;
        Ha(ctx);
        for (f = 0; f < r.length; f++) {
            var b = r[f];
            if (b.hidden) continue;
            if (0 == b.type) {
                ctx.font = b.size + "px NovaSquare";
                var c = b.x << 1,
                    d = b.y << 1;
                b.isCentered && (c -= ctx.measureText(b.text).width / 2);
                ctx.fillStyle = "#000000";
                ctx.fillText(b.text, c, d);
            } else if (2 == b.type) ctx.fillStyle = b.isBad == 1 ? "#FF0000" : b.isBad == 2 ? "#0000FF" : "#00FF00", ctx.globalAlpha = .2, ctx.fillRect(b.x  
<< 1, b.y << 1, b.width << 1, b.height << 1), ctx.globalAlpha = 1;
            else if (3 == b.type) {
                var c = b.x << 1,
                    d = b.y << 1,
                    g = b.width << 1,
                    e = b.height << 1;
                ctx.fillStyle = b.color;
                ctx.globalAlpha = .2;
                ctx.fillRect(c, d, g, e);
                ctx.globalAlpha =
                    .5;
                ctx.fillStyle = "#000000";
                40 > b.width || 40 > b.height ? (ctx.font = "30px NovaSquare", ctx.fillText(b.count, c + g / 2 -  
ctx.measureText(b.count).width / 2, d + e / 2 + 10)) : (ctx.font = "60px NovaSquare", ctx.fillText(b.count, c + g / 2 -  
ctx.measureText(b.count).width / 2, d + e / 2 + 20));
                ctx.globalAlpha = 1
            } else if (4 == b.type) {
                c = b.x << 1;
                d = b.y << 1;
                g = b.width << 1;
                e = b.height << 1;
                ctx.fillStyle = b.color;
                ctx.strokeStyle = b.color;
                ctx.globalAlpha = 1;
                ctx.fillRect(c, d, g, e);
                ctx.globalAlpha = .2;
                ctx.fillStyle = "#000000";
                ctx.fillRect(c, d, g, e);
                ctx.globalAlpha = 1;
                ctx.fillStyle = b.color;
                var n = t - b.lastClickAt < 150,
                    l = n ? 8 : 12;
                ctx.fillRect(c + l, d + l, g - 2 * l, e - 2 * l);
                ctx.strokeStyle = "#000000";
                ctx.globalAlpha = .1;
                ctx.beginPath();
                ctx.moveTo(c, d);
                ctx.lineTo(c + l, d + l);
                ctx.moveTo(c + g, d);
                ctx.lineTo(c + g - l, d + l);
                ctx.moveTo(c, d + e);
                ctx.lineTo(c + l, d + e - l);
                ctx.moveTo(c + g, d + e);
                ctx.lineTo(c + g - l, d + e - l);
                ctx.moveTo(c, d);
                ctx.rect(c, d, g, e);
                ctx.rect(c + l, d + l, g - 2 * l, e - 2 * l);
                ctx.stroke();
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = .5;
                50 > b.width || 50 > b.height ? (ctx.font = "35px NovaSquare", ctx.fillText(b.count, c + g / 2 -  
ctx.measureText(b.count).width / 2, d + e / 2 + 13)) : (ctx.font = "45px NovaSquare", ctx.fillText(b.count,
                    c + g / 2 - ctx.measureText(b.count).width / 2, d + e / 2 + 16));
                n && (ctx.fillStyle = "#000000", ctx.globalAlpha = .15, ctx.fillRect(c + l, d + l, g - 2 * l, e - 2 * l));
                ctx.globalAlpha = 1
            } else 5 == b.type && (ga(!1), ctx.drawImage(b.canvas, 0, 0, 400, 300, 0, 0, 800, 600), ga(!0))
        }
    ctx.restore();

    return canv.toDataURL();
}

function ma() {
    t = Date.now();
    a.clearRect(0, 0, 800, 600);
    a.fillStyle = "#FFFFFF";
    a.fillRect(0, 0, 800, 600);
    a.fillStyle = "#000000";
    a.globalAlpha = 1;
    a.save();
        var f, scale;
        if (!testMode) {
            if (showImage) {
                a.globalAlpha = bgOpacity;
                if (bgFit) {
                    if (bgRatio) {
                        scale = Math.min(800/background.width, 600/background.height);
                        a.drawImage(background, bgShiftX, bgShiftY, background.width*scale, background.height*scale);
                    } else a.drawImage(background, bgShiftX, bgShiftY, 800, 600);
                } else {
                    a.drawImage(background, bgShiftX, bgShiftY, background.width*bgScale, background.height*bgScale);
                }
                a.globalAlpha = 1;
            }
            Ha(a);
        } 
        for (f = 0; f < r.length; f++) {
            var b = r[f];
            if (b.hidden) continue;
            if (0 == b.type) {
                a.font = b.size + "px NovaSquare";
                var c = b.x << 1,
                    d = b.y << 1;
                b.isCentered && (c -= a.measureText(b.text).width / 2);
                a.fillStyle = "#000000";
                a.fillText(b.text, c, d);
            } else if (1 == b.type) a.fillStyle = b.color, a.fillRect(b.x << 1, b.y << 1, b.width << 1, b.height <<  
1), a.strokeStyle = "#000000", a.globalAlpha = .2, a.lineWidth = 2, a.strokeRect((b.x << 1) + 1, (b.y << 1) + 1,  
(b.width << 1) - 2, (b.height << 1) - 2), a.globalAlpha = 1;
            else if (2 == b.type) a.fillStyle = b.isBad == 1 ? "#FF0000" : b.isBad == 2 ? "#0000FF" : "#00FF00", a.globalAlpha = .2, a.fillRect(b.x  
<< 1, b.y << 1, b.width << 1, b.height << 1), a.globalAlpha = 1;
            else if (3 == b.type) {
                var c = b.x << 1,
                    d = b.y << 1,
                    g = b.width << 1,
                    e = b.height << 1;
                a.fillStyle = b.color;
                a.globalAlpha = .2;
                a.fillRect(c, d, g, e);
                a.globalAlpha =
                    .5;
                a.fillStyle = "#000000";
                40 > b.width || 40 > b.height ? (a.font = "30px NovaSquare", a.fillText(b.count, c + g / 2 -  
a.measureText(b.count).width / 2, d + e / 2 + 10)) : (a.font = "60px NovaSquare", a.fillText(b.count, c + g / 2 -  
a.measureText(b.count).width / 2, d + e / 2 + 20));
                a.globalAlpha = 1
            } else if (4 == b.type) {
                c = b.x << 1;
                d = b.y << 1;
                g = b.width << 1;
                e = b.height << 1;
                a.fillStyle = b.color;
                a.strokeStyle = b.color;
                a.globalAlpha = 1;
                a.fillRect(c, d, g, e);
                a.globalAlpha = .2;
                a.fillStyle = "#000000";
                a.fillRect(c, d, g, e);
                a.globalAlpha = 1;
                a.fillStyle = b.color;
                var n = t - b.lastClickAt < 150,
                    l = n ? 8 : 12;
                a.fillRect(c + l, d + l, g - 2 * l, e - 2 * l);
                a.strokeStyle = "#000000";
                a.globalAlpha = .1;
                a.beginPath();
                a.moveTo(c, d);
                a.lineTo(c + l, d + l);
                a.moveTo(c + g, d);
                a.lineTo(c + g - l, d + l);
                a.moveTo(c, d + e);
                a.lineTo(c + l, d + e - l);
                a.moveTo(c + g, d + e);
                a.lineTo(c + g - l, d + e - l);
                a.moveTo(c, d);
                a.rect(c, d, g, e);
                a.rect(c + l, d + l, g - 2 * l, e - 2 * l);
                a.stroke();
                a.fillStyle = "#000000";
                a.globalAlpha = .5;
                50 > b.width || 50 > b.height ? (a.font = "35px NovaSquare", a.fillText(b.count, c + g / 2 -  
a.measureText(b.count).width / 2, d + e / 2 + 13)) : (a.font = "45px NovaSquare", a.fillText(b.count,
                    c + g / 2 - a.measureText(b.count).width / 2, d + e / 2 + 16));
                n && (a.fillStyle = "#000000", a.globalAlpha = .15, a.fillRect(c + l, d + l, g - 2 * l, e - 2 * l));
                a.globalAlpha = 1
            } else 5 == b.type && (ga(!1), a.drawImage(b.canvas, 0, 0, 400, 300, 0, 0, 800, 600), ga(!0))
        }
    a.restore();
    na();
    a.save();
    oa(!0);
    a.restore();
    A.requestAnimationFrame(ma);
}

function oa(f) {
    if (!testMode) a.save(), a.globalAlpha = 1, a.drawImage(P, B - 5, C - 5);
    else {
        var b = 0,
            c = 0;
        if (v != k || w != q) {
            a.save();
            if (f) {
                a.globalAlpha = .2, a.fillStyle = "#FF0000", a.beginPath();
                a.arc(B + 2, C + 8, 20, 0, 2 * Math.PI, !1);
                a.fill();
            }
            a.globalAlpha = .5;
            a.drawImage(P, B - 5, C - 5);
            a.restore();
        } else {
            b = B & 1, c = C & 1;
        }
        a.save();
        if (f) {
            a.globalAlpha = .2, a.fillStyle = "#FFFF00", a.beginPath();
            a.arc((k << 1) + b + 2, (q << 1) + c + 8, 20, 0, 2 * Math.PI, !1);
            a.fill();
        }
        a.globalAlpha = 1;
        a.drawImage(P, (k << 1) + b - 5, (q << 1) + c - 5);
    }
    a.restore();
}

function na() {
    a.save();
    a.strokeStyle = "#000000";
    t = Date.now();
    for (var f = 0; f < I.length; f++) {
        var b = I[f],
            c = (t - b[2]) / 1E3,
            d = 1 - 2 * c;
        0 >= d ? (I.splice(f, 1), --f) : (c *= 50, a.beginPath(), a.globalAlpha = .3 * d, a.arc(b[0], b[1], c, 0, 2 * Math.PI, !1), a.stroke());
    }
    a.lineWidth = 1;
    a.beginPath();
    for (f = 0; f < O.length; f++) {
        b = O[f];
        c = 10 - (t - b[4]) / 1E3;
        if (c <= 0) {
            O.splice(f, 1),
            --f;
        } else {
            1 < c && (c = 1), a.globalAlpha = .3 * c;
            a.moveTo(b[0] - .5, b[1] - .5);
            a.lineTo(b[2] - .5, b[3] - .5);
        }
    }
    a.stroke();
    a.restore();
}

function sleep(ms) {
    return new Promise((resolve) => {
        if (!ms) resolve();
        else setTimeout(resolve, ms);
    });
}

var testMode = false;
var TestModeHandlers = {
    prepareLevel: function() {
        generateWalls();
        this.establishConnections();
        var spawn = getSpawnPoint();
        W(spawn[0], spawn[1]);
    },
    establishConnections: function() {
        var i, l = r.length, obj;
        for (i = 0; i < l; i++) {
            obj = r[i];
            obj.id = i;
            obj.hidden = false;
        }
        for (i = 0; i < l; i++) {
            obj = r[i];
            if (obj.type == 3 || obj.type == 4) {
                obj.maxCount = obj.count;
                obj.lastCount = obj.count;
                obj.doors = getWallsIdByColor(obj.color);
                if (obj.type == 4) obj.timer = null;
            }
        }

        function getWallsIdByColor(c) {
            var o, l = r.length, j, walls = [];
            for (j = 0; j < l; j++) {
                o = r[j];
                if (o.type == 1) {
                    if (o.color === c) walls.push(o.id);
                }
            }
            return walls;
        }
    },
    prepareEditor: function() {
        var obj;
        for (var i = 0; i < r.length; i++) {
            obj = r[i];
            if (obj.type == 1) {
                r.splice(i, 1);
                i--;
            }
            delete obj.hidden;
            delete obj.id;
            if (obj.type == 3 || obj.type == 4) {
                obj.count = obj.maxCount;
                if (obj.type == 4) {
                    clearTimeout(obj.timer);
                }
                delete obj.maxCount;
                delete obj.lastCount;
                delete obj.doors;
                delete obj.timer;
            }
        }
    },
    lastProcessedPos: [0, 0],
    processTriggerAt: function(x, y) {
        var obj = getTriggerAt(x, y),
        lastObj = getTriggerAt(this.lastProcessedPos[0], this.lastProcessedPos[1]),
        count;

        if (obj) {
            if (obj.type == 2) {
                if (obj.isBad) {
                    var spawn = getSpawnPoint();
                    W(spawn[0], spawn[1]);
                }
            }
            if (obj.type == 3) {
                if (lastObj !== obj) {
                    obj.lastCount = obj.count;
                    count = obj.count - cursorWeight;
                    if (count < 0) obj.count = 0;
                    else obj.count = count;
                    if (obj.count == 0) this.setHiddenByIds(true, obj.doors);
                }
            }
        } else {
            if (lastObj) {
                if (lastObj.type == 3) {
                    lastObj.lastCount = lastObj.count;
                    count = lastObj.count + cursorWeight;
                    if (count > lastObj.maxCount) {
                        count = lastObj.maxCount;
                    }
                    lastObj.count = count;
                    if (lastObj.count > 0 && lastObj.lastCount == 0) this.setHiddenByIds(false, lastObj.doors);
                }
            }
        }
        this.lastProcessedPos = [x, y];
    },
    mouseup: function(evt) {
        Y = !1;
    },
    putClick: function(x, y, count) {
        var btn, c;
        setTimeout(function() {
            var d = 0, n, l;
            a: for (; d < count; d++) {
                for (n = 0; n < N.length; n++) {
                    l = N[n];
                    if (l[0] == x && l[1] == y) {
                        N.splice(n, 1);
                        continue a;
                    }
                }
                I.push([x << 1, y << 1, t]);
            }
        }, 100);
        btn = getTriggerAt(x, y);
        if (btn) {
            if (btn.type == 4) {
                c = btn.count - count;
                if (c < 0) btn.count = 0;
                else btn.count = c;
                clearTimeout(btn.timer);
                btn.timer = setTimeout(function() {
                    buttonIncrease(btn);
                }, btn.count == 0 ? 4000 : 1000);
                if (btn.count == 0 && btn.lastCount != 0) this.setHiddenByIds(true, btn.doors);
                btn.lastCount = btn.count;
                btn.lastClickAt = t;
            }
        }
    },
    setHiddenByIds: function(val, ids) {
        var i, l = ids.length, obj, newPos;
        var lastPos = TestModeHandlers.lastProcessedPos;
        for (i = 0; i < l; i++) {
            obj = r[ids[i]];
            obj.hidden = !!val;
        }
        if (!val) {
            if (z(lastPos[0], lastPos[1])) {
                newPos = findCorrectPos(lastPos[0], lastPos[1]);
                W(newPos[0], newPos[1]);
            }
        }
    },
    putLine: function(a, b, c, d) {
        setTimeout(function() {
            O.push([a << 1, b << 1, c << 1, d << 1, t]);
        }, 50);
    }
};

function findCorrectPos(x, y) {
    var point = [x, y], 
    offsetx = 0, offsety = 0, 
    i;

    for (i = 0; i < 400; i++) {
        if (!z(x - i, y)) offsetx = -i;
        if (!z(x + i, y)) offsetx = i;
        if (offsetx != 0) break;
    }
    for (i = 0; i < 300; i++) {
        if (!z(x, y - i)) offsety = -i;
        if (!z(x, y + i)) offsety = i;
        if (offsety != 0) break;
    }
    
    if ((offsetx == 0 && offsety != 0) || (offsetx != 0 && offsety == 0)) {
        if (offsetx == 0) {
            point[1] += offsety;
        } else {
            point[0] += offsetx;
        }
        return point;
    } 
    if (offsetx != 0 && offsety != 0) {
        if (Math.abs(offsetx) < Math.abs(offsety)) {
            point[0] += offsetx;
        } else {
            point[1] += offsety;
        }
        return point;
    }
    return getSpawnPoint();
}

function buttonIncrease(obj) {
    var count = obj.count + 1;
    if (count >= obj.maxCount) {
        obj.count = obj.maxCount;
    } else {
        obj.count = count;
        obj.timer = setTimeout(() => buttonIncrease(obj), 1000);
    }
    if (obj.count != 0 && obj.lastCount == 0) TestModeHandlers.setHiddenByIds(false, obj.doors);
    obj.lastCount = obj.count;
}

var imgSrcInput, showImageInput, imgControls, bgScrInput, bgFitInput, bgRatioInput, inputNumberUI = [], downloadButton, logButton,
    manualButton, clearWallsButton, testButton, mazeButton, wallhackInput, testControls, logArea;

function prepUI() {
    M = E.getElementById("noCursorLock");
    inputNumberUI = E.getElementsByClassName("inputNumberUI");
    for (var i = 0; i < inputNumberUI.length; i++) {
        if (i == 1) inputNumberUI[1].parentElement.style.display = "none";
        let n = i;
        inputNumberUI[i].onmouseover = () => inputNumberUI[n].focus();
        inputNumberUI[i].onmouseout = () => inputNumberUI[n].blur();
        inputNumberUI[i].onkeypress = (evt) => {
            evt.stopPropagation(); 
            if ((evt.which || evt.keyCode) == 13) 
                inputNumberUI[n].blur();
        }
        inputNumberUI[i].onchange = () => validateInputValueChange(inputNumberUI[n].id);
    }
    bgScrInput = E.getElementById("bgScrInput");
    bgScrInput.onmouseover = () => bgScrInput.focus();
    bgScrInput.onmouseout = () => bgScrInput.blur();
    bgScrInput.onkeypress = (evt) => {
        evt.stopPropagation(); 
        if ((evt.which || evt.keyCode) == 13) 
            bgScrInput.blur();
    }
    bgScrInput.onchange = () => changeImg(bgScrInput.value);
    showImageInput = E.getElementById("showImageInput");
    showImageInput.onchange = () => {
        showImage = !showImage;
        if (!showImage) {
            imgControls.style.display = "none";
            imgSrcInput.style.display = "none";
        } else {
            imgControls.style.display = "";
            imgSrcInput.style.display = "";
        }
    }
    showImageInput.checked = showImage;
    imgControls = E.getElementById("imgControls");
    if (!showImage) imgControls.style.display = "none";
    imgSrcInput = E.getElementById("imgSrcInput");
    if (!showImage) imgSrcInput.style.display = "none";
    bgFitInput = E.getElementById("bgFitInput");
    bgRatioInput = E.getElementById("bgRatioInput");
    bgFitInput.checked = true;
    bgRatioInput.checked = true;
    bgFitInput.onchange = () => {
        bgFit = !bgFit;
        if (bgFit) {
            bgRatioInput.parentElement.style.display = "";
        } else {
            bgRatioInput.parentElement.style.display = "none";
        }
    }
    bgRatioInput.onchange = () => {
        bgRatio = !bgRatio;
    }
    clearWallsButton = E.getElementById("clearWallsButton");
    clearWallsButton.onclick = function() {
        clearWalls();
        if (codeShown) logArea.value = generateCode();
    };
    mazeButton = E.getElementById("mazeButton");
    mazeButton.onclick = function() {
        generateMaze();
        if (codeShown) logArea.value = generateCode();
    }
    testControls = E.getElementById("testControls");
    testButton = E.getElementById("testButton");
    testButton.onclick = function(evt) {
        testMode = !testMode;
        if (testMode) {
            clearWallsButton.style.display = "none";
            mazeButton.style.display = "none";
            downloadButton.style.display = "none";
            testControls.style.display = "";
            TestModeHandlers.prepareLevel();
            evt.currentTarget.innerHTML = "← Back to editor";
        } else {
            clearWallsButton.style.display = "";
            mazeButton.style.display = "";
            downloadButton.style.display = "";
            testControls.style.display = "none";
            TestModeHandlers.prepareEditor();
            evt.currentTarget.innerHTML = "Test the level →";
        }
    };
    wallhackInput = E.getElementById("wallhackInput");
    wallhackInput.onchange = function() {
        wallhack = !wallhack;
    };
    downloadButton = E.getElementById("downloadButton");
    downloadButton.onclick = downloadTxt;
    logArea = E.getElementById("logArea");
    logArea.onmouseover = () => logArea.focus();
    logArea.onmouseout = () => logArea.blur();
    logArea.value = manualText;
    logButton = E.getElementById("logButton");
    logButton.onclick = function() {
        codeShown = true;
        logArea.value = generateCode();
    };
    manualButton = E.getElementById("manualButton");
    manualButton.onclick = function() {
        codeShown = false;
        logArea.value = manualText;
    };
}


function downloadTxt() {
    var element = E.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generateCode()));
    element.setAttribute('download', "my level.txt");
    element.style.display = 'none';
    E.body.appendChild(element);
    element.click();
    E.body.removeChild(element);
}

function validateInputValueChange(inputId) {
    switch (inputId) {
        case "bgOpacityInput":
            bgOpacity = validateValue(bgOpacityInput.value, bgOpacity, 0, 1);
            bgOpacityInput.value = bgOpacity;
            break;
        case "bgScaleInput":
            bgScale = validateValue(bgScaleInput.value, bgScale, -Infinity, +Infinity);
            bgScaleInput.value = bgScale;
            break;
        case "bgShiftXInput":
            bgShiftX = validateValue(bgShiftXInput.value, bgShiftX, -Infinity, +Infinity);
            bgShiftXInput.value = bgShiftX;
            break;
        case "bgShiftYInput":
            bgShiftY = validateValue(bgShiftYInput.value, bgShiftY, -Infinity, +Infinity);
            bgShiftYInput.value = bgShiftY;
            break;
        case "clickCountInput":
            clickCount = validateValue(clickCountInput.value, clickCount, 1, 1000);
            clickCountInput.value = clickCount;
            break;
        case "cursorWeightInput":
            cursorWeight = validateValue(cursorWeightInput.value, cursorWeight, 1, 1000);
            cursorWeightInput.value = cursorWeight;
            break;
        case "serverPingInput":
            serverPing = validateValue(serverPingInput.value, serverPing, 0, 10000);
            serverPingInput.value = serverPing;
            break;
    }
}

function validateValue(inputVal, varToChange, min, max) {
    if (isNumeric(inputVal)) {
        var val = Number(inputVal);
        if (val >= min && val <= max)
            return val;
    }
    return varToChange;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function init() {
    prepUI();
    y = E.getElementById("canvas");
    a = y.getContext("2d");
    y.style.cursor = "none";
    y.onmousemove = V;
    y.onmousedown = va;
    La();
    A.requestAnimationFrame(ma);
}

init();
