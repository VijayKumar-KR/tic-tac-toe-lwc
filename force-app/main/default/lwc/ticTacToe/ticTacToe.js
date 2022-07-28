import { LightningElement } from 'lwc';
// Resource-Image
import congratsImg from '@salesforce/resourceUrl/congrats_img'; 
import AstroImg from '@salesforce/resourceUrl/Astro_img';
// turn icons
import Xicon from '@salesforce/resourceUrl/X_icon';  
import Oicon from '@salesforce/resourceUrl/O_icon';
// level img
import beast_level from '@salesforce/resourceUrl/beast_level';
// Resource-Track
import turnChangeTrack from '@salesforce/resourceUrl/turn_change_track';
import winnerTrack from '@salesforce/resourceUrl/winner_track';
import restartTrack from '@salesforce/resourceUrl/restart_track'; 
// Instructions
import instruction_img from '@salesforce/resourceUrl/instruction_img'; 
import instructions from '@salesforce/label/c.tic_tac_toe_instructions';
// toast 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import header_background_img from '@salesforce/resourceUrl/header_background_img'; 

export default class TicTacToe extends LightningElement {
    
    header_background_img = header_background_img
    // default turn 
    turn = 'X'
    // show/hide Start Game text
    isGameOn = false
    // game over bool
    isGameOver = false
    // Original Board index
    currentBoardIndexValue = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    // turn winning combination & line angle 
    // winCombination = [// rows
    //                     [0, 1, 2, 3, 5, 0],
    //                     [3, 4, 5, 3, 14, 0],                       
    //                     [6, 7, 8, 3, 23, 0],
    //                     // columns
    //                     [0, 3, 6, -6, 14, 90],
    //                     [1, 4, 7, 3.3, 14, 90],
    //                     [2, 5, 8, 12.6, 14, 90],
    //                     // diagonal
    //                     [0, 4, 8, 3.6, 14, 45],
    //                     [2, 4, 6, 3.6, 14, -45]]
    winCombination = [// rows
                        [0, 1, 2],
                        [3, 4, 5],                       
                        [6, 7, 8],
                        // columns
                        [0, 3, 6],
                        [1, 4, 7],
                        [2, 5, 8],
                        // diagonal
                        [0, 4, 8],
                        [2, 4, 6]]
    // options
    options = [{ label: 'Play against a Friend', value: 'Friend' },
                { label: 'Level 0: Easy', value: 'CPU_Easy' },
                { label: 'Level 1: Beast', value: 'CPU_Hard' }]
    // computer turn var
    level = 'CPU_Easy';
    isFirstTurn = true;
    // play with computer
    computerturn = false
    // Easy level var
    edgemoves = [1, 3, 5, 7]
    cornermoves = [0, 2, 6, 8]
    centermove = [4]
    // img
    congrats_img = congratsImg
    Astro_img = AstroImg
    // turn icon
    X_icon = Xicon
    O_icon = Oicon
    // level img
    beast_level = beast_level
    //track
    turn_change_track = turnChangeTrack;
    winner_track = winnerTrack;
    restart_track = restartTrack;
    muted = false
    // spinner
    isLoading = false
    // points
    X_Points = 0
    O_Points = 0
    // instructions
    label = {
        instructions
    };
    isShowInfo = false
    instruction_img = instruction_img

    // change to next turn value
    swapTurn(){
        this.turn = this.turn === "X" ? "O" : "X";
    }

    // Swap player
    handleChangeTurn(){
        if(!this.isGameOn){
            this.swapTurn();
            this.template.querySelector('[data-id=player-turn-text]').textContent = this.turn+' turn';
            this.showToast('Player Updated', 'You changed player to \"'+this.turn+'\"', 'info');
        }else{
            this.showToast('Error', 'You can\'t change the player while game is on!', 'error');
        }
    }

    // add border bottom color for X-turn
    get displayBottomColorForXTurn(){
        return this.turn === "X" ? "borderBottomColor pointsTable" : "pointsTable";
    }
    // add border bottom color for O-turn
    get displayBottomColorForOTurn(){
        return this.turn === "O" ? "borderBottomColor pointsTable" : "pointsTable";
    }

    get backgroundStyle(){
        return `border-radius: 10px;height:15rem;background-image:url(${header_background_img})`;
    }

    // Shuffle Mute and unMute
    handleMute(){
        this.muted = !this.muted;
    }

