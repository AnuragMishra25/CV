/**
 * Script: constants.js
 * Author: Anurag Mishra
 * Date : 08/04/2017
 * Description : Constant file for config purpose
 */

const DOM_LIST = {
    TEAMS_PER_MATCH: "teamsPerMatch",
    NUMBER_OF_TEAMS: "numberOfTeams",
    ERROR: "error",
    STATUS: "status",
    START: "start",
    WINNER: "winner",
    PROGRESS: "progress"
};

const ERROR_MESSAGE = {
    TOURNAMENT_ID: "Invalid Tournament Id",
    TEAMS_PER_MATCH: "Invalid number of teams for teams per match",
    NETWORK_ERROR: "A network error has occurred: Status "
};

const API_ENDPOINTS = {
    TOURNAMENT: "/tournament",
    TEAM: "/team",
    MATCH: "/match",
    WINNER: "/winner"
};

const INFO_MESSAGE ={
    WAIT : "Grab your popcorn, teams are on fire!!"
}