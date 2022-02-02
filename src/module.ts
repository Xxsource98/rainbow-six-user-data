import axios from 'axios'

type RainbowSixGlobalStatsType = {
    kills: number,
    deaths: number,
    kd: number,
    wins: number,
    wl: number
    headshots: number,
    dbnos: number,
    meleeKills: number,
    playtime: number,
    experience?: number
}

type RainbowSixGeneralStatsType = {
    assists: number,
    barricadesDeployed: number,
    blindKills: number,
    bulletsFired: number,
    bulletsHit: number,
    distanceTravelled: number,
    draws: number,
    gadgetsDestroyed: number,
    gamesPlayed: number,
    losses: number,
    penetrationKills: number,
    rappelBreaches: number,
    reinforcementsDeployed: number,
    revives: number,
    suicides: number,
} & RainbowSixGlobalStatsType

type RainbowSixQueueStatsType = {
    deaths: number,
    draws: number,
    gamesPlayed: number,
    kd: number,
    kills: number,
    losses: number,
    playtime: number,
    wins: number,
    wl: number
}

type RainbowSixGamemodeStatsType = {
    bestScore: number,
    gamesPlayed: number,
    losses: number,
    playtime: number,
    wins: number,
    wl: number,
    killsAsAttackerInObjective?: number,
    killsAsDefenderInObjective?: number,
    timesObjectiveSecured?: number,
    extractionsDenied?: number
}

type RainbowSixStatsType = {
    generalStats: RainbowSixGeneralStatsType,
    casualStats: RainbowSixQueueStatsType,
    rankedStats: RainbowSixQueueStatsType,
    otherStats: RainbowSixQueueStatsType,
    gamemodeStats: {
        bomb: RainbowSixGamemodeStatsType,
        secureArea: RainbowSixGamemodeStatsType,
        hostage: RainbowSixGamemodeStatsType
    }
}

type RainbowSixOperatorAbilityType = {
    key: string,
    title: string,
    value: number
}

type RainbowSixOperatorType = {
    losses: number,
    abilities: RainbowSixOperatorAbilityType[],
    operator: {
        name: string,
        internalName: string,
        role: string,
        ctu: string,
        images: {
            badge: string,
            bust: string,
            figure: string
        }
    }
} & RainbowSixGlobalStatsType

export type RainbowSixUserDataType = {
    username: string,
    platform: string,
    id: string,
    avatarUrl: string,
    lastUpdated: Date,
    level: number,
    lootboxProbability: number,
    totalXP: number,
    stats: RainbowSixStatsType,
    operators: RainbowSixOperatorType[]
}

type ResolveType = {
    success: boolean,
    error: {
        message: string
    }
}

type IDResolveDataType = { id: string }
type IDResolveType = ResolveType & { data: IDResolveDataType }
type UserResolveType = ResolveType & { data: RainbowSixUserDataType }
type AnyResolveType = ResolveType & { data: any }
type PlatformType = 'pc' | 'ps4' | 'xone'