    // onload check whether level is Manual player or with computer
    connectedCallback(){
        // check play against value
        this.computerturn = this.level.includes('CPU') ? true : false;
    }

    // Play Against Combox handleChange
    handleChangeLevel(event){
        this.level = event.detail.value;
        // check whether level is Manual player or with computer
        this.connectedCallback();
        // restart player points table
        this.X_Points = this.O_Points = 0;
        // mute sound for level change
        this.handleRestart();
    }

    // show description on selected level  
    get getleveldescription(){
        return this.level == 'CPU_Easy' ? 'Computer is dumb' : this.level == 'CPU_Hard' ? 'Computer is a Beast' : '';
    }

    // show instructions onhover
    oninfo(){
        this.isShowInfo = true;
    }
    // show instructions onhover out
    offinfo(){
        this.isShowInfo = false;
    }

    // handleClick on turn change
    handleBoxClick(event){
        this.isGameOn = true;
        // Current box id
        let boxId = event.currentTarget.getAttribute("data-Id");
        let boxindex =  parseInt(boxId.split('-')[1]);
        // Below action execute only when GameOver is false
        if(!this.isGameOver){
            // computer turn if this.level.includes('CPU')
            this.computerturn = true;
            this.displayTurnVal(boxindex);
        }
    }
    
    displayTurnVal(boxindex){
        // represent current turn values over all index
        let currentturnindex = this.currentBoardIndexValue.indexOf(boxindex);
        this.currentBoardIndexValue[currentturnindex] = this.turn;

        this.updateSelectedBoxProperties(boxindex);
        // below actions execute only when game not over
        if(!this.checkWinner()){
            // Change turn value 
            this.swapTurn();
            // Avoid adding CSS for Next turn without onclick
            this.template.querySelector('[data-id=box-'+boxindex+']').classList.remove(this.turn+'-turn-color')
            // play sound on each turn 
            this.playTrack(this.turn_change_track);
            // Next turn value on screen
            this.template.querySelector('[data-id=player-turn-text]').textContent = this.turn+' turn';
            // checkDrawMatch
            this.checkDrawMatch();
            // this.template.querySelector('[data-id=won-img]').classList.add('addWidth')
            // CPU turn
            if(this.level.includes('CPU')
                && this.computerturn){
                    this.isLoading = true;
                    this.computerTurn(boxindex);
            }
        }
    }

    // everything related to selected box
    updateSelectedBoxProperties(boxindex){
        // Display Turn Value inside box
        let displayTurnImg = this.turn === 'X' ? this.X_icon : this.O_icon;
        // text in a span
        // this.template.querySelector('[data-id=box-'+boxindex+']').textContent = this.turn;
        // image in a span
        this.template.querySelector('[data-id=box-'+boxindex+']').innerHTML = "<img src="+displayTurnImg+" class="+this.turn+">";
        // avoid overriding filled box
        this.template.querySelector('[data-id=box-'+boxindex+']').style = "pointer-events: none;";
        // add CSS to turn color based on X/O
        this.template.querySelector('[data-id=box-'+boxindex+']').classList.add(this.turn+'-turn-color');
    }

    // Computer turn for Easy and Hard level
    computerTurn(boxindex){
        // not to make computer turn until next manual turn
        this.computerturn = false;
        setTimeout(() => {
            // player edge move make cpu move adjacent to it 
            if(this.level.includes('Hard')){
                if(this.isFirstTurn){
                    this.isFirstTurn = false;
                    if(this.edgemoves.includes(boxindex)){
                        switch(boxindex){
                            case 1:
                                this.displayTurnVal(0); 
                                break;
                            case 3:
                            case 7:
                                this.displayTurnVal(6);
                                break;
                            case 5:
                                this.displayTurnVal(2); 
                                break;
                        }
                    }
                    // player corner move make cpu move center
                    else if(this.cornermoves.includes(boxindex)){
                        this.displayTurnVal(4); 
                    }
                    // player center move make cpu move corner
                    else if(this.centermove == boxindex){
                        let cornerbox = this.getRandomIndex(this.cornermoves);
                        this.displayTurnVal(cornerbox); 
                    }
                }else{
                    // finding the ultimate play on the game that favors the computer
                    var bestSpot = this.minimax(this.currentBoardIndexValue, this.turn);
                    this.displayTurnVal(bestSpot.index); 
                }
            }
            // Easy level of Computer 
            else{
                // get empty boxes
                let remainingbox = this.getEmptyIndexies();
                // get random index for computer turn
                boxindex = this.getRandomIndex(remainingbox);
                // Call displayTurnVal method to select Next turn 
                this.displayTurnVal(boxindex); 
            }
        }, 500);
        this.isLoading = false;
    }

