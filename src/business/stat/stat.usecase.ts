import { ITournamentTable } from "../../models/tournamentTable.model";
import { StatService } from "../../services/stat.service";

export class StatUseCase {
    constructor(private statService: StatService) {}

    async getTournamentTable(tournamentId: string): Promise<ITournamentTable> {
        return this.statService.getTournamentTable(tournamentId);
    }
}