class RainbowSixSiegeUserData {
    static #RejectError(resolveError: string): AnyResolveType {
        return {
            success: false,
            error: {
                message: resolveError!
            },
            data: {}
        }
    }

    static #ResolveIDData(isSuccess: boolean, resolveData: IDResolveDataType, resolveError?: string): IDResolveType {
        return {
            success: isSuccess,
            error: {
                message: resolveError!
            },
            data: resolveData
        }
    }
    
    static #ResolveUserType(isSuccess: boolean, resolveData?: RainbowSixUserDataType, resolveError?: string): UserResolveType {
        return {
            success: isSuccess,
            error: {
                message: resolveError!
            },
            data: resolveData! || {}
        }
    }

    static #GetOperatorsData(operatorsArray: []): RainbowSixOperatorType[] {
        const operators: RainbowSixOperatorType[] = []
    
        operatorsArray.forEach((operator: any) => {
            const abilitiesArray: RainbowSixOperatorAbilityType[] = operator.abilities.map((ability: any) => {
                return {
                    key: ability.key,
                    title: ability.title,
                    value: ability.value
                }
            })
    
            operators.push({
                kills: operator.kills,
                deaths: operator.deaths,
                kd: operator.kd,
                wins: operator.wins,
                losses: operator.losses,
                wl: operator.wl,
                headshots: operator.headshots,
                dbnos: operator.dbnos,
                meleeKills: operator.melee_kills,
                experience: operator.experience,
                playtime: operator.playtime,
                abilities: abilitiesArray,
                operator: {
                    name: operator.operator.name,
                    internalName: operator.operator.internal_name,
                    role: operator.operator.role,
                    ctu: operator.operator.ctu,
                    images: {
                        badge: operator.operator.images.badge,
                        bust: operator.operator.images.bust,
                        figure: operator.operator.images.figure
                    }
                }
            })
        });
    
        return operators
    }

    static async GetPlayerID (name: string, platform: PlatformType): Promise<AnyResolveType> {
        return new Promise(async (resolve, reject) => {
            await axios.get(`https://r6stats.com/api/player-search/${name}/${platform}`).then(returnData => {
                const axiosData = returnData.data
                const returnObject = axiosData.data as object
    
                if (returnObject.toString()) {
                    const resolveData = {
                        // @ts-ignore
                        id: returnObject[0].ubisoft_id
                    }

                    resolve(this.#ResolveIDData(true, resolveData))
                }
                else {
                    reject(this.#RejectError('Player ID Not Found'))
                }
            }).catch(ex => reject(this.#RejectError(ex)))
        })
    }
    
    static async GetPlayerData(PlayerID: string): Promise<UserResolveType> {
        return new Promise(async (resolve, reject) => {
            await axios.get(`https://r6stats.com/api/stats/${PlayerID}`).then(returnData => {
                const axiosData = returnData.data
                const object = axiosData.data
    
                const OperatorsData = this.#GetOperatorsData(object.operators)
    
                const resolveData: RainbowSixUserDataType = {
                    username: object.username,
                    platform: object.platform,
                    id: PlayerID,
                    avatarUrl: object.avatar_url_256,
                    lastUpdated: object.last_updated,
                    level: object.progression.level,
                    lootboxProbability: object.progression.lootbox_probability,
                    totalXP: object.progression.total_xp,
                    stats: {
                        generalStats: {
                            assists: object.stats[0].general.assists,
                            barricadesDeployed: object.stats[0].general.barricades_deployed,
                            blindKills: object.stats[0].general.blind_kills,
                            bulletsFired: object.stats[0].general.bullets_fired,
                            bulletsHit: object.stats[0].general.bullets_hit,
                            dbnos: object.stats[0].general.dbnos,
                            deaths: object.stats[0].general.deaths,
                            distanceTravelled: object.stats[0].general.distance_travelled,
                            draws: object.stats[0].general.draws,
                            gadgetsDestroyed: object.stats[0].general.gadgets_destroyed,
                            gamesPlayed: object.stats[0].general.games_played,
                            headshots: object.stats[0].general.headshots,
                            kd: object.stats[0].general.kd,
                            kills: object.stats[0].general.kills,
                            losses: object.stats[0].general.losses,
                            meleeKills: object.stats[0].general.melee_kills,
                            penetrationKills: object.stats[0].general.penetration_kills,
                            playtime: object.stats[0].general.playtime,
                            rappelBreaches: object.stats[0].general.rappel_breaches,
                            reinforcementsDeployed: object.stats[0].general.reinforcements_deployed,
                            revives: object.stats[0].general.revives,
                            suicides: object.stats[0].general.suicides,
                            wins: object.stats[0].general.wins,
                            wl: object.stats[0].general.wl
                        },
                        casualStats: {
                            deaths: object.stats[0].queue.casual.deaths,
                            draws: object.stats[0].queue.casual.draws,
                            gamesPlayed: object.stats[0].queue.casual.games_played,
                            kd: object.stats[0].queue.casual.kd,
                            kills: object.stats[0].queue.casual.kills,
                            losses: object.stats[0].queue.casual.losses,
                            playtime: object.stats[0].queue.casual.playtime,
                            wins: object.stats[0].queue.casual.wins,
                            wl: object.stats[0].queue.casual.wl
                        },
                        rankedStats: {
                            deaths: object.stats[0].queue.ranked.deaths,
                            draws: object.stats[0].queue.ranked.draws,
                            gamesPlayed: object.stats[0].queue.ranked.games_played,
                            kd: object.stats[0].queue.ranked.kd,
                            kills: object.stats[0].queue.ranked.kills,
                            losses: object.stats[0].queue.ranked.losses,
                            playtime: object.stats[0].queue.ranked.playtime,
                            wins: object.stats[0].queue.ranked.wins,
                            wl: object.stats[0].queue.ranked.wl
                        },
                        otherStats: {
                            deaths: object.stats[0].queue.other.deaths,
                            draws: object.stats[0].queue.other.draws,
                            gamesPlayed: object.stats[0].queue.other.games_played,
                            kd: object.stats[0].queue.other.kd,
                            kills: object.stats[0].queue.other.kills,
                            losses: object.stats[0].queue.other.losses,
                            playtime: object.stats[0].queue.other.playtime,
                            wins: object.stats[0].queue.other.wins,
                            wl: object.stats[0].queue.other.wl
                        },
                        gamemodeStats: {
                            bomb: {
                                bestScore: object.stats[0].gamemode.bomb.best_score,
                                gamesPlayed: object.stats[0].gamemode.bomb.games_played,
                                losses: object.stats[0].gamemode.bomb.losses,
                                playtime: object.stats[0].gamemode.bomb.playtime,
                                wins: object.stats[0].gamemode.bomb.wins,
                                wl: object.stats[0].gamemode.bomb.wl
                            },
                            secureArea: {
                                bestScore: object.stats[0].gamemode.secure_area.best_score,
                                gamesPlayed: object.stats[0].gamemode.secure_area.games_played,
                                killsAsAttackerInObjective: object.stats[0].gamemode.secure_area.kills_as_attacker_in_objective,
                                killsAsDefenderInObjective: object.stats[0].gamemode.secure_area.kills_as_defender_in_objective,
                                losses: object.stats[0].gamemode.secure_area.losses,
                                playtime: object.stats[0].gamemode.secure_area.playtime,
                                timesObjectiveSecured: object.stats[0].gamemode.secure_area.times_objective_secured,
                                wins: object.stats[0].gamemode.secure_area.wins,
                                wl: object.stats[0].gamemode.secure_area.wl
                            },
                            hostage: {
                                bestScore: object.stats[0].gamemode.hostage.best_score,
                                gamesPlayed: object.stats[0].gamemode.hostage.games_played,
                                losses: object.stats[0].gamemode.hostage.losses,
                                playtime: object.stats[0].gamemode.hostage.playtime,
                                extractionsDenied: object.stats[0].gamemode.hostage.extractions_denied,
                                wins: object.stats[0].gamemode.hostage.wins,
                                wl: object.stats[0].gamemode.hostage.wl
                            },
                        }
                    },
                    operators: OperatorsData
                }
    
                resolve(this.#ResolveUserType(true, resolveData))
            }).catch(ex => {
                if (ex.response.status === 400) {
                    reject(this.#RejectError('User Not Found!'))
                }

                reject(this.#RejectError(ex))
            })
        })
    }
}

export default RainbowSixSiegeUserData