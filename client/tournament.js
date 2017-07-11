/**
 * Script: client.js
 * Author: Anurag Mishra
 * Date : 08/04/2017
 * Description : file contains code for tournament
 */

"use strict";

class Tournament {

    constructor(teamsPerMatch, numberOfTeams) {
        if (!teamsPerMatch || !numberOfTeams || (teamsPerMatch == 1)){
            throw new Error(ERROR_MESSAGE.TEAMS_PER_MATCH);
        }
        this._teamsPerMatch = teamsPerMatch;
        this._numberOfTeams = numberOfTeams;
        this._tournamentId = null;
    }

    static _getErrorMessage(responseData, responseJSON) {
        let message  = ERROR_MESSAGE.NETWORK_ERROR + responseData.status;
        if (responseJSON.hasOwnProperty("error")) {
            if (responseJSON.hasOwnProperty("message")) {
                message = responseJSON.message
            }
        }
        return message;
    }

    init() {
         let p = new Promise(async (resolve, reject) => {
            try {
                let tournamentData = await Ajax.post(API_ENDPOINTS.TOURNAMENT, {
                    teamsPerMatch: this._teamsPerMatch,
                    numberOfTeams: this._numberOfTeams,
                });
                let responseJSON = await tournamentData.json();
                this._tournamentId = responseJSON.tournamentId;
                if (tournamentData.status !== 200) {
                    let message = getError(tournamentData, responseJSON);
                    // let message = Tournament._getErrorMessage(
                    //     tournamentData, responseJSON
                    // );
                    return reject(new Error(message));
                }
                return resolve(responseJSON.matchUps);
            } catch (exception) {
                return reject(exception);
            }
        });
        return p;
    }

    getSingleTeamData(teamId) {
        let p = new Promise(async (resolve, reject) => {
            try {
                if (this._tournamentId == null) {
                    return reject(new Error(ERROR_MESSAGE.TOURNAMENT_ID));
                }
                let teamData = await Ajax.get(API_ENDPOINTS.TEAM, {
                    tournamentId: this._tournamentId,
                    teamId: teamId
                });
                let teamJSON = await teamData.json();
                if (teamData.status !== 200) {
                    let message = getError(teamData,teamJSON);
                    // let message = Tournament._getErrorMessage(
                    //     teamData, teamJSON
                    // );
                    return reject(new Error(message));
                }
                return resolve(teamJSON);
            } catch (exception) {
                return reject(exception);
            }
        });
        return p;
    }

    getSingleMatchScore(match, round) {
        let p = new Promise(async (resolve, reject) => {
            try {
                if (this._tournamentId == null) {
                    return reject(new Error(ERROR_MESSAGE.TOURNAMENT_ID));
                }
                let matchData = await Ajax.get(API_ENDPOINTS.MATCH, {
                    tournamentId: this._tournamentId,
                    match: match,
                    round: round
                });
                let matchJSON = await matchData.json();
                if (matchData.status !== 200) {
                    let message = getError(matchData,matchJSON);
                    // let message = Tournament._getErrorMessage(
                    //     matchData, matchJSON
                    // );
                    return reject(new Error(message));
                }
                return resolve(matchJSON.score);
            } catch (exception) {
                return reject(exception);
            }
        });
        return p;
    }

    getWinningScore(matchScore, teamScores) {
        let p = new Promise(async (resolve, reject) => {
            try {
                if (this._tournamentId == null) {
                    return reject(new Error(ERROR_MESSAGE.TOURNAMENT_ID));
                }
                let winningData = await Ajax.get(API_ENDPOINTS.WINNER, {
                    tournamentId: this._tournamentId,
                    matchScore: matchScore,
                    teamScores: teamScores
                });
                let winningJSON = await winningData.json();
                if (winningData.status !== 200) {
                    let message = getError(winningData,winningJSON);
                    // let message = Tournament._getErrorMessage(
                    //     winningData, winningJSON
                    // );
                    return reject(new Error(message));
                }
                return resolve(winningJSON.score);
            } catch (exception) {
                return reject(exception);
            }
        });
        return p;
    }

    getAllTeamData(numberOfTeams) {
        let teamPromiseList = [];
        for (let i = 0; i < numberOfTeams; i++) {
            teamPromiseList.push(this.getSingleTeamData(i));
        }
        return Promise.all(teamPromiseList);
    }

    getAllMatchScores(matches, round) {
        let matchPromiseList = [];
        for (let match of matches) {
            matchPromiseList.push(this.getSingleMatchScore(match.match, round));
        }
        return Promise.all(matchPromiseList);
    }

    getAllWinners(matches, matchScores, teams) {
        let winnersPromiseList = [];
        for (let match of matches) {
            let matchScore = matchScores[match.match];
            let teamScores = [];
            for (let i = 0; i < this._teamsPerMatch; i++) {
                teamScores.push(teams[match.teamIds[i]].score);
            }
            winnersPromiseList.push(this.getWinningScore(matchScore, teamScores))
        }
        return Promise.all(winnersPromiseList);
    }

    createRound(winnerScoreList, teamList, previousMatchList) {
        let newList = [];
        let collection = [];
        for (let i = 0; i < previousMatchList.length; i++) {
            for (let j = 0; j < previousMatchList[i].teamIds.length; j++) {
                if (teamList[previousMatchList[i].teamIds[j]].score ==
                    winnerScoreList[i]
                ) {
                    collection.push(teamList[previousMatchList[i].teamIds[j]].teamId);
                    // If array is 2 then append
                    if ((i + 1) % this._teamsPerMatch === 0) {
                        newList.push({
                            match: newList.length,
                            teamIds: collection
                        });
                        // Reset the bank of teams
                        collection = [];
                    }
                    // We've found the winner of this previous match
                    // don't search anymore
                    break;
                }
            }
        }
        return newList;
    }
}
