var board;
var board_discovered;
var bombs_on_board = 50;
var rows = 15;
var columns = 15;
var flag_enabled = false;
var gameOver = false;
var first_click = true;
var starting_bombs;
var sec;

var timer = setInterval(time, 1000);
function time() {
    sec++;

    document.getElementById("timer").innerHTML = sec;
}

window.onload = function () {
    init_game();
    small_button();
};

function get_tile_id(r, c) {
    return r.toString() + "-" + c.toString();
}

function clear_board() {
    clearInterval(timer);
    gameOver = false;
    first_click = true;
    const outerDivElement = document.getElementById("board");

    const innerDivElements = outerDivElement.getElementsByTagName("div");
    while (innerDivElements.length > 0) {
        innerDivElements[0].parentNode.removeChild(innerDivElements[0]);
    }
}

function check_win() {
    if (bombs_on_board != 0) {
        return;
    }
    let tiles_covered = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board_discovered[r][c] == 0) {
                tiles_covered++;
            }
        }
    }
    if (tiles_covered == starting_bombs) {
        gameOver = true;
        alert("You Won\nIn time: " + sec);
    }
}

function init_game() {
    document.getElementById("flag-button").className = "flag_off";
    document.getElementById("small-button").addEventListener("click", small_button);
    document.getElementById("medium-button").addEventListener("click", medium_button);
    document.getElementById("large-button").addEventListener("click", large_button);
    document.addEventListener("keydown", function (event) {
        if (event.key === "f") {
            set_flag();
        }
    });
}

function generate_board(rows_g, columns_g, bombs_g) {
    clear_board();
    let board_element = document.getElementById("board");
    rows = rows_g;
    columns = columns_g;
    bombs_on_board = bombs_g;
    board_element.style.width = (columns * 50).toString() + "px";
    board_element.style.height = (rows * 50).toString() + "px";
    starting_bombs = bombs_g;
    start_game();
}

function custom_button() {
    let rows_t = Number(document.getElementById("num1").value);
    let columns_t = Number(document.getElementById("num2").value);
    let bombs_on_board_t = Number(document.getElementById("num3").value);
    if (rows_t < 1 || columns_t < 1 || bombs_on_board_t < 0 || rows_t * columns_t - 1 < bombs_on_board_t) {
        //return;
    }
    generate_board(rows_t, columns_t, bombs_on_board_t);
}

function small_button() {
    generate_board(9, 9, 10);
}

function medium_button() {
    generate_board(16, 16, 40);
}

function large_button() {
    generate_board(16, 30, 99);
}

function start_game() {
    document.getElementById("flag-button").addEventListener("click", set_flag);
    document.getElementById("bombs_left").innerText = bombs_on_board.toString();
    board = [];
    board_discovered = [];
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        board_discovered[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i][j] = 0;
            board_discovered[i][j] = 0;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = get_tile_id(r, c);
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", function (ev) {
                ev.preventDefault();
                if (first_click) return;
                let tile = this;
                console.log("a");
                flag_click(tile);
                return false;
            });
            let num = board[r][c];
            update_tile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
}

function set_flag() {
    if (flag_enabled) {
        flag_enabled = false;
        document.getElementById("flag-button").className = "flag_off";
    } else {
        flag_enabled = true;
        document.getElementById("flag-button").className = "flag_on";
    }
}

function add_bombs(row, column) {
    var bombs_left = starting_bombs;
    while (bombs_left > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0 && r != row && c != column) {
            board[r][c] = -1;
            bombs_left--;
        }
    }
}

function bordering_bombs(r, c) {
    let bombs = 0;
    if (r > 0 && board[r - 1][c] == -1) {
        bombs++;
    }
    if (r > 0 && c > 0 && board[r - 1][c - 1] == -1) {
        bombs++;
    }
    if (r > 0 && c < columns - 1 && board[r - 1][c + 1] == -1) {
        bombs++;
    }

    if (c > 0 && board[r][c - 1] == -1) {
        bombs++;
    }
    if (c < columns - 1 && board[r][c + 1] == -1) {
        bombs++;
    }

    if (r < rows - 1 && board[r + 1][c] == -1) {
        bombs++;
    }
    if (r < rows - 1 && c > 0 && board[r + 1][c - 1] == -1) {
        bombs++;
    }
    if (r < rows - 1 && c < columns - 1 && board[r + 1][c + 1] == -1) {
        bombs++;
    }
    return bombs;
}

