


$(document).ready(function(){

  //constants 
  //The order and offset is important for other methods!

  var B = 0;
  var O = 1;
  var X = -1;

  var N = 20;
  var E = 21;
  var S = 22;
  var W = 23;

  var currentState = O;

  var config;

  //game array
  var game = [];

  var placed = 0;
  var wins = {
    X: 0,
    O: 0
  };
  

  /***************************/
  /* Render / Setup / Configs*/
  /***************************/

  var configs = {
    Hard: {
      width: 5,
      height: 5
    },
    Easy : {
      width: 3,
      height: 3
    }
  }

  

  var localStorageName = "lastUsedConfig";

  function initConfig() {
    config = {
      width: parseInt($('#width').val()),
      height: parseInt($('#height').val()),
    }
    localStorage.setItem(localStorageName, JSON.stringify(config));
  }

  function retreiveLocalStorage() {
    var lsconf = localStorage.getItem(localStorageName);
    if (typeof(lsconf) == "string") {
      useConfig(JSON.parse(lsconf));
    }
  }
  
  function useConfig(conf) {
    config = conf;
    $("#height-slider").slider("value", config.height);
    $("#width-slider").slider("value", config.width);
    $('.radio').buttonset('refresh');
  }

  function configOrEasy(prop) {
    return isNaN(config[prop]) ? configs.Easy[prop] : config[prop];
  }

  function isO(state) {
    return state == O;
  }

  function start(){

    $('#about').hide();
    $('#areaForGame').show();
    $('#about-toggle').show();
    $('#game').addClass("turn" + currentState);

    //Asser timer over 
    endGame();
    $('#gameover').hide();
    $('#counter').show();

    initConfig();

    var main = $('main #game');
    main.html("");
    var table = $('<table/>');

    var placed = 0;

    main.append(table);

    spacesInPlay = config.width * config.height -1;
    foodInPlay = 0;

    game = [];
    for (var i = 0; i < config.height; i++){
      var tr = $('<tr/>');
      table.append(tr);
      for (var j = 0; j < config.width; j++){
        gs = defaultGameState(j, i);
        tr.append(gs.td)
      }
    }

    format();
  }

  function endGame(){
    $('#gameover').show();
    format();
  }

  function rerender(coord){
    var td = game[coord.x][coord.y].td;
    var state = gameState(coord);

    td.removeClass("snake empty head win");
    switch(state) {
        case X:
            td.addClass("X");
            break;
        case O:
            td.addClass("O");
            break;
        default:
            td.addClass("empty");
    }

    if (game[coord.x][coord.y].win) {
      td.addClass("win "+ game[coord.x][coord.y].win);
    }

  }

  function writeCount() {

    var winString = "X: " + wins.X + " O: " + wins.O;
    $('#counter').html(winString);
  }



  /**************/
  /* Game State */
  /**************/
 

  function getInDir(coords, dir) {
    coord = dupli(coords);
    switch(dir) {
        case N:
            coord.y = (coord.y -1);
            break;
        case E:
            coord.x = (coord.x +1);
            break;
        case S:            
            coord.y = (coord.y +1);
            break;
        case W:
            coord.x = (coord.x -1);
            break;
        default:
    }
    if (coord.x > config.width -1 || coord.x < 0 || coord.y< 0 || coord.y > config.height - 1) {
      coord.outofbounds = true;
    }
    return coord;
  }

  function defaultGameState(i, j) {

    if (!$.isArray(game)) {
      game = [];
    }
    if (!$.isArray(game[i])){
      game[i] = [];
    }

    game[i][j] = {
      state: B,
      td: $('<td>'),
      coord: get(i,j)
    };
    game[i][j].td.data("coord", get(i,j));
    rerender(get(i,j))
    return game[i][j];
  }


  function gameState(coord) {
    return game[coord.x][coord.y].state;
  }

  function setGameState(coord, state) {
    game[coord.x][coord.y].state = state;
    rerender(coord);
  }
  function setWin(coord, style) {
    game[coord.x][coord.y].win = style;
    rerender(coord);
  }


  function isWinning(coord) {

    var check = gameState(coord);
    if (check == B) {
      return false;
    }

    var winByWidth = game.every(function(v) {
        return v[coord.y].state == check;
      });
    
    if (winByWidth) {
      game.every(function(v) {
        setWin(v[coord.y].coord, "h");
        return true;
      });
      return true;
    } 

    var winByHeight = game[coord.x].every(function(v) {
        return v.state == check;
      });
    
    if (winByHeight) {
      game[coord.x].every(function(v) {
        setWin(v.coord, "v");
        return true;
      });
      return true;
    } 

    var diag = [[N,W,S,E,"se"],[N,E,S,W,"sw"]].some(function(dirs) {
       var currentCoord = coord;
        while (!currentCoord.outofbounds) {
          currentCoord = getInDir(getInDir(currentCoord, dirs[0]), dirs[1]);
        }
        var start = currentCoord;
        var count =0;
        do{
          currentCoord = getInDir(getInDir(currentCoord, dirs[2]), dirs[3]);
          count++;
        } while  (!currentCoord.outofbounds && gameState(currentCoord) == check) ;
        count--;
        if (count >= Math.min(config.width, config.height)) {
          currentCoord = start;
          for (var i =0 ; i < Math.min(config.width, config.height); i++) {
            currentCoord = getInDir(getInDir(currentCoord, dirs[2]), dirs[3]);
            setWin(currentCoord, "d" + dirs[4]);
          }
          return true;
        }

    });
   if (diag){
    return true;
   }


    return false;
  }

  /*********/
  /* COORD */
  /*********/

  function coordEquals(a, b) {
    return a.x == b.x && a.y == b.y;
  }

  function get(x,y){
    return {
      x : x,
      y : y
    };
  }

  function dupli(coord){
    return get(coord.x, coord.y);
  }


  


  /*********/
  /* UTILS */
  /*********/

  //get a number between 0 and max - 1 (max not included)
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function format() {

    if (config == null) {
      var sqw = 1;
      var sqh = 1;
    } else {
      var sqw = config.width;
      var sqh = config.height;
    }
    var wwidth = $(window).width() - $('#control').width() -20;
    var wheight = $(window).height() - $('header').outerHeight() - 30;
    var min = Math.min(wwidth /sqw, wheight/sqh);

    $('body').width(min * sqw + $('#control').width() + 20);
    $('#game table, #gameover').width(min * sqw).height(min* sqh);

  }

  /**********/
  /* EVENTS */
  /**********/

  $('#game').on('click', 'td', function() {

    var coord = $(this).data('coord');
    var gs = gameState(coord);

    if (gs == B) {
      setGameState(coord, currentState);
      placed++;
      $('#game').removeClass("turn" + currentState);
      currentState = - currentState;
      $('#game').addClass("turn" + currentState);
    }

    if (isWinning(coord)) {
      endGame();
      if (isO(currentState)){
        wins.X++;
      } else {
        wins.O++;
      }
      writeCount();

    } else if (placed == config.width * config.height) {
      endGame();
    }


  }); 

  $(window).on('resize',function(){ format(); });

  var sliderEventBinder = function(slidername, showbox, config) {
    var onFn = function() {
      $('#' + showbox).val( $("#" + slidername).slider("value") );
    }
    config.create = onFn;
    config.slide = onFn;
    config.change = onFn;
    $( "#" + slidername ).slider(config);
  }


  sliderEventBinder("width-slider", "width",{
    value:configs.Easy.width,
    min: 3,
    max: 10,
    step: 1
  });

  sliderEventBinder("height-slider", "height",{
    value: configs.Easy.height,
    min: 3,
    max: 10,
    step: 1
  });


  $('.radio').buttonset();

  $('.buttons input[type=button]').button();

  $('.defaultConfig').on("click", function() {
    useConfig(configs[$(this).val()]);
    start();
  });

  $('#start').on('click', function(){
    start();
  });


  $('#about-toggle').on('click', function() {
    $('#about').toggle();
    $('#areaForGame').toggle();
  });


  $('.jqButton').button();
  $('#about-toggle').hide();

  $('#gameover').hide();
  $('#counter').hide();
  $('#areaForGame').hide();
  $('#hide').hide();
  format();
  retreiveLocalStorage();
  start();



});
