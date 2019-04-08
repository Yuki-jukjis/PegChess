class Game {
  constructor(turn) {
    this.board = [];
    for(let i=0; i<6; i++){
      this.board.push([]);
      for(let j=0; j<6; j++) {
        if(i < 2)
          this.board[i].push(2);
        else if(i < 4)
          this.board[i].push(0);
        else
          this.board[i].push(1);
      }
    }
    this.turn = turn;
    this.count1 = 12;
    this.count2 = 12;
  }

  put(from, to){
    if(this.possible(from, to)) {
      let toR = Math.floor(to / 6);
      let toC = to % 6;
      let fromR = Math.floor(from / 6);
      let fromC = from % 6;
      let newGame = new Game();
      newGame.board = JSON.parse(JSON.stringify(this.board));
      newGame.board[fromR][fromC] = 0;
      newGame.board[toR][toC] = this.turn;
      newGame.turn = this.turn == 1 ? 2 : 1;
      newGame.count1 = 0;
      newGame.count2 = 0;
      for (let r=0; r<6;r++)
        for (let c=0; c<6;c++) {
          if (newGame.board[r][c] == 1) newGame.count1++;
          if (newGame.board[r][c] == 2) newGame.count2++;
        }
      return newGame;
    }
    else null;
  }

  possible(from, to) {
    let fromR = Math.floor(from / 6);
    let fromC = from % 6;
    let toR = Math.floor(to / 6);
    let toC = to % 6;
    if (this.board[fromR][fromC] != this.turn) return false;
    if (this.board[toR][toC] == this.turn) return false;
    if (toR == fromR && toC == fromC-2 && this.board[fromR][fromC-1]==this.turn) return true;
    if (toR == fromR && toC == fromC+2 && this.board[fromR][fromC+1]==this.turn) return true;
    if (toR == fromR-2 && toC == fromC && this.board[fromR-1][fromC]==this.turn) return true;
    if (toR == fromR+2 && toC == fromC && this.board[fromR+1][fromC]==this.turn) return true;
    return false;
  }

  possibleFrom(from) {
    for(let to=0; to<36; to++)
      if(this.possible(from, to)) return true;
      return false;
  }
}

class Solver {
  constructor(game){
    this.tree = {game, children:[]};
    Solver.alphabeta(this.tree, 2, -Infinity, +Infinity);
  }

  getBest() {
    let value = -Infinity;
    let best = [];
    for(let i=0; i<this.tree.children.length; i++)
      if(value < this.tree.children[i].value)
        best = [this.tree.children[i].game],
        value = this.tree.children[i].value;
      else if (value == this.tree.children[i].value)
        best.push(this.tree.children[i].game);
    return best[Math.floor(Math.random()*best.length)];
  }

  static alphabeta(tree, depth, a, b) {
    if (/*tree が終端ノード || */depth == 0)
      return Solver.heuristic(tree);

    if (tree.game.turn == 2) {
      for(let from=0; from<36; from++)
        for(let to=0; to<36; to++) {
          let game = tree.game.put(from, to);
          if (!game) continue;
          let child = {game, from, to, children:[]};
          tree.children.push(child);
          a = Math.max(a, Solver.alphabeta(child, depth-1, a, b).value);
          if (a >= b)
            break;
      }
      tree.value = a;
      return tree;
    }

    else /*if (tree.game.turn == 1)*/ {
      for(let from=0; from<36; from++)
        for(let to=0; to<36; to++) {
          let game = tree.game.put(from, to);
          if (!game) continue;
          let child = {game, from, to, children:[]};
          tree.children.push(child);
          b = Math.min(b, Solver.alphabeta(child, depth-1, a, b).value);
          if (a >= b)
            break;
      }
      tree.value = b;
      return tree;
    }
  }
  // 静的評価関数
  static heuristic(tree){
    tree.value = tree.game.count2 - tree.game.count1;
    return tree;
  }
}

class Executor {
  click(position){
    if(this.game.turn != 1) return;
    if(this.selected != -1) {
      let result = this.game.put(this.selected, position);
      if (result) {
        this.game = result, this.selected = -1;
        this.game = new Solver(this.game).getBest();
      } else if(this.game.possibleFrom(position))
        this.selected = position;
      else this.selected = -1;
    } else if (this.game.possibleFrom(position))
      this.selected = position;
    else this.selected = -1;
    this.render();
  }

  init() {
    this.game = new Game(1);
    this.selected = -1;
    this.render();
  }

  render() {
    for(let r=0; r<6; r++){
      for(let c=0; c<6; c++){
        let position = r*6+c;
        let td=$("#cell"+position);
        td.attr("class", "cell");
        if(this.game.board[r][c] != 0)
        td.addClass("pawn"+this.game.board[r][c]);
        if(this.selected == position)
          td.addClass("selected");
        if(this.selected != -1 && this.game.possible(this.selected, position))
          td.addClass("suggested");
        if(this.selected == -1 && this.game.possibleFrom(position))
          td.addClass("suggested");
      }
    }
  }

  prepare() {
    let table = $("#board");
    for(let r=0; r<6; r++) {
      let tr = $("<tr>");
      for(let c=0; c<6; c++) {
        let position = r*6+c;
        let td = $("<td>");
        td.attr("id", "cell"+position);
        td.attr("class", "cell");
        td.on("click", (e) => { this.click(position); });
        tr.append(td);
      }
      table.append(tr);
    }
    this.init();
  }
}

executor = new Executor();
window.onload = (e) => {
  executor.prepare();
};