function add_numbers() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) {
                board[r][c] = bordering_bombs(r, c);
            }
        }
    }
}

function update_tile(tile, num, discovered) {
    tile.innerText = "";
    tile.classList.value = "";
    tile.classList.add("tile");
    if (discovered == -1) {
        tile.innerText = "🚩";
        tile.classList.add("flag");
    }
    if (!discovered) {
        return;
    }
    if (num == 0) {
        tile.classList.add("discovered");
    }
    if (num > 0) {
        tile.innerText = num;
        tile.classList.add("x" + num.toString());
        tile.classList.add("discovered");
    }
    if (num == -1 && discovered == 1) {
        tile.innerText = "💣";
        tile.classList.add("bomb");
    }

    check_win();
}

function flag_click(tile) {
    if (!tile.classList.contains("flag") && bombs_on_board > 0 && !tile.classList.contains("discovered")) {
        bombs_on_board--;
        document.getElementById("bombs_left").innerText = bombs_on_board.toString();
        update_tile(tile, -10, -1);
    } else if (tile.classList.contains("flag")) {
        tile.innerText = "";

        bombs_on_board++;
        tile.classList.remove("flag");

        document.getElementById("bombs_left").innerText = bombs_on_board.toString();
    }
    return;
}

function clickTile() {
    if (gameOver) {
        return;
    }
    if (first_click && flag_enabled) {
        return;
    }
    let tile = this;
    if (flag_enabled) {
        if (!tile.classList.contains("flag") && bombs_on_board > 0 && !tile.classList.contains("discovered")) {
            bombs_on_board--;
            document.getElementById("bombs_left").innerText = bombs_on_board.toString();
            update_tile(tile, -10, -1);
        } else if (tile.classList.contains("flag")) {
            tile.innerText = "";

            bombs_on_board++;
            tile.classList.remove("flag");

            document.getElementById("bombs_left").innerText = bombs_on_board.toString();
        }
        return;
    }
    if (tile.classList.contains("flag")) {
        return;
    }
    let coords = tile.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    if (first_click) {
        clearInterval(timer);
        sec = 0;
        timer = setInterval(time, 1000);

        add_bombs(r, c);
        add_numbers();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                let tile = document.getElementById(get_tile_id(r, c));
                update_tile(tile, board[r][c], board_discovered[r][c]);
            }
        }
        console.log(board);

        first_click = false;
    }

    if (gameOver || board_discovered == 1) {
        return;
    }

    if (board[r][c] == -1) {
        gameOver = true;
        reveal_mines();
        return;
    }

    check_mines(r, c);
}

function check_mines(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board_discovered[r][c] == 1) {
        return;
    }
    if (document.getElementById(get_tile_id(r, c)).classList.contains("flag")) {
        return;
    }
    board_discovered[r][c] = 1;
    if (board[r][c] == 0) {
        check_mines(r - 1, c - 1);
        check_mines(r - 1, c);
        check_mines(r - 1, c + 1);

        check_mines(r, c - 1);
        check_mines(r, c + 1);

        check_mines(r + 1, c - 1);
        check_mines(r + 1, c);
        check_mines(r + 1, c + 1);
        let tile = document.getElementById(get_tile_id(r, c));
        update_tile(tile, board[r][c], board_discovered[r][c]);
    }
    if (board[r][c] > 0) {
        let tile = document.getElementById(get_tile_id(r, c));
        update_tile(tile, board[r][c], board_discovered[r][c]);
    }
}

function reveal_mines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == -1) {
                let tile = document.getElementById(get_tile_id(r, c));
                update_tile(tile, board[r][c], 1);
            }
        }
    }
}
