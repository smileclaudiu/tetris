import React from 'react';

import './App.css';

const shapes = [  [ [{x: 0, y: 6}, {x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}],
                    [{x: 1, y: 6}, {x: 0, y: 6}, {x: 0, y: 5}, {x: 0, y: 4}],
                    [{x: 2, y: 5}, {x: 2, y: 6}, {x: 1, y: 6}, {x: 0, y: 6}],
                    [{x: 0, y: 4}, {x: 1, y: 4}, {x: 1, y: 5}, {x: 1, y: 6}] ], // right T
                  
                  [ [{x: 0, y: 5}, {x: 0, y: 6}, {x: 1, y: 6}, {x: 2, y: 6}],
                    [{x: 0, y: 6}, {x: 1, y: 6}, {x: 1, y: 5}, {x: 1, y: 4}],
                    [{x: 2, y: 6}, {x: 2, y: 5}, {x: 1, y: 5}, {x: 0, y: 5}],
                    [{x: 1, y: 4}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}] ], // left T

                  [ [{x: 0, y: 6}, {x: 1, y: 6}, {x: 1, y: 5}, {x: 2, y: 5}],
                    [{x: 0, y: 4}, {x: 0, y: 5}, {x: 1, y: 5}, {x: 1, y: 6}] ], // reverse S

                  [ [{x: 0, y: 5}, {x: 1, y: 5}, {x: 1, y: 6}, {x: 2, y: 6}],
                    [{x: 0, y: 6}, {x: 0, y: 5}, {x: 1, y: 5}, {x: 1, y: 4}] ], // S

                  [ [{x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7}],
                    [{x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}] ], // linie

                  [ [{x: 0, y: 5}, {x: 0, y: 6}, {x: 1, y: 5}, {x: 1, y: 6}] ], // patrat

                  [ [{x: 0, y: 5}, {x: 1, y: 4}, {x: 1, y: 5}, {x: 1, y: 6}],
                    [{x: 1, y: 6}, {x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}],
                    [{x: 1, y: 5}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}],
                    [{x: 1, y: 4}, {x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}] ] // 3
                ];

const activeShape = JSON.parse(JSON.stringify(shapes[Math.floor(Math.random() * shapes.length)]));

const initialState = {
  active: activeShape,
  position: 0,
  blocked: [],
  isRunning: false,
  level: 1,
  streak: 0
}

class Tetris extends React.Component {
  constructor() {
    super();
    this.state = {
    ...initialState
    }
    this.timer = null;
    this.timer2 = null;
    this.reevaluate = false;
  }
  
  componentDidMount(){
    document.addEventListener("keydown", this.changeActive);
  }

  move = () => {
    if(this.state.isRunning) {
      const active = JSON.parse(JSON.stringify(this.state.active));
      active.map(position => position.map( cell => cell.x++));
      const isBlocked = this.checkIfBlocked(active[this.state.position], this.state.blocked);
      const xIsZero = this.checkEndGame(active[this.state.position]);
      if(isBlocked && xIsZero) this.endGame();
        else if(isBlocked) {
        var blocked = [...this.state.blocked, ...this.state.active[this.state.position]];
        blocked = this.evaluateBlocked(blocked);
        if(this.reevaluate) {
          this.setActive(7);
          this.setState({blocked});
          return;
        } else {
          shapes.splice(7, 1);
          this.setActive();
        }
          this.setState({blocked});
      } else 
        this.setState({active})
    }
  }

  checkIfBlocked = (active, blocked) => {
    return active.some(cell => {
      const x = blocked.some(blockedCell => {
        return blockedCell.x === cell.x && blockedCell.y === cell.y;
      })
      if(x || cell.x === 25) return true;
      else return false;
    });
  }

  evaluateBlocked = (blocked) => {
    var newBlocked = JSON.parse(JSON.stringify(blocked));
    var index = [];
    blocked.reduce((acc, cell) => {
      if (acc[cell.x] && acc[cell.x].length === 11) index.push(cell.x);
      else if (acc[cell.x]) acc[cell.x].push(cell.y);
      else acc[cell.x] = [cell.y]
      return acc;
    }, {})
    var remainings = [];
    if(index.length > 0) {
      this.processLevel(index.length);
      index.map(element => {
        return(
          newBlocked = newBlocked.filter(cell => {
            if(cell.x < element) remainings.push(cell);
            return (cell.x !== element && cell.x > element)
          })
        );
      })
      this.reevaluate = true;
      shapes[7] = [remainings];
    } else if (this.reevaluate) this.reevaluate = false;

    return newBlocked;
  }

  processLevel = (rows) => {
    if (this.state.level === 10) return;
    let adjustment = null;
    rows === 1 ? adjustment = 1 : (rows === 2 ? adjustment = 3 : (rows === 3 ? adjustment = 5 : adjustment = 7));
    var streak = this.state.streak + adjustment;
    var level = this.state.level;
    if (streak > 9 && level > 8) {
      streak = 20;
      level = 10;
    } else if (streak > 9) {
      streak = streak % 10;
      level++;
      }

    if (this.state.level !== level) {
      clearInterval(this.timer);
      this.timer = setInterval(this.move, (11 - level) * 30);
      this.setState({streak, level})
    } else this.setState({streak})
  }

