var eleGame = $(".game");
var player = $(".player");
var eleTime = $("#time");
var eleFuel = $("#fuel");
var eleScore = $("#score");
var game = {
    playerWidth: 144,
    playerHeight: 60,
    gameWidth: 960,
    gameHeight: 600,
    fuel: 15,
    maxFuel: 30,
    time: 0,
    score: 0,
    status: true,
    volume: 1,
    name: ''
};

$(".startBtn").on("click", function () {
    $(".instruction").hide();
    $(".game").show();
    init();
});

function init() {


    /*创建元素的方法*/
    function createEle(name, attr, css) {
        var ele = $(`<div class="${name}"></div>`).appendTo(eleGame);
        ele.css(css).attr(attr).css('animation-play-state', 'running').on("webkitAnimationEnd", function () {
            $(this).remove();
        })
    }


    function createMineBullet() {
        var left = parseInt(player.css('left'));
        var top = parseInt(player.css('top'));
        createEle('mine_bullet', {}, {
            left: left + game.playerWidth,
            top: top + game.playerHeight / 2 - 5

        });
    }

    createFEAF();

    /*创建友军,敌军,陨石,燃料*/
    function createFEAF() {
        createEle('friend', {
            score: -10,
            life: 1,
            fuel: -15
        }, {
            left: '100%',
            top: random(80, game.gameHeight - 80)
        });
        createEle('enemy', {
            score: 5,
            life: 1,
            fuel: -15
        }, {
            left: '100%',
            top: random(80, game.gameHeight - 80)
        });
        createEle('aestroid', {
            score: 10,
            life: 2,
            fuel: -15
        }, {
            left: '100%',
            top: random(80, game.gameHeight - 80)
        });

        createEle('fuel', {
            fuel: 15,
            life: 1,
            score: 0
        }, {
            left: random(80, game.gameWidth / 2 + 100),
            top: 0
        })
    }


    /*创建敌军子弹*/
    function createEnemyBullet() {
        var bullet = $('.enemy');
        bullet.each(function () {
            var left = $(this).position().left;
            var top = $(this).position().top;
            createEle('enemy_bullet', {
                score: 0,
                fuel: -15,
                life: 1
            }, {
                left: left - 40,
                top: top + 40
            })
        })
    }


    timingCreateEle();

    /*定时创建元素*/
    function timingCreateEle() {
        setInterval(function () {
            if (game.status) {
                createFEAF();
                createEnemyBullet();
            }
        }, 3500);
    }

    /*玩家移动*/

    var dir = {
        left: false,
        right: false,
        top: false,
        bottom: false,
    };

    $(document).on('keydown', function (e) {
        switch (e.keyCode) {
            case 37:
                dir.left = true;
                break;
            case 39:
                dir.right = true;
                break;
            case 38:
                dir.top = true;
                break;
            case 40:
                dir.bottom = true;
                break;
        }
    });
    $(document).on('keyup', function (e) {
        switch (e.keyCode) {
            case 37:
                dir.left = false;
                break;
            case 39:
                dir.right = false;
                break;
            case 38:
                dir.top = false;
                break;
            case 40:
                dir.bottom = false;
                break;
            case 32:
                if (game.status) {
                    createMineBullet();
                    createAudio('shoot.mp3', game.volume, '');
                }
                break;
            case 80:
                $(".play").click();
                break;
        }
    });


    playerMove();

    function playerMove() {
        if (game.status) {
            var left = getCss(player, 'left');
            var top = getCss(player, 'top');
            if (dir.left) {
                player.css('left', left - 10);
            }
            if (dir.right) {
                player.css('left', left + 10);
            }
            if (dir.top) {
                player.css('top', top - 10);
            }
            if (dir.bottom) {
                player.css('top', top + 10);
            }
            checkPlayer();
        }

        requestAnimationFrame(playerMove);
    }

    function checkPlayer() {
        var left = getCss(player, 'left');
        var top = getCss(player, 'top');
        if (left < 0) {
            player.css('left', 0);
        }
        if (left > game.gameWidth - game.playerWidth) {
            player.css('left', game.gameWidth - game.playerWidth)
        }
        if (top < 80) {
            player.css('top', 80);
        }
        if (top > game.gameHeight - game.playerHeight) {
            player.css('top', game.gameHeight - game.playerHeight)
        }
    }

    checkCollision();

    /*碰撞了要做的处理*/
    function checkCollision() {
        /*玩家和物体碰撞*/
        $('.enemy, .friend, .aestroid, .fuel, .enemy_bullet').each(function () {
            if (collision($(this), player)) {
                game.score += parseInt($(this).attr('score'));
                game.fuel += parseInt($(this).attr('fuel'));
                if (game.fuel > game.maxFuel) {
                    game.fuel = game.maxFuel;
                }
                $(this).remove();
            }
        });

        /*子弹和物体碰撞*/
        $(".mine_bullet").each(function (i, bullet) {

            $('.enemy, .friend, .aestroid').each(function (index, item) {
                if (collision($(bullet), $(item))) {

                    var life = $(item).attr('life');
                    life--;
                    $(item).css('opacity', '0.6');
                    if (life <= 0) {
                        game.score += parseInt($(this).attr('score'));
                        $(item).remove();
                    }
                    $(item).attr('life', life);
                    $(bullet).remove();
                    createAudio('destroyed.mp3', game.volume, '');

                }
            });
        });

        isOver();
        requestAnimationFrame(checkCollision);
    }

    /*判断游戏是否结束*/
    function isOver() {
        eleScore.text(game.score);
        eleFuel.css('width', game.fuel * 5);
        eleFuel.text(game.fuel);

        if (game.fuel <= 0) {
            pause();
            mutedAudio();
            $(".form").show();
            $(".game").hide();
        }
    }

    settingChange();

    function settingChange() {
        setInterval(function () {
            if (game.status) {
                timerCount();
                fuelCount();
            }
        }, 1000)
    }

    function timerCount() {
        game.time++;
        eleTime.text(game.time);
    }

    function fuelCount() {
        game.fuel--;
        eleFuel.text(game.fuel);
        eleFuel.css('width', game.fuel * 5);
    }

    changeFontSize();

    function changeFontSize() {
        $(".font-add").on('click', function () {
            var font = parseInt(eleGame.css('font-size'));
            if (font < 32) {
                eleGame.css('font-size', font + 1);
            }
        });

        $(".font-reduce").on('click', function () {
            var font = parseInt(eleGame.css('font-size'));
            if (font >= 10) {
                eleGame.css('font-size', font - 1);
            }
        })
    }

    $(".sound").on("click", function () {
        if (game.volume == 1) {
            $(this).attr('src', 'images/sound_off.png');
            game.volume = 0;
            mutedAudio();
        } else {
            $(this).attr('src', 'images/sound_on.png');
            game.volume = 1;
            openAudio();
        }
    });


    $(".play").on("click", function () {
        if (game.status) {
            $(this).attr('src', 'images/play.png');
            game.volume = 0;
            mutedAudio();
            pause();
        } else {
            $(this).attr('src', 'images/pause.png');
            game.volume = 1;
            openAudio();
            play();
        }
    })

    function pause() {
        game.status = false;
        $("[style*='animation'], .planet").css('animation-play-state', 'paused');
    }

    function play() {
        game.status = true;
        $("[style*='animation'], .planet").css('animation-play-state', 'running');
    }

    createAudio('background.mp3', game.volume, 'loop');

    function createAudio(src, volume, loop) {
        $(`<audio src="sound/${src}" autoplay ${loop ? 'loop' : ''}></audio>`).appendTo(eleGame).on('ended', function () {
            $(this).remove();
        })[0].volume = volume;
    }

    function mutedAudio() {
        $("audio").each(function () {
            $(this)[0].volume = 0;
        })
    }

    function openAudio() {
        $("audio").each(function () {
            $(this)[0].volume = 1;
        })
    }

    /*碰撞检测*/
    function collision(a, b) {
        var T1 = a.position().top;
        var B1 = a.position().top + a.height();
        var L1 = a.position().left;
        var R1 = a.position().left + a.width();

        var T2 = b.position().top;
        var B2 = b.position().top + b.height();
        var L2 = b.position().left;
        var R2 = b.position().left + b.width();

        return !(L2 > R1 || R2 < L1 || T2 > B1 || B2 < T1);

    }

    function getCss(ele, attr) {
        return parseInt(ele.css(attr));
    }

    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

$("#username").on("input", function () {
    game.name = $(this).val();
    if (game.name == '') {
        $("#continue").addClass('disabled');
    } else {
        $("#continue").removeClass('disabled');
    }
});

$("#continue").on('click', function () {
    if (game.name) {
        /*var result = {
            name: game.name,
            score: game.score,
            time: game.time,
        };

        $.post('./php/register.php', result, function (data) {
                var arr = JSON.parse(data);

                arr.sort(function (a, b) {
                    if (b.score == a.score) {
                        return b.time - a.time;
                    }
                    return b.score - a.score;
                });
                var newArr = arr.slice(0, 10);
                var html = "";
                var tmp = 0;
                for (var i in newArr) {
                    var position = parseInt(i) + 1;
                    if ((i != 0) && (arr[i].score == arr[i - 1].score) && (arr[i].time == arr[i - 1].time)) {
                        html += `
                    <tr>
                        <td>${tmp}</td><td>${newArr[i].name}</td><td>${newArr[i].score}</td><td>${newArr[i].time}</td>
                    </tr>
                    `;
                    } else {
                        tmp = position;
                        html += `
                    <tr>
                        <td>${tmp}</td><td>${newArr[i].name}</td><td>${newArr[i].score}</td><td>${newArr[i].time}</td>
                    </tr>
                    `;
                    }

                }

                $(".rank table").append(html);
                $(".form").hide();
                $(".rank").show();

            }
        )*/


        var result = {
            name: game.name,
            score: game.score,
            time: game.time,
        };

        var data = localStorage.data ? JSON.parse(localStorage.data) : [];

        data.push(result);

        localStorage.data = JSON.stringify(data);
        data = data.slice(0, 10);
        data.sort(function (a, b) {
            if (b.score == a.score) {
                return b.time - a.time;
            }
            return b.score - a.score;
        });
        let su = 0;
        let html = '';
        data.forEach(function (v, i) {
            let n = parseInt(i)+1;
            if ((i>0) && (data[i].score==data[i-1].score) && (data[i].time==data[i-1].time)){
                html += `
                    <tr>
                        <td>${su}</td><td>${v.name}</td><td>${v.score}</td><td>${v.time}</td>
                    </tr>
                    `;
            }else {
                su = n;
                html += `
                    <tr>
                        <td>${su}</td><td>${v.name}</td><td>${v.score}</td><td>${v.time}</td>
                    </tr>
                    `;
            }
        });

        $(".rank table").append(html);

        $(".form").hide();
        $(".rank").show();
    }
});

$(".restart-game").on("click", function () {
    location.href = location.href;
});
