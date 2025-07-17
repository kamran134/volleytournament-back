import { IGame } from "./game.model";
import { ITeam, ITeamStats } from "./team.model";
import { ITournament } from "./tournament.model";

export interface ITournamentTable {
    tournament: ITournament;
    teams: ITeamStats[];
    games: IGame[];
}