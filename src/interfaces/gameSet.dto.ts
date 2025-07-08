import { IsMongoId, IsNumber } from "class-validator";

export class CreateGameSetDto {
    @IsMongoId({ message: "Invalid game ID" })
    game!: string;

    @IsMongoId({ message: "Invalid game result ID" })
    gameResult!: string;

    @IsMongoId({ message: "Invalid team ID" })
    team1!: string;

    @IsMongoId({ message: "Invalid team ID" })
    team2!: string;

    @IsNumber({}, { message: "Invalid score for team 1" })
    scoreTeam1!: number;

    @IsNumber({}, { message: "Invalid score for team 2" })
    scoreTeam2!: number;

    @IsMongoId({ message: "Invalid winner ID" })
    winner!: string;
}

export class UpdateGameSetDto {
    @IsMongoId({ message: "Invalid game ID" })
    game?: string;

    @IsMongoId({ message: "Invalid game result ID" })
    gameResult?: string;

    @IsMongoId({ message: "Invalid team ID" })
    team1?: string;

    @IsMongoId({ message: "Invalid team ID" })
    team2?: string;

    @IsNumber({}, { message: "Invalid score for team 1" })
    scoreTeam1?: number;

    @IsNumber({}, { message: "Invalid score for team 2" })
    scoreTeam2?: number;

    @IsMongoId({ message: "Invalid winner ID" })
    winner?: string;
}

export class GameSetFilterDto {
    @IsMongoId({ message: "Invalid game ID" })
    game?: string;

    @IsMongoId({ message: "Invalid game result ID" })
    gameResult?: string;

    @IsMongoId({ message: "Invalid team ID" })
    team1?: string;

    @IsMongoId({ message: "Invalid team ID" })
    team2?: string;

    @IsMongoId({ message: "Invalid winner ID" })
    winner?: string;
}