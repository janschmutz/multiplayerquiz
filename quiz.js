var io;
var gameSocket;
var roomno = 1;
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    var myid = gameSocket.id;
    gameSocket.emit('connected', {message: "You are connected!", id: myid});
    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('playerFindOpponent', playerFindOpponent);
    gameSocket.on('playerStartQuiz', playerStartQuiz);
    gameSocket.on('playerUpdateScore', playerUpdateScore);
};

function playerJoinGame() {
    var myroom = "room-"+roomno;
    gameSocket.join(myroom);
    if(io.nsps['/'].adapter.rooms[myroom] && io.nsps['/'].adapter.rooms[myroom].length == 2) {
        console.log(myroom +' is full. Game is starting...');
        io.sockets.in(myroom).emit('start', myroom);
        roomno++;
    }
    gameSocket.on('disconnect', function () {
        gameSocket.leave(myroom);
    });
    io.sockets.in(myroom).emit('connectToRoom', "You are in room no. "+roomno);
}

function playerFindOpponent(data) {
    console.log(data);
    io.sockets.in(data.room).emit('opponent', data);
}
function playerStartQuiz(data){
    console.log(data);
    var currentQuestion = quizPool[data.round];
    io.sockets.in(data.room).emit('nextquestion', currentQuestion);
}
function playerUpdateScore(data){
    var test = data;
    io.sockets.in(data.room).emit('newscore', test);
}
var quizPool = [
    {
        Question: "Welcher Affe ist der nächste Verwandte des Menschen?",
        Answers: [
            {
                A: "Kapuziner"
            },
            {
                B: "Orang-Utan"
            },
            {
                C: "Gorilla"
            },
            {
                D: "Schimpanse"
            }
        ],
        Correct: "d"
    },
    {
        Question: "Eine gute Tarnung ist für viele Tiere überlebenswichtig. Die Schwebfliege zum Beispiel sieht der Wespe zum Verwechseln ähnlich und schützt sich so vor Räubern. Wie nennt man diese Ähnlichkeit zwischen zwei verschiedenen Arten?",
        Answers: [
            {
                A: "Metamorphose"
            },
            {
                B: "Mimikry"
            },
            {
                C: "Kongruenz"
            },
            {
                D: "Symbiose"
            }
        ],
        Correct: "b"
    },
    {
        Question: "Wie viele Mägen hat eine Kuh?",
        Answers: [
            {
                A: "Zwei"
            },
            {
                B: "Drei"
            },
            {
                C: "Vier"
            },
            {
                D: "Fünf"
            }
        ],
        Correct: "c"
    },
    {
        Question: "Die Familie der Rabenvögel ist größer, als man denkt. Welcher Vogel gehört nicht dazu?",
        Answers: [
            {
                A: "Kleiber"
            },
            {
                B: "Dohle"
            },
            {
                C: "Eichelhäher"
            },
            {
                D: "Nebelkrähe"
            }
        ],
        Correct: "a"
    },
    {
        Question: "Welches Tier frisst die giftigen Fliegenpilze, ohne krank zu werden?",
        Answers: [
            {
                A: "Hase"
            },
            {
                B: "Dachs"
            },
            {
                C: "Rothirsch"
            },
            {
                D: "Fuchs"
            }
        ],
        Correct: "a"
    },
    {
        Question: "Wie heißt der weibliche Geschlechtsteil der Blume?",
        Answers: [
            {
                A: "Staubbeutel"
            },
            {
                B: "Stempel"
            },
            {
                C: "Blütenblatt"
            },
            {
                D: "Polype"
            }
        ],
        Correct: "b"
    }
];



