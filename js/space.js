// Star - 
function Star(hr, name, n2, ra, de, mag, sp, col, sz){
    this.hr = hr || 0;
    this.name = name;
    this.n2 = n2 || 'Star';
    this.ra = (ra * Math.PI / 180) || 0;
    this.de = (de * Math.PI / 180) || 0;
    this.mag = mag;
    this.sp = sp;
    this.col = col || '#666666';
    this.sz = (sz) || 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
};
Star.prototype.draw = function(ctx, show360, showStarNames){
    if (show360 || this.z > 0) {
        ctx.fillStyle = this.col;
        ctx.fillRect(this.vx - (this.sz / 2), this.vy - (this.sz / 2), this.sz, this.sz);
        if (showStarNames && this.name) {
            ctx.fillStyle = "#666666";
            ctx.font = "12px Segoe UI";
            ctx.fillText(this.name, this.vx + 10, this.vy + 10);
        }
    }
};
Star.prototype.contains = function(tx, ty){
    if (this.vx - (this.sz / 2) - 1 < tx && tx < this.vx + (this.sz / 2) + 1 && this.vy - (this.sz / 2) - 1 < ty && ty < this.vy + (this.sz / 2) + 1) {
        return true;
    }
}

function Coordinate(ra, de, col){
    this.ra = (ra * Math.PI / 180) || 0;
    this.de = (de * Math.PI / 180) || 0;
    this.col = col || '#111111';
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.c = null;
}
Coordinate.prototype.draw = function(ctx, show360){
    if ((show360 || this.z > 0) && this.c){
        ctx.beginPath();
        ctx.moveTo(this.vx, this.vy);
        ctx.lineTo(this.c.vx, this.c.vy);
        //console.log(this.vx + ', ' + this.vy + ' TO ' + this.c.vx + ', ' + this.c.vy);
        ctx.lineWidth=1;
        ctx.strokeStyle = this.col;
        ctx.stroke();
    }
}

function Constellation(name) {
    this.name = name;
    this.coordinates = coordinates || new Array();
    this.ra = 0;
    this.de = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    for (var i = 0; i < this.coordinates.length; i++) {
        this.ra += this.coordinates[i].ra;
        this.de += this.coordinates[i].de;
    }
    this.ra /= this.coordinates.length;
    this.de /= this.coordinates.length;
}
Constellation.prototype.draw = function(ctx, show360, showConstellations, showConstellationName) {
    if (showConstellations) {
        for (var i = 0; i < this.coordinates.length; i++) {
            this.cooordinates[i].draw(ctx, show360);
        }
    }
    if (showConstellationName) {
        ctx.fillStyle = "#990000";
        ctx.font = "12px Segoe UI";
        ctx.fillText(this.name, this.vx + 10, this.vy + 10);
    }
}
Constellation.prototype.addCoordinate = function(c) {
    this.coordinates.push(c);
    this.valid = false;
}

