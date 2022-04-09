import axios from 'axios'

export type RainbowSixGlobalStatsType = {
    kills: number
    deaths: number
    kd: number
    wins: number
    wl: number
    headshots: number
    dbnos: number
    meleeKills: number
    playtime: number
    experience?: number
}

export type RainbowSixGeneralStatsType = {
    assists: number
    barricadesDeployed: number
    blindKills: number
    bulletsFired: number
    bulletsHit: number
    distanceTravelled: number
    draws: number
    gadgetsDestroyed: number
    gamesPlayed: number
    losses: number
    penetrationKills: number
    rappelBreaches: number
    reinforcementsDeployed: number
    revives: number
    suicides: number
} & RainbowSixGlobalStatsType

export type RainbowSixQueueStatsType = {
    deaths: number
    draws: number
    gamesPlayed: number
    kd: number
    kills: number
    losses: number
    playtime: number
    wins: number
    wl: number
}

export type RainbowSixGamemodeStatsType = {
    bestScore: number
    gamesPlayed: number
    losses: number
    playtime: number
    wins: number
    wl: number
    killsAsAttackerInObjective?: number
    killsAsDefenderInObjective?: number
    timesObjectiveSecured?: number
    extractionsDenied?: number
}

export type RainbowSixStatsType = {
    generalStats: RainbowSixGeneralStatsType
    casualStats: RainbowSixQueueStatsType
    rankedStats: RainbowSixQueueStatsType
    otherStats: RainbowSixQueueStatsType
    gamemodeStats: {
        bomb: RainbowSixGamemodeStatsType
        secureArea: RainbowSixGamemodeStatsType
        hostage: RainbowSixGamemodeStatsType
    }
}

export type RainbowSixOperatorAbilityType = {
    key: string
    title: string
    value: number
}

export type RainbowSixOperatorType = {
    losses: number
    abilities: RainbowSixOperatorAbilityType[]
    operator: {
        name: string
        internalName: string
        role: string
        ctu: string
        images: {
            badge: string
            bust: string
            figure: string
        }
    }
} & RainbowSixGlobalStatsType

export type RainbowSixRankType = {
    name: string
    imageURL: string
}

export type RainbowSixSeasonalStatsType = {
    wins: number
    losses: number
    abandons: number
    kills: number
    deaths: number
    prevMMR: number
    MMR: number
    nextMMR: number
    maxMMR: number
    lastMatchMMRChange: number
    rank: RainbowSixRankType
    maxRank: RainbowSixRankType
    championsRankPosition: number
    skillMean: number
    lastMatchSkillMeanChange: number
    skillStandardDeviation: number
    lastMatchSkillStandardDeviationChange: number
    updatedAt: Date | null
}

export type RainbowSixSeasonalRegionsType = {
    seasonName: string
    startDate: Date | null
    endDate: Date | null
    primaryColor: string
    ncsa: RainbowSixSeasonalStatsType
    emea: RainbowSixSeasonalStatsType
    apac: RainbowSixSeasonalStatsType
}

export type RainbowSixAvailableRegions = 'ncsa' | 'emea' | 'apac'

export type RainbowSixUserDataType = {
    region: RainbowSixAvailableRegions
    username: string
    platform: string
    id: string
    avatarUrl: string
    lastUpdated: Date | null
    updateTime: Date | null
    level: number
    lootboxProbability: number
    totalXP: number
    stats: RainbowSixStatsType
    operators: RainbowSixOperatorType[]
    seasonalStats: RainbowSixSeasonalRegionsType[] | null
}

type ResolveType = {
    success: boolean
    error: {
        message: string
    }
}

type IDResolveDataType = { ids: string[] }
type IDResolveType = ResolveType & { data: IDResolveDataType }
type UserResolveType = ResolveType & { data: RainbowSixUserDataType }
type AnyResolveType = ResolveType & { data: any }
type PlatformType = 'pc' | 'ps4' | 'xone'

