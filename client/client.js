/**
 * Script: client.js
 * Author: Anurag Mishra
 * Date : 08/04/2017
 * Description : file contains bootstrapper code for the application
 */

"use strict";
let countMatches,updateSquares;

document.addEventListener('DOMContentLoaded', function(){ 
    try{
        let errorMessage = document.getElementById(DOM_LIST.ERROR);
        let status = document.getElementById(DOM_LIST.STATUS);
        let startButton = document.getElementById(DOM_LIST.START);
        let winner = document.getElementById(DOM_LIST.WINNER);
        let progress = document.getElementById(DOM_LIST.PROGRESS);
        document.getElementById("start").addEventListener("click", async function () {
            startButton.disabled="disabled";
            var teamsPerMatch = document.getElementById(DOM_LIST.TEAMS_PER_MATCH).value;
            var numberOfTeams = document.getElementById(DOM_LIST.NUMBER_OF_TEAMS).value;

            winner.innerText = "";
            errorMessage.innerText="";
            try {
                status.innerText = INFO_MESSAGE.WAIT;
                await simulateTournament(teamsPerMatch, numberOfTeams);
                
                startButton.disabled="";
            } catch (exception) {
                errorMessage.innerText = `${exception.message}`;
                progress.innerText = "";
                status.innerText = "";
                startButton.disabled="";
            }
        });
    }
    catch(ex){
        console.log("Exception while DOMContentLoaded" + ex.toString());
    }
}, false);

countMatches = (teamsPerMatch, numberOfTeams) => {
    let rounder = numberOfTeams/teamsPerMatch;
    let matches = rounder;
    while (rounder > 1) {
        rounder /= teamsPerMatch;
        matches += rounder;
    }
    return matches;
}

updateSquares = (completed, total) => {
    let text = "";
    for (let i = 0; i < total; i++) {
        if (i < completed) {
            text += "■ ";
        }else{
            text += "□ ";
        }
    }
    document.getElementById(DOM_LIST.PROGRESS).innerText = text;
}

async function simulateTournament(teamsPerMatch, numberOfTeams) {
    //tournament created
    const tournament = new Tournament(teamsPerMatch, numberOfTeams);

    //total matches to be played for winner deciding
    const TOTAL_MATCHES = countMatches(teamsPerMatch, numberOfTeams);

    let completedMatch = 0;
    updateSquares(completedMatch, TOTAL_MATCHES);

    let matches = await tournament.init();

    let round = 0;
    let currentMatches = numberOfTeams / teamsPerMatch;

    // Get all scores for teams
    let teams = await tournament.getAllTeamData(numberOfTeams);

    while (currentMatches !== 1) {

        // Get score for each match
        let matchScoreList = await tournament.getAllMatchScores(
            matches, round
        );

        // Get the match score after the match is done
        completedMatch += matches.length;
        updateSquares(completedMatch, TOTAL_MATCHES);

        // Get winner for this round
        let winnerScoreList = await tournament.getAllWinners(
            matches, matchScoreList, teams
        );

        currentMatches /= teamsPerMatch;
        round++;

        matches = tournament.createRound(
            winnerScoreList, teams, matches
        );
    }

    let finalMatch = matches[0];
    playFinalMatch(finalMatch,round, tournament, completedMatch, TOTAL_MATCHES, teams);

}

async function playFinalMatch(finalMatch, round, tournament, completedMatch, totalMatches, teamList){
    // Get the final winner
    let finalMatchScore = await tournament.getSingleMatchScore(finalMatch.match, round);
    let status = document.getElementById(DOM_LIST.STATUS);
    // Final Match
    updateSquares(completedMatch + 1, totalMatches);

    let winnerScores = [];
    for (let team of finalMatch.teamIds) {
        winnerScores.push(teamList[team].score);
    }

    let winnerScore = await tournament.getWinningScore(finalMatchScore, winnerScores);
    let winner = "";

    for (let team of finalMatch.teamIds) {
        if (teamList[team].score == winnerScore) {
            winner = teamList[team].name;
            break;
        }
    }
    status.innerText = "";
    document.getElementById(DOM_LIST.WINNER).innerText = winner;
}

