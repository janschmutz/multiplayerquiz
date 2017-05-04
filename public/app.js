var countery = 0;
jQuery(function($){
    'use strict';
    var IO = {
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('connectToRoom', IO.onRoomConnect );
            IO.socket.on('start', IO.onStartGame );
            IO.socket.on('opponent', IO.onFoundOpponent );
            IO.socket.on('nextquestion', IO.onNextQuestion );
            IO.socket.on('newscore', IO.onNewScore );
        },
        onConnected : function(data) {
            console.log(data.message);
            App.mySocketId = data.id;
        },
        onRoomConnect : function (data) {
            console.log(data);
        },
        onStartGame : function (data) {
            App.myRoom = data.valueOf();
            App.Player.foundOpponent();
        },
        onFoundOpponent : function (data) {
            if (data.id !== App.mySocketId){
                App.Opponent.mySocketID = data.id;
                App.Opponent.myName = data.name;
                App.Opponent.myAvatar = data.avatar;
                App.Player.startCountdown();
            } else{
                App.Player.myAvatar = data.avatar;
            }
        },
        onNextQuestion : function (data) {
            countery++;
            if (countery > 1) {
                App.Player.nextQuestion(data);
            }
        },
        onNewScore : function (data){
            if (data.id !== App.mySocketId){
                App.Opponent.myScore = data.score;
                App.Player.updateScore();
            }
        }
    };
    var App = {
        gameId: 0,
        myRoom: 0,
        mySocketId: '',
        currentRound: 0,
        init: function () {
            App.cacheElements();
             App.showInitScreen();
             App.bindEvents();

            FastClick.attach(document.body);
        },
        cacheElements: function () {
            App.$doc = $(document);

            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$templateSearchOp = $('#search-op-template').html();
            App.$templateCountdown = $('#countdown-template').html();
            App.$templateQuiz = $('#quiz-template').html();
            App.$templateResult = $('#result-template').html();
        },


        bindEvents: function () {
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart', App.Player.onStartClick);
        },


        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
        },
        Opponent : {
            mySocketID: '',
            myName: '',
            myAvatar: '',
            myAnswer: '',
            myScore: 0
        },
        Player : {
            myName: '',
            myAvatar:'',
            myScore: 0,
            onJoinClick: function () {
                App.$gameArea.html(App.$templateJoinGame);
                $('.avatar').each(function(){
                    $(this).click(function(){
                        $(this).css("background-color", "#FF7642");
                        $(this).data('avatar', '1');
                        $(this).siblings().css( "background-color", "white" );
                        $(this).siblings().data('avatar', '0');
                    })
                });

            },
            onStartClick: function () {
                var ava;
                $('.avatar').each(function(){
                    var avatar = $(this).data('avatar');
                    if(avatar == "1") {
                        App.Player.myAvatar = $(this).attr('id');
                    }
                });
                App.Player.myName = $('#inputPlayerName').val() || 'anon'
                IO.socket.emit('playerJoinGame');
                App.$gameArea.html(App.$templateSearchOp);
            },
            foundOpponent: function () {
                var data = {
                    id: App.mySocketId.valueOf(),
                    room: App.myRoom.valueOf(),
                    name: App.Player.myName.valueOf(),
                    avatar: App.Player.myAvatar.valueOf()
                };
                IO.socket.emit('playerFindOpponent',data);
            },
            startCountdown: function () {
                App.$gameArea.html(App.$templateCountdown);
                var mya = App.Player.myAvatar;
                var opa = App.Opponent.myAvatar;

                var myAvat = $('<img />', {
                    id: 'Myid',
                    src: 'svg/'+mya+'.svg'
                });
                myAvat.appendTo($('#myAva'));
                var opAvat = $('<img />', {
                    id: 'Opid',
                    src: 'svg/'+opa+'.svg'
                });
                opAvat.appendTo($('#opAva'));
                $("#myName").text(App.Player.myName);
                $("#opName").text(App.Opponent.myName);
                var data = {
                    room: App.myRoom.valueOf(),
                    round: App.currentRound.valueOf()
                };
                var testtimer = setInterval(function() {
                        var timeCounter = $("h2[id=timer]").html();
                        var updateTime = eval(timeCounter)- eval(1);
                        $("h2[id=timer]").html(updateTime);
                        if(updateTime == 0){
                            clearInterval(testtimer);
                            IO.socket.emit('playerStartQuiz', data);
                        }
                    }, 1000);
            },
            nextQuestion: function (e) {
                console.log(e);
                App.$gameArea.html(App.$templateQuiz);

                //Rundenanzeige

                for(var i=0; i<App.currentRound+1; i++){
                    var pls = i+1;
                    $('#r'+pls).css('background-color', 'blue');
                }
                //Spieler + Punkte

                var myAv = App.Player.myAvatar;
                var opAv = App.Opponent.myAvatar;
                $('#my_name').text(App.Player.myName);
                $('#my_score').text(App.Player.myScore);
                $('#opp_name').text(App.Opponent.myName);
                $('#opp_score').text(App.Opponent.myScore);
                $('#my_avatar').attr('src','svg/'+myAv+'.svg');
                $('#opp_avatar').attr('src','svg/'+opAv+'.svg');

                //Fragen

                $('#ask').text(e.Question);
                $('#a').text(e.Answers[0].A);
                $('#b').text(e.Answers[1].B);
                $('#c').text(e.Answers[2].C);
                $('#d').text(e.Answers[3].D);
                var correct = e.Correct;
                $('#'+correct+correct).data('check', "1");
                $('.query').each(function(){
                    $(this).on('click',function(){
                        $(this).css("background-color", "#FF7642");
                        $(this).data('mine', "1");
                        $(this).siblings().css( "background-color", "white" );
                        $(this).siblings().data('mine', "0");
                    })
                });
                var testtimer = setInterval(function() {
                    var timeCounter = $("h2[id=timerr]").html();
                    var updateTime = eval(timeCounter)- eval(1);
                    $("h2[id=timerr]").html(updateTime);
                    if(updateTime == 0){
                        clearInterval(testtimer);
                        App.currentRound += 1;
                        countery = 0;
                        if($('#'+correct+correct).data('mine') == 1) {
                            App.Player.myScore += 5;
                            $('#'+correct+correct).css('background-color','#52FF42');
                            $('#'+correct+correct).siblings().css('background-color','white');
                        } else {
                            $('.query').each(function(){
                                var wrong = $(this).data('mine');
                                if(wrong == '1') {
                                    $(this).css('background-color','#FF3E3E');
                                }
                            });
                        }
                        var data = {
                            id: App.mySocketId,
                            room: App.myRoom,
                            score: App.Player.myScore
                        };
                        IO.socket.emit('playerUpdateScore', data);
                    }
                }, 1000);

            },
            updateScore: function () {
                $('#opp_score').text(App.Opponent.myScore);
                $('#my_score').text(App.Player.myScore);
                var data = {
                    room: App.myRoom.valueOf(),
                    round: App.currentRound.valueOf()
                };
                if(App.currentRound < 6) {
                    setTimeout(function () {
                        IO.socket.emit('playerStartQuiz', data);
                    }, 2000)
                } else {
                    App.$gameArea.html(App.$templateResult);
                    if (App.Player.myScore > App.Opponent.myScore) {
                        $('#results').text('Gewonnen! Du hast '+App.Player.myScore+'Punkte erziehlt');
                    } if (App.Player.myScore < App.Opponent.myScore){
                        $('#results').text('Leider Verloren! Du hast '+App.Player.myScore+'Punkte erziehlt');
                    } if (App.Player.myScore == App.Opponent.myScore){
                        $('#results').text('Unentschieden, Ihr habt beide '+App.Player.myScore+'Punkte erziehlt');
                    }
                }
            }

        }
    };

    IO.init();
    App.init();

}($));