class RainbowSixSiegeUserData {
    static #RejectError(resolveError: string): AnyResolveType {
        return {
            success: false,
            error: {
                message: resolveError as string,
            },
            data: {},
        }
    }

    static #ResolveIDData(
        isSuccess: boolean,
        resolveData: IDResolveDataType,
        resolveError?: string
    ): IDResolveType {
        return {
            success: isSuccess,
            error: {
                message: resolveError as string,
            },
            data: resolveData,
        }
    }

    static #ResolveUserType(
        isSuccess: boolean,
        resolveData?: RainbowSixUserDataType,
        resolveError?: string
    ): UserResolveType {
        return {
            success: isSuccess,
            error: {
                message: resolveError as string,
            },
            data: (resolveData as RainbowSixUserDataType) || {},
        }
    }

    static #GetOperatorsData(operatorsArray: []): RainbowSixOperatorType[] {
        const operators: RainbowSixOperatorType[] = []

        operatorsArray.forEach((operator: any) => {
            const abilitiesArray: RainbowSixOperatorAbilityType[] =
                operator.abilities.map((ability: any) => {
                    return {
                        key: ability.key,
                        title: ability.title,
                        value: ability.value,
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
                        figure: operator.operator.images.figure,
                    },
                },
            })
        })

        return operators
    }

    static async GetPlayerID(
        name: string,
        platform: PlatformType
    ): Promise<IDResolveType> {
        return new Promise((resolve, reject) => {
            (async () => {
                await axios
                    .get(
                        `https://r6stats.com/api/player-search/${name}/${platform}`,
                        {
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Credentials': 'true',
                            },
                        }
                    )
                    .then(returnData => {
                        const axiosData = returnData.data
                        const returnObject = axiosData.data as Record<
                            string,
                            unknown
                        >[]

                        if (returnObject.toString()) {
                            const allIds: string[] = []

                            if (returnObject && returnObject.length > 0) {
                                returnObject.forEach((element: any) => {
                                    allIds.push(element.ubisoft_id)
                                })
                            }

                            const resolveData = {
                                ids: allIds,
                            }

                            resolve(this.#ResolveIDData(true, resolveData))
                        } else {
                            reject(this.#RejectError('Player ID Not Found'))
                        }
                    })
                    .catch(ex => reject(this.#RejectError(ex)))
            })()
        })
    }

    static async GetPlayerData(PlayerID: string): Promise<UserResolveType> {
        return new Promise((resolve, reject) => {
            (async () => {
                let fetchedData: any | null = null
                let fetchedSeasonalData: any | null = null
                let playerRegion = ''

                await axios
                    .get(`https://r6stats.com/api/stats/${PlayerID}`, {
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Credentials': 'true',
                        },
                    })
                    .then(returnData => {
                        fetchedData = returnData.data.data
                    })
                    .catch(ex => {
                        if (ex.response?.status === 400) {
                            reject(this.#RejectError('User Not Found!'))
                        }

                        reject(this.#RejectError(ex))
                    })

                await axios
                    .get(`https://r6stats.com/api/stats/${PlayerID}/seasonal`, {
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Credentials': 'true',
                        },
                    })
                    .then(returnData => {
                        fetchedSeasonalData = returnData.data.data
                    })
                    .catch(ex => reject(this.#RejectError(ex)))

                await axios
                    .get(
                        `https://r6stats.com/api/player-search/${fetchedData.username}/${fetchedData.platform}`,
                        {
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Credentials': 'true',
                            },
                        }
                    )
                    .then(returnData => {
                        const data = returnData.data.data

                        if (data) {
                            playerRegion =
                                returnData.data.data[0].seasonalStats.region
                        }
                    })
                    .catch(ex => reject(this.#RejectError(ex)))

                if (fetchedData) {
                    const OperatorsData = this.#GetOperatorsData(
                        fetchedData.operators
                    )
                    const seasons = fetchedSeasonalData.seasons
                    const seasonalStatsObject: RainbowSixSeasonalRegionsType[] =
                        []

                    const GetAvailableSeasonRanks = (season: any): string[] => {
                        const ranks: string[] = []
                        const seasonalRanks = season.ranks

                        seasonalRanks.forEach((rankObject: any) => {
                            ranks.push(rankObject.name)
                        })

                        return ranks
                    }

                    const GetRankImageURL = (
                        season: any,
                        rank: string
                    ): string => {
                        const seasonalRanks = season.ranks
                        let currentRank = 'unranked.svg'

                        if (seasonalRanks && rank) {
                            seasonalRanks.forEach((rankObject: any) => {
                                if (rankObject.name == rank) {
                                    currentRank = rankObject.path
                                }
                            })
                        }

                        return `https://cdn.r6stats.com/seasons/ranks/${currentRank}`
                    }

                    if (seasons) {
                        seasons.forEach((season: any) => {
                            if (season) {
                                const seasonalRanks =
                                    GetAvailableSeasonRanks(season)

                                seasonalStatsObject.push({
                                    seasonName: season.name,
                                    startDate:
                                        new Date(season.start_date) || null,
                                    endDate: season.end_date
                                        ? new Date(season.end_date)
                                        : null,
                                    primaryColor: season.primary_color,
                                    ncsa: {
                                        wins: season.regions.ncsa[0].wins,
                                        losses: season.regions.ncsa[0].losses,
                                        abandons:
                                            season.regions.ncsa[0].abandons,
                                        kills: season.regions.ncsa[0].kills,
                                        deaths: season.regions.ncsa[0].deaths,
                                        prevMMR:
                                            season.regions.ncsa[0]
                                                .prev_rank_mmr,
                                        MMR: season.regions.ncsa[0].mmr,
                                        nextMMR:
                                            season.regions.ncsa[0]
                                                .next_rank_mmr,
                                        maxMMR: season.regions.ncsa[0].max_mmr,
                                        lastMatchMMRChange:
                                            season.regions.ncsa[0]
                                                .last_match_mmr_change,
                                        rank: {
                                            name:
                                                seasonalRanks[
                                                    season.regions.ncsa[0].rank
                                                ] || 'Unknown',
                                            imageURL: GetRankImageURL(
                                                season,
                                                seasonalRanks[
                                                    season.regions.ncsa[0].rank
                                                ]
                                            ),
                                        },
                                        maxRank: {
                                            name:
                                                seasonalRanks[
                                                    season.regions.ncsa[0]
                                                        .max_rank
                                                ] || 'Unknown',
                                            imageURL: GetRankImageURL(
                                                season,
                                                seasonalRanks[
                                                    season.regions.ncsa[0]
                                                        .max_rank
                                                ]
                                            ),
                                        },
                                        championsRankPosition:
                                            season.regions.ncsa[0]
                                                .champions_rank_position,
                                        skillMean:
                                            season.regions.ncsa[0].skill_mean,
                                        lastMatchSkillMeanChange:
                                            season.regions.ncsa[0]
                                                .last_match_skill_mean_change,
                                        skillStandardDeviation:
                                            season.regions.ncsa[0]
                                                .skill_standard_deviatation,
                                        lastMatchSkillStandardDeviationChange:
                                            season.regions.ncsa[0]
                                                .last_match_skill_standard_deviation_change,
                                        updatedAt:
                                            new Date(
                                                season.regions.ncsa[0].updated_at
                                            ) || null,
                                    },
                                    emea: {
                                        wins: season.regions.emea[0].wins,
                                        losses: season.regions.emea[0].losses,
                                        abandons:
                                            season.regions.emea[0].abandons,
                                        kills: season.regions.emea[0].kills,
                                        deaths: season.regions.emea[0].deaths,
                                        prevMMR:
                                            season.regions.emea[0]
                                                .prev_rank_mmr,
                                        MMR: season.regions.emea[0].mmr,
                                        nextMMR:
                                            season.regions.emea[0]
                                                .next_rank_mmr,
                                        maxMMR: season.regions.emea[0].max_mmr,
                                        lastMatchMMRChange:
                                            season.regions.emea[0]
                                                .last_match_mmr_change,
                                        rank: {
                                            name:
                                                seasonalRanks[
                                                    season.regions.emea[0].rank
                                                ] || 'Unknown',
                                            imageURL: GetRankImageURL(
                                                season,
                                                seasonalRanks[
                                                    season.regions.emea[0].rank
                                                ]
                                            ),
                                        },
                                        maxRank: {
                                            name:
                                                seasonalRanks[
                                                    season.regions.emea[0]
                                                        .max_rank
                                                ] || 'Unknown',
                                            imageURL: GetRankImageURL(
                                                season,
                                                seasonalRanks[
                                                    season.regions.emea[0]
                                                        .max_rank
                                                ]
                                            ),
                                        },
                                        championsRankPosition:
                                            season.regions.emea[0]
                                                .champions_rank_position,
                                        skillMean:
                                            season.regions.emea[0].skill_mean,
                                        lastMatchSkillMeanChange:
                                            season.regions.emea[0]
                                                .last_match_skill_mean_change,
                                        skillStandardDeviation:
                                            season.regions.emea[0]
                                                .skill_standard_deviatation,
                                        lastMatchSkillStandardDeviationChange:
                                            season.regions.emea[0]
                                                .last_match_skill_standard_deviation_change,
                                        updatedAt:
                                            new Date(
                                                season.regions.emea[0].updated_at
                                            ) || null,
                                    },
                                    apac: {
                                        wins: season.regions.apac[0].wins,
                                        losses: season.regions.apac[0].losses,
                                        abandons:
                                            season.regions.apac[0].abandons,
                                        kills: season.regions.apac[0].kills,
                                        deaths: season.regions.apac[0].deaths,
                                        prevMMR:
                                            season.regions.apac[0]
                                                .prev_rank_mmr,
                                        MMR: season.regions.apac[0].mmr,
                                        nextMMR:
                                            season.regions.apac[0]
                                                .next_rank_mmr,
                                        maxMMR: season.regions.apac[0].max_mmr,
                                        lastMatchMMRChange:
                                            season.regions.apac[0]
                                                .last_match_mmr_change,
                                        rank: {
                                            name:
                                                seasonalRanks[
                                                    season.regions.apac[0].rank
                                                ] || 'Unknown',
                                            imageURL: GetRankImageURL(
                                                season,
                                                seasonalRanks[
                                                    season.regions.apac[0].rank
                                                ]
                                            ),
                                        },
                                        maxRank: {
                                            name:
                                                seasonalRanks[
                                                    season.regions.apac[0]
                                                        .max_rank
                                                ] || 'Unknown',
                                            imageURL: GetRankImageURL(
                                                season,
                                                seasonalRanks[
                                                    season.regions.apac[0]
                                                        .max_rank
                                                ]
                                            ),
                                        },
                                        championsRankPosition:
                                            season.regions.apac[0]
                                                .champions_rank_position,
                                        skillMean:
                                            season.regions.apac[0].skill_mean,
                                        lastMatchSkillMeanChange:
                                            season.regions.apac[0]
                                                .last_match_skill_mean_change,
                                        skillStandardDeviation:
                                            season.regions.apac[0]
                                                .skill_standard_deviatation,
                                        lastMatchSkillStandardDeviationChange:
                                            season.regions.apac[0]
                                                .last_match_skill_standard_deviation_change,
                                        updatedAt:
                                            new Date(
                                                season.regions.apac[0].updated_at
                                            ) || null,
                                    },
                                })
                            }
                        })
                    }

                    const resolveData: RainbowSixUserDataType = {
                        region:
                            (playerRegion as RainbowSixAvailableRegions) ||
                            'invalid',
                        username: fetchedData.username,
                        platform: fetchedData.platform,
                        id: PlayerID,
                        avatarUrl: fetchedData.avatar_url_256,
                        lastUpdated: new Date(fetchedData.last_updated) || null,
                        updateTime:
                            new Date(fetchedData.queue?.estimated) || null,
                        level: fetchedData.progression?.level,
                        lootboxProbability:
                            fetchedData.progression?.lootbox_probability,
                        totalXP: fetchedData.progression?.total_xp,
                        seasonalStats: seasonalStatsObject,
                        stats: {
                            generalStats: {
                                assists: fetchedData.stats[0]?.general?.assists,
                                barricadesDeployed:
                                    fetchedData.stats[0]?.general
                                        ?.barricades_deployed,
                                blindKills:
                                    fetchedData.stats[0]?.general?.blind_kills,
                                bulletsFired:
                                    fetchedData.stats[0]?.general
                                        ?.bullets_fired,
                                bulletsHit:
                                    fetchedData.stats[0]?.general?.bullets_hit,
                                dbnos: fetchedData.stats[0]?.general?.dbnos,
                                deaths: fetchedData.stats[0]?.general?.deaths,
                                distanceTravelled:
                                    fetchedData.stats[0]?.general
                                        ?.distance_travelled,
                                draws: fetchedData.stats[0]?.general?.draws,
                                gadgetsDestroyed:
                                    fetchedData.stats[0]?.general
                                        ?.gadgets_destroyed,
                                gamesPlayed:
                                    fetchedData.stats[0]?.general?.games_played,
                                headshots:
                                    fetchedData.stats[0]?.general?.headshots,
                                kd: fetchedData.stats[0]?.general?.kd,
                                kills: fetchedData.stats[0]?.general?.kills,
                                losses: fetchedData.stats[0]?.general?.losses,
                                meleeKills:
                                    fetchedData.stats[0]?.general?.melee_kills,
                                penetrationKills:
                                    fetchedData.stats[0]?.general
                                        ?.penetration_kills,
                                playtime:
                                    fetchedData.stats[0]?.general?.playtime,
                                rappelBreaches:
                                    fetchedData.stats[0]?.general
                                        ?.rappel_breaches,
                                reinforcementsDeployed:
                                    fetchedData.stats[0]?.general
                                        ?.reinforcements_deployed,
                                revives: fetchedData.stats[0]?.general?.revives,
                                suicides:
                                    fetchedData.stats[0]?.general?.suicides,
                                wins: fetchedData.stats[0]?.general?.wins,
                                wl: fetchedData.stats[0]?.general?.wl,
                            },
                            casualStats: {
                                deaths: fetchedData.stats[0]?.queue?.casual
                                    .deaths,
                                draws: fetchedData.stats[0]?.queue?.casual
                                    .draws,
                                gamesPlayed:
                                    fetchedData.stats[0]?.queue?.casual
                                        .games_played,
                                kd: fetchedData.stats[0]?.queue?.casual.kd,
                                kills: fetchedData.stats[0]?.queue?.casual
                                    .kills,
                                losses: fetchedData.stats[0]?.queue?.casual
                                    .losses,
                                playtime:
                                    fetchedData.stats[0]?.queue?.casual
                                        .playtime,
                                wins: fetchedData.stats[0]?.queue?.casual.wins,
                                wl: fetchedData.stats[0]?.queue?.casual.wl,
                            },
                            rankedStats: {
                                deaths: fetchedData.stats[0]?.queue?.ranked
                                    .deaths,
                                draws: fetchedData.stats[0]?.queue?.ranked
                                    .draws,
                                gamesPlayed:
                                    fetchedData.stats[0]?.queue?.ranked
                                        .games_played,
                                kd: fetchedData.stats[0]?.queue?.ranked.kd,
                                kills: fetchedData.stats[0]?.queue?.ranked
                                    .kills,
                                losses: fetchedData.stats[0]?.queue?.ranked
                                    .losses,
                                playtime:
                                    fetchedData.stats[0]?.queue?.ranked
                                        .playtime,
                                wins: fetchedData.stats[0]?.queue?.ranked.wins,
                                wl: fetchedData.stats[0]?.queue?.ranked.wl,
                            },
                            otherStats: {
                                deaths: fetchedData.stats[0]?.queue?.other
                                    .deaths,
                                draws: fetchedData.stats[0]?.queue?.other.draws,
                                gamesPlayed:
                                    fetchedData.stats[0]?.queue?.other
                                        .games_played,
                                kd: fetchedData.stats[0]?.queue?.other.kd,
                                kills: fetchedData.stats[0]?.queue?.other.kills,
                                losses: fetchedData.stats[0]?.queue?.other
                                    .losses,
                                playtime:
                                    fetchedData.stats[0]?.queue?.other.playtime,
                                wins: fetchedData.stats[0]?.queue?.other.wins,
                                wl: fetchedData.stats[0]?.queue?.other.wl,
                            },
                            gamemodeStats: {
                                bomb: {
                                    bestScore:
                                        fetchedData.stats[0]?.gamemode?.bomb
                                            .best_score,
                                    gamesPlayed:
                                        fetchedData.stats[0]?.gamemode?.bomb
                                            .games_played,
                                    losses: fetchedData.stats[0]?.gamemode?.bomb
                                        .losses,
                                    playtime:
                                        fetchedData.stats[0]?.gamemode?.bomb
                                            .playtime,
                                    wins: fetchedData.stats[0]?.gamemode?.bomb
                                        .wins,
                                    wl: fetchedData.stats[0]?.gamemode?.bomb.wl,
                                },
                                secureArea: {
                                    bestScore:
                                        fetchedData.stats[0]?.gamemode
                                            ?.secure_area.best_score,
                                    gamesPlayed:
                                        fetchedData.stats[0]?.gamemode
                                            ?.secure_area.games_played,
                                    killsAsAttackerInObjective:
                                        fetchedData.stats[0]?.gamemode
                                            ?.secure_area
                                            .kills_as_attacker_in_objective,
                                    killsAsDefenderInObjective:
                                        fetchedData.stats[0]?.gamemode
                                            ?.secure_area
                                            .kills_as_defender_in_objective,
                                    losses: fetchedData.stats[0]?.gamemode
                                        ?.secure_area.losses,
                                    playtime:
                                        fetchedData.stats[0]?.gamemode
                                            ?.secure_area.playtime,
                                    timesObjectiveSecured:
                                        fetchedData.stats[0]?.gamemode
                                            ?.secure_area
                                            .times_objective_secured,
                                    wins: fetchedData.stats[0]?.gamemode
                                        ?.secure_area.wins,
                                    wl: fetchedData.stats[0]?.gamemode
                                        ?.secure_area.wl,
                                },
                                hostage: {
                                    bestScore:
                                        fetchedData.stats[0]?.gamemode?.hostage
                                            .best_score,
                                    gamesPlayed:
                                        fetchedData.stats[0]?.gamemode?.hostage
                                            .games_played,
                                    losses: fetchedData.stats[0]?.gamemode
                                        ?.hostage.losses,
                                    playtime:
                                        fetchedData.stats[0]?.gamemode?.hostage
                                            .playtime,
                                    extractionsDenied:
                                        fetchedData.stats[0]?.gamemode?.hostage
                                            .extractions_denied,
                                    wins: fetchedData.stats[0]?.gamemode
                                        ?.hostage.wins,
                                    wl: fetchedData.stats[0]?.gamemode?.hostage
                                        .wl,
                                },
                            },
                        },
                        operators: OperatorsData,
                    }

                    resolve(this.#ResolveUserType(true, resolveData))
                }

                reject(this.#RejectError('Unknown Error'))
            })()
        })
    }
}

export default RainbowSixSiegeUserData