  checkEndGame = active => {
    return active.some(cell => cell.x === 1)
  }

  changeActive = (e, button = null) => {
    console.log('changeactive')
    if (!this.state.isRunning) return;
    if(e.key === "w" || e.key === "ArrowUp" || button === 'rotate') this.changePosition();
    var direction = null;
    if(e.key === "a" || e.key === "ArrowLeft" || button === 'left') {
      direction = -1;
    } else if (e.key === "d" || e.key === "ArrowRight" || button === 'right') {
      direction = 1; 
    } else if(e.key === "s" || e.key === "ArrowDown" || button === 'down'){
      direction = 0;
    } else return;
  
    const active = JSON.parse(JSON.stringify(this.state.active));
    active.map(position => position.map(cell => {
                                                  if(direction === 0) cell.x++;
                                                  else cell.y = cell.y + direction
                                                  return cell;
                                                  }))
    const block = active[this.state.position].some( cell => (cell.y === -1) || 
                                                            (cell.y === 12) ||
                                                            (cell.x === 25) ||
                                                            (this.state.blocked.some( block => (block.y === cell.y) && (block.x === cell.x))));
    if(block) return;
    else { 
      this.setState({active})
    }
  }

  changePosition = () => {
    const indexLength = this.state.active.length -1;
    var position = this.state.position;
    if (indexLength > this.state.position) position++;
    else position = 0;
    var activeShape = JSON.parse(JSON.stringify(this.state.active));
    var isOutOfRange = false;
    activeShape = activeShape.map(position => {
      position.map(cell => {
        if(cell.y < 0) {
          position.map(cell => cell.y++); 
          isOutOfRange = true;
        } else if (cell.y > 11) {
          position.map(cell=> cell.y--)
          isOutOfRange = true;
        }
        return cell;
      })
      return position;
    })
    if(isOutOfRange) this.setState({active: activeShape, position});
    else this.setState({position})
  }

  setActive = (shape = null) => {
    if(shape === null) {
      const active = shapes[Math.floor(Math.random() * shapes.length)];
      this.setState({active, position: 0})
    } else this.setState({active: shapes[shape], position: 0})
  }

  getCellType = (x, y) => {
    const isActive = this.state.active[this.state.position].some( cell => cell.x === x && cell.y === y);
    const isBlocked = this.state.blocked.some( cell => cell.x === x && cell.y === y);
    if (isActive) return "active";
      else if (isBlocked) return "blocked";
      else return "empty"
  }
  
  startGame = () => {
    if (this.state.isRunning) {
      clearInterval(this.timer)
      this.setState({isRunning: false})
    } else {
      this.timer = setInterval(this.move, (11 - this.state.level) *30);
      this.setState({ isRunning: true })
    }
  }

  restart = () => {
    clearInterval(this.timer);
    this.timer = setInterval(this.move, (11 - initialState.level) * 30);
    document.getElementById("lostMessage").style.display = "none";
    this.setState({
      ...initialState,
      isRunning: true
    })
  }

  endGame = () => {
    this.setState({ isRunning: false });
    document.getElementById("lostMessage").style.display = "block";
    clearInterval(this.timer)
  }

  area = Array(25).fill(Array(12).fill(null));

  render() {
    return (
      <div id="wrapper">
        <div id="lostMessage">
          You lost. Click restart to play again!
          <button onClick={() => this.restart()}>Restart</button>
        </div>
        <div className="area">
          {
            this.area.map((linie, indexX) => {
              return(
                <div className="linie" key={indexX}>
                  {
                    linie.map((coloana, indexY) => {
                      return(
                        <div className={this.getCellType(indexX, indexY)} key={indexX.toString() + ' ' + indexY.toString()}></div>
                      );
                    })
                  }
                </div>
              );
            })
          }
        </div>
        <div id="info">
          <span id="level">
            Level: {this.state.level < 10 ? this.state.level : "Max (10)"}
          </span>
          <span id="streak">
            Streak: {this.state.level < 10 ? this.state.streak :  "Max" }
          </span>
          <button id="startButton" onClick={() => this.startGame()}>
            {this.state.isRunning ? "Pause" : "Start"}
          </button>
          {((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) && <div id="controls">
            <button className="displayBlockButton" onMouseDown={ (e)=> setInterval(this.changeActive(e,'rotate'), 30)}>	&#9850;</button>
            <button onTouchStart={(e) =>{this.timer2 = setInterval(() => this.changeActive(e, 'left'), 100); this.changeActive(e, 'left')}}  onTouchEnd={ () => clearInterval(this.timer2)} >&larr;</button>
            <button onTouchStart={(e) =>{this.timer2 = setInterval(() => this.changeActive(e, 'right'), 100); this.changeActive(e, 'right')}} onTouchEnd={ () => clearInterval(this.timer2)}>&rarr;</button>
            <button className="displayBlockButton" onTouchStart={(e) => this.timer2 = setInterval(() => this.changeActive(e, 'down'), 100)} onTouchEnd={ () => clearInterval(this.timer2)} >&darr;</button>
          </div>}
        </div>
      </div>
    );
  }
  
}

export default Tetris;
