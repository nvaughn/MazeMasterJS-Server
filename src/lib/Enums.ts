// various states that the Player might be in
export enum TROPHY_IDS {
    WASTED_TIME = 0,
    NERVOUS_WALK,
    WATCHING_PAINT_DRY,
    WISHFUL_THINKING,
    WISHFUL_DYING,
    WINNER_WINNER_CHEDDAR_DINNER,
    FLAWLESS_VICTORY,
    YOU_FOUGHT_THE_WALL,
    SPINNING_YOUR_WHEELS,
    SCRIBBLER,
    PAPERBACK_WRITER,
    JUMPING_JACK_FLASH,
    KICKING_UP_DUST,
    MIGHTY_MOUSE,
    SHORTCUTTER,
    THE_LONG_WAY_HOME,
    THE_LONGER_WAY_HOME,
    THE_LONGEST_WAY_HOME,
    LIGHT_AT_THE_END,
    DAZED_AND_CONFUSED,
    DOUBLE_BACKER,
    LOOPER,
    YOU_FELL_FOR_IT,
    TOO_HOT_TO_HANDLE,
    OUT_OF_MOVES
}

// various states that players may find themselves in
export enum PLAYER_STATES {
    NONE = 0,
    STANDING = 1,
    SITTING = 2,
    LYING = 4,
    STUNNED = 8,
    BLIND = 16,
    BURNING = 32,
    LAMED = 64,
    BEARTRAPPED = 128,
    SLOWED = 256,
    DEAD = 512
}

// Cardinal directions used for movement, exits, and other direction-based functions
export enum DIRS {
    NONE = 0,
    NORTH = 1,
    SOUTH = 2,
    EAST = 4,
    WEST = 8
}

// CELL TAGS
export enum CELL_TAGS {
    NONE = 0,
    START = 1,
    FINISH = 2,
    PATH = 4,
    CARVED = 8,
    LAVA = 16
}

export enum CELL_TRAPS {
    NONE = 0,
    PIT = 1,
    BEARTRAP = 2,
    TARPIT = 4,
    FLAMETHOWER = 8
}

// enumeration of possible game results
export enum GAME_RESULTS {
    IN_PROGRESS = 0,
    OUT_OF_MOVES,
    OUT_OF_TIME,
    DEATH_TRAP,
    DEATH_POISON,
    DEATH_LAVA,
    WIN,
    WIN_FLAWLESS,
    ABANDONED
}

// enumeration of possible game states
export enum GAME_STATES {
    NEW = 0,
    IN_PROGRESS,
    FINISHED,
    ABORTED,
    ERROR
}

// database types/names
export enum DATABASES {
    MAZES = 0,
    SCORES,
    TEAMS
}