// Space -
function Space(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    // fix mouse co-ordinate problems when there's a border or padding
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderTopWidth'], 10)   || 0;
    }
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    // State
    this.valid = false;
    this.dragging = false;
    this.dragged = false;
    
    // Child elements
    this.stars = []; 
    this.coordinates = []; 
    this.constellations = [];

    // Values
    this.xoff = 0; 
    this.yoff = 0;
    this.hrot = 0;
    this.vrot = 0;
    this.rad = 100;
    this.selectedStar = null;
    this.mode = 0;

    // Settings
    this.showGrids = true;
    this.showStarNames = true;
    this.showConstellations = true;
    this.showConstellationName = false;
    this.show360 = false;
    this.zoom = 8;

    var self = this;

    // Fixes a problem where double clicking causes text to get selected on the canvas
    this.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

    this.canvas.addEventListener('mousedown', function(e) {
        var mouse = self.getMouse(e);
        self.xoff = mouse.x;
        self.yoff = mouse.y;
        self.dragging = true;
    }, true);
    
    this.canvas.addEventListener('mousemove', function(e) {
        if (self.dragging){
            var mouse = self.getMouse(e);
            $("body").css("cursor", "move");
            self.hrot += (Math.asin((mouse.x - self.xoff) / self.rad)) / self.zoom;
            var dvrot = Math.asin((mouse.y - self.yoff) / self.rad) % (Math.PI / 2);
            if ((dvrot + self.vrot) > Math.PI / 2 * -1 && (dvrot + self.vrot) < Math.PI / 2) {
                self.vrot += dvrot / self.zoom;
            }
            //console.log('hr:' + (self.hrot * 180 / Math.PI) + ' vr:' + (self.vrot * 180 / Math.PI) + ' ux,uy,uz: 0,' + Math.cos(self.vrot) + ',' + Math.sin(self.hrot));
            self.calc();
            //self.valid = false;
            self.dragged = true;
            self.xoff = mouse.x;
            self.yoff = mouse.y;
        }
    }, true);
    
    this.canvas.addEventListener('mouseup', function(e) {
        var mouse = self.getMouse(e);
        $("body").css("cursor", "default");
        self.dragging = false;
        if (self.dragged) {
            self.dragged = false;
        }
        else if (self.selectStar) {
            var stars = self.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                if (p.contains(mouse.x, mouse.y)) {
                    self.selectedStar = p;
                    self.selectStar(p);
                    self.calc();
                    //self.valid = false;
                    break;
                }
            }
        }
    }, true);
    
    $(canvas).mousewheel(function(event, delta, dx, dy) {
        //console.log('dX: ' + dx + ' dY: ' + dy );
        if (dy > 0 && self.zoom + 0.1 < 13) {
            self.zoom += 0.1;
        }
        if (dy < 0 && self.zoom - 0.1 > 1) {
            self.zoom -= 0.1;
        }
        self.calc();
        //self.valid = false;
    });

    this.interval = 30;
    setInterval(function() { self.draw(); }, self.interval);
}
Space.prototype.calc = function() {
    
    
    switch (this.mode) {
        default:
        case 0:
            this.showGrids = true;
            this.showStarNames = true;
            this.showConstellations = true;
            this.showConstellationName = false;
            this.show360 = false;
            //this.zoom = 8;
            if (this.showGrids) {
                var coordinates = this.coordinates;
                var l = coordinates.length;
                for (var i = 0; i < l; i++) {
                    var p = coordinates[i];
                    this.calcMove(p);
                }
            }
            var l = this.constellations.length;
            for (var i = 0; i < l; i++) {
                if (this.showConstellationName) {
                    this.calcMove(this.constallations[i]);
                }
                if (this.showConstellations) {
                    for (var j = 0; j < l; j++) {
                        this.calcMove(this.constallations[i].coordinate[j]);
                    }
                }
            }
            var stars = this.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                this.calcMove(p);
            }
            break;
        case 1:
            // 6d
            this.showGrids = false;
            this.showStarNames = false;
            this.showConstellations = false;
            this.showConstellationName = false;
            this.show360 = true;
            //this.zoom = 4;
            var stars = this.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                this.calcMove6d(p);
            }
            break;
        case 2:
            // Loop crown
            this.showGrids = false;
            this.showStarNames = false;
            this.showConstellations = false;
            this.showConstellationName = false;
            this.show360 = true;
            //this.zoom = 4;
            var stars = this.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                this.calcMoveLoopCrown(p);
            }
            break;
        case 3:
            // The ring
            this.showGrids = false;
            this.showStarNames = false;
            this.showConstellations = false;
            this.showConstellationName = false;
            this.show360 = true;
            //this.zoom = 4;
            var stars = this.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                this.calcMoveTheRing(p);
            }
            break;
        case 4:
            // Fish bowl
            this.showGrids = true;
            this.showStarNames = false;
            this.showConstellations = false;
            this.showConstellationName = false;
            this.show360 = true;
            //this.zoom = 4;
            if (this.showGrids) {
                var coordinates = this.coordinates;
                var l = coordinates.length;
                for (var i = 0; i < l; i++) {
                    var p = coordinates[i];
                    this.calcMoveFishBowl(p);
                }
            }
            var stars = this.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                this.calcMoveFishBowl(p);
            }
            break;
        case 5:
            // Fish
            this.showGrids = false;
            this.showStarNames = false;
            this.showConstellations = false;
            this.showConstellationName = false;
            this.show360 = true;
            //this.zoom = 4;
            var stars = this.stars;
            var l = stars.length;
            for (var i = 0; i < l; i++) {
                var p = stars[i];
                this.calcMoveFish(p);
            }
            break;
    }
    this.valid = false;
}
Space.prototype.calcMove = function(p) {
    // Horizontal rotation
    p.x = this.rad * Math.cos(p.de) * Math.cos(p.ra - this.hrot);
    p.y = this.rad * Math.sin(p.de);
    p.z = this.rad * Math.cos(p.de) * Math.sin(p.ra - this.hrot);
    // Vertical rotation
    var py = p.y;
    p.y = p.y * Math.cos(this.vrot) - p.z * Math.sin(this.vrot);
    p.z = p.z * Math.sin(Math.PI / 2 - this.vrot) + py * Math.cos(Math.PI / 2 - this.vrot);
    // Viewport
    p.vx = this.canvas.width / 2 + p.x * this.zoom;
    p.vy = this.canvas.height / 2 + p.y * this.zoom * -1;
}
Space.prototype.calcMove6d = function(p) {
    var dra = p.ra + this.hrot;
    var ddec = Math.cos(this.hrot - p.ra) - Math.sin(p.de - this.vrot);
    p.z = this.rad * Math.cos(ddec) * Math.cos(dra);
    p.x = this.rad * Math.cos(p.de) * Math.sin(dra);
    p.y = this.rad * Math.sin(ddec);
    p.vx = this.canvas.width / 2 + p.x * this.zoom;
    p.vy = this.canvas.height / 2 + p.y * this.zoom * -1;
}
Space.prototype.calcMoveLoopCrown = function(p) {
    var dra = p.ra + this.hrot;
    var ddec = Math.cos(this.hrot - p.ra) - Math.sin(p.de - this.vrot);
    p.z = this.rad * Math.cos(ddec) * Math.cos(dra);
    p.x = this.rad * Math.cos(ddec) * Math.sin(dra);
    p.y = this.rad * Math.sin(ddec);
    p.vx = this.canvas.width / 2 + p.x * this.zoom;
    p.vy = this.canvas.height / 2 + p.y * this.zoom * -1;
}
Space.prototype.calcMoveTheRing = function(p) {
    var dra = p.ra + this.hrot;
    var ddec = p.de * this.vrot;
    p.z = this.rad * Math.cos(ddec) * Math.cos(dra);
    p.x = this.rad * Math.cos(ddec) * Math.sin(dra);
    p.y = this.rad * Math.sin(ddec);   
    p.vx = this.canvas.width / 2 + p.x * this.zoom;
    p.vy = this.canvas.height / 2 + p.y * this.zoom * -1;
}
Space.prototype.calcMoveFishBowl = function(p) {
    var dra = p.ra + this.hrot;
    var ddec = Math.cos(this.hrot) * Math.sin(p.de * this.vrot);
    p.z = this.rad * Math.cos(ddec) * Math.cos(dra);
    p.x = this.rad * Math.cos(ddec) * Math.sin(dra);
    p.y = this.rad * Math.sin(ddec);   
    p.vx = this.canvas.width / 2 + p.x * this.zoom;
    p.vy = this.canvas.height / 2 + p.y * this.zoom * -1;
}
Space.prototype.calcMoveFish = function(p) {
    var dra = p.ra + this.hrot;
    var ddec = Math.cos(this.hrot - p.ra) * Math.sin(p.de * this.vrot);
    p.z = this.rad * Math.cos(ddec) * Math.cos(dra);
    p.x = this.rad * Math.cos(ddec) * Math.sin(dra);
    p.y = this.rad * Math.sin(ddec);
    p.vx = this.canvas.width / 2 + p.x * this.zoom;
    p.vy = this.canvas.height / 2 + p.y * this.zoom * -1;
}
Space.prototype.draw = function() {
    if (!this.valid) {
        this.clear();
        if (this.showGrids) {
            var coordinates = this.coordinates;
            var l = coordinates.length;
            for (var i = 0; i < l; i++) {
                coordinates[i].draw(this.ctx, this.show360);
            }
        }
        var l = this.constellations.length;
        for (var i = 0; i < l; i++) {
            if (this.showConstellationName) {
                this.ctx.fillStyle = "#770000";
                this.ctx.font = "12px Segoe UI";
                this.ctx.fillText(this.name, this.constellations[i].vx - (this.constellations[i].name.length), this.vy - (this.constellations[i].name.length));
            }
            if (this.showConstellations) {
                for (var j = 0; j < l; j++) {
                    this.constallations[i].coordinate[j].draw(this.ctx, this.show360);
                }
            }
        }
        var stars = this.stars;
        var l = stars.length;
        for (var i = 0; i < l; i++) {
            stars[i].draw(this.ctx, this.show360, this.showStarNames);
        }
        if (this.selectedStar && this.selectedStar.z > 0) {
            this.ctx.beginPath();
            this.ctx.arc(this.selectedStar.vx, this.selectedStar.vy, 10, 0, 2 * Math.PI, false);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = '#0000ff';
            this.ctx.stroke();
        }
        this.valid = true;
    }
}
Space.prototype.addStar = function(star) {
    this.stars.push(star);
    this.valid = false;
}
Space.prototype.addCoordinate = function(c) {
    this.coordinates.push(c);
    this.valid = false;
}
Space.prototype.addConstallation = function(c) {
    this.constellations.push(c);
    this.valid = false;
}
Space.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = window.innerWidth; 
}
Space.prototype.getMouse = function(e) {
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;
    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
    return {x: mx, y: my};
}
Space.prototype.selectStar = function(star) {
    alert(star.name);
}