    // keep track of function calls
    fc = 0;

    // the main minimax function
    minimax(newBoard, player){
        //keep track of function calls;
        this.fc = this.fc+1;
        //available spots
        var availSpots = this.getEmptyIndexies(newBoard);
        // checks for the terminal states such as win, lose, and tie and returning a value accordingly
        if (this.winning(newBoard, 'X')){
        return {score:-10};
        }
        else if (this.winning(newBoard, 'O')){
        return {score:10};
        }
        else if (availSpots.length === 0){
            return {score:0};
        }
        // an array to collect all the objects
        var moves = [];
        // loop through available spots
        for (var i = 0; i < availSpots.length; i++){
            //create an object for each and store the index of that spot that was stored as a number in the object's index key
            var move = {};
                move.index = newBoard[availSpots[i]];
            // set the empty spot to the current player
            newBoard[availSpots[i]] = player;

            //if collect the score resulted from calling minimax on the opponent of the current player
            if (player == 'O'){
                var result = this.minimax(newBoard, 'X');
                move.score = result.score;
            }
            else{
                var result = this.minimax(newBoard, 'O');
                move.score = result.score;
            }
            
            //reset the spot to empty
            newBoard[availSpots[i]] = move.index;
        
            // push the object to the array
            moves.push(move);
        }
    
        // if it is the computer's turn loop over the moves and choose the move with the highest score
        var bestMove;
        if(player === 'O'){
            var bestScore = -10000;
            for(var i = 0; i < moves.length; i++){
                if(moves[i].score > bestScore){
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }else{
        // else loop over the moves and choose the move with the lowest score
        var bestScore = 10000;
            for(var i = 0; i < moves.length; i++){
                if(moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
                }
            }
        }
        // return the chosen move (object) from the array to the higher depth
        return moves[bestMove];
    }

    // winning combinations using the board indexies for instace the first win could be 3 xes in a row
    winning(board, player){
    if (
           (board[0] == player && board[1] == player && board[2] == player) ||
           (board[3] == player && board[4] == player && board[5] == player) ||
           (board[6] == player && board[7] == player && board[8] == player) ||
           (board[0] == player && board[3] == player && board[6] == player) ||
           (board[1] == player && board[4] == player && board[7] == player) ||
           (board[2] == player && board[5] == player && board[8] == player) ||
           (board[0] == player && board[4] == player && board[8] == player) ||
           (board[2] == player && board[4] == player && board[6] == player)
           ) {
           return true;
       } 
       return false;
   }

    // get remaining empty box index values
    getEmptyIndexies(){
        return this.currentBoardIndexValue.filter(i => i != 'X' && i != 'O');
    }

    // get a random index from an remainingbox array
    getRandomIndex(remainingbox) {
        const randomboxIndex = Math.floor(Math.random() * remainingbox.length);
        const indexval = remainingbox[randomboxIndex];
        return indexval;
    }
    
    // check winner
    checkWinner(){
        // to avoid dual line winning combination (ex: When both 0, 1, 2 and 1, 4, 7 having same values)
        var winnotfound = true;
        // Check for winning Combination
        this.winCombination.forEach(e => {
            if(winnotfound && this.getWinningCombination(e)){
                    // Game Over true
                    this.isGameOver = true;
                    // Remove player-won value text
                    this.template.querySelector('[data-id=player-won]').textContent = this.turn;
                    // Remove Next turn value text
                    this.template.querySelector('[data-id=player-turn-text]').textContent = '';
                    // add pulse CSS to highligh winning combination boxes
                    this.addPulseCssForMatchedPath(e);
                    //Congrats Img
                    this.displayCongratsImg();
                    // add CSS to cross line 
                    // this.displayCrossLine(e);
                    // Update players Score
                    this.updatePoints();
                    // play winner sound track
                    this.playTrack(this.winner_track);
                    winnotfound = false
            }
        });
        return this.isGameOver;
    }

    getWinningCombination(e){
        if(this.template.querySelector('[data-id=box-'+e[0]+']').innerHTML
            && this.template.querySelector('[data-id=box-'+e[1]+']').innerHTML
            && this.template.querySelector('[data-id=box-'+e[2]+']').innerHTML
            && (this.template.querySelector('[data-id=box-'+e[0]+']').innerHTML == this.template.querySelector('[data-id=box-'+e[1]+']').innerHTML)
            && (this.template.querySelector('[data-id=box-'+e[1]+']').innerHTML == this.template.querySelector('[data-id=box-'+e[2]+']').innerHTML)){
                return true;
        }
    }

    // add pulse CSS to highligh winning combination boxes
    addPulseCssForMatchedPath(e){
        this.template.querySelector('[data-id=box-'+e[0]+']').classList.add('boxPulse');
        this.template.querySelector('[data-id=box-'+e[1]+']').classList.add('boxPulse');
        this.template.querySelector('[data-id=box-'+e[2]+']').classList.add('boxPulse');
    }

    //Congrats Img
    displayCongratsImg(){
        // img when cpu won in beast level
        if(this.level.includes('Hard')){
            this.template.querySelector('[class=levelimg]').style.width = `155px`;
            this.template.querySelector('[data-id=hu-lose]').textContent = 'You Lose!';
            this.showToast('You Lose!', 'Restart game and play again!', 'info');
        }
        // img for easy level and play with friend
        else{
            this.template.querySelector('[class=congratsImg]').style.width = `300px`;
            if(this.level.includes('Friend')){
                this.showToast('\"'+this.turn+'\" Won', 'Congratulations!', 'success');
            }else{
                this.showToast('You Won', 'Congratulations!', 'success');
            }
        }
    }

    // DEPRECATED : display line for winning combination boxes
    displayCrossLine(e){
        this.template.querySelector('[class=crossline]').style.width = `15rem`;
        this.template.querySelector('[class=crossline]').style.transform = `translate(${e[3]}vw, ${e[4]}vw) rotate(${e[5]}deg)`;
        // this.template.querySelector('[class=line]').classList.add(this.turn+'-turn-line-color');
    }

    // Update players Score
    updatePoints(){
        this.X_Points = this.turn === 'X' ? this.X_Points + 1 : this.X_Points;
        this.O_Points = this.turn === 'O' ? this.O_Points + 1 : this.O_Points;
    }

    // verify draw match 
    checkDrawMatch(){
        let emptyindexies = this.getEmptyIndexies();
        // if its a draw
        if(!emptyindexies.length){
            // Remove Next turn value text
            this.template.querySelector('[data-id=player-turn-text]').textContent = '';
            // Dsiplay Result as "Draw"
            this.template.querySelector('[data-id=player-won]').textContent = 'Draw';
            this.showToast('Draw Match', 'Restart game and play again!', 'warning');
        }
    }

    // handle Restart on "Restart Game" and "level" options change
    handleRestart(){
        this.isFirstTurn = true;
        this.currentBoardIndexValue = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        this.isLoading = true;
        this.isGameOver = false;
        this.isGameOn = false;
        this.turn = 'X';
        // Play restart track
        this.playTrack(this.restart_track);
        // Remove player-won value text
        this.template.querySelector('[data-id=player-won]').textContent = '';
        // Remove Next turn value text
        this.template.querySelector('[data-id=player-turn-text]').textContent = this.turn+' turn';
        // hide congrats img
        this.template.querySelector('[class=congratsImg]').style.width = `0`;
        // hide beast level img
        this.template.querySelector('[class=levelimg]').style.width = `0`;
        this.template.querySelector('[data-id=hu-lose]').textContent = '';
        // hide cross line
        // this.template.querySelector('[class=crossline]').style.width = `0`;
        for (let index = 0; index < 9; index++) {
            // Remove X / O value from all boxes
            this.template.querySelector('[data-id=box-'+index+']').innerHTML = '';
            // make empty boxes clickable
            this.template.querySelector('[data-id=box-'+index+']').style = "pointer-events: all;";
            // Remove Pulse CSS from all boxes
            this.template.querySelector('[data-id=box-'+index+']').classList.remove('boxPulse');
        }
        this.isLoading = false;
    }

    // Play track sound
    playTrack(trackValue){
        this.muted ? '' :  new Audio(trackValue).play();
    }

    // toast message
    showToast(title, msg, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: msg,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
    
}