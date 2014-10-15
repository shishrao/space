(function() {
  
  //alert ('Hello space!');
  var zoom = 8;
  var showGrids = true;
  var showStarNames = true;
  
  var space = new Space($("#space")[0]);

  // Resize to max
  $("#space")[0].width = window.innerWidth;
  $("#space")[0].height = window.innerHeight;
  
  $(window).resize(function() {
    $("#space")[0].width = window.innerWidth;
    $("#space")[0].height = window.innerHeight;
    space.valid = false;
  });
  
  
  
  // Loader -
  $.ajax({
    url: "data/bsc.json",
  }).done(function(data) {
    var obj = eval(data);
    //console.log(obj);
    var l = obj.length;
    for (var i = 0; i < l; i++) {
      var sz = 6 - Number(obj[i].mag);
      // hr, name, n2, ra, de, mag, sp, col, sz
      space.addStar(new Star(Number(obj[i].hr), obj[i].name, obj[i].n2, Number(obj[i].ra), Number(obj[i].de), obj[i].mag, obj[i].sp, obj[i].col, sz));
    }
    
    //space.addStar(new Star('EquinoxA', 100, 0, 0, '#00ff00', 10, 0, 0));
    //space.addStar(new Star('EquinoxS', -100, 0, 0, '#00ff00', 5, 180, 0));
    //space.addStar(new Star('SolisticeS', 0, 0, 100, '#ffff00', 5, 90, 0));
    //space.addStar(new Star('SolisticeW', 0, 0, -100, '#ffff00', 5, 260, 0));
    
    drawGrids(15, '#111111');
    drawEcliptic(15, '#00ff00');
    drawConstellations();
    
    // Initial deliberate calc
    space.calc();
  });
  
  function drawGrids(gridSpace, col) {
    var gridSpace = 15;
    var firstc = null;
    var prevc = null;
    // Celestial latitudes
    for (var d = (-90 + 30); d < 90; d += gridSpace){
      firstc = null
      prevc = null;
      for (var r = 0; r < 360; r += gridSpace){
        var c = new Coordinate(r, d, col);
        if (r > 0) {
          prevc.c = c;
        } else {
          firstc = c;
        }
        prevc = c;
        space.addCoordinate(c);
      }
      prevc.c = firstc;
    }
    // Celestial longitudes
    for (var r = 0; r < 360; r += gridSpace){
      firstc = null;
      prevc = null;
      for (var d = -90; d <= 90; d += gridSpace){
        var c = new Coordinate(r, d, col);
        if (d > -90) {
          prevc.c = c;
        } else {
          firstc = c;
        }
        prevc = c;
        space.addCoordinate(c);
      }
    }
  }
  
  function drawEcliptic(gridSpace, col) {
    var firstc = null;
    var prevc = null;
    for (var r = 0; r < 360; r += gridSpace){
      var d = 23.4 * Math.sin(r * Math.PI / 180);
      var c = new Coordinate(r, d, col);
      if (r > 0) {
        prevc.c = c;
      } else {
        firstc = c;
      }
      prevc = c;
      space.addCoordinate(c);
    }
    prevc.c = firstc;
  }
  
  function drawConstellations() {
    $.ajax({
      url: "data/const.json",
    }).done(function(data) {
      var obj = eval(data);
      for(var l = 0; l < 0; l++) {
        var firstc = null;
        var prevc = null;
        var constellation = new Constellation(obj[i].name);
        for (var i = 0; i < obj[l].sidx.length; i++) {
          for (var s = 0; s < space.stars.length; s++) {
            if (space.stars[s].hr == obj[l].sidx[i]) {
              var c = new Coordinate(space.stars[s].ra * (180 / Math.PI), space.stars[s].de * (180 / Math.PI), '#770000');
              if (prevc != null) {
                prevc.c = c
              }
              prevc = c;
              constellation.addCoordinate(c);
              break;
            }
          }
        }
        space.addConstellation(constellation);
      }
      for(var l = 0; l < obj.length; l++) {
        var firstc = null;
        var prevc = null;
        var coordinates = new Array();
        for (var i = 0; i < obj[l].sidx.length; i++) {
          for (var s = 0; s < space.stars.length; s++) {
            if (space.stars[s].hr == obj[l].sidx[i]) {
              var c = new Coordinate(space.stars[s].ra * (180 / Math.PI), space.stars[s].de * (180 / Math.PI), '#770000');
              if (prevc != null) {
                prevc.c = c
              }
              prevc = c;
              space.addCoordinate(c);
              break;
            }
          }
        }
      }
      space.calc();
    });
  }
  
  $("#btn-info-close").click(function() {
    if($("#btn-info-close").text() == "\u25B2"){
      $("#info-container").stop().animate({
        height: 20
      }, 100, function() {
        $("#btn-info-close").text("\u25BC")
      });
    } else {
      $("#info-container").stop().animate({
        height: 550
      }, 100, function() {
        $("#btn-info-close").text("\u25B2")
      });
    }
  });
  
  $("#btn-tab-home").click(function() {
    showTab($("#content-home"));
  });
  
  $("#btn-tab-star").click(function() {
    showTab($("#content-star"));
  });
  
  $("#btn-tab-fun").click(function() {
    showTab($("#content-fun"));
  });
  
  function showTab(obj) {
    $("#content-home").hide();
    $("#content-star").hide();
    $("#content-fun").hide();
    obj.show();
  }
  
  space.selectStar = function(star) {
    $("#info-container").css("height", 550);
    $("#btn-info-close").text("\u25B2");
    showTab($("#content-star"));
    $("#content-star h1").text(star.name);
    $("#content-star h2").text(star.n2);
    $("#star-info").html(
      "<p><table>" +
      "<tr><td width=\"100\">HR</td><td>" + star.hr + "</td></tr>" +
      "<tr><td>Magnitude</td><td>" + star.mag + "&deg;</td></tr>" + 
      "<tr><td>Right Asc.</td><td>" + parseFloat(Math.round(star.ra * 100) / 100).toFixed(2) + "&deg;</td></tr>" +
      "<tr><td>Declenation</td><td>" + parseFloat(Math.round(star.de * 100) / 100).toFixed(2) + "&deg;</td></tr>" + 
      "<tr><td>Magnitude</td><td>" + star.mag + "</td></tr>" + 
      "<tr><td>Spect. Type</td><td>" + star.sp + "</td></tr>" +
      "</table></p>");
  }
  
})();  