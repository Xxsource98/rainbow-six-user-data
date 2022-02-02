# Rainbow Six User Data
Rainbow Six User Data is a module with functions to fetch player's statistics information using https://www.r6stats.com API. Written in TypeScript with all statistics types.

# Example 
```ts
import RainbowSixSiegeUserData, { RainbowSixUserDataType } from 'rainbow-six-user-data'

const GetUserData = async (Username: string): Promise<RainbowSixUserDataType> => {
    let UserID: string = ''
    let UserData: RainbowSixUserDataType | null = null

    await RainbowSixSiegeUserData.GetPlayerID(Username, 'pc').then(returnData => {
        if (returnData.success) {
            UserID = returnData.data.id
        }
    })

    await RainbowSixSiegeUserData.GetPlayerData(UserID).then(returnData => {
        if (returnData.success) {
            UserData = returnData.data
        }
    })

    return UserData!
}

await GetUserData("UserNickname").then(UserData => {
    console.log(UserData)
}).catch(ex => console.error(ex))
```