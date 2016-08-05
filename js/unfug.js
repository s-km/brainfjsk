const instructions = {
  MOVE_R : '>',
  MOVE_L : '<',
  INCR : '+',
  DECR : '-',
  OUT : '.',
  IN : ',',
  JUMP_F : '[',
  JUMP_B : ']'
};

const speeds = {
  "Instant" : 1, 
  "Fast" : 33,
  "Medium" : 16.5,
  "Slow" : 4
};

const examples = {
  "helloWorld" : "++++++++++[>+++++++>++++++++++>+++>++++<<<<-]>++.>+.+++++++..+++.>>++++.<++.<++++++++.--------.+++.------.--------.>+.",
  "echoInput" : ">,[>,]<[.<]",
  "binaryCount" : "-[>[->]++[-<+]-]",
  "rot13" : ",[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>++++++++++++++<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>>+++++[<----->-]<<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>++++++++++++++<-[>+<-[>+<-[>+<-[>+<-[>+<-[>++++++++++++++<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>>+++++[<----->-]<<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>++++++++++++++<-[>+<-]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]>.[-]<,]"
};

let currentIndex;
let pointer;
let inputCount;
let cellDisplay = document.getElementsByClassName("memoryCells");
let cellHighlighter = document.getElementById("activeCell");
let cells = new Array (30000);
let jumpStack = [];

let functionTimer;

let speed = 16.5;
let code;
let input;
let output = document.getElementById("output");

window.addEventListener("load", function(){ 
  document.getElementById("run").addEventListener("click", function(){
    initialize(cells);   
  });
  
  const speedOptions = document.getElementsByClassName("speeds");
  
  for(let option of speedOptions){
    option.addEventListener("click", ({target}) => { 
      speed = speeds[target.innerHTML];
    });
  }
 
  document.addEventListener("click", (event) => {
    if(event.target != document.getElementById("program") || event.target != document.getElementById("speed")) {
      document.getElementById("program").classList.remove("showDropdown");
      document.getElementById("speed").classList.remove("showDropdown");
    }
  });

  document.getElementById("example").addEventListener("click", (event) => {
    document.getElementById("speed").classList.remove("showDropdown");
    document.getElementById("program").classList.add("showDropdown");
    event.stopPropagation();
  });

  document.getElementById("animationSpeed").addEventListener("click", (event) => {
    document.getElementById("program").classList.remove("showDropdown");
    document.getElementById("speed").classList.add("showDropdown");
    event.stopPropagation();
  });


  document.getElementById("program").addEventListener("click", (event) => {
    document.getElementById("code").value = examples[event.target.getAttribute('data-example')];
    document.getElementById("program").classList.remove("showDropdown");
    event.stopPropagation();
  });
  
  document.getElementById("speed").addEventListener("click", (event) => {
    document.getElementById("speed").classList.remove("showDropdown");
    event.stopPropagation();
  });

});

function initialize(cells){
  if(functionTimer !== null)
    clearTimeout(functionTimer);
  currentIndex = 0;
  pointer = 0;
  inputCount = 0;
  code = document.getElementById("code").value;
  input = document.getElementById("input").value;
  output.value = "";
  output.placeholder = "Running...";
  for(let cell of cellDisplay){
    cell.innerHTML = '0';
    cell.style.backgroundColor = 'rgba(255, 35, 35, 0)';
    cell.classList.remove('Output');
  }
  cells.fill(0);
  resetCells();
  cellHighlighter.removeAttribute("style");
  cellHighlighter.style.display = 'block';  
  speed == speeds.Instant ? quickInterpret(code, input) : visualInterpret(code, input);
}

