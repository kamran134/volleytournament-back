import { ITournamentTable } from "../models/tournamentTable.model";
import TournamentModel, { ITournament } from "../models/tournament.model";
import GameModel from "../models/game.model";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";
import { logger } from "../utils/logger";
import { ITeam, ITeamStats } from "../models/team.model";

export class StatService {
    constructor() {}

    async getTournamentTable(tournamentId: string): Promise<ITournamentTable> {
        try {
            const tournament = await TournamentModel.findById(tournamentId).populate('teams') as ITournament;
            if (!tournament) {
                throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 404);
            }

            const games = await GameModel.find({ tournament: tournamentId }).populate('team1 team2 tour');
            const teamsStats: ITeamStats[] = (tournament.teams as ITeam[]).map(team => ({
                team,
                points: 0,
                matchesPlayed: 0,
                matchesWon: 0,
                matchesLost: 0,
                matchesDrawn: 0
            }));

            games.forEach(game => {
                const team1 = teamsStats.find(ts => (ts.team as ITeam)._id.toString() === game.team1._id.toString());
                const team2 = teamsStats.find(ts => (ts.team as ITeam)._id.toString() === game.team2._id.toString());

                if (!team1 || !team2) {
                    logger.warn(`Team not found for game ${game._id}`);
                    return;
                }

                // algorithm to calculate points and matches:
                // if 2:0 winner gets 3 points, loser gets 0
                // if 2:1 winner gets 2 points, loser gets 1
                // if 3:0 or 3:1 winner gets 3 points, loser gets 0
                // if 3:2 winner gets 2 points, loser gets 1
                if (game.winner) {
                    if (game.winner.toString() === game.team1._id.toString()) {
                        if (game.scoreTeam1 === 2 && game.scoreTeam2 === 0) {
                            team1.points += 3; // Win
                        }
                        else if (game.scoreTeam1 === 2 && game.scoreTeam2 === 1) {
                            team1.points += 2; // Win
                            team2.points += 1; // Loss
                        } else if (game.scoreTeam1 === 3 && game.scoreTeam2 === 0) {
                            team1.points += 3; // Win
                        } else if (game.scoreTeam1 === 3 && game.scoreTeam2 === 1) {
                            team1.points += 3; // Win
                        } else if (game.scoreTeam1 === 3 && game.scoreTeam2 === 2) {
                            team1.points += 2; // Win
                            team2.points += 1; // Loss
                        }

                        team1.matchesWon += 1;
                        team2.matchesLost += 1;
                    } else if (game.winner.toString() === game.team2._id.toString()) {
                        if (game.scoreTeam2 === 2 && game.scoreTeam1 === 0) {
                            team2.points += 3; // Win
                        }
                        else if (game.scoreTeam2 === 2 && game.scoreTeam1 === 1) {
                            team2.points += 2; // Win
                            team1.points += 1; // Loss
                        } else if (game.scoreTeam2 === 3 && game.scoreTeam1 === 0) {
                            team2.points += 3; // Win
                        } else if (game.scoreTeam2 === 3 && game.scoreTeam1 === 1) {
                            team2.points += 3; // Win
                        } else if (game.scoreTeam2 === 3 && game.scoreTeam1 === 2) {
                            team2.points += 2; // Win
                            team1.points += 1; // Loss
                        }

                        team2.matchesWon += 1;
                        team1.matchesLost += 1;
                    }

                    team1.matchesPlayed += 1;
                    team2.matchesPlayed += 1;
                }
            });

            // if points are equal, sort by wins, then by matches played
            teamsStats.sort((a, b) => {
                if (b.points === a.points) {
                    if (b.matchesWon === a.matchesWon) {
                        return b.matchesPlayed - a.matchesPlayed;
                    }
                    return b.matchesWon - a.matchesWon;
                }
                return b.points - a.points;
            });
            // teamsStats.sort((a, b) => b.points - a.points);

            return { tournament, teams: teamsStats, games };
        } catch (error) {
            logger.error('Error fetching tournament table:', error);
            throw new AppError(MESSAGES.TOURNAMENT.TABLE_FETCH_FAILED, 500);
        }
    }
}