function visualInterpret(code, input){
  if(speed == speeds.Instant){
    initialize(cells);
    return;
  }
  if (currentIndex < code.length){
    functionTimer = setTimeout(() => {
      switch(code[currentIndex]){
        case instructions.INCR:
          cells[pointer] !== 255 ? cells[pointer]++ : cells[pointer] = 0;
          break;
        case instructions.DECR:
          cells[pointer] !== 0 ? cells[pointer]-- : cells[pointer] = 255; 
          break;
        case instructions.MOVE_R:
          pointer !== 29999 ? pointer++ : pointer = 0;
          break;
        case instructions.MOVE_L:
          pointer !== 0 ? pointer-- : pointer = 29999;
          break;
        case instructions.JUMP_F:
          if(isZero(cells[pointer]))
            currentIndex = findClosed(currentIndex);
          break;
        case instructions.JUMP_B:
          if(!isZero(cells[pointer]))
            currentIndex = findOpen(currentIndex);
          break;
        case instructions.OUT:
          display(cells[pointer]);
          break;
        case instructions.IN:
          cells[pointer] = read(input);
          inputCount++;
          break;
      }
      if (pointer < 20){
        animateMemory(code[currentIndex]);
      }
      currentIndex++;
      requestAnimationFrame(() => {visualInterpret(code, input)});
    }, 1000/speed); 
  }
  else
    if (cellDisplay[pointer].style.backgroundColor == 'rgb(255, 35, 35)')
          cellDisplay[pointer].style.backgroundColor = 'rgba(255, 35, 35, 0)';
    return;
}

function quickInterpret(code, input){
  let steps = 0;
  while (currentIndex < code.length && steps < 1000000){
    switch(code[currentIndex]){
      case instructions.INCR:
        cells[pointer] !== 255 ? cells[pointer]++ : cells[pointer] = 0;
        break;
      case instructions.DECR:
        cells[pointer] !== 0 ? cells[pointer]-- : cells[pointer] = 255; 
        break;
      case instructions.MOVE_R:
        pointer !== 29999 ? pointer++ : pointer = 0;
        break;
      case instructions.MOVE_L:
        pointer !== 0 ? pointer-- : pointer = 29999;
        break;
      case instructions.JUMP_F:
        if(isZero(cells[pointer]))
          currentIndex = findClosed(currentIndex);
        break;
      case instructions.JUMP_B:
        if(!isZero(cells[pointer]))
          currentIndex = findOpen(currentIndex);
        break;
      case instructions.OUT:
        display(cells[pointer]);
        break;
      case instructions.IN:
        cells[pointer] = read(input);
        inputCount++;
        break;
    }
    currentIndex++;
    steps++;
  }
}


function animateMemory(instruction) {
  let stackDisplay = document.getElementsByClassName("stackCell")[pointer];
  let activeCell = cellDisplay[pointer].getBoundingClientRect();
  if (instruction == '.') {
    if (cellDisplay[pointer].classList.contains('Output')){
      let flashedCell = cellDisplay[pointer];
      let replaceCell = flashedCell.cloneNode(true);
      flashedCell.parentNode.replaceChild(replaceCell, flashedCell);
    }
    cellDisplay[pointer].classList.add('Output');
  }
  cellHighlighter.style.height = activeCell.height + 'px';
  cellHighlighter.style.width = activeCell.width + 'px';
  cellHighlighter.style.top = activeCell.top + 'px';
  cellHighlighter.style.left = activeCell.left + 'px';
  cellDisplay[pointer].innerHTML = cells[pointer];
  stackDisplay.style.transform = "scaleY(" + cells[pointer]/127 + ")";
}

function isZero(num){
  return num === 0 ? true : false;
}

function read(input){
  return isNaN(input.charCodeAt(inputCount)) ? 0 : input.charCodeAt(inputCount);
}

function display(cell){
  output.value += String.fromCharCode(cell);
}

function findClosed(index){
  let b = 1;
  while(b !== 0){
    index++;
    if(code[index] == '[')
      b++;
    else if (code[index] == ']')
      b--;
  }
  return index;
}

function findOpen(index){
  let b = 1;
  while(b !== 0){
    index--;
    if(code[index] == '[')
      b--;
    else if (code[index] == ']')
      b++;
  }
  return index;
}

function resetCells() {
  for(cell of document.getElementsByClassName("stackCell")) {
    cell.style.transform = "scaleY(0)";
  }
}